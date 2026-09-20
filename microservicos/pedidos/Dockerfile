FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --verbose

COPY . .

EXPOSE 3002

CMD ["npm", "start"]