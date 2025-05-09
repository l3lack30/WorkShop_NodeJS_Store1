const express = require('express');
const userSchema = require('../model/usersModel');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
// const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;

        // ค้นหาผู้ใช้
        const user = await userSchema.findOne({ username });
        if (!user) {
            return res.status(400).json({ status: 400, message: 'Invalid username or password.', data: null });
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ status: 400, message: 'Invalid username or password.', data: null });
        }

        // ตรวจสอบสถานะการอนุมัติของผู้ใช้
        if (!user.isApproved) {
            return res.status(401).json({ status: 401, message: 'User not approved.', data: null });
        }

        // สร้าง JWT access token (ระยะเวลาสั้น)
        const accessToken = jwt.sign(
            {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // // สร้าง JWT refresh token (ระยะเวลายาว)
        // const refreshToken = jwt.sign(
        //     {
        //         id: user._id,
        //         username: user.username,
        //         email: user.email,
        //         role: user.role,
        //     },
        //     JWT_SECRET,
        //     { expiresIn: JWT_REFRESH_EXPIRES_IN }
        // );

        res.status(200).json({
            status: 200,
            message: 'Login successfully. ',
            access_token: accessToken,
            // refresh_token: refreshToken,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                isApproved: user.isApproved,
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error. ', data: null });
    }
});

module.exports = router;
