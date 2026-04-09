const express = require('express');
const router = express.Router();
const TeleconsultBooking = require('../../modals/teleconsultBooking');
const Users = require('../../modals/users');

// User-facing route to render the booking form
router.get('/', (req, res) => {
    res.render('teleconsult_booking');
});

// Route to handle form submission
router.post('/submit', async (req, res) => {
    try {
        const newBooking = new TeleconsultBooking(req.body);
        await newBooking.save();
        res.status(200).json({ success: true, message: 'Booking created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Admin Route to view all bookings
router.get('/admin', async (req, res) => {
    if (!req.session.userId) return res.redirect('/auth/login');
    
    try {
        const loggedInUser = await Users.findById(req.session.userId);
        if (loggedInUser.role !== 'Admin') {
            return res.redirect('/');
        }
        
        const bookings = await TeleconsultBooking.find().sort({ createdAt: -1 });

        res.render('teleconsultBookings', {
            page: "Teleconsult Bookings",
            user: loggedInUser,
            bookings
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// Admin Route to delete a booking
router.post('/admin/delete/:id', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ success: false });
    try {
        const loggedInUser = await Users.findById(req.session.userId);
        if (loggedInUser.role !== 'Admin') {
            return res.status(403).json({ success: false });
        }
        
        await TeleconsultBooking.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

// Admin Route to fetch single booking for edit
router.get('/admin/:id', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ success: false });
    try {
        const loggedInUser = await Users.findById(req.session.userId);
        if (loggedInUser.role !== 'Admin') return res.status(403).json({ success: false });
        
        const booking = await TeleconsultBooking.findById(req.params.id);
        if(!booking) return res.status(404).json({ success: false });
        
        res.status(200).json({ success: true, booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

// Admin Route to logically update a booking
router.post('/admin/update/:id', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ success: false });
    try {
        const loggedInUser = await Users.findById(req.session.userId);
        if (loggedInUser.role !== 'Admin') return res.status(403).json({ success: false });
        
        const updateData = req.body;
        
        await TeleconsultBooking.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        res.status(200).json({ success: true });
    } catch(err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;
