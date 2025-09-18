# HealthGo Dockerfile
# Multi-stage build for production

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S healthgo -u 1001

# Copy built application
COPY --from=builder --chown=healthgo:nodejs /app/dist ./dist
COPY --from=builder --chown=healthgo:nodejs /app/package*.json ./
COPY --from=builder --chown=healthgo:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER healthgo

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start the application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]