import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
import json

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    client = genai.Client(api_key=API_KEY)
else:
    client = None
    print("Warning: GEMINI_API_KEY not found in environment.")

def troubleshoot_issue(user_query: str, telemetry_data: dict, system_logs: str) -> str:
    """
    Sends the user query along with system telemetry and logs to Gemini for troubleshooting.
    """
    if not client:
        return "Error: Gemini API key is not configured."

    system_instruction = (
        "You are 'The Digital Technician' for a system monitor called Helios. "
        "You help users diagnose system issues like bottlenecks, high memory usage, etc. "
        "Use the provided telemetry context and system logs to give precise and technical advice. "
        "IMPORTANT: Format your response in clean Markdown. "
        "Include these specific headers: '### Diagnosis', '### Likely Causes', '### Actionable Recommendations', and '### Risk & Confidence'. "
        "Use bullet points and bold text to make it highly organized and modern. Do not use generic pleasantries."
    )
    
    prompt = (
        f"User Complaint: {user_query}\n\n"
        f"Current System Telemetry:\n{json.dumps(telemetry_data, indent=2)}\n\n"
        f"Recent System Logs (Errors/Warnings):\n{system_logs}\n\n"
        "Please provide a helpful, brief, and technical response."
    )

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
            )
        )
        return response.text
    except Exception as e:
        return f"An error occurred while calling Gemini API: {str(e)}"

def recommend_build(budget: str, workload: str, telemetry_data: dict) -> str:
    """
    Uses the system specs and user requirements to recommend a completely new PC build.
    """
    if not client:
        return "Error: Gemini API key is not configured."

    system_instruction = (
        "You are the 'Helios Build Advisor'. "
        "You analyze the user's current system specifications (telemetry data) to understand their current limitations, "
        "and recommend a completely new PC build based on their stated budget and workload. "
        "IMPORTANT: Format your response in clean Markdown. "
        "Include these specific headers: '### Analysis of Current System', '### Recommended Build', and '### Expected Performance Gains'. "
        "Use bullet points and bold text to make it highly organized and modern. Do not use generic pleasantries."
    )
    
    prompt = (
        f"Current System Specs (Reference point):\n{json.dumps(telemetry_data, indent=2)}\n\n"
        f"Target Workload: {workload}\n"
        f"Budget for New Build: {budget}\n\n"
        "Please recommend the best new PC build components."
    )

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
            )
        )
        return response.text
    except Exception as e:
        return f"An error occurred while calling Gemini API: {str(e)}"
