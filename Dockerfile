FROM denoland/deno:1.44.4

WORKDIR /app

# Copy backend source code
COPY backend/ .

# Expose port
EXPOSE 4000

# Start the application
CMD ["deno", "run", "--allow-all", "app.ts"]
