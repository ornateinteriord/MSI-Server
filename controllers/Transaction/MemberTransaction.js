const MemberTransactionModel = require("../../models/memberTransaction.model");
const MemberModel = require("../../models/member.model");

// Get Transactions for a Member
exports.getMemberTransactions = async (req, res) => {
    try {
        const { memberId } = req.params;
        const transactions = await MemberTransactionModel.findOne({ member_id: memberId }).sort({ createdAt: -1 });
        // Retrieve all? User asked for "Transaction History Table".
        // Let's fetch all.
        const allTransactions = await MemberTransactionModel.find({ member_id: memberId }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: allTransactions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Add Transaction (Deposit/Withdraw)
exports.addMemberTransaction = async (req, res) => {
    try {
        const { member_id, amount, type, description, remark } = req.body;
        // type: 'credit' or 'debit'

        if (!member_id || !amount || !type) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // 1. Fetch Last Balance
        const lastTx = await MemberTransactionModel.findOne({ member_id }).sort({ createdAt: -1 });
        const lastBalance = lastTx ? lastTx.balance : 0;

        let credit = 0;
        let debit = 0;
        let newBalance = lastBalance;

        if (type === 'credit') {
            credit = Number(amount);
            newBalance += credit;
        } else if (type === 'debit') {
            debit = Number(amount);
            if (lastBalance < debit) {
                return res.status(400).json({ success: false, message: "Insufficient Balance" });
            }
            newBalance -= debit;
        } else {
            return res.status(400).json({ success: false, message: "Invalid transaction type" });
        }

        const newTx = new MemberTransactionModel({
            member_transaction_id: `TXN-${Date.now()}`,
            member_id,
            transaction_date: new Date(),
            description: description || `Transaction ${type}`,
            credit,
            debit,
            balance: newBalance,
            status: "Completed",
            remarks: remark
        });

        await newTx.save();

        return res.status(201).json({ success: true, message: "Transaction Start Successful", data: newTx });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
