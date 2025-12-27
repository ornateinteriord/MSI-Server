const TransactionModel = require("../models/transaction.model");

/**
 * Generate a unique transaction ID
 * Format: TXN000001, TXN000002, etc.
 */
const generateTransactionId = async () => {
    const lastTransaction = await TransactionModel.findOne()
        .sort({ createdAt: -1 })
        .limit(1);

    let newTransactionId = "TXN000001";
    if (lastTransaction && lastTransaction.transaction_id) {
        // Extract numeric part from formats like "TXN000001" or "TXN-timestamp"
        const match = lastTransaction.transaction_id.match(/TXN(\d+)/);
        if (match) {
            const lastId = parseInt(match[1]);
            if (!isNaN(lastId)) {
                const nextId = lastId + 1;
                newTransactionId = `TXN${nextId.toString().padStart(6, '0')}`;
            }
        }
    }

    return newTransactionId;
};

module.exports = generateTransactionId;
