import subprocess
import sys
import signal
import os
import time
import socket
from dotenv import dotenv_values

HERE = os.path.dirname(os.path.abspath(__file__))

# Use whichever interpreter launched this script (works cross-platform / venv).
ROOT_PYTHON = sys.executable

env = dotenv_values(os.path.join(HERE, ".env"))
if not env.get("JWT_SECRET"):
    sys.exit("[start.py] ERROR: .env is missing JWT_SECRET.")

def port_is_free(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) != 0

for port, name in [(8000, "FastAPI"), (8501, "Streamlit")]:
    if not port_is_free(port):
        sys.exit(f"[start.py] ERROR: Port {port} already in use — {name} cannot start.")

processes: list[subprocess.Popen] = []

def shutdown(signum, frame):
    print("\n[start.py] Shutting down both servers...")
    for p in processes:
        if p.poll() is None:
            p.terminate()
    deadline = time.time() + 5
    for p in processes:
        try:
            p.wait(timeout=max(0, deadline - time.time()))
        except subprocess.TimeoutExpired:
            p.kill()
    sys.exit(0)

signal.signal(signal.SIGINT, shutdown)
if hasattr(signal, "SIGTERM"):
    signal.signal(signal.SIGTERM, shutdown)

processes.append(subprocess.Popen(
    [ROOT_PYTHON, "-m", "uvicorn", "main:app",
     "--host", "127.0.0.1", "--port", "8000", "--app-dir", HERE],
    cwd=HERE,
))
print("[start.py] FastAPI  → http://127.0.0.1:8000")

processes.append(subprocess.Popen(
    [ROOT_PYTHON, "-m", "streamlit", "run", os.path.join(HERE, "labeler.py"),
     "--server.port", "8501", "--server.headless", "true"],
    cwd=HERE,
))
print("[start.py] Labeler  → http://localhost:8501")
print("[start.py] Press Ctrl+C to stop both servers.")

while True:
    for p in processes:
        if p.poll() is not None:
            print(f"[start.py] Process pid={p.pid} exited unexpectedly. Shutting down.")
            shutdown(None, None)
    time.sleep(1)