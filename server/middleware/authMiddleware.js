const jwt = require('jsonwebtoken');
const store = require('../utils/dataStore');

const protect = async (req, res, next) => {
  let token;

  // Check demo header switch first
  const demoUserId = req.headers['x-user-id'];
  const demoUserRole = req.headers['x-user-role'];

  if (demoUserId) {
    const user = store.users.find(u => String(u._id) === String(demoUserId));
    if (user) {
      req.user = user;
      return next();
    }
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'urban_fleet_super_secret_jwt_key_2026');
      
      const user = store.users.find(u => String(u._id) === String(decoded.id));
      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token' });
    }
  }

  // If no auth provided, default to customer demo user for smooth testing
  if (store.users.length > 0) {
    req.user = store.users[0];
    return next();
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'anonymous'}) is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
