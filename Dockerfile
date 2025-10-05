# syntax=docker/dockerfile:1

# --- Base image versions ---
ARG NODE_VERSION=20-alpine

# --- Dependencies stage ---
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
# Enable corepack and pnpm
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- Builder stage ---
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build Next.js
ENV NODE_ENV=production
RUN pnpm build

# --- Runner stage ---
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
# Next.js server respects PORT
ENV PORT=8080
# Expose for Fly
EXPOSE 8080
# Install postgres client for running SQL migrations
RUN apk add --no-cache postgresql-client bash
# Copy app build and minimal files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/drizzle.config.json ./drizzle.config.json
COPY --from=builder /app/database/migrations ./database/migrations
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Install production dependencies
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate \
  && pnpm install --prod --frozen-lockfile

# Start Next.js server
CMD ["pnpm", "start", "-p", "8080"]
