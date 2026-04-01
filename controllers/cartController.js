const { pool } = require('../db');

const cartController = {
  addToCart: async (req, res) => {
    try {
      const { product_id, quantity } = req.body;
      const user_id = req.user.id;

      // Перевіряємо, чи товар вже в кошику
      const existing = await pool.query(
        'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
        [user_id, product_id]
      );

      if (existing.rows.length > 0) {
        // Оновлюємо кількість
        const result = await pool.query(
          'UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
          [quantity, user_id, product_id]
        );
        return res.json(result.rows[0]);
      }

      // Додаємо новий товар
      const result = await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [user_id, product_id, quantity]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Failed to add to cart' });
    }
  },

  getCart: async (req, res) => {
    try {
      const user_id = req.user.id;
      const result = await pool.query(`
        SELECT c.*, p.name, p.price, p.image_url 
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = $1
      `, [user_id]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  },

  removeFromCart: async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const result = await pool.query(
        'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, user_id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }
      
      res.json({ message: 'Item removed from cart' });
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ error: 'Failed to remove from cart' });
    }
  }
};

module.exports = cartController;