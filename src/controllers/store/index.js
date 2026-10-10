const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../../modals/product');

// Setup multer for product image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/assets/uploads/products');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// E-commerce Home Page
router.get('/', async (req, res) => {
    try {
        let filterCategory = req.query.category || 'all';
        let query = {};
        if (filterCategory !== 'all') {
            query.category = filterCategory;
        }
        
        const products = await Product.find(query);
        
        res.render('store_home', { 
            products: products,
            currentCategory: filterCategory
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Product Show Page (List of all products, could be same as home or paginated, using home for now)
router.get('/products', (req, res) => {
    res.redirect('/store');
});

// Checkout Page
router.get('/checkout', (req, res) => {
    res.render('store_checkout');
});

// Admin Dashboard Page
const storeAdminUser = { role: 'Admin', name: 'Store Admin', _id: 'store_admin_123', userId: 'admin01' };

const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId === 'store_admin_123') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

router.get('/admin', isAdmin, async (req, res) => {
    const products = await Product.find();
    res.render('store_admin_dashboard', { products, activePage: 'dashboard', user: storeAdminUser, page: 'Store Admin Dashboard' });
});

router.get('/admin/products', isAdmin, async (req, res) => {
    const products = await Product.find();
    res.render('store_admin_products', { products, activePage: 'products', user: storeAdminUser, page: 'Products Management' });
});

// Add new product
router.post('/admin/products', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, category, price, description } = req.body;
        const imagePath = req.file ? '/uploads/products/' + req.file.filename : '';

        const newProduct = new Product({
            name,
            category,
            price,
            description,
            image: imagePath
        });

        await newProduct.save();
        res.redirect('/store/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding product");
    }
});

// Delete product
router.post('/admin/products/delete/:id', isAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/store/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting product");
    }
});

// Edit product
router.post('/admin/products/edit/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, category, price, description } = req.body;
        const updateData = { name, category, price, description };
        
        if (req.file) {
            updateData.image = '/uploads/products/' + req.file.filename;
        }

        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/store/admin/products');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating product");
    }
});

router.get('/admin/users', isAdmin, (req, res) => {
    res.render('store_admin_users', { activePage: 'users', user: storeAdminUser, page: 'User Activity' });
});

router.get('/admin/orders', isAdmin, (req, res) => {
    res.render('store_admin_orders', { activePage: 'orders', user: storeAdminUser, page: 'Orders & Sales' });
});

// Product Details Page
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).send('Product not found');
        }
        
        // Find related products
        const relatedProducts = await Product.find({ category: product.category, _id: { $ne: product._id } }).limit(3);
        
        res.render('store_product_details', { 
            product,
            relatedProducts
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
