#!/bin/bash

# Navigate to the script's directory
cd "$(dirname "$0")"

echo "Starting Frontend Application..."

# Run npm start with BROWSER=none to avoid opening a new tab automatically
# You can remove BROWSER=none if you want it to open the browser
BROWSER=none npm start
