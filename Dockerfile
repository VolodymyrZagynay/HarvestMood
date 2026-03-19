FROM node:18-slim

WORKDIR /app

# Копіюємо package.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо весь код
COPY . .

RUN mkdir -p uploads

EXPOSE 4000

CMD ["node", "server.js"]