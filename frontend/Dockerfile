
# ---------- 1. Build Stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Accept the env from docker-compose at build time
ARG VITE_MODEL_BASE=/
ENV VITE_MODEL_BASE=${VITE_MODEL_BASE}

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY . .

# Ensure old cached bundles don't remain
RUN rm -rf dist .vite || true

# Build the Vite app with correct API URL injected
RUN npm run build


# ---------- 2. Nginx Serve Stage ----------
FROM nginx:alpine

# Copy build output into nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]