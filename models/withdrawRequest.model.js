const mongoose = require("mongoose");

const withdrawRequestSchema = mongoose.Schema(
    {
        withdraw_request_id: {
            type: String,
            required: true,
            unique: true,
        },
        member_id: {
            type: String,
            required: true,
            index: true,
        },
        account_id: {
            type: String,
            required: true,
        },
        account_no: {
            type: String,
            required: true,
        },
        account_type: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        bank_account_number: {
            type: String,
            required: true,
        },
        ifsc_code: {
            type: String,
            required: true,
        },
        account_holder_name: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Completed"],
            default: "Pending",
        },
        requested_date: {
            type: Date,
            default: Date.now,
        },
        processed_date: {
            type: Date,
            default: null,
        },
        processed_by: {
            type: String,
            default: null,
        },
        rejection_reason: {
            type: String,
            default: null,
        },
        transaction_id: {
            type: String,
            default: null,
        },
    },
    { timestamps: true, collection: "withdrawRequest_tbl" }
);

const WithdrawRequestModel = mongoose.model("WithdrawRequest", withdrawRequestSchema);
module.exports = WithdrawRequestModel;
