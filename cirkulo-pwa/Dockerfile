# Build stage
FROM node:22-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Accept build arguments for environment variables
ARG VITE_DYNAMIC_ENVIRONMENT_ID
ARG VITE_LENS_APP_ADDRESS
ENV VITE_DYNAMIC_ENVIRONMENT_ID=$VITE_DYNAMIC_ENVIRONMENT_ID
ENV VITE_LENS_APP_ADDRESS=$VITE_LENS_APP_ADDRESS


# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies with build scripts enabled for trusted packages
RUN pnpm install --frozen-lockfile --ignore-scripts=false

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage with Caddy
FROM caddy:2-alpine

# Copy built application from builder stage
COPY --from=builder /app/build/client /srv

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port
EXPOSE 3000

# Caddy runs automatically with the Caddyfile
