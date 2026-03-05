import os
import smtplib
import ssl
from email.message import EmailMessage
from crewai.tools import tool

@tool("SendEmailTool")
def send_email_tool(recipient_email: str, subject: str, body: str, attachment_path: str = None):
    """Sends an email. Supports attachments. Auto-detects SSL (465) vs STARTTLS (587)."""
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = os.getenv('SMTP_PORT')
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    recipient_email = str(recipient_email)
    
    # Mock behavior if credentials are missing
    if not all([smtp_host, smtp_port, smtp_user, smtp_password]):
        print(f"\n[MOCK EMAIL SENT]\nTo: {recipient_email}\nSubject: {subject}\nBody:\n{body}\nAttachment: {attachment_path}\n")
        return "Mock email sent successfully (SMTP credentials missing)."
    
    try:
        msg = EmailMessage()
        msg.set_content(body)
        msg['Subject'] = subject
        msg['From'] = smtp_user
        msg['To'] = recipient_email
        
        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, 'rb') as f:
                file_data = f.read()
                file_name = os.path.basename(attachment_path)
                msg.add_attachment(file_data, maintype='application', subtype='pdf', filename=file_name)
        
        port = int(smtp_port)
        # Use unverified context to avoid SSL errors on local env if needed, 
        # specifically mentioned in original notebook
        context = ssl._create_unverified_context()
        
        if port == 465:
            with smtplib.SMTP_SSL(smtp_host, port, context=context) as server:
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_host, port) as server:
                server.starttls(context=context)
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
                
        return f"Email sent successfully to {recipient_email}."
    except Exception as e:
        return f"Failed to send email: {str(e)}"
