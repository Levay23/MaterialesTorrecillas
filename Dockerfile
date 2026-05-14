# --- Etapa de producción ---
# Usamos la imagen completa (no slim) para tener python/make disponibles
# para compilar módulos nativos como bcrypt en Linux
FROM node:20-bullseye

# Instalar openssl para Baileys
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Instalar pnpm de forma estable
RUN npm install -g pnpm@9 --no-fund --no-audit

WORKDIR /app

# 1. Copiar archivos de configuración del workspace primero (optimiza caché)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# 2. Copiar los package.json de cada paquete para que pnpm sepa qué instalar
COPY lib/db/package.json ./lib/db/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY artifacts/api-server/package.json ./artifacts/api-server/

# 3. Instalar solo dependencias de producción
RUN pnpm install --ignore-scripts

# 4. Copiar el código fuente completo (necesario para imports de workspace)
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/

# 5. Copiar el bundle ya compilado localmente (dist ya existe)
COPY artifacts/api-server/dist/ ./artifacts/api-server/dist/

# Puerto requerido por Hugging Face
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Arrancar el servidor con el bundle ya compilado
CMD ["node", "--enable-source-maps", "./artifacts/api-server/dist/index.mjs"]
