FROM denoland/deno:1.45.0

WORKDIR /app

# Copy all source files
COPY . .

# Expose port
EXPOSE 4000

# Run the application (let Deno handle dependency resolution at runtime)
CMD ["deno", "run", "--allow-all", "app.ts"]
