# Install dependencies only when needed
FROM node:22-alpine3.21 AS deps
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile


# Build the app with cache dependencies
FROM node:22-alpine3.21 AS builder
WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . ./

RUN yarn build
RUN yarn install --frozen-lockfile --production && yarn cache clean


# Production image, copy all the files and run next
FROM node:22-alpine3.21 AS runner
WORKDIR /usr/src/app

# Install only production dependencies
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

ENV NODE_ENV=production
USER node
EXPOSE 4000

CMD [ "node", "dist/src/main.js" ]