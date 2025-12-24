const mongoose = require("mongoose");

const paymentsSchema = mongoose.Schema(
  {
    payment_id: {
      type: String,
      required: true,
    },
    payment_date: {
      type: Date,
      default: null,
    },
    paid_to: {
      type: String,
      default: null,
    },
    payment_details: {
      type: String,
      default: null,
    },
    mode_of_payment_paid: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      default: "active",
    },
    ref_no: {
      type: String,
      default: null,
    },
    payment_no: {
      type: String,
      default: null,
    },
    entered_by: {
      type: String,
      default: null,
    },
    branch_code: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "payments_tbl" }
);

const PaymentsModel = mongoose.model("payments_tbl", paymentsSchema);
module.exports = PaymentsModel;

