# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install ALL dependencies (including devDependencies for the build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the production bundle
# VITE_API_URL can be passed as a build-arg so the bundled JS points at the right backend
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Production Stage ----
# Use a minimal nginx image to serve the static files
FROM nginx:stable-alpine AS production

# Remove the default nginx config and copy a custom one
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
