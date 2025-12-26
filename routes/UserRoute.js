const express = require("express");
const router = express.Router();
const { getMemberTransactions, addMemberTransaction } = require("../controllers/Transaction/MemberTransaction");
// const Authenticated = require("../middlewares/auth"); // Uncomment when needed

// Transaction Routes
router.post('/transaction/add', addMemberTransaction);
router.get('/transaction/:memberId', getMemberTransactions);

module.exports = router;
