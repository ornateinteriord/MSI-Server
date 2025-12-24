const { createMember, getMembers, updateMember, getMemberById } = require("../controllers/Admin/Member/index");
const Authenticated = require("../middlewares/auth");
const authorizeRoles = require("../middlewares/authorizeRole");

const router = require("express").Router();

// manipal society routes
router.post('/create-member', Authenticated, authorizeRoles("ADMIN"), createMember)
router.get('/get-members', Authenticated, getMembers)
router.put('/update-member/:memberId', Authenticated, updateMember)
router.get('/get-member/:memberId', Authenticated, getMemberById)
module.exports = router;
