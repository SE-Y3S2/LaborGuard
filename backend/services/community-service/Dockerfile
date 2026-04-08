FROM node:20-alpine AS base
RUN apk add --no-cache dumb-init python3 make g++ libc6-compat
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --legacy-peer-deps

FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5002
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]