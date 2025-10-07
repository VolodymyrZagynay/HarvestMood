const { sql, poolPromise } = require('../db');

async function getCategories(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Categories');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function createCategory(req, res) {
  try {
    const { CategoryName } = req.body;
    const pool = await poolPromise;

    await pool.request()
      .input('CategoryName', sql.NVarChar, CategoryName)
      .query('INSERT INTO Categories (CategoryName) VALUES (@CategoryName)');

    res.json({ message: 'Category created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getCategories, createCategory };
