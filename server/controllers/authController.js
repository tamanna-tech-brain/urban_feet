const jwt = require('jsonwebtoken');
const store = require('../utils/dataStore');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'urban_fleet_super_secret_jwt_key_2026', {
    expiresIn: '30d',
  });
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        specialization: user.specialization,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Register new customer
// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const newUser = {
      _id: 'usr_' + Date.now(),
      name,
      email,
      password: password || 'password123',
      role: role || 'customer',
      phone: phone || '',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      specialization: '',
      createdAt: new Date(),
    };

    store.users.push(newUser);
    store.saveToFile();

    const token = generateToken(newUser._id);
    res.status(201).json({
      success: true,
      token,
      user: newUser,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get current user
// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// @desc Get all users / personas
// @route GET /api/auth/users
exports.getUsers = async (req, res) => {
  const sanitized = store.users.map(({ password, ...u }) => u);
  res.json({
    success: true,
    users: sanitized,
  });
};
