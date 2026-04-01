const { pool } = require('../db');

const productController = {
  getProducts: async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT p.*, u.name as farmer_name, c.name as category_name
        FROM products p
        LEFT JOIN users u ON p.farmer_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  getProductById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(`
        SELECT p.*, u.name as farmer_name, c.name as category_name
        FROM products p
        LEFT JOIN users u ON p.farmer_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { name, description, price, unit, stock, category_id } = req.body;
      const farmer_id = req.user.id;
      const image_url = req.file ? `/uploads/${req.file.filename}` : null;

      const result = await pool.query(
        `INSERT INTO products (farmer_id, category_id, name, description, price, unit, stock, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [farmer_id, category_id, name, description, price, unit, stock, image_url]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, unit, stock, category_id } = req.body;
      
      const result = await pool.query(
        `UPDATE products 
         SET name = $1, description = $2, price = $3, unit = $4, stock = $5, category_id = $6
         WHERE id = $7 AND farmer_id = $8
         RETURNING *`,
        [name, description, price, unit, stock, category_id, id, req.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found or unauthorized' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'DELETE FROM products WHERE id = $1 AND farmer_id = $2 RETURNING id',
        [id, req.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found or unauthorized' });
      }
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  },

  searchProducts: async (req, res) => {
    try {
      const { q } = req.query;
      const result = await pool.query(
        `SELECT * FROM products 
         WHERE name ILIKE $1 OR description ILIKE $1
         ORDER BY created_at DESC`,
        [`%${q}%`]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error searching products:', error);
      res.status(500).json({ error: 'Failed to search products' });
    }
  },

  getMyProducts: async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM products WHERE farmer_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching my products:', error);
      res.status(500).json({ error: 'Failed to fetch my products' });
    }
  }
};

module.exports = productController;