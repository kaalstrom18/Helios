import time
import requests
import platform
from telemetry import get_telemetry, get_recent_logs

# Updated API URL as requested by the user
API_URL = "https://helios-ui43.onrender.com/api/telemetry"
SYNC_INTERVAL = 5 # Sync every 5 seconds for the MVP

def run_connector():
    machine_id = platform.node()
    print(f"Starting Helios Connector for machine: {machine_id}")
    
    while True:
        try:
            telemetry_data = get_telemetry()
            logs = get_recent_logs()
            
            payload = {
                "machine_id": machine_id,
                "telemetry": telemetry_data,
                "logs": logs
            }
            
            response = requests.post(API_URL, json=payload)
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
