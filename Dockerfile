FROM node:20-slim

# Instalar dependencias necesarias para módulos nativos
RUN apt-get update && apt-get install -y \
    openssl \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@9 tsx --no-fund --no-audit

WORKDIR /app

# Copiar TODO el proyecto
COPY . .

# Instalar dependencias
RUN pnpm install --no-frozen-lockfile

# Asegurar que el directorio de datos existe y es escribible
RUN mkdir -p /app/pgdata && chmod 777 /app/pgdata

EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Ejecutar el servidor DIRECTAMENTE desde el código fuente para evitar errores de empaquetado
WORKDIR /app/artifacts/api-server
CMD ["tsx", "src/index.ts"]
