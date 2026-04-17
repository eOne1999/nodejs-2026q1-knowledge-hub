FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache curl
ENV NODE_ENV=production
RUN adduser -D -g '' nodeuser
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
USER nodeuser
EXPOSE 4000
CMD ["./entrypoint.sh"]