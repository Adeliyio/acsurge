# Railway-compatible Gunicorn configuration for AdCopySurge Backend
import multiprocessing
import os

# Server socket - Railway provides PORT via environment variable
port = os.environ.get("PORT", "8000")
bind = f"0.0.0.0:{port}"
backlog = 2048

# Worker processes - Railway containers have limited CPU, so be conservative
workers = min(multiprocessing.cpu_count(), 2)  # Max 2 workers for Railway
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
preload_app = True
timeout = 60  # Increased for AI processing
keepalive = 2

# Logging - Railway captures stdout/stderr
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stderr
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Process naming
proc_name = "adcopysurge-railway"

# Server mechanics - Railway-compatible settings
daemon = False
# Don't set user/group in Railway
# user = "www-data"
# group = "www-data"
tmp_upload_dir = None

# Worker process callbacks
def on_starting(server):
    server.log.info("Starting AdCopySurge API server on Railway")

def on_reload(server):
    server.log.info("Reloading AdCopySurge API server")

def worker_int(worker):
    worker.log.info("Worker received INT or QUIT signal")

def pre_fork(server, worker):
    server.log.info(f"Worker spawned (pid: {worker.pid})")

def post_fork(server, worker):
    server.log.info(f"Worker spawned (pid: {worker.pid})")

def post_worker_init(worker):
    worker.log.info("Worker initialized")

def worker_abort(worker):
    worker.log.info("Worker received SIGABRT signal")
