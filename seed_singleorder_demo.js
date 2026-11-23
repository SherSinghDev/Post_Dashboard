require('dotenv').config();
const dns = require('dns');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
} catch (e) { }

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/modals/users');
const PatientForm = require('./src/modals/patientForm');

async function seedSingleOrderDemo() {
    try {
        const uri = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/parceldb';
        console.log("Connecting to MongoDB...");
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to DB successfully.");

        // Clean previous demo accounts if any
        const demoEmails = [
            'statehead@bsrf.com',
            'districtofficer1@bsrf.com',
            'districtofficer2@bsrf.com',
            'blockofficer1@bsrf.com',
            'blockofficer2@bsrf.com',
            'fieldofficer1@bsrf.com',
            'fieldofficer2@bsrf.com',
            'fieldofficer3@bsrf.com'
        ];

        // Delete existing demo users and their referred demo patient forms
        const existingUsers = await User.find({ email: { $in: demoEmails } });
        const existingUserIds = existingUsers.map(u => u.userId).filter(Boolean);

        if (existingUserIds.length > 0) {
            await PatientForm.deleteMany({ referredBy: { $in: existingUserIds } });
        }
        await User.deleteMany({ email: { $in: demoEmails } });
        console.log("Cleaned up any previous single order demo data.");

        // Find next numeric user ID
        const allUsers = await User.find().sort({ createdAt: -1 }).select("userId");
        let maxNum = 200;
        allUsers.forEach(u => {
            let n = parseInt(u.userId);
            if (!isNaN(n) && n > maxNum) maxNum = n;
        });

        const hashedPassword = await bcrypt.hash('1234', 10);

        // ==========================================
        // 1. STATE HEAD (Top Level Root Officer)
        // ==========================================
        maxNum++;
        const stateHead = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Ramesh Chandra (State Head)",
            email: "statehead@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "singleorder",
            position: "State head",
            mobile: "9811002201",
            gender: "Male",
            dateOfBirth: new Date("1982-03-15"),
            bloodGroup: "O+",
            state: "Rajasthan",
            district: "Jaipur",
            block: "Jaipur Central",
            village: "Civil Lines",
            fullAddress: "House 12, Civil Lines, Jaipur",
            pinCode: "302006",
            aadharNo: "900100000001",
            membershipType: "District Level Membership - ₹2365",
            referralCode: "TL-SH001"
        });
        await stateHead.save();
        console.log(`[1] Created State Head: ${stateHead.name} (ID: ${stateHead.userId}, Email: ${stateHead.email})`);

        // ============================================================
        // 2. DISTRICT OFFICERS (Reporting to Ramesh Chandra State Head)
        // ============================================================
        maxNum++;
        const districtOfficer1 = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Sunita Sharma (District Officer)",
            email: "districtofficer1@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "singleorder",
            position: "District officer",
            mobile: "9811002202",
            gender: "Female",
            dateOfBirth: new Date("1988-06-20"),
            bloodGroup: "A+",
            state: "Rajasthan",
            district: "Jaipur",
            assignedDistrict: "Jaipur",
            block: "Sanganer",
            village: "Malviya Nagar",
            fullAddress: "B-40, Malviya Nagar, Jaipur",
            pinCode: "302017",
            aadharNo: "900100000002",
            membershipType: "District Level Membership - ₹2365",
            parentUser: stateHead._id,
            referredBy: stateHead.userId,
            referrerName: stateHead.name,
            referralCode: "TL-DO001"
        });
        await districtOfficer1.save();
        console.log(`[2] Created District Officer 1: ${districtOfficer1.name} (ID: ${districtOfficer1.userId}, Reporting to: ${stateHead.name})`);

        maxNum++;
        const districtOfficer2 = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Ajay Meena (District Officer)",
            email: "districtofficer2@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "singleorder",
            position: "District officer",
            mobile: "9811002203",
            gender: "Male",
            dateOfBirth: new Date("1987-11-12"),
            bloodGroup: "B+",
            state: "Rajasthan",
            district: "Ajmer",
            assignedDistrict: "Ajmer",
            block: "Kishangarh",
            village: "Madanganj",
            fullAddress: "Station Road, Madanganj, Ajmer",
            pinCode: "305801",
            aadharNo: "900100000003",
            membershipType: "District Level Membership - ₹2365",
            parentUser: stateHead._id,
            referredBy: stateHead.userId,
            referrerName: stateHead.name,
            referralCode: "TL-DO002"
        });
        await districtOfficer2.save();
        console.log(`[3] Created District Officer 2: ${districtOfficer2.name} (ID: ${districtOfficer2.userId}, Reporting to: ${stateHead.name})`);

        // =================================================================
        // 3. BLOCK OFFICERS (Reporting to their respective District Officers)
        // =================================================================
        maxNum++;
        const blockOfficer1 = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Vikram Choudhary (Block Officer)",
            email: "blockofficer1@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "singleorder",
            position: "Block officer",
            mobile: "9811002204",
            gender: "Male",
            dateOfBirth: new Date("1991-04-18"),
            bloodGroup: "O+",
            state: "Rajasthan",
            district: "Jaipur",
            block: "Sanganer",
            village: "Pratap Nagar",
            fullAddress: "Sector 3, Pratap Nagar, Sanganer, Jaipur",
            pinCode: "302033",
            aadharNo: "900100000004",
            membershipType: "Block Level Membership - ₹1365",
            parentUser: districtOfficer1._id,
            referredBy: districtOfficer1.userId,
            referrerName: districtOfficer1.name,
            referralCode: "TL-BO001"
        });
        await blockOfficer1.save();
        console.log(`[4] Created Block Officer 1: ${blockOfficer1.name} (ID: ${blockOfficer1.userId}, Reporting to: ${districtOfficer1.name})`);

        maxNum++;
        const blockOfficer2 = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Pooja Rathore (Block Officer)",
            email: "blockofficer2@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "singleorder",
            position: "Block officer",
            mobile: "9811002205",
            gender: "Female",
            dateOfBirth: new Date("1993-09-25"),
            bloodGroup: "AB+",
            state: "Rajasthan",
            district: "Ajmer",
            block: "Kishangarh",
            village: "Silora",
            fullAddress: "Industrial Area, Silora, Kishangarh",
            pinCode: "305802",
            aadharNo: "900100000005",
            membershipType: "Block Level Membership - ₹1365",
            parentUser: districtOfficer2._id,
            referredBy: districtOfficer2.userId,
            referrerName: districtOfficer2.name,
            referralCode: "TL-BO002"
        });
        await blockOfficer2.save();
        console.log(`[5] Created Block Officer 2: ${blockOfficer2.name} (ID: ${blockOfficer2.userId}, Reporting to: ${districtOfficer2.name})`);

        // =================================================================
        // 4. FIELD OFFICERS (Reporting to their respective Block Officers)
        // =================================================================
        maxNum++;
        const fieldOfficer1 = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Amit Kumar (Field Officer)",
            email: "fieldofficer1@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "singleorder",
            position: "Field officer",
            mobile: "9811002206",
            gender: "Male",
            dateOfBirth: new Date("1995-02-10"),
            bloodGroup: "B+",
            state: "Rajasthan",
            district: "Jaipur",
            block: "Sanganer",
            village: "Sitapura",
            fullAddress: "Plot 44, Sitapura Industrial Area, Jaipur",
            pinCode: "302022",
            aadharNo: "900100000006",
            membershipType: "Centre Level Membership - ₹865",
            parentUser: blockOfficer1._id,
            referredBy: blockOfficer1.userId,
            referrerName: blockOfficer1.name,
            referralCode: "TL-FO001"
        });
        await fieldOfficer1.save();
        console.log(`[6] Created Field Officer 1: ${fieldOfficer1.name} (ID: ${fieldOfficer1.userId}, Reporting to: ${blockOfficer1.name})`);

        maxNum++;
        const fieldOfficer2 = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Neha Gupta (Field Officer)",
            email: "fieldofficer2@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "singleorder",
            position: "Field officer",
            mobile: "9811002207",
            gender: "Female",
            dateOfBirth: new Date("1996-07-14"),
            bloodGroup: "A+",
            state: "Rajasthan",
            district: "Jaipur",
            block: "Sanganer",
            village: "Mansarovar",
            fullAddress: "Lane 5, Mansarovar, Jaipur",
            pinCode: "302020",
            aadharNo: "900100000007",
            membershipType: "Centre Level Membership - ₹865",
            parentUser: blockOfficer1._id,
            referredBy: blockOfficer1.userId,
            referrerName: blockOfficer1.name,
            referralCode: "TL-FO002"
        });
        await fieldOfficer2.save();
        console.log(`[7] Created Field Officer 2: ${fieldOfficer2.name} (ID: ${fieldOfficer2.userId}, Reporting to: ${blockOfficer1.name})`);

        maxNum++;
        const fieldOfficer3 = new User({
            userId: String(maxNum).padStart(2, '0'),
            name: "Deepak Verma (Field Officer)",
            email: "fieldofficer3@bsrf.com",
            password: hashedPassword,
            role: "Coordinator",
            type: "singleorder",
            position: "Field officer",
            mobile: "9811002208",
            gender: "Male",
            dateOfBirth: new Date("1997-12-05"),
            bloodGroup: "O+",
            state: "Rajasthan",
            district: "Ajmer",
            block: "Kishangarh",
            village: "Gundolav",
            fullAddress: "Near Lake, Gundolav, Kishangarh",
            pinCode: "305801",
            aadharNo: "900100000008",
            membershipType: "Centre Level Membership - ₹865",
            parentUser: blockOfficer2._id,
            referredBy: blockOfficer2.userId,
            referrerName: blockOfficer2.name,
            referralCode: "TL-FO003"
        });
        await fieldOfficer3.save();
        console.log(`[8] Created Field Officer 3: ${fieldOfficer3.name} (ID: ${fieldOfficer3.userId}, Reporting to: ${blockOfficer2.name})`);

        // =================================================================
        // 5. DEMO PATIENT FORMS (Referred by downline officers)
        // =================================================================
        console.log("\nSeeding demo patient forms referred by officers...");

        const demoPatients = [
            // Patient 1: Referred by Field Officer 1 (Verified)
            {
                patientName: "Manoj Kumar Sharma",
                fatherOrHusbandName: "Ramswaroop Sharma",
                gender: "Male",
                houseOrStreet: "Plot 15, Tonk Road",
                locality: "Sitapura",
                cityOrDistrict: "Jaipur",
                state: "Rajasthan",
                landmark: "Near Bus Stand",
                pinCode: "302022",
                mobileNumber: "9876500001",
                emergencyContact: "9876500002",
                diseaseName: "Joint Pain & Ortho Care",
                duration: "6 Months",
                formType: "form1",
                registerNo: "SO-P01",
                referredBy: fieldOfficer1.userId,
                type: "singleorder",
                otherStatus: {
                    doctorStatus: "Verified",
                    supportStatus: "Completed",
                    deliveryStatus: "In Progress"
                }
            },
            // Patient 2: Referred by Field Officer 1 (Pending)
            {
                patientName: "Sunita Devi",
                fatherOrHusbandName: "Rajendra Prasad",
                gender: "Female",
                houseOrStreet: "House 28",
                locality: "Sanganer",
                cityOrDistrict: "Jaipur",
                state: "Rajasthan",
                landmark: "Behind Govt School",
                pinCode: "302029",
                mobileNumber: "9876500003",
                emergencyContact: "9876500004",
                diseaseName: "Diabetes & Sugar Care",
                duration: "1 Year",
                formType: "form2",
                registerNo: "SO-P02",
                referredBy: fieldOfficer1.userId,
                type: "singleorder",
                otherStatus: {
                    doctorStatus: "pending",
                    supportStatus: "",
                    deliveryStatus: ""
                }
            },
            // Patient 3: Referred by Field Officer 2 (Delivered)
            {
                patientName: "Kavita Saini",
                fatherOrHusbandName: "Pawan Saini",
                gender: "Female",
                houseOrStreet: "Lane 4",
                locality: "Mansarovar",
                cityOrDistrict: "Jaipur",
                state: "Rajasthan",
                landmark: "Near Metro Pillar 32",
                pinCode: "302020",
                mobileNumber: "9876500005",
                emergencyContact: "9876500006",
                diseaseName: "Digestive & Acidity Care",
                duration: "3 Months",
                formType: "form1",
                registerNo: "SO-P03",
                referredBy: fieldOfficer2.userId,
                type: "singleorder",
                otherStatus: {
                    doctorStatus: "Verified",
                    supportStatus: "Completed",
                    trackingIdStatus: "TRK-99001",
                    deliveryStatus: "delivered"
                }
            },
            // Patient 4: Referred by Field Officer 2 (Verified)
            {
                patientName: "Rakesh Mehra",
                fatherOrHusbandName: "Satish Mehra",
                gender: "Male",
                houseOrStreet: "Quarter 11",
                locality: "Mahaveer Nagar",
                cityOrDistrict: "Jaipur",
                state: "Rajasthan",
                landmark: "Near Park",
                pinCode: "302018",
                mobileNumber: "9876500007",
                emergencyContact: "9876500008",
                diseaseName: "Asthma & Breathing Care",
                duration: "8 Months",
                formType: "form3",
                registerNo: "SO-P04",
                referredBy: fieldOfficer2.userId,
                type: "singleorder",
                otherStatus: {
                    doctorStatus: "Verified",
                    supportStatus: "In Progress",
                    deliveryStatus: "Pending Dispatch"
                }
            },
            // Patient 5: Referred by Block Officer 1 (Verified)
            {
                patientName: "Gopal Lal Jat",
                fatherOrHusbandName: "Bhagirath Jat",
                gender: "Male",
                houseOrStreet: "Village Post Office",
                locality: "Kishangarh Renwal",
                cityOrDistrict: "Jaipur",
                state: "Rajasthan",
                landmark: "Near Panchayat Bhawan",
                pinCode: "303603",
                mobileNumber: "9876500009",
                emergencyContact: "9876500010",
                diseaseName: "Total Wellness Care",
                duration: "2 Months",
                formType: "form1",
                registerNo: "SO-P05",
                referredBy: blockOfficer1.userId,
                type: "singleorder",
                otherStatus: {
                    doctorStatus: "Verified",
                    supportStatus: "Completed",
                    deliveryStatus: "Dispatched"
                }
            },
            // Patient 6: Referred by Field Officer 3 (Pending in Ajmer)
            {
                patientName: "Dinesh Rawat",
                fatherOrHusbandName: "Mohan Lal Rawat",
                gender: "Male",
                houseOrStreet: "House 5",
                locality: "Silora Road",
                cityOrDistrict: "Ajmer",
                state: "Rajasthan",
                landmark: "Near Marble Market",
                pinCode: "305802",
                mobileNumber: "9876500011",
                emergencyContact: "9876500012",
                diseaseName: "Immunity & Weakness Care",
                duration: "5 Months",
                formType: "form2",
                registerNo: "SO-P06",
                referredBy: fieldOfficer3.userId,
                type: "singleorder",
                otherStatus: {
                    doctorStatus: "pending",
                    supportStatus: "",
                    deliveryStatus: ""
                }
            }
        ];

        for (let p of demoPatients) {
            await PatientForm.create(p);
        }

        console.log(`Successfully created ${demoPatients.length} demo patient forms.`);
        console.log("\n=======================================================");
        console.log("DEMO SINGLE ORDER LOGINS (Password for all: 1234):");
        console.log("=======================================================");
        console.log("1. State Head (Full State Downline):");
        console.log(`   Email: statehead@bsrf.com | ID: ${stateHead.userId} | Sees: 7 officers & 6 patients`);
        console.log("2. District Officer 1 (Jaipur District Downline):");
        console.log(`   Email: districtofficer1@bsrf.com | ID: ${districtOfficer1.userId} | Sees: 3 officers & 5 patients`);
        console.log("3. District Officer 2 (Ajmer District Downline):");
        console.log(`   Email: districtofficer2@bsrf.com | ID: ${districtOfficer2.userId} | Sees: 2 officers & 1 patient`);
        console.log("4. Block Officer 1 (Sanganer Block Downline):");
        console.log(`   Email: blockofficer1@bsrf.com | ID: ${blockOfficer1.userId} | Sees: 2 officers & 4 patients`);
        console.log("5. Field Officer 1 (Frontline Officer):");
        console.log(`   Email: fieldofficer1@bsrf.com | ID: ${fieldOfficer1.userId} | Sees: 0 downline (base tier)`);
        console.log("=======================================================\n");

        await mongoose.disconnect();
        console.log("Seeding complete. Disconnected from DB.");
        process.exit(0);

    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seedSingleOrderDemo();
