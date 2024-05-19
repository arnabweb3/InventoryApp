const express = require("express");
const router = express.Router();
const { validateToken } = require("../Middleware/validateTokenhandler");
const { sellerMiddleware } = require("../Middleware/authMiddleware");
const {
  generateCoupon,
  createCoupon,
  getAllCoupon,
  getSingleCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} = require("../Controllers/couponController");

// ------------------------------------------------------------------

// GET
// Generate Coupon
router.route("/generate").get(validateToken, generateCoupon);

// POST
// New Coupon Code
router.route("/coupons").post(validateToken, createCoupon);

// GET
// All Coupon Code
router.route("/coupons").get(validateToken, getAllCoupon);

// GET
// One Coupon Code
router.route("/coupons/:id").get(validateToken, getSingleCoupon);

// PUT
// Edit Coupon Code
router.route("/coupons/:id").put(validateToken, updateCoupon);

// DELETE
// Delete Coupon Code
router.route("/coupons/:id").delete(validateToken, deleteCoupon);

// POST
// Apply Coupon Code
router.route("/apply").post(validateToken, applyCoupon);

module.exports = router;
