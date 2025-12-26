const express = require("express");
const router = express.Router();
const { getAgentById } = require("../controllers/Admin/Agent");
const Authenticated = require("../middlewares/auth");


router.get('/get-agent/:agentId', getAgentById)

module.exports = router;