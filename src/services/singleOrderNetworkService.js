const mongoose = require('mongoose');
const Users = require('../modals/users');
const PatientForm = require('../modals/patientForm');

/**
 * Standardizes position string for case-insensitive matching and grouping
 */
function normalizePosition(pos) {
    if (!pos) return 'Unassigned';
    const clean = pos.trim().toLowerCase();
    if (clean.includes('state')) return 'State Head';
    if (clean.includes('district')) return 'District Officer';
    if (clean.includes('block')) return 'Block Officer';
    if (clean.includes('field')) return 'Field Officer';
    return pos.trim();
}

/**
 * Traverses all descendant single-order users for a given parent user.
 * Supports arbitrary depth (State Head -> District Officer -> Block Officer -> Field Officer...).
 * Also supports Admin role to view entire single-order organizational tree.
 */
async function getSingleOrderDescendantNetwork(currentUser) {
    let descendants = [];
    let visitedUserIds = new Set();
    visitedUserIds.add(currentUser._id.toString());

    // Position & Level tracking
    let byPosition = {
        'State Head': 0,
        'District Officer': 0,
        'Block Officer': 0,
        'Field Officer': 0
    };
    let byLevel = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    const isManagerRole = currentUser.role === 'Admin' || 
                          currentUser.role === 'stock_operator' || 
                          (currentUser.position && currentUser.position.toLowerCase().includes('stock operator'));

    if (isManagerRole) {
        // Stock Operator / Admin acts as Overall Manager viewing all Single Order users and downlines
        const allSingleOrderUsers = await Users.find({
            type: { $regex: new RegExp("^singleorder$", "i") },
            _id: { $ne: currentUser._id }
        }).populate('parentUser', 'name position userId').lean();

        // Map to quickly find parent info
        const userByIdMap = new Map();
        allSingleOrderUsers.forEach(u => {
            u.normPosition = normalizePosition(u.position);
            userByIdMap.set(u._id.toString(), u);
            if (u.userId) userByIdMap.set(u.userId.toString(), u);
            if (u.referralCode) userByIdMap.set(u.referralCode.toString(), u);
        });

        for (let u of allSingleOrderUsers) {
            // Determine hierarchical level under the Stock Operator Manager
            if (u.normPosition === 'State Head') {
                u.level = 1;
                u.parentName = currentUser.name || 'Stock Operator (Manager)';
                u.parentPosition = 'Stock Operator';
                u.parentDisplayId = currentUser.userId || '';
            } else if (u.normPosition === 'District Officer') {
                u.level = 2;
            } else if (u.normPosition === 'Block Officer') {
                u.level = 3;
            } else if (u.normPosition === 'Field Officer') {
                u.level = 4;
            } else {
                u.level = 5;
            }

            // Fill parent details
            let parent = null;
            if (u.parentUser && typeof u.parentUser === 'object' && u.parentUser.name) {
                parent = u.parentUser;
            } else if (u.parentUser && userByIdMap.has(u.parentUser.toString())) {
                parent = userByIdMap.get(u.parentUser.toString());
            } else if (u.referredBy && userByIdMap.has(u.referredBy.toString())) {
                parent = userByIdMap.get(u.referredBy.toString());
            }

            if (parent) {
                u.parentName = parent.name;
                u.parentPosition = parent.position || (parent.role === 'stock_operator' ? 'Stock Operator' : 'Supervisor');
                u.parentDisplayId = parent.userId || '';
            } else if (u.normPosition === 'State Head') {
                u.parentName = u.referrerName || (currentUser.role === 'stock_operator' ? (currentUser.name || 'Stock Operator (Manager)') : 'Direct / None');
                u.parentPosition = currentUser.role === 'stock_operator' ? 'Stock Operator' : 'Management';
                u.parentDisplayId = currentUser.role === 'stock_operator' ? (currentUser.userId || '') : '';
            } else {
                u.parentName = u.referrerName || 'State Head';
                u.parentPosition = 'Officer';
                u.parentDisplayId = u.referredBy || '';
            }

            descendants.push(u);
            byPosition[u.normPosition] = (byPosition[u.normPosition] || 0) + 1;
            byLevel[u.level] = (byLevel[u.level] || 0) + 1;
        }

        // Natural hierarchical sort: State Head -> District -> Block -> Field
        descendants.sort((a, b) => a.level - b.level);
    } else {
        // --- LEVEL 1: Direct Children of currentUser ---
        const l1Conditions = [{ parentUser: currentUser._id }];
        if (currentUser.userId) l1Conditions.push({ referredBy: currentUser.userId });
        if (currentUser.referralCode) l1Conditions.push({ referredBy: currentUser.referralCode });

        let currentLevelUsers = await Users.find({
            _id: { $ne: currentUser._id },
            type: { $regex: new RegExp("^singleorder$", "i") },
            $or: l1Conditions
        }).lean();

        let level = 1;
        while (currentLevelUsers.length > 0 && level <= 10) {
            let nextLevelUsers = [];
            byLevel[level] = 0;

            for (let u of currentLevelUsers) {
                const idStr = u._id.toString();
                if (!visitedUserIds.has(idStr)) {
                    visitedUserIds.add(idStr);
                    u.level = level;
                    u.normPosition = normalizePosition(u.position);

                    // Find parent details from previous level or currentUser
                    if (level === 1) {
                        u.parentName = currentUser.name || 'Direct';
                        u.parentPosition = currentUser.position || 'Supervisor';
                        u.parentDisplayId = currentUser.userId || '';
                    }

                    descendants.push(u);
                    byLevel[level] = (byLevel[level] || 0) + 1;
                    byPosition[u.normPosition] = (byPosition[u.normPosition] || 0) + 1;
                }
            }

            // Find children for the next level
            const parentLevelUsers = descendants.filter(u => u.level === level);
            if (parentLevelUsers.length === 0) break;

            const prevObjIds = parentLevelUsers.map(u => u._id);
            const prevUserIds = parentLevelUsers.map(u => u.userId).filter(Boolean);
            const prevRefCodes = parentLevelUsers.map(u => u.referralCode).filter(Boolean);

            let nextConditions = [{ parentUser: { $in: prevObjIds } }];
            if (prevUserIds.length > 0) nextConditions.push({ referredBy: { $in: prevUserIds } });
            if (prevRefCodes.length > 0) nextConditions.push({ referredBy: { $in: prevRefCodes } });

            const unvisitedFilter = Array.from(visitedUserIds).map(id => new mongoose.Types.ObjectId(id));
            let rawNextDocs = await Users.find({
                _id: { $nin: unvisitedFilter },
                type: { $regex: new RegExp("^singleorder$", "i") },
                $or: nextConditions
            }).lean();

            for (let doc of rawNextDocs) {
                // Link each next user to their parent in parentLevelUsers
                const matchedParent = parentLevelUsers.find(p =>
                    (doc.parentUser && p._id.toString() === doc.parentUser.toString()) ||
                    (doc.referredBy && (p.userId === doc.referredBy || p.referralCode === doc.referredBy))
                );
                doc.parentName = matchedParent ? matchedParent.name : 'Team Leader';
                doc.parentPosition = matchedParent ? matchedParent.position : 'Officer';
                doc.parentDisplayId = matchedParent ? (matchedParent.userId || '') : '';
                nextLevelUsers.push(doc);
            }

            currentLevelUsers = nextLevelUsers;
            level++;
        }
    }

    // Map descendant user identifiers for querying referred patient forms
    const descendantUserMap = new Map();
    const allDescendantRefKeys = [];

    descendants.forEach(u => {
        if (u.userId) {
            descendantUserMap.set(u.userId.toString(), u);
            allDescendantRefKeys.push(u.userId.toString());
        }
        if (u.referralCode) {
            descendantUserMap.set(u.referralCode.toString(), u);
            allDescendantRefKeys.push(u.referralCode.toString());
        }
    });

    let descendantPatients = [];
    if (allDescendantRefKeys.length > 0) {
        // Fetch all patient forms referred by any descendant
        const patientDocs = await PatientForm.find({
            referredBy: { $in: allDescendantRefKeys }
        }).sort({ createdAt: -1 }).lean();

        // Calculate patient counts per descendant user and enrich patient records
        const patientCountByUser = new Map();

        patientDocs.forEach(p => {
            const refKey = p.referredBy ? p.referredBy.toString() : '';
            const referrer = descendantUserMap.get(refKey);

            if (referrer) {
                p.referrerName = referrer.name;
                p.referrerPosition = referrer.position || 'Field Officer';
                p.referrerNormPosition = referrer.normPosition || normalizePosition(referrer.position);
                p.referrerUserId = referrer.userId;
                p.referrerLevel = referrer.level;
                p.referrerDistrict = referrer.district;
                p.referrerBlock = referrer.block;

                const count = patientCountByUser.get(referrer._id.toString()) || 0;
                patientCountByUser.set(referrer._id.toString(), count + 1);
            } else {
                p.referrerName = 'Unknown Member';
                p.referrerPosition = 'Officer';
                p.referrerNormPosition = 'Officer';
                p.referrerUserId = refKey;
                p.referrerLevel = 1;
            }

            descendantPatients.push(p);
        });

        // Set patient count on each descendant user object
        descendants.forEach(u => {
            u.totalPatientsReferred = patientCountByUser.get(u._id.toString()) || 0;
        });
    } else {
        descendants.forEach(u => {
            u.totalPatientsReferred = 0;
        });
    }

    // Compute patient status counts & monthly delivered stats
    let verifiedPatients = 0;
    let pendingPatients = 0;
    let deliveredPatients = 0;
    let deliveredCurrentMonth = 0;
    const deliveredByMonth = {};

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    descendantPatients.forEach(p => {
        const docStatus = p.otherStatus ? p.otherStatus.doctorStatus : '';
        const delivStatus = p.otherStatus ? p.otherStatus.deliveryStatus : '';
        const isDelivered = delivStatus && ['delivered', 'Delivered', 'DELIVERED'].includes(delivStatus);

        if (isDelivered) {
            deliveredPatients++;
            const pDate = p.createdAt ? new Date(p.createdAt) : new Date();
            const ym = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
            deliveredByMonth[ym] = (deliveredByMonth[ym] || 0) + 1;
            if (ym === currentMonthKey) {
                deliveredCurrentMonth++;
            }
        } else if (docStatus && docStatus !== '' && docStatus !== 'pending' && docStatus !== 'Pending') {
            verifiedPatients++;
        } else {
            pendingPatients++;
        }
    });

    // Generate list of the last 12 months for dropdown selection
    const monthsList = [];
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthsList.push({
            key: ym,
            label: i === 0 ? `${label} (Current)` : label,
            isCurrent: i === 0,
            count: deliveredByMonth[ym] || 0
        });
    }

    // Distinct positions present among descendants for filtering pills
    const presentPositions = Array.from(
        new Set(descendants.map(u => u.normPosition).filter(Boolean))
    );

    // Standard ordering for positions
    const standardOrder = ['State Head', 'District Officer', 'Block Officer', 'Field Officer'];
    const orderedPositions = standardOrder.filter(pos => presentPositions.includes(pos));
    presentPositions.forEach(pos => {
        if (!orderedPositions.includes(pos)) orderedPositions.push(pos);
    });

    return {
        descendants,
        patients: descendantPatients,
        distinctPositions: orderedPositions,
        counts: {
            direct: byLevel[1] || 0,
            totalTeam: descendants.length,
            totalPatients: descendantPatients.length,
            verifiedPatients,
            pendingPatients,
            deliveredPatients,
            deliveredCurrentMonth,
            deliveredByMonth,
            currentMonthKey,
            monthsList,
            byPosition,
            byLevel
        }
    };
}

module.exports = {
    getSingleOrderDescendantNetwork,
    normalizePosition
};
