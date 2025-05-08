const express = require('express');
const router = express.Router();
const userSchema = require('../model/usersModel');

router.post('/', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await userSchema.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'Username or Email already exists. ' });
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
        res.status(500).json({ status: 500, message: 'Server error. ' });
    }
});

module.exports = router;
