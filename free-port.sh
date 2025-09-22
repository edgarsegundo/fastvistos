#!/bin/bash

# Default port
PORT=${1:-3000}

# Find the PID of the process using the given port
PID=$(lsof -ti :$PORT)

if [ -z "$PID" ]; then
  echo "✅ Port $PORT is already free."
else
  echo "⚠️  Port $PORT is in use by PID $PID. Attempting to kill it..."
  kill -9 $PID
  if [ $? -eq 0 ]; then
    echo "✅ Successfully killed process $PID. Port $PORT is now free."
  else
    echo "❌ Failed to kill process $PID. You may need to run this script with sudo."
  fi
fi
