const mongoose = require('mongoose');

// 1. University Schema
const universitySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    code: { type: String, trim: true },
    logo: { type: String, default: '' },
    location: { type: String, default: '' },
    state: { type: String, default: '' },
    website: { type: String, default: '' },
    approvals: [{ type: String }], // e.g. UGC, AICTE, NAAC A+, WES Approved
    description: { type: String, default: '' },
    ranking: { type: String, default: '' },
    admissionDeadline: { type: String, default: '31st October 2026' },
    brochureUrl: { type: String, default: '' },
    establishedYear: { type: String, default: '2008' },
    campusType: { type: String, default: 'State / Private / Deemed' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 2. Course Schema
const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'EduUniversity' },
    universityName: { type: String, default: '' },
    category: { 
        type: String, 
        enum: ['UG', 'PG', 'Diploma', 'Certificate', 'Doctoral', 'Vocational'],
        default: 'UG' 
    },
    stream: { 
        type: String, 
        enum: [
            'Computer Science', 
            'Engineering', 
            'Management', 
            'Arts & Humanities', 
            'Commerce', 
            'Law', 
            'Pharmacy', 
            'Physiotherapy', 
            'Agriculture', 
            'Journalism & Mass Comm', 
            'Fashion & Design', 
            'Library Science', 
            'Doctoral Programmes',
            'Vocational / Skill Development'
        ],
        default: 'Management'
    },
    duration: { type: String, default: '3 Years' },
    mode: { 
        type: String, 
        enum: ['Online', 'Distance', 'Regular', 'Vocational / Hybrid'],
        default: 'Online' 
    },
    feePerYear: { type: Number, default: 25000 },
    totalFee: { type: Number, default: 75000 },
    eligibility: { type: String, default: '10+2 with minimum 45% marks from recognized board' },
    requiredDocuments: [{ type: String }],
    seats: { type: Number, default: 60 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 3. Student Schema
const studentSchema = new mongoose.Schema({
    studentId: { type: String, unique: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String, default: '' },
    fatherName: { type: String, default: '' },
    motherName: { type: String, default: '' },
    dob: { type: String, default: '' },
    gender: { type: String, default: 'Male' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    photo: { type: String, default: '/images/default-avatar.png' },
    qualification: { type: String, default: '12th Pass' },
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'EduCenter', default: null },
    centerName: { type: String, default: 'Direct / Online' },
    counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: 'EduCounsellor', default: null },
    status: { type: String, default: 'Active' }
}, { timestamps: true });

// 4. Admission Application Schema
const applicationSchema = new mongoose.Schema({
    applicationNo: { type: String, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'EduStudent' },
    studentName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    fatherName: { type: String, default: '' },
    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'EduUniversity' },
    universityName: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'EduCourse' },
    courseTitle: { type: String, required: true },
    category: { type: String, default: 'UG' },
    stream: { type: String, default: '' },
    mode: { type: String, default: 'Online' },
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'EduCenter', default: null },
    centerName: { type: String, default: 'Direct Portal' },
    counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: 'EduCounsellor', default: null },
    counsellorName: { type: String, default: 'Unassigned' },
    status: { 
        type: String, 
        enum: ['Pending', 'Under Review', 'Verified', 'Approved', 'Offer Letter Issued', 'Fee Paid', 'Enrolled', 'Rejected'],
        default: 'Pending' 
    },
    photo: { type: String, default: '' },
    documents: [{
        docType: { type: String }, // e.g. '10th Marksheet', '12th Marksheet', 'Graduation', 'Aadhar Card'
        fileUrl: { type: String },
        status: { type: String, default: 'Pending' }
    }],
    feeAmount: { type: Number, default: 0 },
    feePaid: { type: Number, default: 0 },
    paymentTxnId: { type: String, default: '' },
    paymentMode: { type: String, default: 'UPI / Online' },
    paymentStatus: { type: String, default: 'Unpaid' },
    admissionLetterNo: { type: String, default: '' },
    offerLetterUrl: { type: String, default: '' },
    admissionDate: { type: Date, default: Date.now },
    remarks: { type: String, default: '' }
}, { timestamps: true });

// 5. Counsellor Schema
const counsellorSchema = new mongoose.Schema({
    counsellorId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    department: { type: String, default: 'Admissions' },
    target: { type: Number, default: 25 },
    commissionRate: { type: Number, default: 5 }, // 5%
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 6. Lead / Enquiry Schema
const leadSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, required: true },
    fatherName: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    courseInterested: { type: String, default: '' },
    universityInterested: { type: String, default: '' },
    mode: { type: String, default: 'Online' },
    status: { 
        type: String, 
        enum: ['New Lead', 'Connected / In Discussion', 'Follow-up Scheduled', 'Converted / Applied', 'Not Interested', 'Closed'],
        default: 'New Lead' 
    },
    counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: 'EduCounsellor', default: null },
    counsellorName: { type: String, default: 'General Pool' },
    followUpDate: { type: String, default: '' },
    notes: [{
        date: { type: Date, default: Date.now },
        note: { type: String },
        recordedBy: { type: String }
    }],
    source: { type: String, default: 'Website Quick Enquiry' }
}, { timestamps: true });

// 7. Franchise / Education Centre Schema
const centerSchema = new mongoose.Schema({
    centerCode: { type: String, unique: true },
    centerName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    commissionRate: { type: Number, default: 15 }, // 15% commission per admission
    totalCommissionEarned: { type: Number, default: 0 },
    totalCommissionPaid: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 8. Notice Schema
const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, default: 'Admissions' }, // Admissions, Exams, Classes, General
    audience: { type: String, default: 'All' }, // All, Students, Centers, Counsellors
    isImportant: { type: Boolean, default: false },
    fileUrl: { type: String, default: '' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

// 9. Study Material Schema
const studyMaterialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    courseStream: { type: String, default: 'Computer Science' },
    courseTitle: { type: String, default: 'BCA / MCA' },
    semester: { type: String, default: 'Semester 1' },
    subject: { type: String, default: 'Programming & Data Structures' },
    fileUrl: { type: String, default: '#' },
    format: { type: String, default: 'PDF' },
    fileSize: { type: String, default: '4.8 MB' },
    downloadsCount: { type: Number, default: 142 }
}, { timestamps: true });

// 10. Online Class Schema
const onlineClassSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true },
    instructor: { type: String, default: 'Dr. Sharma / Prof. Verma' },
    courseStream: { type: String, default: 'Management' },
    date: { type: String, default: '2026-10-25' },
    time: { type: String, default: '11:00 AM - 12:30 PM' },
    joinUrl: { type: String, default: 'https://meet.google.com/bsrf-edu-live' },
    status: { type: String, default: 'Upcoming' } // Upcoming, Live, Completed
}, { timestamps: true });

// 11. Online Exam Schema
const onlineExamSchema = new mongoose.Schema({
    examTitle: { type: String, required: true },
    courseStream: { type: String, default: 'Computer Science' },
    subject: { type: String, default: 'Computer Fundamentals & Programming' },
    examDate: { type: String, default: '2026-11-05' },
    durationMinutes: { type: Number, default: 60 },
    totalQuestions: { type: Number, default: 50 },
    totalMarks: { type: Number, default: 100 },
    status: { type: String, default: 'Scheduled' }, // Scheduled, Active, Expired
    instructions: { type: String, default: 'All questions are multiple choice. Negative marking is 0.25.' }
}, { timestamps: true });

// 12. Certificate Verification Schema
const certificateSchema = new mongoose.Schema({
    certificateNo: { type: String, unique: true, required: true },
    studentName: { type: String, required: true },
    fatherName: { type: String, default: '' },
    courseTitle: { type: String, required: true },
    universityName: { type: String, required: true },
    rollNo: { type: String, required: true },
    issueDate: { type: String, default: '2026-06-15' },
    grade: { type: String, default: 'Grade A / First Class' },
    percentage: { type: String, default: '78.5%' },
    status: { type: String, default: 'Verified & Authentic' }
}, { timestamps: true });

module.exports = {
    University: mongoose.model('EduUniversity', universitySchema),
    Course: mongoose.model('EduCourse', courseSchema),
    Student: mongoose.model('EduStudent', studentSchema),
    Application: mongoose.model('EduApplication', applicationSchema),
    Counsellor: mongoose.model('EduCounsellor', counsellorSchema),
    Lead: mongoose.model('EduLead', leadSchema),
    Center: mongoose.model('EduCenter', centerSchema),
    Notice: mongoose.model('EduNotice', noticeSchema),
    StudyMaterial: mongoose.model('EduStudyMaterial', studyMaterialSchema),
    OnlineClass: mongoose.model('EduOnlineClass', onlineClassSchema),
    OnlineExam: mongoose.model('EduOnlineExam', onlineExamSchema),
    Certificate: mongoose.model('EduCertificate', certificateSchema)
};
