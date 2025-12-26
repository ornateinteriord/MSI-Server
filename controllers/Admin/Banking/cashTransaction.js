const CashTransactionModel = require("../../../models/cashTransaction.model");

/**
 * Get all cash transactions with balance calculations
 */
const getAllCashTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        // Build filter
        const filter = { status: { $ne: 'inactive' } };

        if (search) {
            filter.$or = [
                { cash_transaction_id: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { reference_no: { $regex: search, $options: 'i' } },
                { voucher_no: { $regex: search, $options: 'i' } }
            ];
        }

        // Get all transactions sorted by date
        const allTransactions = await CashTransactionModel.find(filter).sort({ transaction_date: 1, createdAt: 1 });

        // Calculate balances
        let runningBalance = 0;
        let totalDebit = 0;
        let totalCredit = 0;

        const transactionsWithBalance = allTransactions.map((transaction) => {
            const debit = transaction.debit || 0;
            const credit = transaction.credit || 0;

            totalDebit += debit;
            totalCredit += credit;

            // Credit increases balance, debit decreases balance
            runningBalance += credit - debit;

            return {
                ...transaction.toObject(),
                balance: runningBalance
            };
        });

        // Calculate opening and closing balances
        const openingBalance = 0; // Assuming opening balance is 0
        const closingBalance = runningBalance;

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedTransactions = transactionsWithBalance.slice(startIndex, endIndex);

        return res.status(200).json({
            success: true,
            message: "Cash transactions fetched successfully",
            data: paginatedTransactions,
            summary: {
                openingBalance,
                debitAmount: totalDebit,
                creditAmount: totalCredit,
                closingBalance
            },
            pagination: {
                total: transactionsWithBalance.length,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(transactionsWithBalance.length / limit)
            }
        });
    } catch (error) {
        console.error("Error in getAllCashTransactions:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch cash transactions",
            error: error.message
        });
    }
};

/**
 * Get cash transaction by ID
 */
const getCashTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await CashTransactionModel.findOne({
            cash_transaction_id: id,
            status: { $ne: 'inactive' }
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Cash transaction not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cash transaction fetched successfully",
            data: transaction
        });
    } catch (error) {
        console.error("Error in getCashTransactionById:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch cash transaction",
            error: error.message
        });
    }
};

/**
 * Create cash transaction
 */
const createCashTransaction = async (req, res) => {
    try {
        const {
            transaction_date,
            description,
            reference_no,
            credit,
            debit,
            voucher_no,
            branch_id
        } = req.body;

        // Generate cash transaction ID
        const count = await CashTransactionModel.countDocuments();
        const cash_transaction_id = `CASH${String(count + 1).padStart(4, '0')}`;

        const newTransaction = new CashTransactionModel({
            cash_transaction_id,
            transaction_date,
            description,
            reference_no,
            credit,
            debit,
            voucher_no,
            branch_id,
            status: "active"
        });

        await newTransaction.save();

        return res.status(201).json({
            success: true,
            message: "Cash transaction created successfully",
            data: newTransaction
        });
    } catch (error) {
        console.error("Error in createCashTransaction:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create cash transaction",
            error: error.message
        });
    }
};

/**
 * Soft delete cash transaction
 */
const deleteCashTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await CashTransactionModel.findOneAndUpdate(
            { cash_transaction_id: id },
            { $set: { status: "inactive" } },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Cash transaction not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cash transaction deleted successfully",
            data: transaction
        });
    } catch (error) {
        console.error("Error in deleteCashTransaction:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete cash transaction",
            error: error.message
        });
    }
};

module.exports = {
    getAllCashTransactions,
    getCashTransactionById,
    createCashTransaction,
    deleteCashTransaction
};
