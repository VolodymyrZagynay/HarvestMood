const { sql, poolPromise } = require('../db');

// Створення продукту (тільки фермер)
async function createProduct(req, res) {
  try {
    const { ProductName, Description, Price, StockQuantity, CategoryId, Images } = req.body;
    const farmerId = req.user.UserId; // хто залогінився

    const pool = await poolPromise;
    const result = await pool.request()
      .input('FarmerId', sql.Int, farmerId)
      .input('CategoryId', sql.Int, CategoryId)
      .input('ProductName', sql.NVarChar, ProductName)
      .input('Description', sql.NVarChar, Description)
      .input('Price', sql.Decimal(10, 2), Price)
      .input('StockQuantity', sql.Int, StockQuantity)
      .query(`
        INSERT INTO Products (FarmerId, CategoryId, ProductName, Description, Price, StockQuantity)
        OUTPUT INSERTED.ProductId
        VALUES (@FarmerId, @CategoryId, @ProductName, @Description, @Price, @StockQuantity)
      `);

    const productId = result.recordset[0].ProductId;

    // Додаємо картинки, якщо передали
    if (Images && Images.length > 0) {
      for (const url of Images) {
        await pool.request()
          .input('ProductId', sql.Int, productId)
          .input('ImageUrl', sql.NVarChar, url)
          .query('INSERT INTO ProductImages (ProductId, ImageUrl) VALUES (@ProductId, @ImageUrl)');
      }
    }

    res.json({ message: 'Product created successfully', productId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Отримати всі продукти з опціями фільтрації
async function getProducts(req, res) {
  try {
    const { search, category } = req.query; // query params
    let query = `
      SELECT p.ProductId, p.ProductName, p.Description, p.Price, p.StockQuantity, p.CreatedAt,
             u.UserName AS FarmerName, c.CategoryName
      FROM Products p
      JOIN Users u ON p.FarmerId = u.UserId
      JOIN Categories c ON p.CategoryId = c.CategoryId
      WHERE 1=1
    `;

    if (search) query += ` AND p.ProductName LIKE '%${search}%' `;
    if (category) query += ` AND c.CategoryName = '${category}' `;

    const pool = await poolPromise;
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Отримати продукт за ID
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const product = await pool.request()
      .input('ProductId', sql.Int, id)
      .query(`
        SELECT p.*, u.UserName AS FarmerName, c.CategoryName
        FROM Products p
        JOIN Users u ON p.FarmerId = u.UserId
        JOIN Categories c ON p.CategoryId = c.CategoryId
        WHERE p.ProductId = @ProductId
      `);

    if (product.recordset.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // картинки
    const images = await pool.request()
      .input('ProductId', sql.Int, id)
      .query('SELECT ImageUrl FROM ProductImages WHERE ProductId = @ProductId');

    const fullProduct = product.recordset[0];
    fullProduct.Images = images.recordset.map(img => img.ImageUrl);

    res.json(fullProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Оновити продукт (тільки фермер, свій продукт)
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { ProductName, Description, Price, StockQuantity, CategoryId } = req.body;
    const farmerId = req.user.UserId;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProductId', sql.Int, id)
      .input('FarmerId', sql.Int, farmerId)
      .input('ProductName', sql.NVarChar, ProductName)
      .input('Description', sql.NVarChar, Description)
      .input('Price', sql.Decimal(10, 2), Price)
      .input('StockQuantity', sql.Int, StockQuantity)
      .input('CategoryId', sql.Int, CategoryId)
      .query(`
        UPDATE Products
        SET ProductName = @ProductName,
            Description = @Description,
            Price = @Price,
            StockQuantity = @StockQuantity,
            CategoryId = @CategoryId
        WHERE ProductId = @ProductId AND FarmerId = @FarmerId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(403).json({ message: 'You can only update your own products' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Видалити продукт
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const farmerId = req.user.UserId;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('ProductId', sql.Int, id)
      .input('FarmerId', sql.Int, farmerId)
      .query('DELETE FROM Products WHERE ProductId = @ProductId AND FarmerId = @FarmerId');

    if (result.rowsAffected[0] === 0) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
