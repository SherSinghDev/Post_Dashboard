const Users = require('../modals/users');
const PatientForm = require('../modals/patientForm');
const StockTransaction = require('../modals/stockTransactions');

/**
 * Calculates inactivity details for a stockorder user based on two activity factors:
 * 1) Referring a patient form (PatientForm where referredBy is user.userId or user.referralCode)
 * 2) Creating a stock transaction (StockTransaction where senderId/receiverId match user.userId or user._id)
 *
 * Notice rule:
 * How long since they did either of those things. If they did not do anything from both,
 * then inactivity days increase. If inactive >= 60 days, user becomes suspended.
 */
async function getUserInactivityDetails(user) {
    if (!user) return null;

    const userObjId = user._id ? user._id.toString() : '';
    const userId = user.userId ? String(user.userId).trim() : '';
    const referralCode = user.referralCode ? String(user.referralCode).trim() : '';

    // Candidate identifiers for referredBy in patient form
    const patientRefConditions = [];
    if (userId) patientRefConditions.push({ referredBy: userId });
    if (referralCode) patientRefConditions.push({ referredBy: referralCode });
    if (userObjId) patientRefConditions.push({ referredBy: userObjId });

    let latestPatientDate = null;
    if (patientRefConditions.length > 0) {
        const lastPatient = await PatientForm.findOne({
            $or: patientRefConditions
        }).sort({ createdAt: -1 }).select('createdAt');

        if (lastPatient && lastPatient.createdAt) {
            latestPatientDate = new Date(lastPatient.createdAt);
        }
    }

    // Candidate identifiers for stock transactions
    const stockTxConditions = [];
    if (userId) {
        stockTxConditions.push({ senderId: userId });
        stockTxConditions.push({ receiverId: userId });
    }
    if (userObjId) {
        stockTxConditions.push({ senderId: userObjId });
        stockTxConditions.push({ receiverId: userObjId });
    }

    let latestStockTxDate = null;
    if (stockTxConditions.length > 0) {
        const lastTx = await StockTransaction.findOne({
            $or: stockTxConditions
        }).sort({ createdAt: -1 }).select('createdAt');

        if (lastTx && lastTx.createdAt) {
            latestStockTxDate = new Date(lastTx.createdAt);
        }
    }

    // Fallback baseline when no patient or stock transaction has ever been performed:
    // User creation date (or lastLogin/current Date)
    const baseDate = user.createdAt ? new Date(user.createdAt) : (user.lastLogin ? new Date(user.lastLogin) : new Date());

    // Most recent activity across both factors
    const activityDates = [];
    if (latestPatientDate) activityDates.push(latestPatientDate);
    if (latestStockTxDate) activityDates.push(latestStockTxDate);

    let lastActivityDate;
    if (activityDates.length > 0) {
        lastActivityDate = new Date(Math.max(...activityDates.map(d => d.getTime())));
    } else {
        lastActivityDate = baseDate;
    }

    const now = Date.now();
    const diffMs = Math.max(0, now - lastActivityDate.getTime());
    const inactiveDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, 60 - inactiveDays);
    const isSuspensionDue = inactiveDays >= 60;

    return {
        inactiveDays,
        remainingDays,
        isSuspensionDue,
        isSuspended: Boolean(user.isSuspended || isSuspensionDue),
        lastActivityDate,
        latestPatientDate,
        latestStockTxDate,
        accountCreatedAt: baseDate
    };
}

/**
 * Checks and auto-suspends a stockorder user if they exceed 60 inactive days.
 */
async function checkAndApplyUserSuspension(user) {
    if (!user || user.type !== 'stockorder') return user;

    const details = await getUserInactivityDetails(user);
    if (details && details.isSuspensionDue && !user.isSuspended) {
        user.isSuspended = true;
        await Users.updateOne({ _id: user._id }, { $set: { isSuspended: true } });
    }
    return user;
}

module.exports = {
    getUserInactivityDetails,
    checkAndApplyUserSuspension
};
