const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { pool } = require('./db');

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

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Кореневий маршрут API
app.get('/', (req, res) => {
  res.json({
    name: 'Harvest Mood API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      docs: 'GET /api/docs',
      health: 'GET /health',
      auth: {
        register: 'POST /api/register',
        login: 'POST /api/login',
        users: 'GET /api/users'
      },
      products: {
        list: 'GET /api/products',
        search: 'GET /api/products/search?q=...',
        create: 'POST /api/products (Farmer only)',
        getOne: 'GET /api/products/:id',
        update: 'PUT /api/products/:id (Farmer only)',
        delete: 'DELETE /api/products/:id (Farmer only)',
        myProducts: 'GET /api/my-products (Farmer only)'
      },
      cart: {
        get: 'GET /api/cart',
        add: 'POST /api/cart',
        remove: 'DELETE /api/cart/:id'
      },
      orders: {
        create: 'POST /api/orders',
        list: 'GET /api/orders'
      },
      reviews: {
        create: 'POST /api/reviews',
        list: 'GET /api/reviews/:productId'
      },
      categories: {
        list: 'GET /api/categories',
        create: 'POST /api/categories (Farmer only)'
      }
    }
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API маршрути
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

// Віддача статичних файлів фронтенду (тільки в продакшені)
const frontendPath = path.join(__dirname, 'frontend', 'dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendPath)) {
  console.log('📁 Serving frontend from:', frontendPath);
  app.use(express.static(frontendPath));
  
  // Всі інші маршрути відправляємо на фронтенд
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      next();
    } else {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API: https://localhost:${PORT}/api`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Frontend: https://localhost:${PORT}`);
  }
});