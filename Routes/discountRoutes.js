const express = require("express");
const router = express.Router();
const { validateToken } = require("../Middleware/validateTokenhandler");
const { sellerMiddleware } = require("../Middleware/authMiddleware");
const {
  assignDiscount,
  discountedProduct,
  editDiscountedProduct,
  deleteDiscountedProduct,
} = require("../Controllers/discountController");

// ------------------------------------------------------------------

// POST
// Assign Discount
router.route("/assign").post(validateToken, sellerMiddleware, assignDiscount);

// GET
// Discount Products
router
  .route("/products")
  .get(validateToken, sellerMiddleware, discountedProduct);

// PUT
// Discount Products
router
  .route("/products/edit/:product_id")
  .put(validateToken, sellerMiddleware, editDiscountedProduct);

// DELETE
// Discount Products Delete
router
  .route("/products/delete")
  .delete(validateToken, sellerMiddleware, deleteDiscountedProduct);

module.exports = router;
