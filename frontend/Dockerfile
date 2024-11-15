FROM node:14 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM iamfreee/docker-nginx-static-spa:latest
COPY --from=builder /usr/src/app/build /var/www/html