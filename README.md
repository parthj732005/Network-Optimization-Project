
# 📦 Fulfillment Center (FC) Network Optimization for Retail/E-Commerce

A full-stack optimization system that determines the **optimal locations of Fulfillment Centers (FCs)** for retail/e-commerce networks.
The system simulates customer geolocations, generates FC candidates, and solves a **facility-location optimization model** to minimize:
🚚 Total logistics + transportation cost
🏭 FC opening cost
📍 Customer-to-FC assignment distance

-----

## ⭐ Features

### 🧮 Optimization Model

**k-Facility Location Model** (k ≥ 3)

Constraints include:

  * Customer count: 100–4000
  * FC candidates ≤ 1.2 × customers
  * Each customer assigned to exactly 1 FC
  * FC load capacity ≤ 50% of total demand

Outputs:

  * Optimal FCs to open
  * Customer → FC assignments
  * Total optimized cost

### 🗺 Map Rendering

Generates a **Base64 PNG map** showing:

  * 🔵 Customer locations
  * ▲ FC candidates
  * 🔺 Selected FCs
  * ➖ Assignment lines

### 💻 Frontend (React)

  * Clean 3-step UI for input
  * Validations for each field
  * Displays:
      * Cost summary
      * FC table
      * Customer assignment table
      * Interactive map

-----

## 📁 Project Structure

The project is split into two primary services: the **Model Server (backend)** and the **Frontend (React)**, orchestrated by Docker Compose.

```
fc-optimization/
│
├── Model_Notebook/                        
│   ├── Data_Preprocessing.ipynb
│   ├── Optimization_code.ipynb
│   ├── US Zip Codes from 2013 Government Data.csv
│   └── Zip_codes.csv
│
├── frontend/
│   ├── .dockerignore
│   ├── .env
│   ├── .gitignore
│   ├── Dockerfile
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf
│   ├── package-lock.json
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── assets/
│       │   └── react.svg
│       ├── pages/
│       │   └── OptimizePage.jsx
│       ├── queries/
│       │   └── useOptimize.js
│       ├── App.css
│       ├── App.jsx
│       ├── api.js
│       ├── index.css
│       └── main.jsx
│
├── modelserver/
│   ├── __pycache__/
│   ├── Dockerfile
│   ├── Zip_codes.csv
│   ├── app.py
│   └── requirements.txt
│
└── docker-compose.yml
```

-----

## 🔧 Prerequisites

  * **Docker** and **Docker Compose** (required to build and run the containerized services)

### Key Libraries:

  * **Model Server (Python)**: Built on **FastAPI** (`fastapi`, `uvicorn`) and uses **pulp**, **scipy**, **numpy**, and **pandas** for the core optimization model and data handling. Map rendering uses **matplotlib** and **cartopy**.
  * **Frontend (React)**: Uses **React** for the UI, **React Query** (`@tanstack/react-query`) for efficient data fetching/state management, **Axios** for API communication, and **React Hook Form** with **Zod** for robust form handling and validation.

### API Keys Required?

❌ No API keys needed. All geolocations and FC candidates are synthetically generated.

-----

## 🧠 How the System Works

1️⃣ User Inputs

  * Number of Customer Geolocations (ZIP Code)
  * Number of FC Candidates
  * Value of k (FCs to open)

2️⃣ Model Server Processing

  * Generates random lat/lon points
  * Builds distance + cost matrix
  * Runs MILP optimization (CBC solver, managed by `pulp`)
  * Returns:
      * Total optimized cost
      * Selected FCs
      * Customer assignments
      * Base64 PNG map

3️⃣ Frontend Display

  * Shows all results with:
      * Tables
      * Colored map
      * FC details
      * Customer → FC mapping

-----

## 🚀 Setup Instructions (Docker Compose)

This project uses **Docker Compose** to orchestrate the Model Server and Frontend services. This is the simplest way to get the entire system running.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/fc-optimization.git
cd fc-optimization
```

### 2️⃣ Build and Run Services

Ensure that **Docker Desktop** (or the Docker daemon) is running on your system.

The following command will:

  * Build the `backend` (FastAPI) and `frontend` (React/NGINX) Docker images.
  * Start both services, connecting them via the Docker network.

<!-- end list -->

```bash
docker-compose up --build
```

**Service Endpoints:**

  * **Frontend (Application UI)**: 👉 **http://localhost:3000**
  * **Model Server API (Direct)**: 👉 **http://localhost:8000** (Used internally by the frontend)

**To run the services in the background (detached mode):**

```bash
docker-compose up -d --build
```

**To stop and remove the running containers:**

```bash
docker-compose down
```

-----

## ▶ Usage

Note: The application requires internet connection for the first run to fetch data about USA map from the internet. 
1.  Navigate to the **Frontend** application at `http://localhost:3000`.
2.  Enter values for:
      * Customer Geolocations (ZIP Codes)
      * FC Candidates
      * k (minimum 3)
3.  Click **Run Optimization**.
4.  View the results:
      * Selected FCs
      * Customer Assignment Table
      * Cost Summary
      * Optimization Map
