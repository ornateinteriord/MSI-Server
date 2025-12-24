const mongoose = require("mongoose");

const adminSchema = mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      default: null,
    },
    reference_id: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "pending",
    },
    branch_code: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, collection: "admin_tbl" }
);

const AdminModel = mongoose.model("admin_tbl", adminSchema);
module.exports = AdminModel;

