# ---- Build Stage ----
# Use a Node.js version compatible with your Angular dependencies
FROM node:22-alpine AS build

# Set the working directory
WORKDIR /app

# --- Dependency Installation ---
# Copy ONLY the package.json files that actually exist.
# We copy them first to leverage Docker's layer caching.
COPY backend/package.json ./backend/
COPY backend/package-lock.json ./backend/
COPY frontend/package.json ./frontend/
COPY frontend/package-lock.json ./frontend/

# Install backend dependencies
RUN npm install --prefix backend

# Install frontend dependencies inside the 'frontend' directory
RUN npm install --prefix frontend

# --- Source Code Copy ---
# Now that dependencies are installed, copy the rest of the source code.
# The .dockerignore file will prevent local node_modules from being copied.
COPY . .

# --- Frontend Build ---
# Run the Angular build command from within the frontend directory.
RUN cd frontend && npm run build

# =========================================================
# !!! CRITICAL DEBUGGING STEP !!!
# This will show the 'dist' directory if the build was successful.
# =========================================================
RUN echo "--- Listing frontend directory contents after build ---" && ls -laR frontend

# ===============================================
# === NEW DEBUGGING LINE: ADD THIS LINE ===
# ===============================================
# This will list the files in the src directory so we can see what's there.
RUN ls -la /app/backend/src


# ---- Final Stage ----
# Use a fresh, lean image for the final application
FROM node:22-alpine

WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production

# Copy all necessary files from the build stage
# This includes the built frontend, the backend source, and all node_modules.
COPY --from=build /app /app

# Expose the port the application runs on
EXPOSE 3000

# Command to start the backend server, which will serve the frontend.
CMD ["npm", "start", "--prefix", "backend"]