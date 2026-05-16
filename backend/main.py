import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import TelemetrySnapshot
from ai import troubleshoot_issue, recommend_build

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Helios Cloud Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, machine_id: str):
        await websocket.accept()
        if machine_id not in self.active_connections:
            self.active_connections[machine_id] = []
        self.active_connections[machine_id].append(websocket)

    def disconnect(self, websocket: WebSocket, machine_id: str):
        if machine_id in self.active_connections and websocket in self.active_connections[machine_id]:
            self.active_connections[machine_id].remove(websocket)

    async def broadcast(self, message: dict, machine_id: str):
        if machine_id in self.active_connections:
            for connection in self.active_connections[machine_id]:
                await connection.send_json(message)

manager = ConnectionManager()

class TelemetryPayload(BaseModel):
    machine_id: str
    telemetry: dict
    logs: Optional[str] = None

class ChatRequest(BaseModel):
    machine_id: str
    query: str

class UpgradeRequest(BaseModel):
    machine_id: str
    budget: str
    workload: str

@app.post("/api/telemetry")
async def receive_telemetry(payload: TelemetryPayload, db: Session = Depends(get_db)):
    # Store in database
    db_snapshot = TelemetrySnapshot(
        machine_id=payload.machine_id,
        data=payload.telemetry,
        system_logs=payload.logs
    )
    db.add(db_snapshot)
    db.commit()
    db.refresh(db_snapshot)

    # Broadcast to connected web clients for this machine
    await manager.broadcast(payload.telemetry, payload.machine_id)
    return {"status": "success"}

@app.get("/api/machines")
async def get_machines(db: Session = Depends(get_db)):
    machines = db.query(TelemetrySnapshot.machine_id).distinct().all()
    return {"machines": [m[0] for m in machines]}

@app.websocket("/ws/telemetry/{machine_id}")
async def websocket_telemetry(websocket: WebSocket, machine_id: str, db: Session = Depends(get_db)):
    await manager.connect(websocket, machine_id)
    
    # Send latest telemetry upon connection if exists
    latest = db.query(TelemetrySnapshot).filter(TelemetrySnapshot.machine_id == machine_id).order_by(TelemetrySnapshot.timestamp.desc()).first()
    if latest and latest.data:
        await websocket.send_json(latest.data)
        
    try:
        while True:
            # Just keep the connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, machine_id)
        print(f"Client disconnected from telemetry stream for {machine_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    latest = db.query(TelemetrySnapshot).filter(TelemetrySnapshot.machine_id == request.machine_id).order_by(TelemetrySnapshot.timestamp.desc()).first()
    
    current_telemetry = latest.data if latest else {}
    system_logs = latest.system_logs if latest and latest.system_logs else "No logs available."
    
    response = troubleshoot_issue(request.query, current_telemetry, system_logs)
    return {"response": response, "telemetry_context": current_telemetry}

@app.post("/api/upgrade")
async def upgrade_endpoint(request: UpgradeRequest, db: Session = Depends(get_db)):
    latest = db.query(TelemetrySnapshot).filter(TelemetrySnapshot.machine_id == request.machine_id).order_by(TelemetrySnapshot.timestamp.desc()).first()
    
    current_telemetry = latest.data if latest else {}
    
    response = recommend_build(request.budget, request.workload, current_telemetry)
    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
