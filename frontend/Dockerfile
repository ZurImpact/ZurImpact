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

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
# Lean Nginx image — only the static build output, no Node or build tools.
FROM nginx:alpine

# Remove default Nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy the Vite build output
COPY --from=build /app/dist /usr/share/nginx/html

# SPA routing: fall back to index.html for client-side routes
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
