# ---- Build Stage ----
FROM node:22-alpine AS build

WORKDIR /app

# Install Angular CLI globally (optional but helpful)
RUN npm install -g @angular/cli

# Copy only the package.json files (for dependency install)
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies (inside Docker, Linux platform)
RUN npm install

# Copy rest of the source code AFTER installing dependencies
COPY . .

# Build the frontend
RUN npm run build:frontend

# ---- Final Stage ----
FROM node:22-alpine

WORKDIR /app

# Copy all built code and deps from build stage
COPY --from=build /app /app

EXPOSE 3000

CMD ["npm", "start"]
