const authorizeRoles = (...allowedRoles) => (req, res, next) => {
    const user = req.user; 

    if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ status: 403, message: 'Forbidden: Admin access only.' });
    }

    next();
};

module.exports = authorizeRoles;