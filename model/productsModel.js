const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
    },
    stock: {
        type: Number,
        min: 0
    },
    category: {
        type: String,
        unique: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('products', productSchema);