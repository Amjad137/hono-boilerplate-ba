FROM node:20-alpine AS base

FROM base AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Set environment variables
ENV HUSKY=0
ENV NODE_ENV=production

# Enable Corepack for correct Yarn version
RUN corepack enable
RUN yarn set version 4.3.0

# Copy all files first for Yarn PnP compatibility
COPY . .

# Install dependencies and build
RUN yarn install --immutable
RUN yarn run build

# Create environment file after build
ARG ENV=production
RUN yarn run env:copy:${ENV}

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

# Copy only the necessary files from the builder stage
COPY --from=builder --chown=hono:nodejs /app/dist /app/dist
COPY --from=builder --chown=hono:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=hono:nodejs /app/package.json /app/package.json
COPY --from=builder --chown=hono:nodejs /app/yarn.lock /app/yarn.lock
COPY --from=builder --chown=hono:nodejs /app/.env /app/.env
COPY --from=builder --chown=hono:nodejs /app/.yarn /app/.yarn

# Set production environment
ENV NODE_ENV=production

USER hono
EXPOSE 8000

CMD ["node", "/app/dist/index.js"]