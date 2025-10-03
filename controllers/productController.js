const { sql, poolPromise } = require('../db');

// Створення продукту (тільки фермер)
async function createProduct(req, res) {
  try {
    const { ProductName, Description, Price, StockQuantity, CategoryId } = req.body;
    const farmerId = req.user.UserId;

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

    // якщо були картинки
    if (req.files?.images) {
      for (const file of req.files.images) {
        await pool.request()
          .input('ProductId', sql.Int, productId)
          .input('ImageUrl', sql.NVarChar, '/uploads/' + file.filename)
          .query('INSERT INTO ProductImages (ProductId, ImageUrl) VALUES (@ProductId, @ImageUrl)');
      }
    }

    res.json({ message: 'Product created successfully', productId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Отримати всі продукти
async function getProducts(req, res) {
  try {
    const { search, category } = req.query;
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

    // додаємо картинки до кожного продукту
    for (let product of result.recordset) {
      const images = await pool.request()
        .input('ProductId', sql.Int, product.ProductId)
        .query('SELECT ImageUrl FROM ProductImages WHERE ProductId = @ProductId');

      product.Images = images.recordset.map(img => img.ImageUrl);
    }

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

// Оновити продукт
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const farmerId = req.user.UserId;

    const { ProductName, Description, Price, StockQuantity, CategoryId } = req.body;

    const pool = await poolPromise;
    let updateFields = [];
    let request = pool.request();

    request.input('ProductId', sql.Int, id);
    request.input('FarmerId', sql.Int, farmerId);

    if (ProductName) {
      updateFields.push("ProductName = @ProductName");
      request.input('ProductName', sql.NVarChar, ProductName);
    }
    if (Description) {
      updateFields.push("Description = @Description");
      request.input('Description', sql.NVarChar, Description);
    }
    if (Price) {
      updateFields.push("Price = @Price");
      request.input('Price', sql.Decimal(10,2), parseFloat(Price));
    }
    if (StockQuantity) {
      updateFields.push("StockQuantity = @StockQuantity");
      request.input('StockQuantity', sql.Int, parseInt(StockQuantity));
    }
    if (CategoryId) {
      updateFields.push("CategoryId = @CategoryId");
      request.input('CategoryId', sql.Int, parseInt(CategoryId));
    }

    if (updateFields.length === 0 && !req.files?.images) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // текстові поля
    if (updateFields.length > 0) {
      const query = `
        UPDATE Products
        SET ${updateFields.join(", ")}
        WHERE ProductId = @ProductId AND FarmerId = @FarmerId
      `;
      await request.query(query);
    }

    // нові картинки
    if (req.files?.images) {
      for (const file of req.files.images) {
        await pool.request()
          .input('ProductId', sql.Int, id)
          .input('ImageUrl', sql.NVarChar, '/uploads/' + file.filename)
          .query('INSERT INTO ProductImages (ProductId, ImageUrl) VALUES (@ProductId, @ImageUrl)');
      }
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
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
