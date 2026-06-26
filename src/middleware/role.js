/**
 * Middleware factory to enforce role-based access control.
 * @param {...string} allowedRoles - The roles that are allowed access to the route.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. User is not authenticated.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    return next();
  };
};

module.exports = {
  requireRole
};
