# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./

# Install all dependencies for building
RUN npm install

COPY . .

# Build Next.js
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies
RUN npm install --omit=dev

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
