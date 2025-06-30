FROM denoland/deno:alpine-1.44.4

WORKDIR /app

# Copy package files first
COPY deno.json ./

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start the application
CMD ["deno", "run", "--allow-all", "app.ts"]
