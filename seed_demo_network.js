require('dotenv').config();
const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
} catch (e) { }

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/modals/users');
const Stock = require('./src/modals/stock');

async function seedFiveLevelDemo() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB successfully.");

        // Clean previous demo users if any
        const demoEmails = [
            'demouser@bsrf.com',
            'demol1_raj@bsrf.com',
            'demol1_priya@bsrf.com',
            'demol2_amit@bsrf.com',
            'demol2_sneha@bsrf.com',
            'demol3_vikram@bsrf.com',
            'demol4_pooja@bsrf.com',
            'demol5_manoj@bsrf.com'
        ];

        await User.deleteMany({ email: { $in: demoEmails } });
        console.log("Cleaned up any previous demo users.");

        // Find last registered number for userId generation
        const allUsers = await User.find().sort({ createdAt: -1 }).select("userId");
        let maxNum = 100;
        allUsers.forEach(u => {
            let n = parseInt(u.userId);
            if (!isNaN(n) && n > maxNum) maxNum = n;
        });

        const hashedPassword = await bcrypt.hash('1234', 10);

        // 1. Root Test User (The one YOU will log in with!)
        maxNum++;
        const rootUserId = String(maxNum).padStart(2, '0');
        const rootUser = new User({
            userId: rootUserId,
            name: "Devendra Sharma (Test Account)",
            email: "demouser@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "stockorder",
            position: "Program Manager",
            mobile: "9876543210",
            gender: "Male",
            dateOfBirth: new Date("1990-01-15"),
            bloodGroup: "O+",
            state: "Rajasthan",
            district: "Jaipur",
            block: "Sanganer",
            village: "Sitapura",
            fullAddress: "Plot 12, Industrial Area, Sitapura, Jaipur",
            pinCode: "302022",
            aadharNo: "123456789012",
            membershipType: "Life time membership Fee (₹500)",
            referralCode: "TL-ROOT01"
        });
        await rootUser.save();
        await Stock.create({ userId: rootUser._id, totalStock: 50 });
        console.log("Created Root User:", rootUser.name, "| Email:", rootUser.email);

        // 2. Level 1 Users (Referred directly by Root User)
        maxNum++;
        const l1User1 = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Rajesh Verma",
            email: "demol1_raj@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "stockorder",
            position: "District Head",
            mobile: "9823456781",
            gender: "Male",
            dateOfBirth: new Date("1992-05-10"),
            bloodGroup: "A+",
            state: "Rajasthan",
            district: "Ajmer",
            block: "Kishangarh",
            village: "Madanganj",
            fullAddress: "Near Bus Stand, Madanganj, Kishangarh",
            pinCode: "305801",
            aadharNo: "234567890123",
            membershipType: "Life time membership Fee (₹500)",
            parentUser: rootUser._id,
            referredBy: rootUser.userId,
            referrerName: rootUser.name,
            referralCode: "TL-RAJ001"
        });
        await l1User1.save();

        maxNum++;
        const l1User2 = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Priya Singh",
            email: "demol1_priya@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "stockorder",
            position: "District Head",
            mobile: "9871234562",
            gender: "Female",
            dateOfBirth: new Date("1994-08-20"),
            bloodGroup: "B+",
            state: "Rajasthan",
            district: "Kota",
            block: "Ladpura",
            village: "Vigyan Nagar",
            fullAddress: "House 45, Vigyan Nagar, Kota",
            pinCode: "324005",
            aadharNo: "345678901234",
            membershipType: "One year Membership Fee (₹365)",
            parentUser: rootUser._id,
            referredBy: rootUser.userId,
            referrerName: rootUser.name,
            referralCode: "TL-PRI002"
        });
        await l1User2.save();
        console.log("Created 2 Level-1 Users: Rajesh Verma, Priya Singh");

        // 3. Level 2 Users (Referred by Level 1 - Rajesh Verma & Priya Singh)
        maxNum++;
        const l2User1 = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Amit Choudhary",
            email: "demol2_amit@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "stockorder",
            position: "Block Head/City Head",
            mobile: "9765432109",
            gender: "Male",
            dateOfBirth: new Date("1995-11-12"),
            bloodGroup: "O+",
            state: "Rajasthan",
            district: "Jodhpur",
            block: "Luni",
            village: "Borunda",
            fullAddress: "Ward 4, Borunda, Jodhpur",
            pinCode: "342604",
            aadharNo: "456789012345",
            membershipType: "Life time membership Fee (₹500)",
            parentUser: l1User1._id,
            referredBy: l1User1.userId,
            referrerName: l1User1.name,
            referralCode: "TL-AMI003"
        });
        await l2User1.save();

        maxNum++;
        const l2User2 = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Sneha Patel",
            email: "demol2_sneha@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "stockorder",
            position: "Block Head/City Head",
            mobile: "9654321098",
            gender: "Female",
            dateOfBirth: new Date("1996-03-25"),
            bloodGroup: "AB+",
            state: "Gujarat",
            district: "Ahmedabad",
            block: "Daskroi",
            village: "Bopal",
            fullAddress: "B-201, Shivalik Residency, Bopal, Ahmedabad",
            pinCode: "380058",
            aadharNo: "567890123456",
            membershipType: "Life time membership Fee (₹500)",
            parentUser: l1User2._id,
            referredBy: l1User2.userId,
            referrerName: l1User2.name,
            referralCode: "TL-SNE004"
        });
        await l2User2.save();
        console.log("Created 2 Level-2 Users: Amit Choudhary, Sneha Patel");

        // 4. Level 3 User (Referred by Level 2 - Amit Choudhary)
        maxNum++;
        const l3User = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Vikram Rathore",
            email: "demol3_vikram@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "stockorder",
            position: "Centre Head",
            mobile: "9543210987",
            gender: "Male",
            dateOfBirth: new Date("1993-07-18"),
            bloodGroup: "B-",
            state: "Rajasthan",
            district: "Udaipur",
            block: "Girwa",
            village: "Sukher",
            fullAddress: "Sukher Bypass, Near Toll, Udaipur",
            pinCode: "313001",
            aadharNo: "678901234567",
            membershipType: "One year Membership Fee (₹365)",
            parentUser: l2User1._id,
            referredBy: l2User1.userId,
            referrerName: l2User1.name,
            referralCode: "TL-VIK005"
        });
        await l3User.save();
        console.log("Created Level-3 User: Vikram Rathore");

        // 5. Level 4 User (Referred by Level 3 - Vikram Rathore)
        maxNum++;
        const l4User = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Pooja Meena",
            email: "demol4_pooja@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "stockorder",
            position: "Centre Head",
            mobile: "9432109876",
            gender: "Female",
            dateOfBirth: new Date("1997-12-05"),
            bloodGroup: "O-",
            state: "Rajasthan",
            district: "Alwar",
            block: "Behror",
            village: "Neemrana",
            fullAddress: "RIICO Industrial Phase 1, Neemrana, Alwar",
            pinCode: "301705",
            aadharNo: "789012345678",
            membershipType: "Life time membership Fee (₹500)",
            parentUser: l3User._id,
            referredBy: l3User.userId,
            referrerName: l3User.name,
            referralCode: "TL-POO006"
        });
        await l4User.save();
        console.log("Created Level-4 User: Pooja Meena");

        // 6. Level 5 User (Referred by Level 4 - Pooja Meena)
        maxNum++;
        const l5User = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Manoj Kumar Saini",
            email: "demol5_manoj@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "stockorder",
            position: "Centre Head",
            mobile: "9321098765",
            gender: "Male",
            dateOfBirth: new Date("1998-04-14"),
            bloodGroup: "A+",
            state: "Haryana",
            district: "Rewari",
            block: "Bawal",
            village: "Asalwas",
            fullAddress: "Main Market Road, Asalwas, Bawal",
            pinCode: "123501",
            aadharNo: "890123456789",
            membershipType: "Life time membership Fee (₹500)",
            parentUser: l4User._id,
            referredBy: l4User.userId,
            referrerName: l4User.name,
            referralCode: "TL-MAN007"
        });
        await l5User.save();
        console.log("Created Level-5 User: Manoj Kumar Saini");

        console.log("\n==========================================");
        console.log("✨ DEMO USERS SEEDED SUCCESSFULLY!");
        console.log("------------------------------------------");
        console.log("LOGIN CREDENTIALS TO TEST:");
        console.log("Email:    demouser@bsrf.com");
        console.log("Password: 1234");
        console.log("Name:     Devendra Sharma (Test Account)");
        console.log("Network:  7 members across all 5 Levels");
        console.log("  - Level 1 (Direct, Full Access): Rajesh Verma, Priya Singh");
        console.log("  - Level 2 (Name & Address Only): Amit Choudhary, Sneha Patel");
        console.log("  - Level 3 (Name & Address Only): Vikram Rathore");
        console.log("  - Level 4 (Name & Address Only): Pooja Meena");
        console.log("  - Level 5 (Name & Address Only): Manoj Kumar Saini");
        console.log("==========================================\n");

        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err);
        process.exit(1);
    }
}

seedFiveLevelDemo();
