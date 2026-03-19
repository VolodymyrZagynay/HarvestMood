const express = require('express');
global.dbConnected = false;
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

// Простий маршрут для кореня - інформація про API
app.get('/', (req, res) => {
  res.json({
    name: 'Harvest Mood API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
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

// Додайте також маршрут для перевірки здоров'я (health check)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: global.dbConnected ? 'connected' : 'checking'
  });
});

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
    global.dbConnected = true; 
    console.log('Connected to MSSQL');
  } catch (err) {
    global.dbConnected = false; 
    console.error('Database connection failed:', err);
  }
  console.log(`Server running on port ${PORT}`);
});