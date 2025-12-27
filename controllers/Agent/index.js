const AccountsModel = require("../../models/accounts.model");
const MemberModel = require("../../models/member.model");
const TransactionModel = require("../../models/transaction.model");
const generateTransactionId = require("../../utils/generateTransactionId");

// Get all accounts assigned to a specific agent with member details
const getAssignedAccounts = async (req, res) => {
    try {
        const { agentId } = req.params;

        if (!agentId) {
            return res.status(400).json({
                success: false,
                message: "Agent ID is required"
            });
        }

        // Find all accounts assigned to this agent
        const accounts = await AccountsModel.find({
            assigned_to: agentId
        }).sort({ date_of_opening: -1 });

        // Fetch member details for each account
        const accountsWithMemberDetails = await Promise.all(
            accounts.map(async (account) => {
                const member = await MemberModel.findOne({
                    member_id: account.member_id
                });

                return {
                    date_of_opening: account.date_of_opening,
                    account_no: account.account_no,
                    account_holder: member ? member.name : "N/A",
                    date_of_maturity: account.date_of_maturity,
                    balance: account.account_amount,
                    status: account.status,
                    // Include additional fields that might be useful
                    account_id: account.account_id,
                    member_id: account.member_id,
                    account_type: account.account_type,
                    account_operation: account.account_operation
                };
            })
        );

        res.status(200).json({
            success: true,
            message: "Assigned accounts fetched successfully",
            data: accountsWithMemberDetails
        });
    } catch (error) {
        console.error("Error fetching assigned accounts:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch assigned accounts",
            error: error.message
        });
    }
};

// Collect payment for an assigned account
const collectPayment = async (req, res) => {
    try {
        const { accountId, amount } = req.body;
        const agentId = req.params.agentId; // Get agent ID from authenticated user

        // Validate input
        if (!accountId || !amount) {
            return res.status(400).json({
                success: false,
                message: "Account ID and amount are required"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than zero"
            });
        }

        // Find the account
        const account = await AccountsModel.findOne({ account_id: accountId });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        // Verify the account is assigned to this agent
        if (account.assigned_to !== agentId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to collect payments for this account"
            });
        }

        // Check if account is active
        if (account.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: "Cannot collect payment for inactive account"
            });
        }

        // Get member details for transaction
        const member = await MemberModel.findOne({ member_id: account.member_id });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        // Generate transaction ID
        const newTransactionId = await generateTransactionId();

        // Update account balance
        account.account_amount += parseFloat(amount);
        await account.save();

        // Create transaction record
        const transaction = await TransactionModel.create({
            transaction_id: newTransactionId,
            transaction_date: new Date(),
            member_id: account.member_id,
            account_number: account.account_no,
            account_type: account.account_type,
            transaction_type: "Collection",
            description: "Collected by agent",
            credit: parseFloat(amount),
            balance: account.account_amount,
            Name: member.name,
            mobileno: member.contactno,
            status: "Completed",
            collected_by: agentId
        });

        res.status(200).json({
            success: true,
            message: "Payment collected successfully",
            data: {
                transaction_id: transaction.transaction_id,
                account_no: account.account_no,
                account_holder: member.name,
                collected_amount: amount,
                new_balance: account.account_amount,
                collection_date: transaction.transaction_date
            }
        });

    } catch (error) {
        console.error("Error collecting payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to collect payment",
            error: error.message
        });
    }
};

module.exports = {
    getAssignedAccounts,
    collectPayment
};
