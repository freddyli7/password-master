FROM node:12.16-alpine
WORKDIR /app
RUN mkdir -p /passwordMaster
WORKDIR /app/passwordMaster
COPY . .
