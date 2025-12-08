FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias de producción y dev
RUN npm install --legacy-peer-deps

# Copiar todo el código fuente
COPY . .

# Compilar NestJS
RUN npm run build

# Exponer puerto
EXPOSE 5000

# Ejecutar la app
CMD ["node", "dist/main.js"]
