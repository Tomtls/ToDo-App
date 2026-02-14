# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
COPY Backend/package*.json ./
RUN npm ci
COPY Backend/prisma ./prisma
COPY Backend/prisma.config.ts ./
COPY Backend/tsconfig.json ./
COPY Backend/src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NODE_ENV=production
COPY Backend/package*.json ./
RUN npm ci --omit=dev
COPY Backend/prisma ./prisma
COPY Backend/prisma.config.ts ./
RUN npx prisma generate
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["npm","run","start"]
