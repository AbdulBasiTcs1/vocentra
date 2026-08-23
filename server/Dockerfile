# ---- Base Stage ----
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Production Stage ----
FROM base AS production

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only production node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Change ownership to the non-root user
RUN chown -R appuser:appgroup /app

USER appuser

# Expose the port the app listens on
EXPOSE 8000

# Health check to verify the server is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:8000/ || exit 1

# Start the server
CMD ["node", "index.js"]
