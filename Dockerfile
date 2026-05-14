FROM node:20-slim

# Instalar dependencias necesarias para Puppeteer/Baileys si fuera necesario
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Instalar pnpm usando npm en lugar de corepack para mayor estabilidad
RUN npm install -g pnpm@9

WORKDIR /app

# Copiar archivos del monorepo
COPY . .

# Instalar dependencias
RUN pnpm install

# Hugging Face requiere el puerto 7860
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Comando de inicio usando tsx para evitar errores de esbuild en Linux
CMD ["npx", "tsx", "artifacts/api-server/src/index.ts"]
