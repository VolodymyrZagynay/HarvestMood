const { pool } = require('../db');

const reviewController = {
  createReview: async (req, res) => {
    try {
      const { product_id, rating, comment } = req.body;
      const user_id = req.user.id;

      const result = await pool.query(
        `INSERT INTO reviews (user_id, product_id, rating, comment)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [user_id, product_id, rating, comment]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  },

  getReviews: async (req, res) => {
    try {
      const { productId } = req.params;
      const result = await pool.query(`
        SELECT r.*, u.name as user_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC
      `, [productId]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }
};

module.exports = reviewController;