const express = require("express");
const router = express.Router();
const { getTransactions, addTransaction, getAllTransactions } = require("../controllers/Transaction/TransactionController");
const Authenticated = require("../middlewares/auth");

// Unified Transaction Routes
router.post('/add', addTransaction); // /transaction/add
router.get('/member/:id', getTransactions); // /transaction/member/:id
router.get('/all', getAllTransactions); // /transaction/all (Admin)

module.exports = router;
