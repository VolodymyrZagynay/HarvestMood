const { sql, poolPromise } = require('../db');

async function createOrder(req, res) {
  try {
    const { items } = req.body; 
    // items = [{ ProductId: 1, Quantity: 2 }, { ProductId: 3, Quantity: 1 }]

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one product" });
    }

    const pool = await poolPromise;

    let total = 0;
    for (const item of items) {
      const product = await pool.request()
        .input('ProductId', sql.Int, item.ProductId)
        .query('SELECT Price, StockQuantity FROM Products WHERE ProductId = @ProductId');

      if (product.recordset.length === 0) {
        return res.status(400).json({ message: `Product ${item.ProductId} not found` });
      }

      const { Price, StockQuantity } = product.recordset[0];
      if (item.Quantity > StockQuantity) {
        return res.status(400).json({ message: `Not enough stock for product ${item.ProductId}` });
      }

      total += Price * item.Quantity;
    }

    const orderResult = await pool.request()
      .input('CustomerId', sql.Int, req.user.UserId)
      .input('TotalAmount', sql.Decimal(10,2), total)
      .query('INSERT INTO Orders (CustomerId, TotalAmount) OUTPUT INSERTED.OrderId VALUES (@CustomerId, @TotalAmount)');

    const orderId = orderResult.recordset[0].OrderId;

    for (const item of items) {
      const product = await pool.request()
        .input('ProductId', sql.Int, item.ProductId)
        .query('SELECT Price, StockQuantity FROM Products WHERE ProductId = @ProductId');

      const { Price, StockQuantity } = product.recordset[0];

      await pool.request()
        .input('OrderId', sql.Int, orderId)
        .input('ProductId', sql.Int, item.ProductId)
        .input('Quantity', sql.Int, item.Quantity)
        .input('UnitPrice', sql.Decimal(10,2), Price)
        .query('INSERT INTO OrderItems (OrderId, ProductId, Quantity, UnitPrice) VALUES (@OrderId, @ProductId, @Quantity, @UnitPrice)');

      await pool.request()
        .input('ProductId', sql.Int, item.ProductId)
        .input('NewStock', sql.Int, StockQuantity - item.Quantity)
        .query('UPDATE Products SET StockQuantity = @NewStock WHERE ProductId = @ProductId');
    }

    res.json({ message: "Order created successfully", orderId, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function getOrders(req, res) {
  try {
    const pool = await poolPromise;

    const orders = await pool.request()
      .input('CustomerId', sql.Int, req.user.UserId)
      .query('SELECT * FROM Orders WHERE CustomerId = @CustomerId ORDER BY OrderDate DESC');

    const result = [];
    for (const order of orders.recordset) {
      const items = await pool.request()
        .input('OrderId', sql.Int, order.OrderId)
        .query(`SELECT oi.OrderItemId, oi.Quantity, oi.UnitPrice, 
                       p.ProductName, p.ProductId
                FROM OrderItems oi
                JOIN Products p ON oi.ProductId = p.ProductId
                WHERE oi.OrderId = @OrderId`);

      result.push({ ...order, items: items.recordset });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createOrder, getOrders };
