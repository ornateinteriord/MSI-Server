const express = require("express");
const router = express.Router();
const Authenticated = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorizeRole");
const { getMemberById } = require("../controllers/Admin/Member");


router.get('/get-member/:memberId', Authenticated, authorizeRoles(["USER"]), getMemberById)

module.exports = router;