from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from database import Base

class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False) # Maps to Supabase auth.users UUID
    machine_id = Column(String, unique=True, index=True, nullable=False)
    hostname = Column(String)
    machine_token = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PairingCode(Base):
    __tablename__ = "pairing_codes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TelemetrySnapshot(Base):
    __tablename__ = "telemetry_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(String, ForeignKey("machines.machine_id"), index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    data = Column(JSON)
    system_logs = Column(String, nullable=True)
