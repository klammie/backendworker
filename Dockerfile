FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Ensure Prisma client is generated inside the container
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "server.js"]