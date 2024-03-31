const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const userControllers = require("../controllers/User-Controllers");

router.post(
  "/invite/user",
  [
    check("name").isLength({ min: 2, max: 255 }),
    check("email").isEmail(),
    check("phoneNumber").isMobilePhone(),
    check("alternateEmail").optional().isEmail(),
    check("orgName").optional().isLength({ min: 1, max: 255 }),
    check("orgRole").optional().isLength({ min: 1, max: 255 }),
    check("validTill").optional().isISO8601(),
  ],
  userControllers.inviteUser
);

// Sign Up route
router.post(
  "/signUp",
  [
    check("uniqueId").isLength({ min: 8, max: 8 }),
    check("password").isLength({ min: 8 }),
  ],
  userControllers.signUp
);

// Login route
router.post("/login", userControllers.login);

// Logout route
router.post("/logout", userControllers.logout);

// Edit User route
router.patch(
  "/edit/user",
  [
    check("name").isLength({ min: 2, max: 255 }),
    check("email").isEmail(),
    check("phoneNumber").isMobilePhone(),
    check("alternateEmail").optional().isEmail(),
    check("orgName").optional().isLength({ min: 1, max: 255 }),
    check("orgRole").optional().isLength({ min: 1, max: 255 }),
    check("validTill").optional().isISO8601(),
    check("uniqueId").isLength({ min: 8, max: 8 }),
  ],
  userControllers.editUser
);

module.exports = router;
