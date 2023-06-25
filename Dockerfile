FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV APP_PORT=8000

CMD ["npm", "run", "dev"]