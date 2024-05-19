const express = require("express");
const router = express.Router();
// Controllers
const {
  addToCart,
  viewCart,
  updateCart,
  removeCartItem,
  clearCart,
} = require("../Controllers/cartController");
// Middleware
const { validateToken } = require("../Middleware/validateTokenhandler");

// ------------------------------------------------------------------------- Routes -------------------------------------------------------------------------

// POST
// Add to cart
router.route("/add").post(validateToken, addToCart);

// GET
// View Cart
router.route("/view").get(validateToken, viewCart);

// PUT
// Update Cart
router.route("/update").put(validateToken, updateCart);

// DELETE
// Remove Cart Item
router.route("/remove/:product_id").delete(validateToken, removeCartItem);

// DELETE
// Clear Cart
router.route("/clear").delete(validateToken, clearCart);

module.exports = router;
