# ── Stage 1: Build frontend ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx vite build

# ── Stage 2: Production ─────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server files
COPY server.js db.js csv-parser.js seed.js ./

# Copy built frontend
COPY --from=builder /app/public ./public

# Create data directory for SQLite
RUN mkdir -p data && chown -R node:node /app

USER node

ENV NODE_ENV=production
ENV PORT=8000
ENV ANTHROPIC_API_KEY=

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost:8000/api/stats || exit 1

CMD ["node", "server.js"]
