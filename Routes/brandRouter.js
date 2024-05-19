const express = require("express");
const { validateToken } = require("../Middleware/validateTokenhandler");
const { adminMiddleware } = require("../Middleware/authMiddleware");
const {
  createBrand,
  getAllBrands,
  getBrandByName,
  updateBrand,
  deleteBrand,
} = require("../Controllers/brandController");
const { uploadPicture } = require("../utils/awsFunction");

const router = express.Router();

router.post(
  "/",
  validateToken,
  adminMiddleware,
  uploadPicture.single("logo"),
  createBrand
);
router.get("/", getAllBrands);
router.get("/:name", getBrandByName);
router.put(
  "/update/:brandId",
  validateToken,
  adminMiddleware,
  uploadPicture.single("logo"),
  updateBrand
);
router.delete("/delete/:brandId", validateToken, adminMiddleware, deleteBrand);

module.exports = router;
