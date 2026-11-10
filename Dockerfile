FROM node:26.13.0-bookworm-slim

ENV PORT=8080
ENV HOST=0.0.0.0

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 8080

USER node

CMD [ "npm", "run", "start"]