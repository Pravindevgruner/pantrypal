# -------------------------------------------------------------
# PantryPal Backend Production Container Image
# Multi-stage build for optimal image size and minimal attack surface
# -------------------------------------------------------------

FROM node:20-alpine AS dependencies

WORKDIR /app

# Install build dependencies if native addons require them
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# -------------------------------------------------------------
# Runtime Stage
# -------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Ensure security updates and curl/wget for healthchecks
RUN apk add --no-cache curl wget tzdata

ENV NODE_ENV=production
ENV PORT=5000
ENV TZ=Asia/Kolkata

# Create app directory with correct permissions for non-root user
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src/ ./src/
COPY --chown=node:node config/ ./config/

# Run as non-root user for container security
USER node

EXPOSE 5000

# Docker Healthcheck targeting the REST API health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "src/app.js"]
