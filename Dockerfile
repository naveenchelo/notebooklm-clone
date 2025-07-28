# Use a Node.js version that is compatible with your Angular CLI dependencies
FROM node:22-alpine AS build

WORKDIR /app

# Copy package.json files for both root, backend, and frontend
# This optimizes Docker's layer caching
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for the entire project
RUN npm install

# Copy the rest of the project source code
COPY . .

# Build the Angular frontend
# The build command will now succeed because the Node.js version is correct
RUN npm run build:frontend

# --- Final Stage ---
# Use a lean image for the final application
FROM node:22-alpine

WORKDIR /app

# Copy only the necessary files from the build stage
# This includes node_modules, backend code, and the BUILT frontend
COPY --from=build /app /app

# Expose the port your application will run on
EXPOSE 3000

# The command to start your Node.js server
CMD ["npm", "start"]