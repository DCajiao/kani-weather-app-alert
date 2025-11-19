# -----------------------------
# 1) Build Stage
# -----------------------------
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias del sistema (si Vite necesita)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copiar package.json y lockfiles para cache de dependencias
COPY package*.json ./

# Si usas pnpm o yarn, cámbialo aquí
RUN npm install

# Copiar toda la app
COPY . .

# Build de producción
RUN npm run build


# -----------------------------
# 2) Production Stage (Nginx)
# -----------------------------
FROM nginx:1.27-alpine AS runner

# Copiar build de Vite al html público de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración opcional de nginx (ver debajo)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
