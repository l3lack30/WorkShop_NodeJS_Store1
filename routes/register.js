const express = require('express');
const router = express.Router();
const userSchema = require('../model/usersModel');

router.post('/', async (req, res) => {
    const { username, email, password } = req.body;

    // ตรวจสอบว่าฟิลด์ไหนไม่ได้กรอก
    const missingFields = [];
    if (!username) missingFields.push('username');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
        return res.status(400).json({
            status: 400,
            message: `Missing required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}.`,
            data: null
        });
    }

    try {
        const existingUser = await userSchema.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'Username or Email already exists. ', data: null });
        }

        const newUser = new userSchema({
            username,
            email,
            password
        });

        await newUser.save();

        res.status(201).json({
            status: 201,
            message: 'Registered successfully. ',
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                isApproved: newUser.isApproved,
                createdAt: newUser.createdAt,
                password: newUser.password
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error. ', data: null });
    }
});

module.exports = router;
