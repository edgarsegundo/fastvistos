# Use official Node.js slim image
FROM node:22-slim

# Set working directory
WORKDIR /app

# Install dependencies based on package-lock.json
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the rest of the project files
COPY . .

# Build the Astro site (uncomment if you want to build on container start)
# RUN npm run build

# Expose Astro's default port
EXPOSE 4321

# Default command: start Astro preview server
CMD ["npm", "run", "preview"]
