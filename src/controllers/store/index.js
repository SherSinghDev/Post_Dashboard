const express = require('express');
const router = express.Router();

// Mock products data
const products = [
    {
        id: 1,
        name: "Ayurvedic Herbal Tea",
        category: "ayurveda",
        price: 299,
        image: "https://picsum.photos/seed/bsrf_tea/800/800",
        description: "A soothing blend of traditional herbs to boost immunity and calm the mind.",
        rating: 4.8,
        reviews: 124
    },
    {
        id: 2,
        name: "Kids Brain Builder Puzzle",
        category: "kids",
        price: 499,
        image: "https://picsum.photos/seed/bsrf_puzzle/800/800",
        description: "Educational puzzle designed to enhance cognitive skills in young children.",
        rating: 4.5,
        reviews: 89
    },
    {
        id: 3,
        name: "Ashwagandha Extract",
        category: "ayurveda",
        price: 599,
        image: "https://picsum.photos/seed/bsrf_extract/800/800",
        description: "Pure Ashwagandha root extract for stress relief and vitality.",
        rating: 4.9,
        reviews: 312
    },
    {
        id: 4,
        name: "Organic Baby Lotion",
        category: "kids",
        price: 349,
        image: "https://picsum.photos/seed/bsrf_lotion/800/800",
        description: "Gentle, organic lotion safe for baby's sensitive skin.",
        rating: 4.7,
        reviews: 201
    },
    {
        id: 5,
        name: "Triphala Churna",
        category: "ayurveda",
        price: 199,
        image: "https://picsum.photos/seed/bsrf_churna/800/800",
        description: "Classic Ayurvedic formulation for digestive health.",
        rating: 4.6,
        reviews: 156
    },
    {
        id: 6,
        name: "Children's Story Book Set",
        category: "kids",
        price: 799,
        image: "https://picsum.photos/seed/bsrf_books/800/800",
        description: "A collection of 5 beautifully illustrated bedtime stories.",
        rating: 4.9,
        reviews: 420
    }
];

// E-commerce Home Page
router.get('/', (req, res) => {
    let filterCategory = req.query.category || 'all';
    let displayProducts = products;
    
    if (filterCategory !== 'all') {
        displayProducts = products.filter(p => p.category === filterCategory);
    }
    
    res.render('store_home', { 
        products: displayProducts,
        currentCategory: filterCategory
    });
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

router.get('/admin', isAdmin, (req, res) => {
    res.render('store_admin_dashboard', { products, activePage: 'dashboard', user: storeAdminUser, page: 'Store Admin Dashboard' });
});

router.get('/admin/products', isAdmin, (req, res) => {
    res.render('store_admin_products', { products, activePage: 'products', user: storeAdminUser, page: 'Products Management' });
});

router.get('/admin/users', isAdmin, (req, res) => {
    res.render('store_admin_users', { activePage: 'users', user: storeAdminUser, page: 'User Activity' });
});

router.get('/admin/orders', isAdmin, (req, res) => {
    res.render('store_admin_orders', { activePage: 'orders', user: storeAdminUser, page: 'Orders & Sales' });
});

// Product Details Page
router.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        return res.status(404).send('Product not found');
    }
    
    // Find related products
    const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);
    
    res.render('store_product_details', { 
        product,
        relatedProducts
    });
});

module.exports = router;
