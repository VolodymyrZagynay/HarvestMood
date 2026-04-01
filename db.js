const { Pool } = require('pg');

// Перевіряємо, чи ми в продакшені
const isProduction = process.env.NODE_ENV === 'production';

// Налаштування підключення
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/harvest_mood',
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Перевірка підключення
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

module.exports = { pool };