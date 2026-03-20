# AI Compliance Platform Frontend Dockerfile (Optimized Multi-Stage)

# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code and build
COPY . .

# Accept dynamic API URL securely for Cloud Run deployments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder phase
COPY --from=build /app/build /usr/share/nginx/html

# Update Nginx to listen on port 3000 instead of 80 to match docker-compose.yml
RUN sed -i 's/listen  *80;/listen 3000;/g' /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]