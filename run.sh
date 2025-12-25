#!/usr/bin/env bash
# Robust dev helper: start a local HTTP server and open the demo in your browser.
# Features:
# - Detects `python3` or `python` and falls back to `npx http-server` if available
# - Accepts `--simulate` and `--port` flags
# - Prints server PID and installs an EXIT trap to kill the server when this script exits
# - Offers to kill an existing process using the chosen port
# Usage:
#   ./run.sh                     # serve at http://localhost:8000/file-qfr.html
#   ./run.sh --simulate          # open with ?simulate=1
#   ./run.sh --port 9000         # use port 9000

set -euo pipefail

PORT=8000
SIMULATE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --simulate|-s)
      SIMULATE=1; shift ;;
    --port)
      PORT="$2"; shift 2 ;;
    --help|-h)
      sed -n '1,120p' "$0"; exit 0 ;;
    *)
      echo "Unknown arg: $1"; exit 2 ;;
  esac
done

URL="http://localhost:${PORT}/file-qfr.html"
if [[ $SIMULATE -eq 1 ]]; then
  URL="${URL}?simulate=1"
fi

# function to detect server command
start_server() {
  if command -v python3 > /dev/null 2>&1; then
    python3 -m http.server "$PORT" &
    echo $!
  elif command -v python > /dev/null 2>&1; then
    python -m http.server "$PORT" &
    echo $!
  else
    # Prefer npx/http-server. If npx missing but npm exists, offer to install http-server locally.
    if ! command -v npx > /dev/null 2>&1; then
      if command -v npm > /dev/null 2>&1; then
        echo "npx not found. npm is available. Install http-server locally so we can run it via npx? [y/N]"
        read -r yn
        if [[ "$yn" =~ ^[Yy]$ ]]; then
          npm install --no-audit --no-fund http-server >/dev/null 2>&1 || {
            echo "npm install failed. Install http-server manually or install python3." >&2
            return 1
          }
        else
          echo "Skipping auto-install. Install python3 or npx/http-server and retry." >&2
          return 1
        fi
      else
        echo "No supported local server found (python3 or npx). Install python3 or npm and retry." >&2
        return 1
      fi
    fi

    # Run via npx (now available or previously present)
    npx http-server -p "$PORT" &
    echo $!
  fi
}

# If port is in use, show info and offer to kill it
if lsof -iTCP:"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
  EXISTING_PID=$(lsof -iTCP:"$PORT" -sTCP:LISTEN -t)
  echo "Port $PORT already in use by PID $EXISTING_PID." 
  read -r -p "Kill that process and continue? [y/N] " yn
  if [[ "$yn" =~ ^[Yy]$ ]]; then
    kill "$EXISTING_PID" || { echo "Failed to kill $EXISTING_PID"; exit 1; }
    sleep 0.2
  else
    echo "Aborting."; exit 1
  fi
fi

# Start server and register cleanup
SERVER_PID=$(start_server)
if [[ -z "${SERVER_PID:-}" ]]; then
  echo "Failed to start server."; exit 1
fi

cleanup() {
  if ps -p "$SERVER_PID" > /dev/null 2>&1; then
    kill "$SERVER_PID" || true
  fi
}
trap cleanup EXIT

sleep 0.2

echo "Started server (PID $SERVER_PID) serving on port $PORT. Opening $URL"

if command -v open > /dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open > /dev/null 2>&1; then
  xdg-open "$URL"
else
  echo "Open $URL in your browser"
fi

echo "Server will be stopped when this script exits (trap installed)."
