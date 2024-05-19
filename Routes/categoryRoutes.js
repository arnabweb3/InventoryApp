const express = require("express");
const {
  addCategory,
  getCategories,
  addChildCategory,
  addSubCategory,
} = require("../Controllers/categoryController");
const { validateToken } = require("../Middleware/validateTokenhandler");
const { adminMiddleware } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/", validateToken, adminMiddleware, addCategory);
// router.put("/addchildCat", validateToken, adminMiddleware, addChildCategory);
// router.put("/addchildCat", validateToken, adminMiddleware, addChildCategory);
router.put("/addSubCat", validateToken, adminMiddleware, addSubCategory);
router.put("/addchildCat", validateToken, adminMiddleware, addChildCategory);
// router.put("/addchildCat", addChildCategory); //For testing
// router.get("/", validateToken, adminMiddleware, getCategories);
router.get("/", getCategories);

module.exports = router;
