const mongoose = require("mongoose");

const agentTransactionSchema = new mongoose.Schema(
  {
    agent_transaction_id: {
      type: String,
      required: true,
      trim: true,
    },

    transaction_date: {
      type: Date,
      required: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // 🔑 IMPORTANT: keep as STRING
    reference_no: {
      type: String,
      required: true,
      index: true,
    },

    voucher_no: {
      type: String,
      trim: true,
      default: "",
    },

    credit: {
      type: Number,
      default: 0,
      min: 0,
    },

    debit: {
      type: Number,
      default: 0,
      min: 0,
    },

    balance: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "Completed", "Pending"],
      default: "active",
    },

    branch_id: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "agent_transaction_tbl",
  }
);

module.exports = mongoose.model("AgentTransaction", agentTransactionSchema);
