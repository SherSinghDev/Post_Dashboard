let express = require('express')
let router = express.Router()
let JobApplication = require('../../modals/jobs')
let bcrypt = require('bcrypt')
let Recruiter = require('../../modals/recruiters')



router.get('/form/:jobType', async (req, res) => {
    let { jobType } = req.params
    res.render('jobs/form', { jobType })
})



// register job application
router.post("/apply-job", async (req, res) => {
    try {
        console.log(req.body);

        const { name, address, pinCode, email, mobile, jobType } = req.body;

        // Validate manually (optional)
        if (!name || !address || !pinCode || !email || !mobile) {
            return res.status(400).json({ created: false, message: "All fields are required" });
        }

        const newApplication = await JobApplication.create({
            name,
            address,
            pinCode,
            email,
            mobile,
            jobType
        });

        return res.status(201).json({
            created: true,
            message: "Job application submitted successfully",
            data: newApplication,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ created: false, message: "Server error", error });
    }
});


// GET all applications
router.get('/dashboard', async (req, res) => {
    if (req.session.userId) {
        try {
            let user = await Recruiter.findOne({ _id: req.session.userId })
            let financeUnverified = (await JobApplication.find({ approveStatus: "Unverified", jobType: 'finance' })).length
            let financePending = (await JobApplication.find({ approveStatus: "Pending", jobType: 'finance' })).length
            let financeVerified = (await JobApplication.find({ approveStatus: "Verified", jobType: 'finance' })).length
            let healthsingalorderUnverified = (await JobApplication.find({ approveStatus: "Unverified", jobType: 'healthsingalorder' })).length
            let healthsingalorderPending = (await JobApplication.find({ approveStatus: "Pending", jobType: 'healthsingalorder' })).length
            let healthsingalorderVerified = (await JobApplication.find({ approveStatus: "Verified", jobType: 'healthsingalorder' })).length
            let healthsalaryUnverified = (await JobApplication.find({ approveStatus: "Unverified", jobType: 'healthsalary' })).length
            let healthsalaryPending = (await JobApplication.find({ approveStatus: "Pending", jobType: 'healthsalary' })).length
            let healthsalaryVerified = (await JobApplication.find({ approveStatus: "Verified", jobType: 'healthsalary' })).length
            let healthstockUnverified = (await JobApplication.find({ approveStatus: "Unverified", jobType: 'healthstock' })).length
            let healthstockPending = (await JobApplication.find({ approveStatus: "Pending", jobType: 'healthstock' })).length
            let healthstockVerified = (await JobApplication.find({ approveStatus: "Verified", jobType: 'healthstock' })).length
            let holidaysUnverified = (await JobApplication.find({ approveStatus: "Unverified", jobType: 'holidays' })).length
            let holidaysPending = (await JobApplication.find({ approveStatus: "Pending", jobType: 'holidays' })).length
            let holidaysVerified = (await JobApplication.find({ approveStatus: "Verified", jobType: 'holidays' })).length
            let ecommerceUnverified = (await JobApplication.find({ approveStatus: "Unverified", jobType: 'ecommerce' })).length
            let ecommercePending = (await JobApplication.find({ approveStatus: "Pending", jobType: 'ecommerce' })).length
            let ecommerceVerified = (await JobApplication.find({ approveStatus: "Verified", jobType: 'ecommerce' })).length
            let bsrfhospitalalloptahyUnverified = (await JobApplication.find({ approveStatus: "Unverified", jobType: 'bsrfhospitalalloptahy' })).length
            let bsrfhospitalalloptahyPending = (await JobApplication.find({ approveStatus: "Pending", jobType: 'bsrfhospitalalloptahy' })).length
            let bsrfhospitalalloptahyVerified = (await JobApplication.find({ approveStatus: "Verified", jobType: 'bsrfhospitalalloptahy' })).length
            let bsrfsolarprojectUnverified = (await JobApplication.find({ approveStatus: "Unverified", jobType: 'bsrfsolarproject' })).length
            let bsrfsolarprojectPending = (await JobApplication.find({ approveStatus: "Pending", jobType: 'bsrfsolarproject' })).length
            let bsrfsolarprojectVerified = (await JobApplication.find({ approveStatus: "Verified", jobType: 'bsrfsolarproject' })).length
            let bsrfeducationprojectUnverified = (await JobApplication.find({ approveStatus: "Unverified", jobType: 'bsrfeducationproject' })).length
            let bsrfeducationprojectPending = (await JobApplication.find({ approveStatus: "Pending", jobType: 'bsrfeducationproject' })).length
            let bsrfeducationprojectVerified = (await JobApplication.find({ approveStatus: "Verified", jobType: 'bsrfeducationproject' })).length
            let jjhayurvedaUnverified = (await JobApplication.find({ approveStatus: "Unverified", jobType: 'jjhayurveda' })).length
            let jjhayurvedaPending = (await JobApplication.find({ approveStatus: "Pending", jobType: 'jjhayurveda' })).length
            let jjhayurvedaVerified = (await JobApplication.find({ approveStatus: "Verified", jobType: 'jjhayurveda' })).length


            res.render('jobs/index', {
                page: "Dashboard",
                user,
                financeUnverified,
                financePending,
                financeVerified,
                bsrfeducationprojectUnverified,
                bsrfeducationprojectPending,
                bsrfeducationprojectVerified,
                healthsingalorderUnverified,
                healthsingalorderPending,
                healthsingalorderVerified,
                healthsalaryUnverified,
                healthsalaryPending,
                healthsingalorderVerified,
                healthsalaryUnverified,
                healthsalaryVerified,
                healthstockUnverified,
                healthstockPending,
                healthstockVerified,
                healthsalaryVerified,
                holidaysUnverified,
                holidaysPending,
                holidaysVerified,
                ecommerceUnverified,
                ecommercePending,
                ecommerceVerified,
                bsrfhospitalalloptahyUnverified,
                bsrfhospitalalloptahyPending,
                bsrfhospitalalloptahyVerified,
                bsrfsolarprojectUnverified,
                bsrfsolarprojectPending,
                bsrfsolarprojectVerified,
                jjhayurvedaUnverified,
                jjhayurvedaPending,
                jjhayurvedaVerified
            });
        } catch (error) {
            console.log(error);
            res.redirect('/auth/login')
        }
    }
    else {
        res.redirect('/auth/login')
    }
});


router.get("/create-dummy-recruiter", async (req, res) => {
    try {
        // Dummy recruiter data
        const dummyName = "Dummy Recruiter";
        const dummyEmail = "jobs@bsrf.com";
        const dummyPassword = "1234bsrf";

        // Hash password
        const hashedPassword = await bcrypt.hash(dummyPassword, 10);

        // Create recruiter
        const newRecruiter = await Recruiter.create({
            name: dummyName,
            email: dummyEmail,
            password: hashedPassword,
        });

        return res.status(201).json({
            created: true,
            message: "Dummy recruiter created successfully",
            recruiter: {
                id: newRecruiter._id,
                name: newRecruiter.name,
                email: newRecruiter.email,
            },
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
});

// unverified jobs


router.get('/unverified/:type', async (req, res) => {
    if (req.session.userId) {
        try {
            let varified = false
            let user = await Recruiter.findOne({ _id: req.session.userId })
            let jobs = await JobApplication.find({ approveStatus: "Unverified", jobType: req.params.type })
            // let verified = (await JobApplication.find({ approveStatus: "Verified" })).length
            res.render('jobs/allforms', { page: "Job Forms", user, applications: jobs, varified });
        } catch (error) {
            console.log(error);
            res.redirect('/auth/login')
        }
    }
    else {
        res.redirect('/auth/login')
    }
});

router.get('/verified/:type', async (req, res) => {
    if (req.session.userId) {
        try {
            let varified = true
            let user = await Recruiter.findOne({ _id: req.session.userId })
            let jobs = await JobApplication.find({ approveStatus: "Verified", jobType: req.params.type })
            // let verified = (await JobApplication.find({ approveStatus: "Verified" })).length
            res.render('jobs/allforms', { page: "Job Forms", user, applications: jobs, varified });
        } catch (error) {
            console.log(error);
            res.redirect('/auth/login')
        }
    }
    else {
        res.redirect('/auth/login')
    }
});

router.get('/pending/:type', async (req, res) => {
    if (req.session.userId) {
        try {
            varified = false
            let user = await Recruiter.findOne({ _id: req.session.userId })
            let jobs = await JobApplication.find({ approveStatus: "Pending", jobType: req.params.type })
            // let verified = (await JobApplication.find({ approveStatus: "Verified" })).length
            res.render('jobs/allforms', { page: "Job Forms", user, applications: jobs, varified });
        } catch (error) {
            console.log(error);
            res.redirect('/auth/login')
        }
    }
    else {
        res.redirect('/auth/login')
    }
});

router.get('/details/:id', async (req, res) => {
    try {
        const app = await JobApplication.findById(req.params.id);
        if (!app) return res.status(404).json({ success: false });
        res.json({ success: true, data: app });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
    }
});







router.put("/application/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, pinCode, email, mobile, approveStatus } = req.body;

        // Check if exists
        const existing = await JobApplication.findById(id);
        if (!existing) {
            return res.status(404).json({
                updated: false,
                message: "Application not found",
            });
        }

        // Update fields
        const updatedApplication = await JobApplication.findByIdAndUpdate(
            id,
            {
                name,
                address,
                pinCode,
                email,
                mobile,
                approveStatus
            },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            updated: true,
            message: "Application updated successfully",
            data: updatedApplication,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            updated: false,
            message: "Server error",
            error: error.message,
        });
    }
});









module.exports = router