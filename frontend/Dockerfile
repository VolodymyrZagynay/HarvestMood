# ЕТАП 1: ЗБІРКА
FROM node:18-alpine AS builder

WORKDIR /app

# КОПІЮЄМО ФАЙЛИ ЗАЛЕЖНОСТЕЙ
COPY package*.json ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# ВСТАНОВЛЮЄМО ЗАЛЕЖНОСТІ
RUN npm ci

# КОПІЮЄМО ВЕСЬ КОД
COPY index.html ./
COPY public ./public
COPY src ./src

# ЗБИРАЄМО ПРОЄКТ
RUN npm run build

# ЕТАП 2: ВІДДАЄМО СТАТИКУ ЧЕРЕЗ NGINX
FROM nginx:alpine

# КОПІЮЄМО ЗІБРАНІ ФАЙЛИ
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]