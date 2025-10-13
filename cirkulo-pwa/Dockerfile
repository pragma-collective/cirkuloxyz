# Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Accept build argument for Dynamic environment ID
ARG VITE_DYNAMIC_ENVIRONMENT_ID
ENV VITE_DYNAMIC_ENVIRONMENT_ID=$VITE_DYNAMIC_ENVIRONMENT_ID

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Caddy
FROM caddy:2-alpine

# Copy built application from builder stage
COPY --from=builder /app/build/client /srv

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port
EXPOSE 3000

# Caddy runs automatically with the Caddyfile
