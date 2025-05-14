const mongoose = require('mongoose');
const { Schema } = mongoose;

const ordersSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'canceled'],
        default: 'pending',
    },
    note: {
        type: String,
        default: '',
        trim: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('orders', ordersSchema);