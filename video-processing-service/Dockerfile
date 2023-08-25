# Stage 1: Build stage
FROM node:18 AS builder

# Set /app as working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json into the working directory
COPY package*.json .

# Install any dependencies specified in package.json
RUN npm install

# Bundle app source files and folders inside the Docker image
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production stage
FROM node:18

# Install ffmpeg in the container
RUN apt-get update && apt-get install -y ffmpeg

# Set the working directory as /app
WORKDIR /app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install production-only dependencies
RUN npm install --only=production

# Copy built app from the builder stage
COPY --from=builder /app/dist ./dist

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define the command to run app using CMD which defines the runtime
CMD [ "npm", "run", "serve" ]