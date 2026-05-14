FROM node:20-bullseye

# Instalar openssl para Baileys
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Instalar pnpm
RUN npm install -g pnpm@9 --no-fund --no-audit

WORKDIR /app
RUN mkdir -p /app/pgdata

# Copiar TODO el proyecto (ya incluye dist/ pre-compilado)
COPY . .

# Instalar todas las dependencias (sin compilar módulos nativos)
RUN pnpm install --ignore-scripts

# Puerto requerido por Hugging Face
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production
ENV PGDATA_PATH=/app/pgdata

# Arrancar con el bundle pre-compilado
CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
