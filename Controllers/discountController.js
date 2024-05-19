// Packages
const asyncHandler = require("express-async-handler");
// Models
const productModel = require("../Models/productModel");
const discountModel = require("../Models/discountModel");

// ------------------------------------------------------------------

// Add
// Assign Discount
exports.assignDiscount = asyncHandler(async (req, res) => {
  const sellerId = req.user;
  const { products, discount } = req.body;
  if (!products || !discount) {
    res.status(400);
    throw new Error("Please select product and discount properly");
  }

  try {
    // Mapping for all the products that have been selected to be a part of the discounted product list.
    const process = products.map(async (prod_id) => {
      // Checking if the product is for logged in seller
      const seller_product = await productModel.findOne({
        $and: [{ _id: prod_id }, { sellerId: sellerId }],
      });
      if (!seller_product) {
        res.status(404);
        throw new Error("No product found");
      }
      // Checking if discount is already assigned for the product
      const discountExists = await discountModel.findOne({
        $and: [{ product: prod_id }, { seller: sellerId }],
      });
      if (discountExists) {
        res.status(400);
        throw new Error("Discount exists for this product");
        // discountExists.discount == discount;
        // await discountExists.save();
      }

      // Those product that doesnot have discount will be assigned with a discount
      const assignDiscount = await discountModel.create({
        product: prod_id,
        seller: seller_product.sellerId,
        discount: discount,
      });

      return assignDiscount;
    });

    const result = await Promise.all(process);
    res.status(201).json({
      message: `${discount}% discount assigned to selected products successfully`,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

// Get
// Discounted Products
exports.discountedProduct = asyncHandler(async (req, res) => {
  const sellerId = req.user;
  // Retrieving the products that the seller has put on discount
  const seller_discounted_product = await discountModel
    .find({
      seller: sellerId,
    })
    .populate("product", "name")
    .populate("seller", "contactInformation.name")
    .lean();
  if (seller_discounted_product.length == 0) {
    res.status(404);
    throw new Error("No product found with discount");
  }

  const products = seller_discounted_product;

  res.status(200).json({ products });
});

// Edit
// Discounted Products
exports.editDiscountedProduct = asyncHandler(async (req, res) => {
  const sellerId = req.user;
  const { product_id } = req.params;
  // Retrieving the products that the seller has put on discount
  const seller_discounted_product = await discountModel.findOne({
    $and: [{ product: product_id }, { seller: sellerId }],
  });
  if (!seller_discounted_product) {
    res.status(404);
    throw new Error("No product found with discount");
  }

  const id = seller_discounted_product._id;

  try {
    const updatedProduct = await discountModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res
      .status(200)
      .json({ message: "Product Edited Successfully", updatedProduct });
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

// Delete
// Discounted Products
exports.deleteDiscountedProduct = asyncHandler(async (req, res) => {
  const sellerId = req.user;
  const { products } = req.body;

  try {
    const process = products.map(async (prod) => {
      const sellerProduct = await discountModel.findOne({
        $and: [{ product: prod }, { seller: sellerId }],
      });
      if (!sellerProduct) {
        res.status(500);
        throw new Error("No product found");
      }
      const id = sellerProduct._id;

      await discountModel.findByIdAndDelete(id);

      return;
    });

    const result = await Promise.all(process);

    res
      .status(200)
      .json({ message: "Discounted Product Deleted Successfully" });
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});
