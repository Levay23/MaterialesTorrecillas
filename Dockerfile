FROM node:20-slim

# Instalar dependencias necesarias para módulos nativos (bcrypt, pglite, etc.)
RUN apt-get update && apt-get install -y \
    openssl \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@9 --no-fund --no-audit

WORKDIR /app

# Copiar TODO el proyecto primero para asegurar que pnpm vea todos los package.json de los workspaces
COPY . .

# Instalar dependencias
# Usamos --no-frozen-lockfile porque al copiar todo puede haber pequeñas discrepancias
RUN pnpm install --no-frozen-lockfile

# Asegurar que el directorio de datos existe
RUN mkdir -p /app/pgdata && chmod 777 /app/pgdata

EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production
ENV PGDATA_PATH=/app/pgdata

WORKDIR /app
CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
