const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ngap_finance_jwt_secret_key_2026';
const REGISTRATION_PIN = process.env.REGISTRATION_PIN || '012301';

// Helper: Ensure users table exists and seed default admin if empty
const initUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(50) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`name\` VARCHAR(100) NOT NULL,
        \`role\` VARCHAR(20) DEFAULT 'admin',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [rows] = await pool.query('SELECT COUNT(*) as count FROM `users`');
    if (rows[0].count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO `users` (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'Admin Utama', 'admin']
      );
      console.log('[Auth] Default admin user initialized (username: admin, password: admin123)');
    }
  } catch (err) {
    console.error('[Auth] Error initializing users table:', err.message);
  }
};

// Immediately initialize users table
initUsersTable();

// POST /api/auth/verify-pin
const verifyPin = async (req, res) => {
  const { pin } = req.body;
  if (!pin || pin.toString() !== REGISTRATION_PIN) {
    return res.status(401).json({
      status: 'error',
      message: 'PIN Keamanan Pendaftaran tidak valid.'
    });
  }
  return res.json({
    status: 'success',
    message: 'PIN Keamanan terverifikasi.'
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    await initUsersTable();

    const { pin, username, password, name } = req.body;

    if (!pin || pin.toString() !== REGISTRATION_PIN) {
      return res.status(401).json({
        status: 'error',
        message: 'PIN Keamanan Pendaftaran tidak valid.'
      });
    }

    if (!username || !password || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama lengkap, username, dan password wajib diisi.'
      });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({
        status: 'error',
        message: 'Username minimal 3 karakter.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'Password minimal 6 karakter.'
      });
    }

    // Check existing username
    const [existing] = await pool.query('SELECT id FROM `users` WHERE username = ?', [username.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Username sudah terdaftar. Gunakan username lain.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO `users` (username, password, name, role) VALUES (?, ?, ?, ?)',
      [username.trim(), hashedPassword, name.trim(), 'admin']
    );

    return res.status(201).json({
      status: 'success',
      message: 'Registrasi akun berhasil. Silakan login dengan akun baru Anda.',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat registrasi.'
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    await initUsersTable();

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username dan password wajib diisi.'
      });
    }

    // Query user by username
    const [rows] = await pool.query('SELECT * FROM `users` WHERE username = ?', [username.trim()]);

    if (rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Username atau password salah.'
      });
    }

    const user = rows[0];

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Username atau password salah.'
      });
    }

    // Generate JWT Token (valid for 7 days)
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      status: 'success',
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat login.'
    });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Sesi tidak ditemukan. Silakan login kembali.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await pool.query('SELECT id, username, name, role FROM `users` WHERE id = ?', [decoded.id]);

    if (rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Pengguna tidak ditemukan.'
      });
    }

    return res.json({
      status: 'success',
      user: rows[0]
    });
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Sesi login telah kadaluarsa atau tidak valid.'
    });
  }
};

module.exports = {
  verifyPin,
  register,
  login,
  getMe
};
