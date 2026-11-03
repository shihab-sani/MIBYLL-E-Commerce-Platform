# ============================================================
# Stage 1 — build
# ============================================================
FROM node:20.11-alpine AS build
WORKDIR /app

# Copy manifests first — caches dependency layer across source changes
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund --prefer-offline

# Copy only the files Vite needs
COPY index.html vite.config.js tailwind.config.js postcss.config.js ./
COPY src ./src

# ⚠️ Only PUBLIC config may be baked into the bundle.
# The API base is a relative path → no hostname, no secret.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL} \
    NODE_ENV=production

# Build, then strip source maps — they expose your source code to attackers
RUN npm run build \
    && find /app/dist -type f -name '*.map' -delete \
    && find /app/dist -type f -name '*.js' -exec grep -l 'sourcesContent' {} \; \
       -exec sed -i 's/"sourcesContent":\[[^]]*\]/"sourcesContent":[]/g' {} \;

# ============================================================
# Stage 2 — runtime
# ============================================================
# nginxinc/nginx-unprivileged runs as UID 101 and listens on 8080
# by default. No privileged port binding, no root user.
FROM nginxinc/nginx-unprivileged:1.27-alpine

# Copy hardened server config
COPY --chown=101:101 nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the compiled assets — no node_modules, no source, no .env
COPY --chown=101:101 --from=build /app/dist /usr/share/nginx/html

# Healthcheck for orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]