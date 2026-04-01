FROM node:18-slim

WORKDIR /app

# Копіюємо package.json для бекенду
COPY package*.json ./

# Встановлюємо залежності бекенду
RUN npm install

# Копіюємо та збираємо фронтенд
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
RUN npm run build || echo "Frontend build skipped or failed"

# Повертаємось в корінь
WORKDIR /app

# Копіюємо весь код бекенду
COPY . .

# Створюємо папку для завантажень
RUN mkdir -p uploads

EXPOSE 10000

CMD ["node", "server.js"]