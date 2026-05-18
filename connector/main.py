import time
import requests
import platform
import os
import json
from telemetry import get_telemetry, get_recent_logs

# Updated API URLs for Render
BASE_URL = "https://helios-2-0.onrender.com"
API_URL = f"{BASE_URL}/api/telemetry"
LINK_URL = f"{BASE_URL}/api/pairing/link"
SYNC_INTERVAL = 5 # Sync every 5 seconds for the MVP

TOKEN_FILE = "machine_token.json"

def get_machine_token(machine_id):
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'r') as f:
            data = json.load(f)
            return data.get("machine_token")
    
    print("="*50)
    print("  HELIOS CONNECTOR INITIALIZATION  ")
    print("="*50)
    print(f"Machine ID: {machine_id}")
    print("This machine is not yet linked to a Helios account.")
    print("Please go to your Helios Web Dashboard, log in, and click 'Pair New Device'.")
    
    while True:
        pair_code = input("\nEnter the 8-character pairing code: ").strip().upper()
        if len(pair_code) != 8:
            print("Invalid format. Code must be 8 characters.")
            continue
            
        try:
            print(f"Linking machine {machine_id}...")
            res = requests.post(LINK_URL, json={
                "pair_code": pair_code,
                "machine_id": machine_id,
                "hostname": machine_id
            })
            
            if res.status_code == 200:
                data = res.json()
                token = data.get("machine_token")
                with open(TOKEN_FILE, 'w') as f:
                    json.dump({"machine_token": token}, f)
                print("Successfully linked! Token saved.")
                return token
            else:
                print(f"Failed to link: {res.text}")
        except Exception as e:
            print(f"Error connecting to server: {e}")

def run_connector():
    machine_id = platform.node()
    machine_token = get_machine_token(machine_id)
    
    print(f"Starting Helios Connector for machine: {machine_id}")
    
    headers = {
        "Machine-Token": machine_token
    }
    
    while True:
        try:
            telemetry_data = get_telemetry()
            logs = get_recent_logs()
            
            payload = {
                "machine_id": machine_id,
                "telemetry": telemetry_data,
                "logs": logs
            }
            
            response = requests.post(API_URL, json=payload, headers=headers)
            if response.status_code == 200:
                print(f"[{time.strftime('%X')}] Successfully synced telemetry.")
            else:
                print(f"[{time.strftime('%X')}] Sync failed with status: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"[{time.strftime('%X')}] Could not connect to backend at {API_URL}. Retrying in {SYNC_INTERVAL}s...")
        except Exception as e:
            print(f"[{time.strftime('%X')}] Error during sync: {e}")
            
        time.sleep(SYNC_INTERVAL)

if __name__ == "__main__":
    run_connector()
