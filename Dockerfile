FROM node:20 AS build

WORKDIR /app

# Instalar herramientas de compilación + libudev
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libudev-dev \
    libusb-1.0-0-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:20 AS production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json /app/yarn.lock ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/main.js"]
