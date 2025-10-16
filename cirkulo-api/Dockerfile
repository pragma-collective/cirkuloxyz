# Use Bun image
FROM oven/bun:1.3-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Start the application
CMD ["bun", "run", "dev"]
