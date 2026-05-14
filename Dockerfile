FROM node:22-slim

# Instalar dependencias necesarias para Puppeteer/Baileys si fuera necesario
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Habilitar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar archivos del monorepo
COPY . .

# Instalar dependencias
RUN pnpm install

# Construir los paquetes necesarios
RUN pnpm --filter @workspace/api-server --if-present build

# Hugging Face requiere el puerto 7860
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Comando de inicio
CMD ["pnpm", "--filter", "@workspace/api-server", "start"]
