FROM node:18-alpine3.15 AS base

WORKDIR /app
COPY ["package.json", "./"]

FROM base AS development
RUN npm install
COPY . .
CMD [ "npm", "run", "start:dev" ]

FROM base AS production
RUN npm install
COPY . .
RUN npm i -g @nestjs/cli
RUN npm run build
CMD [ "npm", "run", "start" ]