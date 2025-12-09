FROM node:20-alpine AS build

# Instala herramientas de compilación + headers
RUN apk add --no-cache python3 make g++ linux-headers

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json /app/yarn.lock ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "dist/main.js"]
