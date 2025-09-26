function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.Role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

module.exports = { authorizeRole };