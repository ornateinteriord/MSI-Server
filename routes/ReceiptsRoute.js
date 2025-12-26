const express = require("express");
const router = express.Router();
const {
    createReceipt,
    getReceipts,
    getReceiptById,
    updateReceipt,
    deleteReceipt
} = require("../controllers/Admin/Banking/receipts");
const Authenticated = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorizeRole");


// Receipts endpoints
router.post("/receipts", Authenticated, authorizeRoles("ADMIN"), createReceipt);
router.get("/receipts", Authenticated, authorizeRoles("ADMIN"), getReceipts);
router.get("/receipts/:receiptId", Authenticated, authorizeRoles("ADMIN"), getReceiptById);
router.put("/receipts/:receiptId", Authenticated, authorizeRoles("ADMIN"), updateReceipt);
router.delete("/receipts/:receiptId", Authenticated, authorizeRoles("ADMIN"), deleteReceipt);

module.exports = router;
