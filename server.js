const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { sql, poolPromise } = require('./db');

const cartController = require('./controllers/cartController');
const authController = require('./controllers/authController');
const productController = require('./controllers/productController');
const orderController = require('./controllers/orderController');
const reviewController = require('./controllers/reviewController');
const categoryController = require('./controllers/categoryController');

const { authenticateToken } = require('./middlewares/authMiddleware');
const { authorizeRole } = require('./middlewares/roleMiddleware');
const { upload } = require('./middlewares/uploadMiddleware');

const app = express();

// Спершу базові middleware
app.use(cors());
app.use(bodyParser.json());

// Потім статичні файли - ДОДАЙТЕ ЦЕ ТУТ
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Далі всі ваші API маршрути (залишаємо без змін)
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

app.get('/api/users', authController.getUsers);
app.get('/api/users/:id', authController.getUserById);
app.put('/api/users/:id', authController.updateUser);
app.delete('/api/users/:id', authController.deleteUser);

app.get('/api/products/search', productController.searchProducts);

app.post(
  '/api/products',
  authenticateToken,
  authorizeRole('Farmer'),
  upload,
  productController.createProduct
);

app.get('/api/products', productController.getProducts);
app.get('/api/products/:id', productController.getProductById);

app.put(
  '/api/products/:id',
  authenticateToken,
  authorizeRole('Farmer'),
  upload,
  productController.updateProduct
);

app.delete(
  '/api/products/:id',
  authenticateToken,
  authorizeRole('Farmer'),
  productController.deleteProduct
);

app.get('/api/my-products',
  authenticateToken,
  authorizeRole('Farmer'),
  productController.getMyProducts
);

// Cart
app.post('/api/cart', authenticateToken, cartController.addToCart);
app.get('/api/cart', authenticateToken, cartController.getCart);
app.delete('/api/cart/:id', authenticateToken, cartController.removeFromCart);

// Orders
app.post('/api/orders', authenticateToken, orderController.createOrder);
app.get('/api/orders', authenticateToken, orderController.getOrders);

// Reviews
app.post('/api/reviews', authenticateToken, reviewController.createReview);
app.get('/api/reviews/:productId', reviewController.getReviews);

// Categories
app.get('/api/categories', categoryController.getCategories);
app.post('/api/categories', authenticateToken, authorizeRole('Farmer'), categoryController.createCategory);

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  try {
    const pool = await poolPromise;
    console.log('Connected to MSSQL');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
  console.log(`Server running on port ${PORT}`);
});