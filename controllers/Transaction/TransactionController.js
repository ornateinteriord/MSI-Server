const TransactionModel = require("../../models/transaction.model");
const Cashfree = require("../../utils/cashfree");
const crypto = require("crypto");
// Unified format for Transaction ID
const generateTransactionId = () => `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Get Transactions for any Member/Agent
exports.getTransactions = async (req, res) => {
    try {
        const { id } = req.params; // member_id or agent_id
        console.log("Fetching transactions for:", id);

        const transactions = await TransactionModel.find({ member_id: id }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: transactions });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Add Transaction (Unified)
exports.addTransaction = async (req, res) => {
    try {
        const {
            member_id,
            amount,
            transaction_type,
            account_number,
            account_type,
            Name,
            mobileno,
            description,
            reference_no
        } = req.body;

        if (!member_id || !amount || !transaction_type) {
            return res.status(400).json({ success: false, message: "Missing required fields: member_id, amount, transaction_type" });
        }

        let credit = 0;
        let debit = 0;

        // Logic mapping based on user request:
        // 'Money Added', 'App Cash Transfer' -> Credit (Deposit)
        // 'Agent Withdraw', 'Member Withdraw', 'Transfer' -> Debit (Expense)

        const creditTypes = ['Money Added', 'App Cash Transfer'];
        const debitTypes = ['Agent Withdraw', 'Member Withdraw', 'Transfer'];

        if (creditTypes.includes(transaction_type)) {
            credit = Number(amount);
        } else if (debitTypes.includes(transaction_type)) {
            debit = Number(amount);
        } else {
            return res.status(400).json({ success: false, message: "Invalid Transaction Type" });
        }

        // Calculate Balance
        const lastTx = await TransactionModel.findOne({ member_id }).sort({ createdAt: -1 });
        const lastBalance = lastTx ? lastTx.balance : 0;

        if (debit > 0 && lastBalance < debit) {
            return res.status(400).json({ success: false, message: "Insufficient Balance" });
        }

        const newBalance = lastBalance + credit - debit;

        const newTx = new TransactionModel({
            transaction_id: generateTransactionId(),
            transaction_date: new Date(),
            member_id,
            transaction_type,
            account_number,
            account_type,
            Name,
            mobileno,
            description: description || transaction_type,
            credit,
            debit,
            balance: newBalance,
            ew_debit: debit > 0 ? String(debit) : "0",
            status: "Pending",
            reference_no
        });

        await newTx.save();
        return res.status(201).json({ success: true, message: "Transaction Successful", data: newTx });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get All
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await TransactionModel.find({}).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// Cashfree Payment Integration
// ==========================================


// 1. Create Payment Order
exports.createPaymentOrder = async (req, res) => {
    try {
        const { member_id, amount, mobileno, Name, email } = req.body;

        if (!member_id || !amount || !mobileno || !Name) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const orderId = `ORDER_${Date.now()}`;

        // Prepare Request
        const request = {
            order_amount: Number(amount),
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: member_id,
                customer_phone: mobileno,
                customer_name: Name,
                customer_email: email || "customer@example.com"
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL}?order_id=${orderId}`
            }
        };

        const response = await Cashfree.PGCreateOrder(request);
        const paymentSessionId = response.data.payment_session_id;

        // Create Pending Transaction in DB
        const newTx = new TransactionModel({
            transaction_id: orderId, // Use Order ID as Transaction ID for mapping
            transaction_date: new Date(),
            member_id,
            transaction_type: "Money Added",
            description: "Online Wallet Top-up (Pending)",
            credit: Number(amount),
            debit: 0,
            balance: 0, // Will update on success
            status: "Pending",
            payment_gateway: "Cashfree",
            gateway_order_id: response.data.order_id,
            payment_session_id: paymentSessionId,
            payment_status: "Pending",
            Name,
            mobileno
        });

        await newTx.save();

        return res.status(200).json({
            success: true,
            payment_session_id: paymentSessionId,
            order_id: orderId
        });

    } catch (error) {
        console.error("Cashfree Order Error:", error.response?.data?.message || error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message
        });
    }
};

// 2. Webhook Handler
exports.handleCashfreeWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-webhook-signature"];
        const timestamp = req.headers["x-webhook-timestamp"];
        const rawBody = req.rawBody; // Required from index.js config

        // Verify Signature
        const generatedSignature = crypto.createHmac('sha256', process.env.CASHFREE_WEBHOOK_SECRET)
            .update(timestamp + rawBody)
            .digest('base64');

        if (signature !== generatedSignature) {
            return res.status(403).json({ message: "Invalid Signature" });
        }

        const event = req.body;
        // Check event type: PAYMENT_SUCCESS or PAYMENT_FAILED

        if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
            const orderId = event.data.order.order_id;

            const transaction = await TransactionModel.findOne({ transaction_id: orderId });
            if (!transaction) return res.status(404).json({ message: "Transaction not found" });

            if (transaction.status === "Completed") return res.status(200).json({ message: "Already Processed" });

            // Update Transaction
            transaction.payment_status = "Success";
            transaction.status = "Completed";
            transaction.description = "Online Wallet Top-up (Success)";
            transaction.payment_data = event.data;

            // Update Balance
            const lastTx = await TransactionModel.findOne({ member_id: transaction.member_id, status: "Completed" }).sort({ createdAt: -1 });
            const lastBalance = lastTx ? lastTx.balance : 0;
            transaction.balance = lastBalance + transaction.credit;

            await transaction.save(); // Save Transaction first

            // Optional: Update Member Wallet Balance in Member Table if exists
        } else if (event.type === "PAYMENT_FAILED_WEBHOOK" || event.type === "PAYMENT_USER_DROPPED_WEBHOOK") {
            const orderId = event.data.order.order_id;
            await TransactionModel.findOneAndUpdate(
                { transaction_id: orderId },
                {
                    status: "Failed",
                    payment_status: "Failed",
                    description: `Online Top-up Failed: ${event.data.payment.payment_message || 'User Dropped'}`
                }
            );
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error("Webhook Error", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 3. Status Check (Polling)
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);

        // Logic to sync DB if needed
        const payments = response.data;
        const successPayment = payments.find(p => p.payment_status === "SUCCESS");

        if (successPayment) {
            // Logic similar to webhook to mark success if not already done
            // Skipping for brevity, assuming webhook handles it mostly. 
            // But good to have a sync function here.

            const transaction = await TransactionModel.findOne({ transaction_id: orderId });
            if (transaction && transaction.status !== "Completed") {
                // Mark as completed
                transaction.payment_status = "Success";
                transaction.status = "Completed";

                const lastTx = await TransactionModel.findOne({ member_id: transaction.member_id, status: "Completed" }).sort({ createdAt: -1 });
                const lastBalance = lastTx ? lastTx.balance : 0;
                transaction.balance = lastBalance + transaction.credit;
                await transaction.save();
            }
            return res.status(200).json({ success: true, status: "SUCCESS" });
        }

        return res.status(200).json({ success: true, status: "PENDING/FAILED" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
