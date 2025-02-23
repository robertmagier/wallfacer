# Use official Node.js image as the base image
FROM node:18-alpine AS builder

# Set working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm
# Install dependencies
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Build the app
RUN pnpm run build

# Use a lightweight production image
FROM node:18-alpine

# Set working directory
WORKDIR /app
# Copy built files from the builder stage
COPY --from=builder /app ./

# Expose the port (matches API_PORT)
EXPOSE 3001

# Run the application
CMD ["node", "dist/main.js"]
