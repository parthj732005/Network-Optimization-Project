FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    g++ \
    make \
    libproj-dev \
    proj-bin \
    proj-data \
    libgeos-dev \
    libgeos++-dev \
    libgdal-dev \
    gdal-bin \
    liblapack-dev \
    libblas-dev \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt /app/

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY . /app

EXPOSE 8000

CMD ["uvicorn", "App:app", "--host", "0.0.0.0", "--port", "8000"]
