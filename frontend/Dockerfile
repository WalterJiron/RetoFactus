FROM node:22.17-alpine

WORKDIR /app/frontend

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

CMD [ "yarn", "dev" ]

EXPOSE 3000