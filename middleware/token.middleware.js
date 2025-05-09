const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // 'Bearer <token>'
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ status: 401, message: 'Access token required', data: null });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ status: 403, message: 'Invalid token', data: null });
        req.user = user; // ถ้า token ถูกต้อง จะมีข้อมูล user ที่ถูกเข้ารหัสอยู่ใน token
        next();
    });
};

module.exports = authenticateToken;