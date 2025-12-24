const express = require("express");
const router = express.Router();
const {
    login,
} = require("../controllers/Auth/AuthController");

// ====================== Auth Routes ======================

// Login route - ACTIVE
router.post("/login", login);

// All other routes - COMMENTED OUT
// router.post("/signup", signup);
// router.get("/sponsor/:ref", getSponsorDetails);
// router.post("/recover-password", recoverPassword);
// router.post("/reset-password", resetPassword);

module.exports = router;
