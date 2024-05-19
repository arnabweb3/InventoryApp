const express = require("express");
const {
  addAdmin,
  adminLogin,
  adminLogout,
} = require("../Controllers/adminController");

const router = express.Router();

router.post("/", addAdmin);
router.post("/login", adminLogin);
router.get("/logout", adminLogout);

module.exports = router;
