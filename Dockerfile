# This where all the code/dependencies will go
FROM node:latest

# Set the working directory
WORKDIR /lib

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose desired port(s)
EXPOSE 3000

# Command to run the application
CMD npm start
