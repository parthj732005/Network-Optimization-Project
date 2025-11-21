FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_MODEL_BASE=/
ENV VITE_MODEL_BASE=${VITE_MODEL_BASE}

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY . .
RUN rm -rf dist .vite || true
RUN npm run build

FROM nginx:alpine

RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 
