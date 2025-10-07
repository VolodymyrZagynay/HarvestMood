const { sql, poolPromise } = require('../db');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/auth');

async function register(req, res) {
  try {
    const { UserName, Email, Password, Role } = req.body;

    if (!Password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const pool = await poolPromise;

    const check = await pool.request()
      .input('Email', sql.NVarChar, Email)
      .query('SELECT * FROM Users WHERE Email = @Email');

    if (check.recordset.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(Password, 10);

    await pool.request()
      .input('UserName', sql.NVarChar, UserName)
      .input('Email', sql.NVarChar, Email)
      .input('PasswordHash', sql.NVarChar, hashed)
      .input('Role', sql.NVarChar, Role)
      .query('INSERT INTO Users (UserName, Email, PasswordHash, Role) VALUES (@UserName, @Email, @PasswordHash, @Role)');

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function login(req, res) {
  try {
    const { Email, Password } = req.body;

    if (!Password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('Email', sql.NVarChar, Email)
      .query('SELECT * FROM Users WHERE Email = @Email');

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(Password, user.PasswordHash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// -------------------- CRUD --------------------

async function getUsers(req, res) {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT UserId, UserName, Email, Role, CreatedAt FROM Users');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserId', sql.Int, id)
      .query('SELECT UserId, UserName, Email, Role, CreatedAt FROM Users WHERE UserId = @UserId');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { UserName, Role } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('UserId', sql.Int, id)
      .input('UserName', sql.NVarChar, UserName)
      .input('Role', sql.NVarChar, Role)
      .query('UPDATE Users SET UserName = @UserName, Role = @Role WHERE UserId = @UserId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'User not found or nothing to update' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('UserId', sql.Int, id)
      .query('DELETE FROM Users WHERE UserId = @UserId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { register, login, getUsers, getUserById, updateUser, deleteUser };
