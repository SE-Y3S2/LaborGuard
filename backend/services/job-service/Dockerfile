FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using legacy peer deps for robustness)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose the internal port (5006)
EXPOSE 5006

# Start the service
CMD ["node", "src/server.js"]
