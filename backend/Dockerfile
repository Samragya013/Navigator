# Dockerfile for Interactive Map Backend
# Optimized for security and performance

# Use Node.js 20 LTS Alpine (more secure and latest stable)
FROM node:20-alpine3.19

# Add metadata
LABEL maintainer="Navigator App"
LABEL description="Interactive Map Time Estimation API"

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with security audit
RUN npm ci --only=production && \
    npm audit fix --production || true && \
    npm cache clean --force

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port (Render uses 10000 for production, 5000 for development)
EXPOSE 5000 10000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000), (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application (uses PORT env var)
CMD ["npm", "start"]
