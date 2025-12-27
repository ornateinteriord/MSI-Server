const express = require("express");
const router = express.Router();
const { getAgentById } = require("../controllers/Admin/Agent");
const { createAccount } = require("../controllers/Admin/Account");
const { getAssignedAccounts, collectPayment } = require("../controllers/Agent");
const Authenticated = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorizeRole");


router.get('/get-agent/:agentId', Authenticated, authorizeRoles(["AGENT"]), getAgentById)
router.post('/create-account', Authenticated, authorizeRoles(["AGENT"]), createAccount)
router.get('/get-assigned-accounts/:agentId', Authenticated, authorizeRoles(["AGENT"]), getAssignedAccounts)
router.post('/collect-payment/:agentId', Authenticated, authorizeRoles(["AGENT"]), collectPayment)

module.exports = router;