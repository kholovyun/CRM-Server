FROM node:18.16-alpine

WORKDIR /app

COPY package.json .

RUN npm install


COPY . .

RUN npm run seed

#RUN npm run build

#ENV APP_PORT=8000

CMD ["npm", "run", "dev"]