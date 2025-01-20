# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json ./

# Install Hardhat and other dependencies
RUN npm install

# Copy the rest of the project files to the working directory
COPY . .

# Command to run Hardhat; here we are using the compile command by default
CMD ["npm", "run", "start"]
