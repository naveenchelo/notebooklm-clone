# ---- Build Stage ----
FROM node:22-alpine AS build

WORKDIR /app

# Install Angular CLI globally (optional)
RUN npm install -g @angular/cli

# Copy root package.json and install
COPY package*.json ./
RUN npm install

# Copy frontend package.json and install in its folder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend source
COPY frontend/. .

# Build frontend Angular app
RUN npm run build

# ---- Final Stage ----
FROM node:22-alpine

WORKDIR /app

# Copy backend source
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy the rest of backend code
COPY backend/. .

EXPOSE 3000

CMD ["npm", "start"]
