const express = require("express");
const {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductsByCategory,
  getProductsByBrand,
  addRating,
  getAllProducts,
} = require("../Controllers/productController");
const { validateToken } = require("../Middleware/validateTokenhandler");
const { sellerMiddleware } = require("../Middleware/authMiddleware");
const { uploadPicture } = require("../utils/awsFunction");

const router = express.Router();

router.post(
  "/",
  validateToken,
  sellerMiddleware,
  uploadPicture.single("productPicture"),
  addProduct
);
router.get("/", validateToken, sellerMiddleware, getProducts); //For seller
router.get("/allProducts", getAllProducts); //For Users
router.get("/getProductsByBrand", getProductsByBrand);
router.put(
  "/update/:id",
  validateToken,
  sellerMiddleware,
  uploadPicture.single("productPicture"),
  updateProduct
);
router.delete("/:id", validateToken, sellerMiddleware, deleteProduct);
router.get("/:id", validateToken, sellerMiddleware, getProductById);
router.get("/get/:categoryId", getProductsByCategory);
router.put("/rating", validateToken, addRating);

module.exports = router;
