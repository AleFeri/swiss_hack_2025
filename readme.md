# SmartAdvisor

This hackathon project demonstrates an innovative platform for banking advisors. The platform leverages Agentic AI to support face-to-face meetings by processing conversations in real time and highlighting the most relevant products for each client based on their historical data.

## Overview

**Objective:**
Provide an intelligent assistant for bank advisors. Upon selecting a client from the platform, the advisor can quickly load the client’s personal and financial data (including historical transactions, holdings, and payment methods). When the advisor starts a meeting, the platform records the conversation, analyzes the audio stream via WebSocket, and identifies tailored product recommendations—empowering the advisor with real-time insights and suggestions.

**Key Features:**
- **Client Data Retriceval:**
  Retrieve detailed client information and historical data (transactions, accounts, payment methods) from a SQLite database.
- **Real-Time Audio Processing:**
  As the meeting begins, the system listens and processes audio data to highlight important keywords and suggest suitable financial products.
- **Seamless Advisor Experience:**
  A user-friendly front-end built with React provides a clear interface where advisors can select clients, view their data, and watch real-time suggestions.
- **Agentic AI:**
  Combines historical data with live conversation analysis to deliver context-aware recommendations that support advisors during critical client interactions.

**Key Features:**

- **Pre-Meeting Client Summaries:**
  Automatically load a full client snapshot—including transactions, accounts, and payment methods—before the meeting starts.
- **Real-Time, Low Latency Audio Processing:**
  Instantly analyze conversations as they happen, highlighting key points to keep interactions flowing naturally.

- **Intuitive Advisor Interface:**
  Use a sleek React dashboard to effortlessly access client data and real-time product suggestions.

- **Rapid Agentic AI:**
  Quickly rank and recommend financial products by merging live conversation insights with historical data.

## Architecture & Tech Stack

- **Backend:**
  - **Framework:** FastAPI
  - **Language:** Python
  - **Database:** SQLite (with pre-built schema in `db.sql` and sample data in `client_history.db`)
  - **Data Validation:** Pydantic models for robust and consistent data exchange
  - **Real-Time Communication:** WebSocket endpoints (in development) to process and respond to audio data

- **Frontend:**
  - **Framework:** React (with TypeScript)
  - **Build Tool:** Vite
  - **Styling & UI:** Tailwind CSS with Radix UI components for accessible, dynamic interfaces
  - **State Management & Data Fetching:** @tanstack/react-query and react-hook-form with Zod for validation

## Setup & Startup Instructions

### Prerequisites

- **Backend:**
  - Python 3.10+
  - pip (Python package installer)

- **Frontend:**
  - Node.js (LTS version recommended)
  - npm (or yarn)

### 1. Backend Setup

1. **Create a virtual environment and install dependencies:**
   ```bash
   python -m venv venv
   # Activate the virtual environment:
   # Linux/Mac:
   source venv/bin/activate
   # Windows:
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Run the backend server:**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at http://localhost:8000/ with automatic interactive documentation at http://localhost:8000/docs.

### 2. **Frontend Setup**

1. **Navigate to the frontend directory and install dependencies:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend will be available at http://localhost:3000/.

2. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at http://localhost:3000/.

### 3. Using the Startup Script
To simplify the process for the jury, a startup script has been provided. This script concurrently starts the backend and frontend servers.
1. **Make the script executable (if not already):**
   ```bash
   chmod +x start.sh
   ```
2. **Run the startup script:**
   ```bash
   ./start.sh
   ```
   The backend will be available at http://localhost:8000/ and the frontend at http://localhost:3000/.

The script performs the following:
Launches the FastAPI backend via uvicorn.
Navigates to the frontend directory, installs dependencies (if needed), and starts the Vite dev server.
Keeps both processes running simultaneously.
