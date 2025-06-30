FROM denoland/deno:latest

# Set the working directory
WORKDIR /app

# Copy the application
COPY . .

# Cache the main application and dependencies
RUN deno cache app.ts

# Expose the port
EXPOSE 4000

# Run the application
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "app.ts"]
