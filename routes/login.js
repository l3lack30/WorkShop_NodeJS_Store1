const express = require('express');
const userSchema = require('../model/usersModel');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;

       // ค้นหาผู้ใช้
       const user = await userSchema.findOne({ username });
       if (!user) {
           return res.status(400).json({ status: 400, message: 'Invalid username or password.' });
       }

       // ตรวจสอบรหัสผ่าน
       const isMatch = await user.comparePassword(password);
       if (!isMatch) {
           return res.status(400).json({ status: 400, message: 'Invalid username or password.' });
       }

       // ตรวจสอบสถานะการอนุมัติของผู้ใช้
       if (!user.isApproved) {
           return res.status(401).json({ status: 401, message: 'User not approved.' });
       }

        // สร้าง JWT token
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            status: 200,
            message: 'Login successfully. ',
            access_token: token,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                isApproved: user.isApproved,
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error. ' });
    }
});

module.exports = router;
