const express = require("express");
const router = express.Router();
const { getAgentById } = require("../controllers/Admin/Agent");
const Authenticated = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorizeRole");

const { getAgentTransactions, addAgentTransaction } = require("../controllers/Transaction/AgentTransaction");

router.get('/get-agent/:agentId', Authenticated, authorizeRoles(["AGENT"]), getAgentById)

// Transaction Routes
router.post('/transaction/add', addAgentTransaction);
router.get('/transaction/:agentId', getAgentTransactions);

module.exports = router;