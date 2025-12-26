const express = require("express");
const router = express.Router();
const { getTransactions, addTransaction, getAllTransactions, createPaymentOrder, handleCashfreeWebhook, checkPaymentStatus } = require("../controllers/Transaction/TransactionController");
const Authenticated = require("../middlewares/auth");

// Unified Transaction Routes
router.post('/add', addTransaction); // /transaction/add
router.get('/member/:id', getTransactions); // /transaction/member/:id
router.get('/all', getAllTransactions); // /transaction/all (Admin)

// Cashfree Routes
router.post('/create-order', createPaymentOrder);
router.post('/webhook/cashfree', handleCashfreeWebhook);
router.get('/status/:orderId', checkPaymentStatus);

module.exports = router;
