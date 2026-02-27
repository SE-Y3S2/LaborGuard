FROM node:20-alpine

# Install native build dependencies required by @tensorflow/tfjs-node
RUN apk add --no-cache python3 make g++ libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 3002

# Start the service
CMD ["node", "src/index.js"]
