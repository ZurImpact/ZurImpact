# ── Stage 1: Build ──────────────────────────────────────────────────────────
# Uses Node to install dependencies and build the Vite/React app.
FROM node:20-alpine AS build

WORKDIR /app

# Enable Corepack for Yarn 4
RUN corepack enable

# Copy Yarn config and dependency files first for layer caching
COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn ./.yarn

RUN yarn install --immutable

# Copy source and build
COPY . .
RUN yarn build

# ── Stage 2: Runtime (Unprivileged & Secure) ─────────────────────────────────
# Using the official unprivileged image to run as non-root (User 101)
FROM nginxinc/nginx-unprivileged:alpine

# Copy the Vite build output to Nginx's default serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# nginx config will be mapped via config map to keep the image clean
# Non-root Nginx uses port 8080 by default (cannot bind to port 80)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
