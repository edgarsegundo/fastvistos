ARG PYTHON_VERSION=3.11
ARG ARCH=amd64

# -------- Stage 1: Builder --------
FROM python:${PYTHON_VERSION}-slim AS builder

WORKDIR /app

# Install build deps and busybox (static)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        bash \
        busybox-static \
        ca-certificates \
        curl \
        libcurl4-openssl-dev \
        gcc \
        libffi-dev \
        libssl-dev \
        build-essential \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*      # Clean up unnecessary package lists after installing dependencies with apt-get

        
# Download tini (init system for PID 1)
RUN curl -Lo /tini https://github.com/krallin/tini/releases/latest/download/tini && chmod +x /tini

# Set up virtual environment
RUN python -m venv /venv

# Set ENV to use the virtual environment by default
ENV PATH="/venv/bin:$PATH"

# Upgrade pip & install tools into the virtual env (no root warning here)
# I decided to not use --upgrade: RUN pip install --upgrade pip 
RUN pip install --upgrade pip setuptools wheel uv

# Install specific dependencies
RUN pip install uvicorn==0.34.0 \
                paramiko

# Generate lockfile and install dependencies
COPY pyproject.toml .

# # Generate lockfile and install dependencies
# RUN uv pip compile pyproject.toml --output-file requirements.lock
# RUN uv pip sync requirements.lock

RUN uv pip compile pyproject.toml --output-file requirements.lock || true
RUN uv pip sync requirements.lock || true

# Copy app source
COPY app/ .
COPY .env .

# Create busybox-style crontab (no 'root' field)
RUN mkdir -p /etc/crontabs

# -------- Stage 2: Minimal Runtime --------
FROM localhost:5000/distroless-python:${PYTHON_VERSION}-${ARCH}

WORKDIR /

# Copy scripts in /usr/local/bin (like uv, quart, etc. entry points)
COPY --from=builder /usr/local/bin /usr/local/bin 

COPY --from=builder /venv /venv
COPY --from=builder /app /app
COPY --from=builder /bin/busybox /busybox
COPY --from=builder /tini /tini
COPY --from=builder /app/bootstrap/root /etc/crontabs/root
COPY --from=builder /app/bootstrap/start.sh /start.sh
COPY --from=builder /app/bootstrap/healthcheck.sh /healthcheck.sh

ENV PYTHONUNBUFFERED=1
ENV PATH="/venv/bin:$PATH"

# # ✅ Add healthcheck here
# HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
#   CMD ["/healthcheck.sh"]

ENTRYPOINT ["/tini", "--", "/start.sh"]
