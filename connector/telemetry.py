import psutil
import time
import subprocess
import platform

def get_recent_logs() -> str:
    """Fetches recent Windows Event Viewer logs for System."""
    try:
        # Get last 20 errors/warnings from System log
        cmd = ['wevtutil', 'qe', 'System', '/q:*[System[(Level=2 or Level=3)]]', '/c:20', '/f:text', '/rd:true']
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.stdout if result.stdout else "No recent errors."
    except Exception as e:
        return f"Failed to read logs: {e}"

def get_telemetry():
    """
    Gather current system telemetry using psutil.
    """
    # System Info
    sys_node = platform.node()
    sys_os = f"{platform.system()} {platform.release()}"
    
    # CPU usage per core
    cpu_cores = psutil.cpu_percent(interval=None, percpu=True)
    # Total CPU usage
    cpu_total = psutil.cpu_percent(interval=None)
    cpu_count = psutil.cpu_count(logical=True)
    
    # Memory usage
    mem = psutil.virtual_memory()
    
    # Disk usage
    disk = psutil.disk_usage('/')
    
    # Battery
    battery = psutil.sensors_battery()
    battery_percent = battery.percent if battery else 100
    is_plugged = battery.power_plugged if battery else True
    
    return {
        "timestamp": time.time(),
        "system": {
            "hostname": sys_node,
            "os": sys_os
        },
        "cpu": {
            "total": cpu_total,
            "cores": cpu_cores,
            "count": cpu_count
        },
        "memory": {
            "total": mem.total,
            "available": mem.available,
            "percent": mem.percent,
            "used": mem.used
        },
        "storage": {
            "total": disk.total,
            "used": disk.used,
            "free": disk.free,
            "percent": disk.percent
        },
        "battery": {
            "percent": battery_percent,
            "plugged_in": is_plugged
        }
    }
