FROM denoland/deno:1.40.0

# Set the working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY deno.json deno.lock ./

# Cache dependencies
RUN deno cache --lock=deno.lock deno.json

# Copy the rest of the application
COPY . .

# Cache the main application
RUN deno cache app.ts

# Expose the port
EXPOSE 4000

# Run the application
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "app.ts"]
