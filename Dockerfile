# AdCopySurge Backend - Production Dockerfile for Fly.io
FROM python:3.12-slim

# Set environment variables for Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements-production.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Create a non-root user for security
RUN useradd --create-home --shell /bin/bash adcopysurge \
    && chown -R adcopysurge:adcopysurge /app

# Switch to non-root user
USER adcopysurge

# Expose port 8080 (Fly.io standard)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Production command with Uvicorn
CMD ["uvicorn", "main_production:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
