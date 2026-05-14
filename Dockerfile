FROM node:20-slim

# Instalar dependencias necesarias para módulos nativos
RUN apt-get update && apt-get install -y \
    openssl \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@9 --no-fund --no-audit

WORKDIR /app

# Copiar archivos de configuración de pnpm para aprovechar el caché
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY lib/db/package.json ./lib/db/
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/ferremax/package.json ./artifacts/ferremax/

# Instalar dependencias (incluyendo las necesarias para compilar módulos nativos)
RUN pnpm install --no-frozen-lockfile

# Copiar el resto del proyecto
COPY . .

# Crear directorio de datos
RUN mkdir -p /app/pgdata && chmod 777 /app/pgdata

EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production
ENV PGDATA_PATH=/app/pgdata

# Ejecutar el servidor directamente desde su carpeta para que encuentre node_modules
WORKDIR /app/artifacts/api-server
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
