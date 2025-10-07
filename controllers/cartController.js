const { sql, poolPromise } = require('../db');

// Додати товар у кошик
async function addToCart(req, res) {
  try {
    const { ProductId, Quantity } = req.body;
    const userId = req.user.UserId;

    const pool = await poolPromise;

    // Додаємо або оновлюємо кількість
    await pool.request()
      .input('UserId', sql.Int, userId)
      .input('ProductId', sql.Int, ProductId)
      .input('Quantity', sql.Int, Quantity)
      .query(`
        MERGE CartItems AS target
        USING (SELECT @UserId AS UserId, @ProductId AS ProductId) AS source
        ON target.UserId = source.UserId AND target.ProductId = source.ProductId
        WHEN MATCHED THEN
            UPDATE SET Quantity = target.Quantity + @Quantity, AddedAt = GETDATE()
        WHEN NOT MATCHED THEN
            INSERT (UserId, ProductId, Quantity) VALUES (@UserId, @ProductId, @Quantity);
      `);

    res.json({ message: 'Product added to cart' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Отримати всі товари з кошика
async function getCart(req, res) {
  try {
    const userId = req.user.UserId;
    const pool = await poolPromise;

    // Видалити товари старші за 7 днів
    await pool.request().query(`
      DELETE FROM CartItems WHERE DATEDIFF(day, AddedAt, GETDATE()) > 7
    `);

    // Отримати актуальні
    const result = await pool.request()
      .input('UserId', sql.Int, userId)
      .query(`
        SELECT c.CartItemId, p.ProductName, p.Price, c.Quantity, (p.Price * c.Quantity) AS Total
        FROM CartItems c
        JOIN Products p ON c.ProductId = p.ProductId
        WHERE c.UserId = @UserId
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Видалити з кошика
async function removeFromCart(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.UserId;
    const pool = await poolPromise;

    await pool.request()
      .input('CartItemId', sql.Int, id)
      .input('UserId', sql.Int, userId)
      .query('DELETE FROM CartItems WHERE CartItemId = @CartItemId AND UserId = @UserId');

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { addToCart, getCart, removeFromCart };
