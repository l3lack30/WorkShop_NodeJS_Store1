const express = require('express');
const router = express.Router();
const productSchema = require('../model/productsModel');
const ordersSchema = require('../model/ordersModel');
const authenticateToken = require('../middleware/token.middleware');
const upload = require('../middleware/uploads.middleware');

// Get all products
router.get('/', authenticateToken, async (req, res) => {
    try {
        const products = await productSchema.find({});
        res.status(200).json({
            status: 200,
            message: 'Products fetched successfully. ',
            data: products
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error. ', data: null });
    }
});

// Get By Id product
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await productSchema.findById(productId);

        if (!product) {
            return res.status(404).json({
                status: 404,
                message: 'Product not found. ',
                data: null
            });
        }

        res.status(200).json({
            status: 200,
            message: 'Product fetched successfully. ',
            data: product
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error. ', data: null });
    }
});

// Post a new product
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, category, stock, rating } = req.body;

        // ตรวจสอบว่ามีชื่อเมนูนี้ในระบบอยู่แล้วหรือไม่
        const existingProduct = await productSchema.findOne({ name });

        if (existingProduct) {
            return res.status(400).json({
                status: 400,
                message: 'This menu name is already in use. Please choose a different name.',
                data: null
            });
        }

        const newProduct = new productSchema({
            name,
            price,
            stock,
            description,
            category,
            rating,
            image: req.file ? `/images/${req.file.filename}` : null
        });

        await newProduct.save();

        res.status(201).json({
            status: 201,
            message: 'Product created successfully. ',
            data: {
                id: newProduct._id,
                menu_name: newProduct.name,
                rating: newProduct.rating,
                price: newProduct.price,
                description: newProduct.description,
                category: newProduct.category,
                stock: newProduct.stock,
                image: newProduct.image,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error. ', data: null });
    }
});

//Put Product
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, price, description, category, stock, rating } = req.body;
        const updateData = { name, price, description, category, stock, rating };

        // ถ้ามีการอัปโหลดรูปใหม่ ให้ใส่ path ใหม่เข้าไป
        if (req.file) {
            updateData.image = `/images/${req.file.filename}`;
        }

        const updatedProduct = await productSchema.findByIdAndUpdate(
            productId,
            updateData,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ status: 404, message: 'Product not found. ', data: null });
        };

        res.status(200).json({
            status: 200,
            message: 'Product updated successfully. ',
            data: {
                name: updatedProduct.name,
                price: updatedProduct.price,
                description: updatedProduct.description,
                rating: updatedProduct.rating,
                category: updatedProduct.category,
                stock: updatedProduct.stock,
                image: updatedProduct.image,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error. ', data: null });
    }
});

// Delete Product
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.id;

        const deletedProduct = await productSchema.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ status: 404, message: 'Product not found. ', data: null });
        }

        res.status(200).json({
            status: 200,
            message: 'Product deleted successfully.'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error. ', data: null });
    }
});

/*------------- Orders of Products -------------*/

// Get All Order of Product
router.get('/:id/orders', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.id;

        const productExists = await productSchema.findById(productId);

        if (!productExists) {
            return res.status(404).json({
                status: 404,
                message: 'Product not found.',
                data: null
            });
        }

        const orders = await ordersSchema
            .find({ productId })
            .populate('productId', 'name price')
            .populate('userId', 'name');

        res.status(200).json({
            status: 200,
            message: 'Orders fetched successfully. ',
            data: orders
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error. ', data: null });
    }
});

// Post Order in Product
router.post('/:id/orders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id; //  ดึง userId จาก JWT ที่ถูก decode โดย middleware
        const productId = req.params.id;
        const { quantity, note } = req.body;

        //ตรวจสอบความถูกต้องของส่งค่าที่ไม่สมเหตุสมผล เช่น สั่งสินค้า 0 ชิ้น หรือ -1 ชิ้น
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ status: 400, message: 'Invalid quantity', data: null });
        }

        // ตรวจสอบว่า userId ถูกส่งมาหรือไม่
        if (!userId) {
            return res.status(400).json({ status: 400, message: 'User ID is required', data: null });
        }

        // หา product จาก DB
        const product = await productSchema.findById(productId);

        if (!product) {
            return res.status(404).json({ status: 404, message: 'Product not found', data: null });
        }

        // เช็ค stock
        if (product.stock < quantity) {
            return res.status(400).json({
                status: 400,
                message: `Insufficient stock. Available: ${product.stock}`,
                data: null
            });
        }

        // คำนวณราคาทั้งหมด
        const totalPrice = quantity * product.price;

        // สร้าง order
        const newOrder = new ordersSchema({
            userId,
            productId,
            quantity,
            note,
            totalPrice,
        });

        // อัปเดต stock สินค้า
        product.stock -= quantity;

        await product.save();
        await newOrder.save();

        res.status(201).json({
            status: 201,
            message: 'Order placed successfully',
            data: newOrder,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: 'Server error. ', data: null });
    }
});

module.exports = router;
