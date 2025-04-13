#!/bin/bash

echo "Starting the FastAPI backend..."
uvicorn main:app --reload &
BACKEND_PID=$!
echo "Backend started with PID ${BACKEND_PID}"

echo "Navigating to the frontend directory..."
cd frontend || { echo "Frontend directory not found! Exiting."; exit 1; }

if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

echo "Starting the Vite development server..."
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID ${FRONTEND_PID}"

echo "Both backend and frontend are running."
echo "Press Ctrl+C to stop the servers..."

trap "echo 'Stopping servers...'; kill ${BACKEND_PID} ${FRONTEND_PID}; exit 0" SIGINT

wait
