# K Sebe Yoga Studio - Multi-stage Dockerfile

# ============================================
# Base stage with Node.js
# ============================================
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ============================================
# Dependencies stage
# ============================================
FROM base AS deps
COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY k-sebe-yoga-studioWEB/package.json ./k-sebe-yoga-studioWEB/
COPY k-sebe-yoga-studio-APPp/package.json ./k-sebe-yoga-studio-APPp/
RUN npm ci

# ============================================
# Development stage
# ============================================
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173 5174
CMD ["npm", "run", "dev:web"]

# ============================================
# Builder stage
# ============================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GEMINI_API_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Build both projects
RUN npm run build:all

# ============================================
# WEB Production stage (nginx)
# ============================================
FROM nginx:alpine AS web-production
COPY --from=builder /app/k-sebe-yoga-studioWEB/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# ============================================
# APP Production stage (nginx)
# ============================================
FROM nginx:alpine AS app-production
COPY --from=builder /app/k-sebe-yoga-studio-APPp/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
