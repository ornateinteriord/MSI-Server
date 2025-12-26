const express = require("express");
const router = express.Router();
const Authenticated = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorizeRole");
const { getMemberById } = require("../controllers/Admin/Member");
const { getMyAccounts, updateMyProfile, getMemberBasicInfo, getMemberAccountsPublic } = require("../controllers/Member");

router.get('/get-member/:memberId', Authenticated, authorizeRoles(["USER"]), getMemberById)

// Member dashboard routes  
router.get('/get-my-accounts', Authenticated, getMyAccounts);

// Update member profile
router.put('/update-profile/:memberId', Authenticated, updateMyProfile);

// Transfer-related routes (for recipient lookup)
router.get('/basic-info/:memberId', Authenticated, getMemberBasicInfo);
router.get('/accounts/:memberId', Authenticated, getMemberAccountsPublic);

module.exports = router;