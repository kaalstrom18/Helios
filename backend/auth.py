import os
import urllib.request
import urllib.error
import json
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase configuration in backend/.env")

security = HTTPBearer()

async def verify_token(token: str):
    try:
        # Verify token by calling Supabase Auth API directly
        req = urllib.request.Request(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_KEY
            }
        )
        with urllib.request.urlopen(req) as response:
            if response.status != 200:
                return None
            
            data = json.loads(response.read().decode())
            # Create a simple user object
            class User:
                def __init__(self, id):
                    self.id = id
            
            return User(id=data["id"])
            
    except Exception:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    user = await verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return user
