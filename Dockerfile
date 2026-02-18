# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including devDeps for tsc)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Set environment
ENV NODE_ENV=production

# Copy only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy compiled code from builder stage
COPY --from=builder /app/dist ./dist

# The app uses service-account.json by default if FIREBASE_SERVICE_ACCOUNT is not set.
# However, for Cloud Run it's recommended to use Secret Manager or the environment variable.
# We will assume the user will set the FIREBASE_SERVICE_ACCOUNT env var.

CMD ["npm", "start"]
