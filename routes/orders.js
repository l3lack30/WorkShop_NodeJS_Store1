const express = require('express');
const router = express.Router();
const ordersSchema = require('../model/ordersModel');
const authenticateToken = require('../middleware/token.middleware');

// Get all orders
router.get('/', authenticateToken, async (req, res) => {
    try {
        const orders = await ordersSchema
            .find({})
            .populate('productId', 'name price')
            .populate('userId', 'username');

        res.status(200).json({
            status: 200,
            message: 'Orders fetched successfully.',
            data: orders
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 500,
            message: 'Server error.',
            data: null
        });
    }
});

// Put order
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        const updatedOrder = await ordersSchema.findByIdAndUpdate(
            orderId,
            { status },
            { new: true, runValidators: true }
        );

        const allowedStatuses = ['รอดำเนินการ', 'กำลังดำเนินการ', 'สำเร็จ', 'ยกเลิก'];
        
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                status: 400,
                message: 'สถานะไม่ถูกต้อง',
                data: null
            });
        }

        if (!updatedOrder) {
            return res.status(404).json({
                status: 404,
                message: 'ไม่พบคำสั่งซื้อนี้',
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            message: 'อัปเดตสถานะคำสั่งซื้อสำเร็จ',
            data: updatedOrder
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 500,
            message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์',
            data: null
        });
    }
});

// Delete order
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const orderId = req.params.id;

        const deletedOrder = await ordersSchema.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({
                status: 404,
                message: 'Order not found.',
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Order deleted successfully.'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 500,
            message: 'Server error.',
            data: null
        });
    }
});

module.exports = router;