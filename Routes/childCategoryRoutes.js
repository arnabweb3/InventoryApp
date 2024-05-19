const express = require("express");
const { validateToken } = require("../Middleware/validateTokenhandler");
const { adminMiddleware } = require("../Middleware/authMiddleware");
const { addChildCategory } = require("../Controllers/childCategoryController");

const router = express.Router();

// router.post("/", validateToken, adminMiddleware, addChildCategory);
router.post("/", addChildCategory);

module.exports = router;
