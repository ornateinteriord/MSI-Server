const AgentTransactionModel = require("../../models/agentTransaction.model");

// Get Agent Transactions
exports.getAgentTransactions = async (req, res) => {
    try {
        const { agentId } = req.params;
        console.log("Fetching transactions for Agent (reference_no):", agentId);

        // Use reference_no instead of agent_id as per existing DB schema/data
        const transactions = await AgentTransactionModel.find({ agent_transaction_id: agentId }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.addAgentTransaction = async (req, res) => {
    try {
        const { agent_id, amount, type, description } = req.body;

        // Find last balance using reference_no
        const lastTx = await AgentTransactionModel.findOne({ agent_transaction_id: agent_id }).sort({ createdAt: -1 });
        const lastBalance = lastTx ? (lastTx.balance || 0) : 0; // Handle missing balance in legacy data

        // Calculate new balance
        let credit = 0;
        let debit = 0;
        let newBalance = lastBalance;

        if (type === 'credit') {
            credit = amount;
            newBalance += credit;
        } else {
            debit = amount;
            if (lastBalance < debit) return res.status(400).json({ message: "Insufficient Balance" });
            newBalance -= debit;
        }

        const newTx = new AgentTransactionModel({
            agent_transaction_id: agent_id,
            reference_no: `ATX-${Date.now()}`,
            transaction_date: new Date(),
            description,
            credit,
            debit,
            balance: newBalance,
            status: "Completed",
            // branch_id? Assuming optional or not passed from FE for now
        });

        await newTx.save();
        res.status(201).json({ success: true, data: newTx });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
