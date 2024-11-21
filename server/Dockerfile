# Server Dockerfile
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the Prisma schema and all source files
COPY prisma ./prisma
COPY . .

# Install dependencies
RUN npm install

# Expose backend server port
EXPOSE 5000

# Start the Node.js server
CMD ["npm", "start"]
