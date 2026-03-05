from fastapi import FastAPI, Request, Form, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from src.database import engine, SessionLocal, Base
from src.models import User, Job, Application
from src.utils import get_pdf_text, get_docx_text
from src.crew import RecruitmentCrew
import shutil
import os
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Peramatrix HR API")

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Static Frontend Serving ---
app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

# --- Auth Routes ---
@app.post("/api/login")
async def login(username: str = Form(...), password: str = Form(...), role: str = Form(...), db: Session = Depends(get_db)):
    # Hardcoded credentials check
    if role == "hr" and (username != "admin" or password != "admin"):
        return JSONResponse(status_code=401, content={"error": "Invalid HR credentials. Use admin/admin."})
    elif role == "candidate" and (username != "user" or password != "user"):
        return JSONResponse(status_code=401, content={"error": "Invalid Candidate credentials. Use user/user."})
        
    # Ensure user exists in database for relational mapping (like submitting applications)
    user = db.query(User).filter(User.username == username, User.role == role).first()
    if not user:
        user = User(username=username, password_hash=password, role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return {"message": "Login successful", "user": {"id": user.id, "username": user.username, "role": user.role}}

# --- HR Routes ---
@app.get("/api/hr_dashboard/{user_id}")
async def hr_dashboard(user_id: int, db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    applications = db.query(Application).all()
    
    jobs_data = [{"id": j.id, "title": j.title, "description": j.description, "file_path": j.file_path} for j in jobs]
    apps_data = [
        {
            "id": a.id, 
            "job_id": a.job_id, 
            "job_title": a.job.title if a.job else "Unknown",
            "candidate_name": a.candidate_name, 
            "email": a.email, 
            "score": a.score, 
            "status": a.status, 
            "interview_status": a.interview_status, 
            "is_selected": a.is_selected,
            "resume_path": a.resume_path,
            "offer_letter_path": a.offer_letter_path
        } for a in applications
    ]
    return {"jobs": jobs_data, "applications": apps_data}

@app.post("/api/upload_jd/{user_id}")
async def upload_jd(user_id: int, title: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_location = f"data/{file.filename}"
    os.makedirs("data", exist_ok=True)
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    # Extract text for description preview
    if file_location.endswith('.docx'):
        description = get_docx_text(file_location)
    else:
        description = "PDF/Text Content" # Simpler for now
        
    new_job = Job(title=title, description=description, file_path=file_location)
    db.add(new_job)
    db.commit()
    return {"message": "Job posted successfully"}

@app.delete("/api/delete_job/{job_id}")
async def delete_job(job_id: int, db: Session = Depends(get_db)):
    # Delete associated applications first to maintain referential integrity
    db.query(Application).filter(Application.job_id == job_id).delete()
    
    # Delete the job
    db.query(Job).filter(Job.id == job_id).delete()
    db.commit()
    
    return {"message": "Job deleted successfully"}

@app.post("/api/evaluate/{application_id}")
async def evaluate_application(application_id: int, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == application_id).first()
    job = db.query(Job).filter(Job.id == app.job_id).first()
    
    # Read resume content
    if app.resume_path.endswith('.pdf'):
        resume_content = get_pdf_text(app.resume_path)
    else:
        resume_content = "Resume content unavailable"

    # Run Crew
    print(f"Starting evaluation for {app.candidate_name}...")
    crew = RecruitmentCrew(resume_content, job.description)
    screening_crew = crew.screening_crew()
    result = screening_crew.kickoff()
    
    # Parse result (This is tricky with string output, in real world we'd want structured output from agents)
    # For now, we'll try to extract score/status if possible or just save the whole text
    score = 0
    status = "Evaluated"
    result_lower = str(result).lower()
    
    if "not shortlisted" in result_lower:
        status = "Rejected"
        score = 40
        app.interview_status = "N/A"
    elif "shortlisted" in result_lower:
        status = "Shortlisted"
        score = 85
        app.interview_status = "Pending"
    else:
         status = "Rejected"
         score = 40
         app.interview_status = "N/A"

    app.score = score
    app.status = status
    app.justification = str(result)
    db.commit()
    
    return {"message": "Evaluation completed", "score": score, "status": status}

@app.post("/api/select_candidate/{application_id}")
async def select_candidate(application_id: int, decision: str = Form(...), ctc: str = Form(None), db: Session = Depends(get_db)):
    # Rename local var to avoid shadowing
    job_app = db.query(Application).filter(Application.id == application_id).first()
    
    # Get Job Details
    job = db.query(Job).filter(Job.id == job_app.job_id).first()
    
    # Get Resume Content
    if job_app.resume_path.endswith('.pdf'):
        resume_content = get_pdf_text(job_app.resume_path)
    elif job_app.resume_path.endswith('.docx'):
        resume_content = get_docx_text(job_app.resume_path)
    else:
        resume_content = "Content unavailable"

    # Instantiate RecruitmentCrew
    crew = RecruitmentCrew(resume_content, job.description)
    
    # Inject Resume Content into Offer Task Description so Agent can find the name
    crew.offer.description += f"\n\nRESUME CONTENT:\n{resume_content}"
    
    offer_crew = crew.offer_crew()
    
    # Inputs to bypass human input (Candidate Name is now extracted from context)
    inputs = {
        'decision': decision,
        'ctc': ctc if ctc else "N/A"
    }
    
    result = offer_crew.kickoff(inputs=inputs)
    result_str = str(result) # Convert result to string for regex
    
    if decision == "Selected":
        import re
        filename = None
        
        # 1. Try to find the generated filename in the output
        # Look for pattern: Offer_Letter_....pdf
        match = re.search(r'(Offer_Letter_.*?\.pdf)', result_str)
        if match:
            extracted = os.path.basename(match.group(1))
            if os.path.exists(f"offer_letters/{extracted}"):
                filename = extracted

        # 2. If regex fails or file not found, try to guess from Resume Content
        if not filename:
            # Extract name from resume content (e.g. "Name: Akhil Kumar Peram")
            name_match = re.search(r'Name:\s*(.*)', resume_content)
            if name_match:
                resume_name = name_match.group(1).strip()
                safe_resume_name = resume_name.replace(' ', '_')
                possible_file = f"Offer_Letter_{safe_resume_name}.pdf"
                
                if os.path.exists(f"offer_letters/{possible_file}"):
                     filename = possible_file
        
        # 3. Fallback to App Candidate Name (and search directory for case-insensitive match)
        if not filename:
            safe_name_app = str(job_app.candidate_name).replace(' ', '_')
            possible_file = f"Offer_Letter_{safe_name_app}.pdf"
            
            # Search directory for a matching file (ignoring case)
            found_in_dir = False
            if os.path.exists("offer_letters"):
                for existing_file in os.listdir("offer_letters"):
                    if existing_file.lower() == possible_file.lower():
                        filename = existing_file
                        found_in_dir = True
                        break
            
            if not found_in_dir:
                 # 4. Final Resort: Find the most recent PDF in the directory
                 # This handles cases where Candidate Name (DB) != Resume Name (File)
                 # and Agent didn't output the path.
                 try:
                    list_of_files = [os.path.join("offer_letters", f) for f in os.listdir("offer_letters") if f.lower().endswith('.pdf')]
                    if list_of_files:
                        latest_file = max(list_of_files, key=os.path.getctime)
                        filename = os.path.basename(latest_file)
                    else:
                        filename = possible_file
                 except Exception as e:
                    filename = possible_file

        job_app.offer_letter_path = filename
        job_app.interview_status = "Selected"
        # job_app.status = "Selected" # Keep as Shortlisted
        job_app.is_selected = 1
    else:
        job_app.interview_status = "Rejected"
        # job_app.status = "Rejected" # Keep as Shortlisted
        job_app.is_selected = 0
        
    db.commit()
    db.commit()
    return {"message": "Candidate selection processed"}

@app.delete("/api/delete_application/{application_id}")
async def delete_application(application_id: int, db: Session = Depends(get_db)):
    # Rename local var to avoid shadowing
    job_app = db.query(Application).filter(Application.id == application_id).first()
    if job_app:
        db.delete(job_app)
        db.commit()
    return {"message": "Application deleted successfully"}


# --- Candidate Routes ---
@app.get("/api/candidate_dashboard/{user_id}")
async def candidate_dashboard(user_id: int, db: Session = Depends(get_db)):
    jobs = db.query(Job).all()
    user = db.query(User).filter(User.id == user_id).first()
    my_apps = db.query(Application).filter(Application.user_id == user_id).all()
    
    jobs_data = [{"id": j.id, "title": j.title, "description": j.description, "file_path": j.file_path} for j in jobs]
    apps_data = [
        {
            "id": a.id, 
            "job_id": a.job_id, 
            "job_title": a.job.title if a.job else "Unknown",
            "score": a.score, 
            "status": a.status, 
            "interview_status": a.interview_status,
            "offer_letter_path": a.offer_letter_path
        } for a in my_apps
    ]
    
    return {
        "user": {"id": user.id, "username": user.username} if user else None,
        "jobs": jobs_data, 
        "applications": apps_data
    }

@app.get("/api/jobs/{job_id}")
async def view_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return JSONResponse(status_code=404, content={"error": "Job not found"})
    return {"id": job.id, "title": job.title, "description": job.description}

@app.post("/api/apply/{job_id}")
async def apply_job(
    job_id: int, 
    user_id: int = Form(...), 
    full_name: str = Form(...), 
    email: str = Form(...),
    resume: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    
    # Check if user already applied to this job
    existing_app = db.query(Application).filter(Application.job_id == job_id, Application.user_id == user_id).first()
    if existing_app:
        return JSONResponse(status_code=400, content={"error": "You have already applied for this job."})

    file_location = f"data/{resume.filename}"
    os.makedirs("data", exist_ok=True)
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(resume.file, file_object)
        
    new_app = Application(
        job_id=job_id,
        candidate_name=full_name, # Use full name from form
        user_id=user.id, # Link to user
        email=email, # Real email from form
        phone="1234567890", # Mock
        resume_path=file_location,
        status="Applied"
    )
    db.add(new_app)
    db.commit()
    return {"message": "Application submitted successfully"}

@app.get("/api/download/{filename:path}")
async def download_file(filename: str):
    # Check potential file locations
    
    # If filename already contains the directory (e.g. data/resume.pdf or offer_letters/offer.pdf)
    if os.path.exists(filename):
        return FileResponse(filename, filename=os.path.basename(filename))
        
    potential_paths = [
        f"{filename}",           # Root
        f"data/{filename}",      # Data folder
        f"offer_letters/{filename}" # Offer letters folder
    ]
    
    for path in potential_paths:
        if os.path.exists(path):
            return FileResponse(path, filename=os.path.basename(path))
            
    return {"error": "File not found", "searched_paths": potential_paths}

# --- Catch-all Route for React Router ---
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    return FileResponse("frontend/dist/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
