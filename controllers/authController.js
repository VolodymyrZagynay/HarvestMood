const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, phone, address, role } = req.body;
      
      // Перевірка чи користувач існує
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Хешування пароля
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Створення користувача
      const result = await pool.query(
        `INSERT INTO users (name, email, password, phone, address, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, role, phone, address, created_at`,
        [name, email, hashedPassword, phone, address, role || 'Customer']
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  },
  
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Пошук користувача
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = result.rows[0];
      
      // Перевірка пароля
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Створення токена
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key-change-this',
        { expiresIn: '7d' }
      );
      
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },
  
  getUsers: async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, name, email, role, phone, address, created_at FROM users ORDER BY id'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },
  
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        'SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },
  
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, phone, address } = req.body;
      
      const result = await pool.query(
        `UPDATE users SET name = $1, phone = $2, address = $3 WHERE id = $4
         RETURNING id, name, email, role, phone, address`,
        [name, phone, address, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  },
  
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
};

module.exports = authController;