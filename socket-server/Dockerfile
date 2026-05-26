FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy socket server
COPY index.js .

# Expose port
EXPOSE 4000

# Start the server
CMD ["node", "index.js"]
