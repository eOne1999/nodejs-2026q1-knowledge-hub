FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json /app
RUN npm ci
COPY . /app
RUN npm run build

FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache curl
ENV NODE_ENV=production
RUN adduser -D -g '' nodeuser
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
USER nodeuser
EXPOSE 4000
CMD ["node", "dist/main.js"]