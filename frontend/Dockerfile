# ============================================================
# BAFS Frontend Dockerfile
# Multi-stage: deps, builder, development, and production
# ============================================================

# ── Base ─────────────────────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app
RUN apk add --no-cache libc6-compat curl

# ── Dependencies ──────────────────────────────────────────────
FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

# ── Development ───────────────────────────────────────────────
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "dev"]

# ── Builder ───────────────────────────────────────────────────
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ── Production ────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public directory and static assets
COPY --from=builder /app/public ./public

# Copy standalone build output and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
