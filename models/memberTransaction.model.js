const mongoose = require("mongoose");

const memberTransactionSchema = mongoose.Schema(
    {
        member_transaction_id: {
            type: String,
            required: true,
        },
        member_id: {
            type: String,
            required: true,
        },
        transaction_date: {
            type: Date,
            default: Date.now,
        },
        description: {
            type: String,
            default: null,
        },
        reference_no: {
            type: String,
            default: null,
        },
        credit: {
            type: Number, // Deposit
            default: 0,
        },
        debit: {
            type: Number, // Withdrawal
            default: 0,
        },
        balance: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            default: "Pending", // Pending, Completed, Failed
        },
        payment_mode: {
            type: String,
            default: "Cash"
        },
        branch_id: {
            type: String,
            default: null,
        },
    },
    { timestamps: true, collection: "member_transaction_tbl" }
);

const MemberTransactionModel = mongoose.model("member_transaction_tbl", memberTransactionSchema);
module.exports = MemberTransactionModel;
