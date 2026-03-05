
import pandas as pd
from crewai.tools import tool
import os

CSV_FILE = "candidates.csv"

def _ensure_csv_exists():
    if not os.path.exists(CSV_FILE):
        df = pd.DataFrame(columns=["Name", "Email", "Phone", "Experience", "Skills", "Score", "Status", "Justification"])
        df.to_csv(CSV_FILE, index=False)

@tool
def add_candidate_details(name: str, email: str, phone: str = "N/A", experience: str = "N/A", skills: str = "N/A") -> str:
    """Adds or updates candidate details in the CSV file."""
    _ensure_csv_exists()
    df = pd.read_csv(CSV_FILE)
    
    # Check if candidate exists, update if present
    if name in df['Name'].values:
        df.loc[df['Name'] == name, ['Email', 'Phone', 'Experience', 'Skills']] = [email, phone, experience, skills]
        action = "Updated"
    else:
        new_row = {"Name": name, "Email": email, "Phone": phone, "Experience": experience, "Skills": skills, "Score": 0, "Status": "Pending", "Justification": "N/A"}
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        action = "Added"
        
    df.to_csv(CSV_FILE, index=False)
    return f"Candidate {name} {action} successfully."

@tool
def update_candidate_status(name: str, score: float, status: str, justification: str) -> str:
    """Updates the evaluation status and score for a candidate."""
    _ensure_csv_exists()
    df = pd.read_csv(CSV_FILE)
    
    if name in df['Name'].values:
        df.loc[df['Name'] == name, ['Score', 'Status', 'Justification']] = [score, status, justification]
        df.to_csv(CSV_FILE, index=False)
        return f"Status updated for {name}."
    else:
        return f"Candidate {name} not found."

@tool
def get_candidate_details(name: str) -> str:
    """Retrieves candidate details including email and status."""
    _ensure_csv_exists()
    df = pd.read_csv(CSV_FILE)
    
    if name in df['Name'].values:
        row = df[df['Name'] == name].iloc[0]
        return f"Name: {row['Name']}, Email: {row['Email']}, Status: {row['Status']}, Score: {row['Score']}"
    else:
        return f"Candidate {name} not found."
