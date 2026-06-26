const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests via HTTP-only cookie containing JWT.
 * Attaches the user object to req.user if valid, otherwise returns 401.
 */
const authenticateUser = (req, res, next) => {
  const token = req.cookies ? req.cookies.auth_token : null;

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication token missing. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtsecret');
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    return next();
  } catch (error) {
    // Clear cookie on verification failure
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired session. Please log in again.'
    });
  }
};

module.exports = {
  authenticateUser
};
