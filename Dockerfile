# Multi-stage Docker build for MOYA Landing Page on Coolify
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl, wget, ca-certificates so Coolify container health probes always succeed
RUN apk add --no-cache curl wget ca-certificates && \
    mkdir -p /root /etc && \
    echo "insecure" > /root/.curlrc && \
    echo "insecure" > /etc/curlrc && \
    echo "check_certificate = off" > /root/.wgetrc && \
    echo "check_certificate = off" > /etc/wgetrc

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.js ./
COPY server ./server

EXPOSE 3000

# Native Docker HEALTHCHECK supporting both HTTP & HTTPS local probes
HEALTHCHECK --interval=5s --timeout=5s --start-period=5s --retries=10 \
  CMD curl -k -f http://127.0.0.1:3000/health || curl -k -f https://127.0.0.1:3000/health || wget --no-check-certificate -qO- http://127.0.0.1:3000/health || node -e "require('http').get('http://127.0.0.1:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["npm", "start"]
