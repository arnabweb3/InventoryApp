const express = require("express");
const { validateToken } = require("../Middleware/validateTokenhandler");
const { adminMiddleware } = require("../Middleware/authMiddleware");
const { addSubCategory } = require("../Controllers/subCategoryController");
const router = express.Router();

router.post("/", validateToken, adminMiddleware, addSubCategory);

module.exports = router;
