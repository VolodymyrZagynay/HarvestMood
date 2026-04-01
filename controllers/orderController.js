const { pool } = require('../db');

const orderController = {
  createOrder: async (req, res) => {
    const client = await pool.connect();
    try {
      const user_id = req.user.id;
      const { shipping_address } = req.body;

      await client.query('BEGIN');

      // Отримуємо кошик
      const cartItems = await client.query(`
        SELECT c.*, p.price 
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = $1
      `, [user_id]);

      if (cartItems.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Розраховуємо загальну суму
      const total_amount = cartItems.rows.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );

      // Створюємо замовлення
      const order = await client.query(
        `INSERT INTO orders (user_id, total_amount, shipping_address, status)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [user_id, total_amount, shipping_address, 'pending']
      );

      // Додаємо товари до замовлення
      for (const item of cartItems.rows) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [order.rows[0].id, item.product_id, item.quantity, item.price]
        );
      }

      // Очищаємо кошик
      await client.query('DELETE FROM cart WHERE user_id = $1', [user_id]);

      await client.query('COMMIT');
      res.status(201).json(order.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    } finally {
      client.release();
    }
  },

  getOrders: async (req, res) => {
    try {
      const user_id = req.user.id;
      const result = await pool.query(`
        SELECT o.*, 
          json_agg(json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price,
            'name', p.name
          )) as items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `, [user_id]);
      
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }
};

module.exports = orderController;