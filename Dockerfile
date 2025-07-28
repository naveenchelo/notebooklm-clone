# ---- Build Stage ----
# Use a Node.js version compatible with your Angular dependencies
FROM node:22-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package management files first for efficient caching
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install ALL dependencies cleanly inside the container.
# This ensures the correct (Linux) version of all packages are installed.
RUN npm install

# Now that dependencies are correctly installed, copy the rest of the source code.
# The .dockerignore file should prevent your local node_modules from being copied.
COPY . .

# Build the frontend.
# The command should be "npm run build" inside the frontend directory.
RUN npm run build:frontend

# =========================================================
# !!! CRITICAL DEBUGGING STEP !!!
# List the contents of the frontend directory to see the build output.
# This will show us if the 'dist/browser' directory was created.
# =========================================================
RUN echo "--- Listing frontend directory contents after build ---" && ls -laR frontend


# ---- Final Stage ----
# Use a fresh, lean image for the final application
FROM node:22-alpine

WORKDIR /app

# Copy the entire built application from the build stage
COPY --from=build /app /app

# Expose the port the application runs on
EXPOSE 3000

# Command to start the backend server
CMD ["npm", "start"]