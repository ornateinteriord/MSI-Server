const mongoose = require("mongoose");

const adminTransactionSchema = mongoose.Schema(
    {
        transaction_id: {
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
        type: {
            type: String, // 'Income', 'Expense'
            default: null
        },
        credit: {
            type: Number,
            default: 0,
        },
        debit: {
            type: Number,
            default: 0,
        },
        balance: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            default: "Completed",
        },
        reference_id: {
            type: String, // Could be agent_id or member_id if related
            default: null
        },
        remarks: {
            type: String,
            default: null
        }
    },
    { timestamps: true, collection: "transaction_tbl" }
);

const AdminTransactionModel = mongoose.model("transaction_tbl", adminTransactionSchema);
module.exports = AdminTransactionModel;
