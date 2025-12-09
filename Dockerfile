FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache python3 g++ make git


COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 5000
CMD ["node", "dist/main.js"]
