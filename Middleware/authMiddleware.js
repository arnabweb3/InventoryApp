const asyncHandler = require("express-async-handler");
const Seller = require("../Models/sellerModel");
const Admin = require("../Models/adminModel");

//Seller Middleware
const sellerMiddleware = asyncHandler(async (req, res, next) => {
  const sellerId = await Seller.findById({ _id: req.user });
  if (!sellerId) {
    res.status(401);
    throw new Error("Unauthorized Access");
  }
  next();
});

//Admin Middleware
const adminMiddleware = asyncHandler(async (req, res, next) => {
  const adminId = await Admin.findById({ _id: req.user });
  if (!adminId) {
    res.status(401);
    throw new Error("Unauthorized Access");
  }
  next();
});

module.exports = {
  sellerMiddleware,
  adminMiddleware,
};
