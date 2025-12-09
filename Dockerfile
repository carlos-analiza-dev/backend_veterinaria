FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY dist ./dist

EXPOSE 5000

CMD ["node", "dist/main.js"]
