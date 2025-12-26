const express = require("express");
const router = express.Router();
const Authenticated = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorizeRole");
const { getMemberById } = require("../controllers/Admin/Member");
const { getMyAccounts, updateMyProfile } = require("../controllers/Member");

router.get('/get-member/:memberId', Authenticated, authorizeRoles(["USER"]), getMemberById)

// Member dashboard routes  
router.get('/get-my-accounts', Authenticated, getMyAccounts);

// Update member profile
router.put('/update-profile/:memberId', Authenticated, updateMyProfile);

module.exports = router;