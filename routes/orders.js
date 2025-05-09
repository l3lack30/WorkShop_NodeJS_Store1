const express = require('express');
const router = express.Router();
const ordersSchema = require('../model/ordersModel');
const authenticateToken = require('../middleware/token.middleware');

// Get all orders
router.get('/', authenticateToken, async (req, res) => {
    try {
        const orders = await ordersSchema.find({});
        res.json({
            status: 200,
            message: 'Orders fetched successfully. ',
            data: orders
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error. ' });
    }
});

module.exports = router;