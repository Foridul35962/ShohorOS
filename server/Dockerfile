FROM node:20-alpine

WORKDIR /server

COPY package*.json ./

RUN npm install

COPY . .

# apply for production
# RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "dev"]

# apply for production
# CMD ["npm", "start"]