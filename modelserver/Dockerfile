FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1

# System deps needed by cartopy, scipy etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    make \
    curl \
    ca-certificates \
    libproj-dev \
    proj-bin \
    proj-data \
    libgeos-dev \
    libgdal-dev \
    gdal-bin \
    liblapack-dev \
    libblas-dev \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

RUN groupadd -r app && useradd -r -g app app \
 && mkdir -p /home/app/.local/share/cartopy \
 && mkdir -p /app/.config/matplotlib \
 && chown -R app:app /home/app /app

# Ensure Matplotlib uses a writable config dir and Cartopy uses XDG_DATA_HOME
ENV MPLCONFIGDIR=/app/.config/matplotlib
ENV XDG_DATA_HOME=/home/app/.local

USER app
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://127.0.0.1:5000/health || exit 1


CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]