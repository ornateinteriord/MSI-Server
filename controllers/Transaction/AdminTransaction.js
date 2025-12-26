const AdminTransactionModel = require("../../models/adminTransaction.model");

exports.getAdminTransactions = async (req, res) => {
    try {
        const transactions = await AdminTransactionModel.find({}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addAdminTransaction = async (req, res) => {
    try {
        const { amount, type, description, reference_id } = req.body;

        const lastTx = await AdminTransactionModel.findOne({}).sort({ createdAt: -1 });
        const lastBalance = lastTx ? lastTx.balance : 0;

        let credit = 0;
        let debit = 0;
        let newBalance = lastBalance;

        if (type === 'credit') { // Income
            credit = Number(amount);
            newBalance += credit;
        } else { // Expense
            debit = Number(amount);
            newBalance -= debit; // Admin can go negative? Usually yes for tracking.
        }

        const newTx = new AdminTransactionModel({
            transaction_id: `ADTX-${Date.now()}`,
            transaction_date: new Date(),
            description,
            type: type === 'credit' ? 'Income' : 'Expense',
            credit,
            debit,
            balance: newBalance,
            reference_id,
            status: "Completed"
        });

        await newTx.save();
        res.status(201).json({ success: true, data: newTx });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
