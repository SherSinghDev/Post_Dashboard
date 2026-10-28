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
} = require('../modals/education');

async function seedEducationData() {
    try {
        const uniCount = await University.countDocuments();
        if (uniCount > 0) {
            return; // Already seeded
        }

        console.log("--- Seeding BSRF Education Portal Default Data ---");

        // 1. Universities
        const universitiesData = [
            {
                name: "Noida International University (NIU)",
                slug: "niu-online",
                code: "NIU-01",
                logo: "https://niuonline.edu.in/assets/images/logo.png",
                location: "Greater Noida, Uttar Pradesh",
                state: "Uttar Pradesh",
                website: "https://niuonline.edu.in",
                approvals: ["UGC Approved", "AICTE", "NAAC A+", "WES Recognized"],
                description: "Noida International University is a premier multidisciplinary university offering world-class online and distance learning programmes with state-of-the-art curriculum.",
                ranking: "Ranked among Top 50 Private Universities in India",
                admissionDeadline: "15th November 2026",
                establishedYear: "2010"
            },
            {
                name: "Swami Vivekanand Subharti University",
                slug: "subharti-dde",
                code: "SVSU-02",
                logo: "https://www.subhartidde.com/images/logo.png",
                location: "Meerut, Uttar Pradesh",
                state: "Uttar Pradesh",
                website: "https://www.subhartidde.com",
                approvals: ["UGC-DEB", "AICTE", "NAAC A", "NMC"],
                description: "Subharti Directorate of Distance Education has empowered over 500,000+ students across India with affordable and flexible UG/PG programmes.",
                ranking: "NAAC 'A' Grade Accredited",
                admissionDeadline: "20th November 2026",
                establishedYear: "2008"
            },
            {
                name: "Mangalayatan University",
                slug: "mangalayatan-online",
                code: "MU-03",
                logo: "https://mude.ac.in/images/logo.png",
                location: "Aligarh, Uttar Pradesh",
                state: "Uttar Pradesh",
                website: "https://mude.ac.in",
                approvals: ["UGC-DEB Approved", "AICTE", "NAAC A+", "AIU Member"],
                description: "Empowering learners through cutting-edge technology, flexible assessments, and career mentorship for distance and online education.",
                ranking: "Top Rated Digital University",
                admissionDeadline: "30th November 2026",
                establishedYear: "2006"
            },
            {
                name: "Galgotias University",
                slug: "galgotias-university",
                code: "GU-04",
                logo: "https://www.galgotiasuniversity.edu.in/assets/images/logo.png",
                location: "Greater Noida, Uttar Pradesh",
                state: "Uttar Pradesh",
                website: "https://www.galgotiasuniversity.edu.in",
                approvals: ["UGC", "NAAC A+", "NBA", "QS I-GAUGE Diamond"],
                description: "Galgotias University is internationally recognized for academic excellence, innovative pedagogy, and record-breaking corporate placements.",
                ranking: "NAAC A+ (Highest Grade in NCR)",
                admissionDeadline: "10th November 2026",
                establishedYear: "2011"
            },
            {
                name: "GLA University",
                slug: "gla-university-online",
                code: "GLA-05",
                logo: "https://www.gla.ac.in/images/gla-logo.png",
                location: "Mathura, Uttar Pradesh",
                state: "Uttar Pradesh",
                website: "https://www.gla.ac.in",
                approvals: ["UGC", "NAAC A+", "12B Status", "AICTE"],
                description: "A benchmark of quality education providing high-demand management, computer science, and engineering specializations.",
                ranking: "NAAC A+ with 3.46 Score",
                admissionDeadline: "25th November 2026",
                establishedYear: "1998"
            },
            {
                name: "Amity University Online",
                slug: "amity-online",
                code: "AMITY-06",
                logo: "https://amityonline.com/assets/images/logo.svg",
                location: "Noida, Uttar Pradesh",
                state: "Uttar Pradesh",
                website: "https://amity.edu",
                approvals: ["UGC-DEB", "WASC USA", "QAA UK", "NAAC A+"],
                description: "India's first university approved by UGC to offer fully online degrees with global faculty and Fortune 500 employer partnerships.",
                ranking: "QS Asia Ranked University",
                admissionDeadline: "30th November 2026",
                establishedYear: "2005"
            }
        ];

        const createdUnis = await University.insertMany(universitiesData);

        // 2. Courses
        const coursesData = [
            // NIU Courses
            {
                title: "Bachelor of Computer Applications (BCA)",
                code: "BCA-01",
                universityId: createdUnis[0]._id,
                universityName: createdUnis[0].name,
                category: "UG",
                stream: "Computer Science",
                duration: "3 Years (6 Semesters)",
                mode: "Online",
                feePerYear: 28000,
                totalFee: 84000,
                eligibility: "10+2 in any stream with minimum 45% aggregate",
                seats: 120
            },
            {
                title: "Master of Business Administration (MBA)",
                code: "MBA-01",
                universityId: createdUnis[0]._id,
                universityName: createdUnis[0].name,
                category: "PG",
                stream: "Management",
                duration: "2 Years (4 Semesters)",
                mode: "Online",
                feePerYear: 45000,
                totalFee: 90000,
                eligibility: "Graduation in any discipline with minimum 50% marks",
                seats: 200
            },
            {
                title: "Master of Computer Applications (MCA)",
                code: "MCA-01",
                universityId: createdUnis[0]._id,
                universityName: createdUnis[0].name,
                category: "PG",
                stream: "Computer Science",
                duration: "2 Years (4 Semesters)",
                mode: "Online",
                feePerYear: 38000,
                totalFee: 76000,
                eligibility: "BCA / B.Sc (IT/CS) / Any Graduate with Maths at 10+2 or degree",
                seats: 100
            },
            // Subharti Courses
            {
                title: "Bachelor of Arts (BA)",
                code: "BA-01",
                universityId: createdUnis[1]._id,
                universityName: createdUnis[1].name,
                category: "UG",
                stream: "Arts & Humanities",
                duration: "3 Years",
                mode: "Distance",
                feePerYear: 12000,
                totalFee: 36000,
                eligibility: "10+2 Pass in any stream from recognized board",
                seats: 300
            },
            {
                title: "Bachelor of Library & Information Science (B.Lib)",
                code: "BLIB-01",
                universityId: createdUnis[1]._id,
                universityName: createdUnis[1].name,
                category: "UG",
                stream: "Library Science",
                duration: "1 Year",
                mode: "Distance",
                feePerYear: 16000,
                totalFee: 16000,
                eligibility: "Graduation in any stream with 45%",
                seats: 100
            },
            {
                title: "Master of Arts (MA - Hindi/English/Pol Science)",
                code: "MA-01",
                universityId: createdUnis[1]._id,
                universityName: createdUnis[1].name,
                category: "PG",
                stream: "Arts & Humanities",
                duration: "2 Years",
                mode: "Distance",
                feePerYear: 15000,
                totalFee: 30000,
                eligibility: "Bachelor's degree in any discipline",
                seats: 150
            },
            // Mangalayatan Courses
            {
                title: "Bachelor of Business Administration (BBA)",
                code: "BBA-01",
                universityId: createdUnis[2]._id,
                universityName: createdUnis[2].name,
                category: "UG",
                stream: "Management",
                duration: "3 Years",
                mode: "Online",
                feePerYear: 26000,
                totalFee: 78000,
                eligibility: "10+2 pass with 45% aggregate",
                seats: 150
            },
            {
                title: "Bachelor of Commerce (B.Com)",
                code: "BCOM-01",
                universityId: createdUnis[2]._id,
                universityName: createdUnis[2].name,
                category: "UG",
                stream: "Commerce",
                duration: "3 Years",
                mode: "Online",
                feePerYear: 18000,
                totalFee: 54000,
                eligibility: "10+2 in Commerce or Science or Arts with Mathematics",
                seats: 150
            },
            // Galgotias Courses
            {
                title: "Bachelor of Technology (B.Tech - Computer Science)",
                code: "BTECH-CS",
                universityId: createdUnis[3]._id,
                universityName: createdUnis[3].name,
                category: "UG",
                stream: "Engineering",
                duration: "4 Years",
                mode: "Regular",
                feePerYear: 95000,
                totalFee: 380000,
                eligibility: "10+2 with Physics, Mathematics & Chemistry (Min 60%)",
                seats: 180
            },
            {
                title: "Bachelor of Pharmacy (B.Pharma)",
                code: "BPHARM-01",
                universityId: createdUnis[3]._id,
                universityName: createdUnis[3].name,
                category: "UG",
                stream: "Pharmacy",
                duration: "4 Years",
                mode: "Regular",
                feePerYear: 85000,
                totalFee: 340000,
                eligibility: "10+2 with PCB / PCM minimum 50% marks",
                seats: 60
            },
            {
                title: "Diploma in Pharmacy (D.Pharma)",
                code: "DPHARM-01",
                universityId: createdUnis[3]._id,
                universityName: createdUnis[3].name,
                category: "Diploma",
                stream: "Pharmacy",
                duration: "2 Years",
                mode: "Regular",
                feePerYear: 65000,
                totalFee: 130000,
                eligibility: "10+2 with Science (PCB or PCM)",
                seats: 60
            },
            // GLA / Certificate / Vocational / Ph.D.
            {
                title: "Ph.D. in Management Studies",
                code: "PHD-MGT",
                universityId: createdUnis[4]._id,
                universityName: createdUnis[4].name,
                category: "Doctoral",
                stream: "Doctoral Programmes",
                duration: "3 - 5 Years",
                mode: "Regular",
                feePerYear: 75000,
                totalFee: 225000,
                eligibility: "Master's Degree with minimum 55% marks + Entrance/UGC-NET",
                seats: 15
            },
            {
                title: "Certificate in Full Stack Web Development",
                code: "CERT-FSW",
                universityId: createdUnis[0]._id,
                universityName: createdUnis[0].name,
                category: "Certificate",
                stream: "Vocational / Skill Development",
                duration: "6 Months",
                mode: "Online",
                feePerYear: 15000,
                totalFee: 15000,
                eligibility: "10+2 / Open to all passionate students",
                seats: 250
            },
            {
                title: "Diploma in Mechanical Engineering",
                code: "DIP-MECH",
                universityId: createdUnis[1]._id,
                universityName: createdUnis[1].name,
                category: "Diploma",
                stream: "Engineering",
                duration: "3 Years",
                mode: "Regular",
                feePerYear: 32000,
                totalFee: 96000,
                eligibility: "10th pass with Science & Math with minimum 45%",
                seats: 90
            }
        ];

        const createdCourses = await Course.insertMany(coursesData);

        // 3. Counsellor
        const hashedPass = await bcrypt.hash("123456", 10);
        const counsellor = await Counsellor.create({
            counsellorId: "BSRF-COU-101",
            name: "Rajesh Sharma",
            email: "counsellor@bsrf.org",
            password: hashedPass,
            phone: "+91 9839332500",
            department: "Central Admissions",
            target: 30,
            commissionRate: 5
        });

        // 4. Education Centre / Franchise
        const center = await Center.create({
            centerCode: "BSRF-CEN-01",
            centerName: "Purvanchal Vidya Kendra",
            ownerName: "Alok Kumar Verma",
            email: "center@bsrf.org",
            password: hashedPass,
            phone: "+91 9876543210",
            address: "Golghar, Pratap Market, Office-1B",
            city: "Gorakhpur",
            state: "Uttar Pradesh",
            pincode: "273001",
            commissionRate: 15,
            totalCommissionEarned: 12500,
            totalCommissionPaid: 5000
        });

        // 5. Student
        const student = await Student.create({
            studentId: "BSRF-STU-1001",
            fullName: "Aman Gupta",
            email: "student@bsrf.org",
            password: hashedPass,
            phone: "+91 9123456789",
            whatsapp: "+91 9123456789",
            fatherName: "Suresh Gupta",
            motherName: "Sunita Gupta",
            dob: "2003-05-14",
            gender: "Male",
            address: "Shivaji Nagar, Colony No. 4",
            city: "Lucknow",
            state: "Uttar Pradesh",
            pincode: "226001",
            qualification: "12th Science (78%)",
            centerId: center._id,
            centerName: center.centerName,
            counsellorId: counsellor._id
        });

        // 6. Application
        await Application.create({
            applicationNo: "BSRF-APP-2026-001",
            studentId: student._id,
            studentName: student.fullName,
            email: student.email,
            phone: student.phone,
            fatherName: student.fatherName,
            universityId: createdUnis[0]._id,
            universityName: createdUnis[0].name,
            courseId: createdCourses[0]._id,
            courseTitle: createdCourses[0].title,
            category: "UG",
            stream: "Computer Science",
            mode: "Online",
            centerId: center._id,
            centerName: center.centerName,
            counsellorId: counsellor._id,
            counsellorName: counsellor.name,
            status: "Approved",
            documents: [
                { docType: "10th Marksheet", fileUrl: "/images/sample-doc.pdf", status: "Verified" },
                { docType: "12th Marksheet", fileUrl: "/images/sample-doc.pdf", status: "Verified" },
                { docType: "Aadhar Card", fileUrl: "/images/sample-doc.pdf", status: "Verified" }
            ],
            feeAmount: 28000,
            feePaid: 28000,
            paymentTxnId: "TXN_UPI_9988221100",
            paymentMode: "UPI QR Scan",
            paymentStatus: "Completed",
            admissionLetterNo: "BSRF/ADM/2026/NIU-1092",
            remarks: "Documents verified successfully. Admission approved."
        });

        // 7. Leads
        await Lead.insertMany([
            {
                name: "Pooja Singh",
                email: "pooja.singh@gmail.com",
                phone: "9871122334",
                fatherName: "Mahesh Singh",
                city: "Varanasi",
                state: "Uttar Pradesh",
                courseInterested: "Master of Business Administration (MBA)",
                universityInterested: "Noida International University (NIU)",
                mode: "Online",
                status: "Connected / In Discussion",
                counsellorId: counsellor._id,
                counsellorName: counsellor.name,
                followUpDate: "2026-10-25",
                notes: [
                    { note: "Student looking for distance or online MBA with installment fee option.", recordedBy: counsellor.name }
                ]
            },
            {
                name: "Rohan Patel",
                email: "rohan.patel@gmail.com",
                phone: "9833445566",
                fatherName: "Kishore Patel",
                city: "Kanpur",
                state: "Uttar Pradesh",
                courseInterested: "Bachelor of Computer Applications (BCA)",
                universityInterested: "Mangalayatan University",
                mode: "Online",
                status: "New Lead",
                counsellorId: counsellor._id,
                counsellorName: counsellor.name,
                followUpDate: "2026-10-24"
            }
        ]);

        // 8. Notices
        await Notice.insertMany([
            {
                title: "Admission Session 2026-2027 Registration Open",
                content: "Online registration for all UG, PG and Diploma courses for academic session 2026-2027 is now actively open across all partner universities.",
                type: "Admissions",
                isImportant: true
            },
            {
                title: "Term-End Examination Schedule Released",
                content: "Online examination forms and timetable for semester exams have been published on the student portal.",
                type: "Exams",
                isImportant: false
            },
            {
                title: "Free Education & Scholarship Scheme Guidelines",
                content: "Meritorious students and underprivileged candidates can now apply for 100% Free Education under BSRF Vidya Abhiyan.",
                type: "General",
                isImportant: true
            }
        ]);

        // 9. Study Materials
        await StudyMaterial.insertMany([
            {
                title: "Object-Oriented Programming with C++ & Java",
                courseStream: "Computer Science",
                courseTitle: "BCA / B.Sc CS",
                semester: "Semester 2",
                subject: "Programming Paradigm",
                format: "PDF",
                fileSize: "5.2 MB",
                downloadsCount: 320
            },
            {
                title: "Principles of Modern Business Management & Marketing",
                courseStream: "Management",
                courseTitle: "BBA / MBA",
                semester: "Semester 1",
                subject: "Management Concepts",
                format: "PDF",
                fileSize: "7.8 MB",
                downloadsCount: 480
            },
            {
                title: "Data Structures & Algorithm Handbook with Python",
                courseStream: "Computer Science",
                courseTitle: "MCA / BCA",
                semester: "Semester 3",
                subject: "Data Structures",
                format: "PDF",
                fileSize: "6.1 MB",
                downloadsCount: 512
            }
        ]);

        // 10. Online Classes
        await OnlineClass.insertMany([
            {
                title: "Advanced Database Management & Cloud SQL",
                subject: "DBMS & Cloud Computing",
                instructor: "Prof. Arvind Sen (M.Tech, IIT)",
                courseStream: "Computer Science",
                date: "2026-10-25",
                time: "10:00 AM - 11:30 AM",
                joinUrl: "https://meet.google.com/bsrf-live-class-1",
                status: "Upcoming"
            },
            {
                title: "Strategic Financial Management & Corporate Budgeting",
                subject: "Financial Accounting",
                instructor: "Dr. Meenakshi Rao (Ph.D. IIM)",
                courseStream: "Management",
                date: "2026-10-26",
                time: "02:00 PM - 03:30 PM",
                joinUrl: "https://meet.google.com/bsrf-live-class-2",
                status: "Upcoming"
            }
        ]);

        // 11. Online Exams
        await OnlineExam.insertMany([
            {
                examTitle: "Mid-Term Assessment: Fundamentals of Computing",
                courseStream: "Computer Science",
                subject: "Computer Systems & IT",
                examDate: "2026-11-05",
                durationMinutes: 60,
                totalQuestions: 50,
                totalMarks: 100,
                status: "Scheduled"
            },
            {
                examTitle: "Online Mock Test: Business Economics & Quantitative Methods",
                courseStream: "Management",
                subject: "Business Statistics",
                examDate: "2026-11-08",
                durationMinutes: 45,
                totalQuestions: 40,
                totalMarks: 80,
                status: "Scheduled"
            }
        ]);

        // 12. Certificates
        await Certificate.create({
            certificateNo: "BSRF-CERT-2026-8899",
            studentName: "Aman Gupta",
            fatherName: "Suresh Gupta",
            courseTitle: "Bachelor of Computer Applications (BCA)",
            universityName: "Noida International University (NIU)",
            rollNo: "NIU2023BCA1092",
            issueDate: "15th June 2026",
            grade: "First Division with Distinction (A+)",
            percentage: "84.2%",
            status: "Verified & Authentic"
        });

        console.log("--- BSRF Education Portal Data Seeded Successfully ---");
    } catch (err) {
        console.error("Error seeding education data:", err);
    }
}

module.exports = seedEducationData;
