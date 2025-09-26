const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'harvest_admin',
  password: process.env.DB_PASSWORD || 'H@rv3stP@ss!',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'Harvest_Mood',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => pool)
  .catch(err => console.log('Database connection failed:', err));

module.exports = { sql, poolPromise };