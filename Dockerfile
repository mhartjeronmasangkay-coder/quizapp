FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

# Runs the dev server, listens to all network interfaces, and polls for file changes
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]
