const { sql, poolPromise } = require('../db');

async function createReview(req, res) {
  try {
    const { OrderItemId, Rating, Comment } = req.body;
    const userId = req.user.UserId;

    const pool = await poolPromise;

    const orderItem = await pool.request()
      .input('OrderItemId', sql.Int, OrderItemId)
      .query(`
        SELECT oi.OrderItemId, o.CustomerId, oi.ProductId
        FROM OrderItems oi
        JOIN Orders o ON oi.OrderId = o.OrderId
        WHERE oi.OrderItemId = @OrderItemId
      `);

    if (orderItem.recordset.length === 0) {
      return res.status(400).json({ message: "Invalid OrderItemId" });
    }

    const item = orderItem.recordset[0];

    if (item.CustomerId !== userId) {
      return res.status(403).json({ message: "You can review only your own purchases" });
    }

    const existing = await pool.request()
      .input('OrderItemId', sql.Int, OrderItemId)
      .query(`SELECT * FROM Reviews WHERE OrderItemId = @OrderItemId`);

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: "Review already exists for this item" });
    }

    await pool.request()
      .input('OrderItemId', sql.Int, OrderItemId)
      .input('Rating', sql.Int, Rating)
      .input('Comment', sql.NVarChar, Comment || null)
      .query(`INSERT INTO Reviews (OrderItemId, Rating, Comment) VALUES (@OrderItemId, @Rating, @Comment)`);

    res.json({ message: "Review created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function getReviews(req, res) {
  try {
    const { productId } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('ProductId', sql.Int, productId)
      .query(`
        SELECT r.ReviewId, r.Rating, r.Comment, r.CreatedAt, u.UserName
        FROM Reviews r
        JOIN OrderItems oi ON r.OrderItemId = oi.OrderItemId
        JOIN Orders o ON oi.OrderId = o.OrderId
        JOIN Users u ON o.CustomerId = u.UserId
        WHERE oi.ProductId = @ProductId
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createReview, getReviews };
