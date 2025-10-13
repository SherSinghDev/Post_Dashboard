let express = require('express')
let router = express.Router()
let Patient = require('../../modals/patients')
let Users = require('../../modals/users')
let Orders = require('../../modals/orders')


const dummyPatients = [
    {
        idNo: "P-1001",
        name: "Rahul Sharma",
        fatherName: "Suresh Sharma",
        gender: "Male",
        mobileNo: "9876543210",
        email: "rahul.sharma@example.com",
        city: "Aligarh",
        state: "Uttar Pradesh",
        address: "123, Gandhi Nagar, Aligarh, UP, 202001",
        status: "Delivered",
        authority: "Dr. Mehta",
    },
    {
        idNo: "P-1002",
        name: "Priya Verma",
        fatherName: "Ramesh Verma",
        gender: "Female",
        mobileNo: "9123456789",
        email: "priya.verma@example.com",
        city: "Lucknow",
        state: "Uttar Pradesh",
        address: "45, Civil Lines, Lucknow, UP, 226001",
        status: "Delivered",
        authority: "Dr. Kapoor",
    },
    {
        idNo: "P-1003",
        name: "Amit Singh",
        fatherName: "Raj Singh",
        gender: "Male",
        mobileNo: "9812345678",
        email: "amit.singh@example.com",
        city: "Kanpur",
        state: "Uttar Pradesh",
        address: "88, Kidwai Nagar, Kanpur, UP, 208001",
        status: "Delivered",
        authority: "Dr. Gupta",
    },
    {
        idNo: "P-1004",
        name: "Neha Mishra",
        fatherName: "Shyam Mishra",
        gender: "Female",
        mobileNo: "9988776655",
        email: "neha.mishra@example.com",
        city: "Varanasi",
        state: "Uttar Pradesh",
        address: "12, Assi Ghat, Varanasi, UP, 221001",
        status: "On Delivery",
        authority: "Dr. Saxena",
    },
    {
        idNo: "P-1005",
        name: "Vikas Yadav",
        fatherName: "Om Prakash Yadav",
        gender: "Male",
        mobileNo: "9876012345",
        email: "vikas.yadav@example.com",
        city: "Agra",
        state: "Uttar Pradesh",
        address: "33, Dayal Bagh, Agra, UP, 282005",
        status: "Delivered",
        authority: "Dr. Sharma",
    },
    {
        idNo: "P-1006",
        name: "Anjali Chauhan",
        fatherName: "Mahesh Chauhan",
        gender: "Female",
        mobileNo: "9090909090",
        email: "anjali.chauhan@example.com",
        city: "Noida",
        state: "Uttar Pradesh",
        address: "B-12, Sector 18, Noida, UP, 201301",
        status: "On Delivery",
        authority: "Dr. Bhatia",
    },
    {
        idNo: "P-1007",
        name: "Rohit Pandey",
        fatherName: "Vinod Pandey",
        gender: "Male",
        mobileNo: "9001234567",
        email: "rohit.pandey@example.com",
        city: "Meerut",
        state: "Uttar Pradesh",
        address: "77, Shastri Nagar, Meerut, UP, 250004",
        status: "Delivered",
        authority: "Dr. Tyagi",
    },
    {
        idNo: "P-1008",
        name: "Sneha Tiwari",
        fatherName: "Harish Tiwari",
        gender: "Female",
        mobileNo: "9501234567",
        email: "sneha.tiwari@example.com",
        city: "Ghaziabad",
        state: "Uttar Pradesh",
        address: "C-44, Raj Nagar, Ghaziabad, UP, 201002",
        status: "On Delivery",
        authority: "Dr. Singh",
    },
    {
        idNo: "P-1009",
        name: "Karan Malik",
        fatherName: "Deepak Malik",
        gender: "Male",
        mobileNo: "9654321876",
        email: "karan.malik@example.com",
        city: "Bareilly",
        state: "Uttar Pradesh",
        address: "22, Model Town, Bareilly, UP, 243001",
        status: "Canceled",
        authority: "Dr. Agarwal",
    },
    {
        idNo: "P-1010",
        name: "Pooja Saxena",
        fatherName: "Dinesh Saxena",
        gender: "Female",
        mobileNo: "9786512345",
        email: "pooja.saxena@example.com",
        city: "Mathura",
        state: "Uttar Pradesh",
        address: "G-56, Krishna Nagar, Mathura, UP, 281004",
        status: "On Delivery",
        authority: "Dr. Yadav",
    },
];


router.get('/', async (req, res) => {
    console.log(req.session);
    if (req.session.userId) {
        let teamLeaders = (await Users.find({ role: "Team Leader" })).length
        let coordinators = (await Users.find({ role: "Coordinator" })).length
        let patients = (await Orders.find()).length
        let user = await Users.findOne({_id:req.session.userId})

        res.render('index', { teamLeaders, coordinators, patients,user, page: "Dashboard" })
    }
    else {
        res.redirect('/auth/login')
    }
})


module.exports = router