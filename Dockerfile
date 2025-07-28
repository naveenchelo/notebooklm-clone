# Use valid Node.js LTS image
FROM node:22-alpine AS build


WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the full project
COPY . .

# Build frontend
RUN npm run build

# Final stage
FROM node:22-alpine

WORKDIR /app

COPY --from=build /app /app

EXPOSE 3000
CMD ["npm", "start"]
