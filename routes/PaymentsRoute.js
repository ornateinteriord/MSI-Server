const express = require("express");
const router = express.Router();
const {
    createPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment
} = require("../controllers/Admin/Banking/payments");
const Authenticated = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorizeRole");


// Payments endpoints
router.post("/payments", Authenticated, authorizeRoles("ADMIN"), createPayment);
router.get("/payments", Authenticated, authorizeRoles("ADMIN"), getPayments);
router.get("/payments/:paymentId", Authenticated, authorizeRoles("ADMIN"), getPaymentById);
router.put("/payments/:paymentId", Authenticated, authorizeRoles("ADMIN"), updatePayment);
router.delete("/payments/:paymentId", Authenticated, authorizeRoles("ADMIN"), deletePayment);

module.exports = router;
