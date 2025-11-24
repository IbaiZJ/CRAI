FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files
COPY --from=base /app/dist ./dist

# Expose port
EXPOSE 4321

# Start server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4321"]
