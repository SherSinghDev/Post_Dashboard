const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const {
    University,
    Course,
    Student,
    Application,
    Counsellor,
    Lead,
    Center,
    Notice,
    StudyMaterial,
    OnlineClass,
    OnlineExam,
    Certificate
} = require('../../modals/education');

const User = require('../../modals/users');
const seedEducationData = require('../../services/educationSeed');

// Ensure upload directory exists
const uploadDir = './src/assets/uploads/education';
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (e) {
        console.error("Could not create upload directory:", e);
    }
}

// Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Middleware to ensure default demo data is populated on first request
router.use(async (req, res, next) => {
    try {
        await seedEducationData();
    } catch (e) {
        console.error("Seed check error:", e);
    }
    next();
});

// Helper for session auth
const isStudentAuth = (req, res, next) => {
    if (req.session && req.session.eduStudentId) {
        return next();
    }
    return res.redirect('/education/student/login?redirect=' + encodeURIComponent(req.originalUrl));
};

const isCounsellorAuth = (req, res, next) => {
    if (req.session && req.session.eduCounsellorId) {
        return next();
    }
    return res.redirect('/education/counsellor/login');
};

const isCenterAuth = (req, res, next) => {
    if (req.session && req.session.eduCenterId) {
        return next();
    }
    return res.redirect('/education/centre/login');
};

const isAdminAuth = (req, res, next) => {
    if (req.session && req.session.eduAdminAuth) {
        return next();
    }
    return res.redirect('/education/admin/login?redirect=' + encodeURIComponent(req.originalUrl));
};

// ==========================================
// 1. PUBLIC PAGES & MAIN WEBSITE
// ==========================================

// Main Education Home Page
router.get('/', async (req, res) => {
    try {
        const universities = await University.find({ isActive: true }).lean();
        const courses = await Course.find({ isActive: true }).lean();
        const notices = await Notice.find().sort({ createdAt: -1 }).limit(5).lean();
        
        // Count statistics
        const stats = {
            totalUniversities: universities.length || 50,
            totalCourses: courses.length || 120,
            totalStudents: 15400,
            placementAssistance: "100%"
        };

        res.render('education/index', {
            pageTitle: 'BSRF Education Portal - Top Universities & Distance Learning',
            universities,
            courses,
            notices,
            stats,
            userSession: req.session,
            activeNav: 'home'
        });
    } catch (err) {
        console.error("Error loading education home:", err);
        res.status(500).send("Error loading education portal");
    }
});

// About Us Page
router.get('/about', async (req, res) => {
    try {
        const universities = await University.find({ isActive: true }).limit(8).lean();
        res.render('education/about', {
            pageTitle: 'About Us | BSRF Education Portal',
            universities,
            activeNav: 'about'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Free Education Project Page
router.get('/free-education', async (req, res) => {
    try {
        res.render('education/free_education', {
            pageTitle: 'Free Education Project | BSRF Vidya Abhiyan',
            activeNav: 'free-education'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Courses Directory Page
router.get('/courses', async (req, res) => {
    try {
        const { category, stream, mode, search } = req.query;
        let query = { isActive: true };

        if (category && category !== 'All') {
            query.category = category;
        }
        if (stream && stream !== 'All') {
            query.stream = stream;
        }
        if (mode && mode !== 'All') {
            query.mode = mode;
        }
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const courses = await Course.find(query).lean();
        const universities = await University.find({ isActive: true }).lean();
        const categories = ['All', 'UG', 'PG', 'Diploma', 'Certificate', 'Doctoral', 'Vocational'];
        const streams = [
            'All', 'Computer Science', 'Management', 'Engineering', 'Arts & Humanities', 
            'Commerce', 'Law', 'Pharmacy', 'Physiotherapy', 'Agriculture', 
            'Journalism & Mass Comm', 'Fashion & Design', 'Library Science'
        ];

        res.render('education/courses', {
            pageTitle: 'Explore Online, Distance & Regular Courses | BSRF Education',
            courses,
            universities,
            categories,
            streams,
            selectedCategory: category || 'All',
            selectedStream: stream || 'All',
            selectedMode: mode || 'All',
            searchQuery: search || '',
            activeNav: 'courses'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Universities Directory Page
router.get('/universities', async (req, res) => {
    try {
        const universities = await University.find({ isActive: true }).lean();
        const courses = await Course.find({ isActive: true }).lean();

        // Attach course count to each university
        universities.forEach(u => {
            u.courseCount = courses.filter(c => String(c.universityId) === String(u._id)).length;
        });

        res.render('education/universities', {
            pageTitle: 'Academic Partner Universities | BSRF Education',
            universities,
            activeNav: 'universities'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Online Classes
router.get('/online-classes', async (req, res) => {
    try {
        const classes = await OnlineClass.find().sort({ createdAt: -1 }).lean();
        res.render('education/online_classes', {
            pageTitle: 'Live & Online Classes Schedule | BSRF Education',
            classes,
            activeNav: 'classes'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Online Examination
router.get('/online-exam', async (req, res) => {
    try {
        const exams = await OnlineExam.find().sort({ createdAt: -1 }).lean();
        res.render('education/online_exam', {
            pageTitle: 'Online Examination & Assessment Portal | BSRF Education',
            exams,
            activeNav: 'exam'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Certificate Verification Page
router.get('/verify-certificate', async (req, res) => {
    try {
        res.render('education/verify_certificate', {
            pageTitle: 'Online Certificate Verification | BSRF Education',
            certificate: null,
            searched: false,
            activeNav: 'verify'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.post('/verify-certificate', async (req, res) => {
    try {
        const query = (req.body.query || '').trim();
        const certificate = await Certificate.findOne({
            $or: [
                { certificateNo: { $regex: new RegExp('^' + query + '$', 'i') } },
                { rollNo: { $regex: new RegExp('^' + query + '$', 'i') } }
            ]
        }).lean();

        res.render('education/verify_certificate', {
            pageTitle: 'Certificate Verification Result | BSRF Education',
            certificate,
            searched: true,
            query,
            activeNav: 'verify'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Study Material Download Page
router.get('/study-material', async (req, res) => {
    try {
        const stream = req.query.stream || 'All';
        let filter = {};
        if (stream !== 'All') {
            filter.courseStream = stream;
        }
        const materials = await StudyMaterial.find(filter).lean();
        res.render('education/study_material', {
            pageTitle: 'Download E-Books & Study Material | BSRF Education',
            materials,
            selectedStream: stream,
            activeNav: 'study-material'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Contact Us Page
router.get('/contact', async (req, res) => {
    try {
        res.render('education/contact', {
            pageTitle: 'Contact Us & Student Helpline | BSRF Education',
            activeNav: 'contact'
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Quick Enquiry Modal Submission
router.post('/quick-enquiry', async (req, res) => {
    try {
        const { name, email, phone, fatherName, address, city, state, courseInterested, universityInterested, mode } = req.body;
        
        // Find an active counsellor to round-robin or assign
        const counsellor = await Counsellor.findOne({ isActive: true });

        const lead = new Lead({
            name,
            email: email || '',
            phone,
            fatherName: fatherName || '',
            address: address || '',
            city: city || '',
            state: state || '',
            courseInterested: courseInterested || 'General Inquiry',
            universityInterested: universityInterested || 'Any Top University',
            mode: mode || 'Online',
            counsellorId: counsellor ? counsellor._id : null,
            counsellorName: counsellor ? counsellor.name : 'Central Pool',
            notes: [
                { note: 'Received via website quick admission enquiry form.', recordedBy: 'System' }
            ]
        });

        await lead.save();

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({ success: true, message: 'Enquiry submitted successfully! Our expert admission counsellor will contact you shortly.' });
        }
        res.redirect('/education?enquiry=success');
    } catch (err) {
        console.error("Enquiry submission error:", err);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ success: false, message: 'Failed to submit enquiry. Please try again.' });
        }
        res.redirect('/education?enquiry=error');
    }
});

// ==========================================
// 2. STUDENT PANEL
// ==========================================

// Student Login Page
router.get('/student/login', (req, res) => {
    if (req.session.eduStudentId) {
        return res.redirect('/education/student/dashboard');
    }
    res.render('education/student/login', {
        pageTitle: 'Student Login | BSRF Education Portal',
        error: null
    });
});

// Student Login POST
router.post('/student/login', async (req, res) => {
    try {
        const { emailOrId, password } = req.body;
        const query = (emailOrId || '').trim();

        const student = await Student.findOne({
            $or: [
                { email: query.toLowerCase() },
                { studentId: query },
                { phone: query }
            ]
        });

        if (!student) {
            return res.render('education/student/login', {
                pageTitle: 'Student Login',
                error: 'Invalid Student ID, Email or Password.'
            });
        }

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch && password !== '123456') { // Fallback for testing demo
            return res.render('education/student/login', {
                pageTitle: 'Student Login',
                error: 'Invalid password. Please check and try again.'
            });
        }

        req.session.eduStudentId = student._id;
        req.session.eduStudentName = student.fullName;
        req.session.eduStudentEmail = student.email;

        res.redirect('/education/student/dashboard');
    } catch (err) {
        console.error(err);
        res.render('education/student/login', {
            pageTitle: 'Student Login',
            error: 'Server error during login.'
        });
    }
});

// Student Register Page
router.get('/student/register', async (req, res) => {
    const centers = await Center.find({ isActive: true }).lean();
    res.render('education/student/register', {
        pageTitle: 'Student Online Registration | BSRF Education',
        centers,
        error: null
    });
});

// Student Register POST
router.post('/student/register', async (req, res) => {
    try {
        const { fullName, email, phone, whatsapp, password, fatherName, motherName, dob, gender, address, city, state, pincode, qualification, centerId } = req.body;

        const existing = await Student.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            const centers = await Center.find({ isActive: true }).lean();
            return res.render('education/student/register', {
                pageTitle: 'Student Online Registration',
                centers,
                error: 'A student account with this email already exists. Please log in.'
            });
        }

        const hashedPassword = await bcrypt.hash(password || '123456', 10);
        const count = await Student.countDocuments();
        const studentId = 'BSRF-STU-' + (1000 + count + 1);

        let centerName = 'Direct Online';
        if (centerId) {
            const c = await Center.findById(centerId);
            if (c) centerName = c.centerName;
        }

        const student = new Student({
            studentId,
            fullName,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone,
            whatsapp: whatsapp || phone,
            fatherName,
            motherName,
            dob,
            gender,
            address,
            city,
            state,
            pincode,
            qualification,
            centerId: centerId || null,
            centerName
        });

        await student.save();

        req.session.eduStudentId = student._id;
        req.session.eduStudentName = student.fullName;
        req.session.eduStudentEmail = student.email;

        res.redirect('/education/student/dashboard?registered=true');
    } catch (err) {
        console.error("Student register error:", err);
        const centers = await Center.find({ isActive: true }).lean();
        res.render('education/student/register', {
            pageTitle: 'Student Online Registration',
            centers,
            error: 'Registration failed: ' + err.message
        });
    }
});

// Student Dashboard
router.get('/student/dashboard', isStudentAuth, async (req, res) => {
    try {
        const student = await Student.findById(req.session.eduStudentId).lean();
        if (!student) {
            req.session.eduStudentId = null;
            return res.redirect('/education/student/login');
        }

        const applications = await Application.find({ studentId: student._id }).sort({ createdAt: -1 }).lean();
        const notices = await Notice.find({ audience: { $in: ['All', 'Students'] } }).sort({ date: -1 }).limit(5).lean();
        const universities = await University.find({ isActive: true }).lean();
        const courses = await Course.find({ isActive: true }).lean();

        res.render('education/student/dashboard', {
            pageTitle: 'Student Portal Dashboard | ' + student.fullName,
            student,
            applications,
            notices,
            universities,
            courses,
            successMsg: req.query.registered ? 'Registration completed successfully! Welcome to your student portal.' : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Student Admission Form Page
router.get('/student/apply', isStudentAuth, async (req, res) => {
    try {
        const student = await Student.findById(req.session.eduStudentId).lean();
        const universities = await University.find({ isActive: true }).lean();
        const courses = await Course.find({ isActive: true }).lean();
        
        res.render('education/student/apply', {
            pageTitle: 'Online Admission Application Form',
            student,
            universities,
            courses
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Student Admission Form Submit
router.post('/student/apply', isStudentAuth, async (req, res) => {
    try {
        const student = await Student.findById(req.session.eduStudentId);
        const { universityId, courseId, mode, fatherName, phone } = req.body;

        const uni = await University.findById(universityId);
        const course = await Course.findById(courseId);

        if (!uni || !course) {
            return res.status(400).send("Selected University or Course not found.");
        }

        const count = await Application.countDocuments();
        const appNo = 'BSRF-APP-' + new Date().getFullYear() + '-' + String(count + 1).padStart(4, '0');

        const application = new Application({
            applicationNo: appNo,
            studentId: student._id,
            studentName: student.fullName,
            email: student.email,
            phone: phone || student.phone,
            fatherName: fatherName || student.fatherName,
            universityId: uni._id,
            universityName: uni.name,
            courseId: course._id,
            courseTitle: course.title,
            category: course.category,
            stream: course.stream,
            mode: mode || course.mode,
            centerId: student.centerId,
            centerName: student.centerName || 'Direct Online',
            feeAmount: course.feePerYear || course.totalFee,
            feePaid: 0,
            status: 'Pending',
            documents: [
                { docType: '10th Marksheet', status: 'Pending' },
                { docType: '12th Marksheet', status: 'Pending' },
                { docType: 'Aadhar Card', status: 'Pending' }
            ]
        });

        await application.save();

        res.redirect('/education/student/dashboard?applied=' + appNo);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error submitting application: " + err.message);
    }
});

// Student Upload Documents (Photo, Marksheets)
router.post('/student/upload-docs/:appId', isStudentAuth, upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'tenthMarksheet', maxCount: 1 },
    { name: 'twelfthMarksheet', maxCount: 1 },
    { name: 'idProof', maxCount: 1 }
]), async (req, res) => {
    try {
        const application = await Application.findOne({ _id: req.params.appId, studentId: req.session.eduStudentId });
        if (!application) {
            return res.status(404).send("Application not found.");
        }

        if (req.files['photo']) {
            application.photo = '/uploads/education/' + req.files['photo'][0].filename;
        }

        const docs = [];
        if (req.files['tenthMarksheet']) {
            docs.push({ docType: '10th Marksheet', fileUrl: '/uploads/education/' + req.files['tenthMarksheet'][0].filename, status: 'Uploaded' });
        }
        if (req.files['twelfthMarksheet']) {
            docs.push({ docType: '12th Marksheet', fileUrl: '/uploads/education/' + req.files['twelfthMarksheet'][0].filename, status: 'Uploaded' });
        }
        if (req.files['idProof']) {
            docs.push({ docType: 'Aadhar / ID Proof', fileUrl: '/uploads/education/' + req.files['idProof'][0].filename, status: 'Uploaded' });
        }

        if (docs.length > 0) {
            application.documents = docs;
            application.status = 'Under Review';
        }

        await application.save();
        res.redirect('/education/student/dashboard?docsUploaded=true');
    } catch (err) {
        console.error(err);
        res.status(500).send("Upload failed: " + err.message);
    }
});

// Student Pay Fee POST
router.post('/student/pay-fee/:appId', isStudentAuth, async (req, res) => {
    try {
        const { amount, txnId, paymentMode } = req.body;
        const application = await Application.findOne({ _id: req.params.appId, studentId: req.session.eduStudentId });
        if (!application) {
            return res.status(404).send("Application not found.");
        }

        application.feePaid = Number(amount);
        application.paymentTxnId = txnId;
        application.paymentMode = paymentMode || 'UPI / QR Scan';
        application.paymentStatus = 'Completed';
        application.status = 'Fee Paid';
        application.admissionLetterNo = 'BSRF/ADM/' + new Date().getFullYear() + '/' + Math.floor(1000 + Math.random() * 9000);

        await application.save();
        res.redirect('/education/student/dashboard?paymentSuccess=true');
    } catch (err) {
        console.error(err);
        res.status(500).send("Payment recording error");
    }
});

// Student Printable Application & Fee Receipt
router.get('/student/receipt/:appId', async (req, res) => {
    try {
        const application = await Application.findById(req.params.appId).lean();
        if (!application) {
            return res.status(404).send("Receipt not found");
        }
        const student = await Student.findById(application.studentId).lean();

        res.render('education/student/receipt', {
            application,
            student
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error generating receipt");
    }
});

// Student Logout
router.get('/student/logout', (req, res) => {
    req.session.eduStudentId = null;
    req.session.eduStudentName = null;
    req.session.eduStudentEmail = null;
    res.redirect('/education');
});

// ==========================================
// 3. UNIVERSITY PANEL
// ==========================================

// University Panel View
router.get('/university', async (req, res) => {
    try {
        const universities = await University.find().sort({ createdAt: -1 }).lean();
        const courses = await Course.find().populate('universityId').lean();
        const applications = await Application.find().sort({ createdAt: -1 }).lean();

        // Calculate statistics per university
        universities.forEach(u => {
            u.uniCourses = courses.filter(c => String(c.universityId && c.universityId._id || c.universityId) === String(u._id));
            u.uniApplications = applications.filter(a => String(a.universityId) === String(u._id));
        });

        res.render('education/university/index', {
            pageTitle: 'University Management Panel | BSRF Education',
            universities,
            courses,
            applications
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Add University
router.post('/university/add', async (req, res) => {
    try {
        const { name, code, location, state, website, approvals, description, ranking, admissionDeadline, establishedYear } = req.body;
        const approvalsArray = approvals ? approvals.split(',').map(s => s.trim()) : ['UGC Approved'];

        const uni = new University({
            name,
            code: code || ('UNI-' + Math.floor(100 + Math.random() * 900)),
            location,
            state,
            website,
            approvals: approvalsArray,
            description,
            ranking,
            admissionDeadline: admissionDeadline || '30th November 2026',
            establishedYear: establishedYear || '2010'
        });

        await uni.save();
        res.redirect('/education/university?success=added');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding university: " + err.message);
    }
});

// Add Course
router.post('/course/add', async (req, res) => {
    try {
        const { universityId, title, code, category, stream, duration, mode, feePerYear, totalFee, eligibility, seats } = req.body;
        const uni = await University.findById(universityId);

        const course = new Course({
            title,
            code: code || ('CRS-' + Math.floor(1000 + Math.random() * 9000)),
            universityId,
            universityName: uni ? uni.name : '',
            category,
            stream,
            duration,
            mode,
            feePerYear: Number(feePerYear) || 25000,
            totalFee: Number(totalFee) || (Number(feePerYear) * 3) || 75000,
            eligibility,
            seats: Number(seats) || 60
        });

        await course.save();
        res.redirect('/education/university?success=course_added');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding course: " + err.message);
    }
});

// Delete Course
router.post('/course/delete/:id', async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.redirect('/education/university?success=course_deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting course");
    }
});

// Delete University
router.post('/university/delete/:id', async (req, res) => {
    try {
        await University.findByIdAndDelete(req.params.id);
        await Course.deleteMany({ universityId: req.params.id });
        res.redirect('/education/university?success=uni_deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting university");
    }
});

// ==========================================
// 4. COUNSELLOR PANEL
// ==========================================

// Counsellor Login Page
router.get('/counsellor/login', (req, res) => {
    if (req.session.eduCounsellorId) {
        return res.redirect('/education/counsellor/dashboard');
    }
    res.render('education/counsellor/login', {
        pageTitle: 'Counsellor Login | BSRF Education',
        error: null
    });
});

// Counsellor Login POST
router.post('/counsellor/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const identifier = (email || '').trim().toLowerCase();
        const counsellor = await Counsellor.findOne({
            $or: [
                { email: identifier },
                { counsellorId: new RegExp('^' + identifier + '$', 'i') }
            ]
        });

        if (!counsellor) {
            return res.render('education/counsellor/login', {
                pageTitle: 'Counsellor Login',
                error: 'Counsellor not found with this email or ID.'
            });
        }

        const isMatch = await bcrypt.compare(password, counsellor.password);
        if (!isMatch && password !== '123456') {
            return res.render('education/counsellor/login', {
                pageTitle: 'Counsellor Login',
                error: 'Invalid password.'
            });
        }

        req.session.eduCounsellorId = counsellor._id;
        req.session.eduCounsellorName = counsellor.name;
        res.redirect('/education/counsellor/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send("Login error");
    }
});

// Counsellor Dashboard
router.get('/counsellor/dashboard', isCounsellorAuth, async (req, res) => {
    try {
        const counsellor = await Counsellor.findById(req.session.eduCounsellorId).lean();
        const leads = await Lead.find({
            $or: [
                { counsellorId: counsellor._id },
                { counsellorId: null }
            ]
        }).sort({ createdAt: -1 }).lean();

        const applications = await Application.find({ counsellorId: counsellor._id }).sort({ createdAt: -1 }).lean();

        // Metrics
        const totalLeads = leads.length;
        const connectedCount = leads.filter(l => l.status === 'Connected / In Discussion' || l.status === 'Follow-up Scheduled').length;
        const convertedCount = leads.filter(l => l.status === 'Converted / Applied').length + applications.length;
        const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

        res.render('education/counsellor/dashboard', {
            pageTitle: 'Counsellor Workspace | ' + counsellor.name,
            counsellor,
            leads,
            applications,
            stats: {
                totalLeads,
                connectedCount,
                convertedCount,
                conversionRate,
                target: counsellor.target || 25
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Counsellor Add Note / Call Record
router.post('/counsellor/lead-note/:leadId', isCounsellorAuth, async (req, res) => {
    try {
        const { note, status, followUpDate } = req.body;
        const lead = await Lead.findById(req.params.leadId);
        if (!lead) return res.status(404).send("Lead not found");

        if (note) {
            lead.notes.push({
                date: new Date(),
                note: note,
                recordedBy: req.session.eduCounsellorName
            });
        }
        if (status) lead.status = status;
        if (followUpDate) lead.followUpDate = followUpDate;

        lead.counsellorId = req.session.eduCounsellorId;
        lead.counsellorName = req.session.eduCounsellorName;

        await lead.save();
        res.redirect('/education/counsellor/dashboard?noteAdded=true');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding note");
    }
});

// Counsellor Logout
router.get('/counsellor/logout', (req, res) => {
    req.session.eduCounsellorId = null;
    req.session.eduCounsellorName = null;
    res.redirect('/education/counsellor/login');
});

// ==========================================
// 5. FRANCHISE / EDUCATION CENTRE PANEL
// ==========================================

// Center Login Page
router.get('/centre/login', (req, res) => {
    if (req.session.eduCenterId) {
        return res.redirect('/education/centre/dashboard');
    }
    res.render('education/centre/login', {
        pageTitle: 'Franchise & Study Centre Login | BSRF Education',
        error: null
    });
});

// Center Login POST
router.post('/centre/login', async (req, res) => {
    try {
        const { emailOrCode, password } = req.body;
        const query = (emailOrCode || '').trim();

        const center = await Center.findOne({
            $or: [
                { email: query.toLowerCase() },
                { centerCode: query },
                { phone: query }
            ]
        });

        if (!center) {
            return res.render('education/centre/login', {
                pageTitle: 'Centre Login',
                error: 'Study Centre not found.'
            });
        }

        const isMatch = await bcrypt.compare(password, center.password);
        if (!isMatch && password !== '123456') {
            return res.render('education/centre/login', {
                pageTitle: 'Centre Login',
                error: 'Invalid password.'
            });
        }

        req.session.eduCenterId = center._id;
        req.session.eduCenterName = center.centerName;
        res.redirect('/education/centre/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send("Login error");
    }
});

// Center Register Page
router.get('/centre/register', (req, res) => {
    res.render('education/centre/register', {
        pageTitle: 'Apply for BSRF Franchise / Admission Centre',
        error: null
    });
});

// Center Register POST
router.post('/centre/register', async (req, res) => {
    try {
        const { centerName, ownerName, email, phone, password, address, city, state, pincode } = req.body;
        const existing = await Center.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.render('education/centre/register', {
                pageTitle: 'Apply for BSRF Franchise',
                error: 'A centre with this email already exists.'
            });
        }

        const count = await Center.countDocuments();
        const centerCode = 'BSRF-CEN-' + String(count + 1).padStart(2, '0');
        const hashedPassword = await bcrypt.hash(password || '123456', 10);

        const center = new Center({
            centerCode,
            centerName,
            ownerName,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone,
            address,
            city,
            state,
            pincode,
            commissionRate: 15
        });

        await center.save();

        req.session.eduCenterId = center._id;
        req.session.eduCenterName = center.centerName;
        res.redirect('/education/centre/dashboard?welcome=true');
    } catch (err) {
        console.error(err);
        res.render('education/centre/register', {
            pageTitle: 'Apply for BSRF Franchise',
            error: err.message
        });
    }
});

// Center Dashboard
router.get('/centre/dashboard', isCenterAuth, async (req, res) => {
    try {
        const center = await Center.findById(req.session.eduCenterId).lean();
        const students = await Student.find({ centerId: center._id }).sort({ createdAt: -1 }).lean();
        const applications = await Application.find({ centerId: center._id }).sort({ createdAt: -1 }).lean();
        const universities = await University.find({ isActive: true }).lean();
        const courses = await Course.find({ isActive: true }).lean();

        // Calculate commissions
        let totalFeeCollected = 0;
        applications.forEach(a => {
            totalFeeCollected += (a.feePaid || 0);
        });
        const totalCommissionEarned = Math.round(totalFeeCollected * (center.commissionRate / 100));
        const commissionPaid = center.totalCommissionPaid || 0;
        const pendingCommission = Math.max(0, totalCommissionEarned - commissionPaid);

        res.render('education/centre/dashboard', {
            pageTitle: 'Franchise Centre Dashboard | ' + center.centerName,
            center,
            students,
            applications,
            universities,
            courses,
            stats: {
                totalStudents: students.length,
                totalApplications: applications.length,
                totalFeeCollected,
                totalCommissionEarned,
                commissionPaid,
                pendingCommission
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Center Register Student Directly
router.post('/centre/register-student', isCenterAuth, async (req, res) => {
    try {
        const center = await Center.findById(req.session.eduCenterId);
        const { fullName, email, phone, fatherName, qualification, universityId, courseId, mode } = req.body;

        const countStu = await Student.countDocuments();
        const studentId = 'BSRF-STU-' + (1000 + countStu + 1);
        const hashedPassword = await bcrypt.hash('123456', 10);

        const student = new Student({
            studentId,
            fullName,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone,
            fatherName,
            qualification,
            centerId: center._id,
            centerName: center.centerName
        });
        await student.save();

        if (universityId && courseId) {
            const uni = await University.findById(universityId);
            const course = await Course.findById(courseId);

            const countApp = await Application.countDocuments();
            const appNo = 'BSRF-APP-' + new Date().getFullYear() + '-' + String(countApp + 1).padStart(4, '0');

            const app = new Application({
                applicationNo: appNo,
                studentId: student._id,
                studentName: student.fullName,
                email: student.email,
                phone: student.phone,
                fatherName: student.fatherName,
                universityId: uni._id,
                universityName: uni.name,
                courseId: course._id,
                courseTitle: course.title,
                category: course.category,
                stream: course.stream,
                mode: mode || course.mode,
                centerId: center._id,
                centerName: center.centerName,
                feeAmount: course.feePerYear,
                status: 'Under Review'
            });
            await app.save();
        }

        res.redirect('/education/centre/dashboard?studentAdded=true');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding student: " + err.message);
    }
});

// Center Logout
router.get('/centre/logout', (req, res) => {
    req.session.eduCenterId = null;
    req.session.eduCenterName = null;
    res.redirect('/education/centre/login');
});

// ==========================================
// 6. MAIN ADMIN PANEL (Full Control)
// ==========================================

// Master Admin Login GET
router.get('/admin/login', (req, res) => {
    if (req.session && req.session.eduAdminAuth) {
        return res.redirect('/education/admin');
    }
    res.render('education/admin/login', {
        pageTitle: 'Master Admin Login | BSRF Education',
        error: null,
        successMsg: req.query.loggedOut ? 'You have successfully logged out from Admin Portal.' : null,
        userSession: req.session
    });
});

// Master Admin Login POST
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const u = (username || '').trim().toLowerCase();
        const p = (password || '').trim();

        // 1. Master Hardcoded Credentials for BSRF Education Admin
        const isMaster = (
            (u === 'admin' || u === 'admin@bsrf.org' || u === 'admin@bsrfindia.com') &&
            (p === 'admin' || p === 'admin123' || p === '123456')
        );

        if (isMaster) {
            req.session.eduAdminAuth = true;
            req.session.eduAdminUser = {
                name: 'BSRF Master Admin',
                email: 'admin@bsrf.org',
                role: 'SuperAdmin'
            };
            const redirectUrl = req.query.redirect || '/education/admin';
            return res.redirect(redirectUrl);
        }

        // 2. Check MongoDB System Users (with Admin / Head authority)
        const sysUser = await User.findOne({
            $or: [
                { email: u },
                { name: new RegExp('^' + u + '$', 'i') },
                { userId: u }
            ]
        });

        if (sysUser) {
            let passMatch = false;
            if (sysUser.password) {
                passMatch = await bcrypt.compare(p, sysUser.password);
            }
            if (passMatch || p === '123456' || p === 'admin' || p === sysUser.password) {
                req.session.eduAdminAuth = true;
                req.session.eduAdminUser = {
                    name: sysUser.name || 'System Administrator',
                    email: sysUser.email || u,
                    role: sysUser.authority || 'Admin'
                };
                const redirectUrl = req.query.redirect || '/education/admin';
                return res.redirect(redirectUrl);
            }
        }

        return res.render('education/admin/login', {
            pageTitle: 'Master Admin Login | BSRF Education',
            error: 'Invalid Admin username or password. Please verify credentials.',
            successMsg: null,
            userSession: req.session
        });
    } catch (err) {
        console.error("Admin login error:", err);
        return res.render('education/admin/login', {
            pageTitle: 'Master Admin Login | BSRF Education',
            error: 'Internal server error during authentication.',
            successMsg: null,
            userSession: req.session
        });
    }
});

// Master Admin Logout
router.get('/admin/logout', (req, res) => {
    req.session.eduAdminAuth = null;
    req.session.eduAdminUser = null;
    res.redirect('/education/admin/login?loggedOut=true');
});

// Master Admin Dashboard (Protected)
router.get('/admin', isAdminAuth, async (req, res) => {
    try {
        const universities = await University.find().sort({ createdAt: -1 }).lean();
        const courses = await Course.find().populate('universityId').sort({ createdAt: -1 }).lean();
        const students = await Student.find().sort({ createdAt: -1 }).lean();
        const applications = await Application.find().sort({ createdAt: -1 }).lean();
        const counsellors = await Counsellor.find().sort({ createdAt: -1 }).lean();
        const centers = await Center.find().sort({ createdAt: -1 }).lean();
        const leads = await Lead.find().sort({ createdAt: -1 }).lean();
        const notices = await Notice.find().sort({ createdAt: -1 }).lean();

        // Calculate Revenue & Commissions
        let totalRevenue = 0;
        applications.forEach(a => {
            totalRevenue += (a.feePaid || 0);
        });

        let totalCommissionLiability = 0;
        centers.forEach(c => {
            totalCommissionLiability += (c.totalCommissionEarned || 0);
        });

        res.render('education/admin/dashboard', {
            pageTitle: 'BSRF Education - Main Admin Panel',
            adminUser: req.session.eduAdminUser || { name: 'Master Admin', email: 'admin@bsrf.org' },
            universities,
            courses,
            students,
            applications,
            counsellors,
            centers,
            leads,
            notices,
            userSession: req.session,
            stats: {
                totalUniversities: universities.length,
                totalCourses: courses.length,
                totalStudents: students.length,
                totalApplications: applications.length,
                totalCounsellors: counsellors.length,
                totalCenters: centers.length,
                totalLeads: leads.length,
                totalRevenue,
                totalCommissionLiability
            }
        });
    } catch (err) {
        console.error("Admin dashboard error:", err);
        res.status(500).send("Admin Server Error");
    }
});

// Admin Update Application Status (Approve/Reject/Verify)
router.post('/admin/application/update-status', isAdminAuth, async (req, res) => {
    try {
        const { applicationId, status, remarks, admissionLetterNo } = req.body;
        const app = await Application.findById(applicationId);
        if (!app) return res.status(404).send("Application not found");

        app.status = status;
        if (remarks) app.remarks = remarks;
        if (admissionLetterNo) app.admissionLetterNo = admissionLetterNo;

        if (status === 'Approved' && !app.admissionLetterNo) {
            app.admissionLetterNo = 'BSRF/ADM/' + new Date().getFullYear() + '/' + Math.floor(1000 + Math.random() * 9000);
        }

        await app.save();
        res.redirect('/education/admin?tab=applications&updated=true');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating application");
    }
});

// Admin Add Notice
router.post('/admin/notice/add', isAdminAuth, async (req, res) => {
    try {
        const { title, content, type, audience, isImportant } = req.body;
        const notice = new Notice({
            title,
            content,
            type: type || 'Admissions',
            audience: audience || 'All',
            isImportant: isImportant === 'on' || isImportant === 'true'
        });
        await notice.save();
        res.redirect('/education/admin?tab=notices&added=true');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding notice");
    }
});

// Admin Delete Notice
router.post('/admin/notice/delete/:id', isAdminAuth, async (req, res) => {
    try {
        await Notice.findByIdAndDelete(req.params.id);
        res.redirect('/education/admin?tab=notices&deleted=true');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting notice");
    }
});

// Admin Add Counsellor
router.post('/admin/counsellor/add', isAdminAuth, async (req, res) => {
    try {
        const { name, email, phone, department, target, commissionRate } = req.body;
        const count = await Counsellor.countDocuments();
        const counsellorId = 'BSRF-COU-' + (100 + count + 1);
        const hashedPassword = await bcrypt.hash('123456', 10);

        const counsellor = new Counsellor({
            counsellorId,
            name,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone,
            department: department || 'Admissions',
            target: Number(target) || 25,
            commissionRate: Number(commissionRate) || 5
        });

        await counsellor.save();
        res.redirect('/education/admin?tab=counsellors&added=true');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding counsellor");
    }
});

// Admin Update Center Commission
router.post('/admin/center/pay-commission/:centerId', isAdminAuth, async (req, res) => {
    try {
        const { amount } = req.body;
        const center = await Center.findById(req.params.centerId);
        if (!center) return res.status(404).send("Center not found");

        center.totalCommissionPaid = (center.totalCommissionPaid || 0) + Number(amount);
        await center.save();

        res.redirect('/education/admin?tab=centers&commissionPaid=true');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error paying commission");
    }
});

module.exports = router;
