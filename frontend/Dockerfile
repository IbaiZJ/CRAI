# Base image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (allow legacy peer deps to avoid react@18 peer conflicts)
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start dev server with host binding
CMD ["npm", "run", "dev"]