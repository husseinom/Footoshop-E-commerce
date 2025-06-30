#!/bin/bash

# Render Deployment Script for Deno Application
echo "Starting Deno application deployment..."

# Install Deno if not available
if ! command -v deno &> /dev/null; then
    echo "Installing Deno..."
    curl -fsSL https://deno.land/x/install/install.sh | sh
    export PATH="$HOME/.deno/bin:$PATH"
fi

# Check Deno version
deno --version

# Start the application
echo "Starting Footoshop backend server..."
deno run --allow-net --allow-read --allow-write app.ts
