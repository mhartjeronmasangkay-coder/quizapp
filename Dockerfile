# Stage 1 - Build the Angular app
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first (faster builds)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all Angular files
COPY . .

# Build for production
RUN npm run build --configuration=production

# Stage 2 - Serve with Nginx
FROM nginx:alpine

# Copy built files to Nginx
COPY --from=builder /app/dist/quizapp/browser /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]