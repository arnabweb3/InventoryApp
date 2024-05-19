// External Modules
const asyncHandler = require("express-async-handler");
// Model
const userModel = require("../Models/userModel");
const productModel = require("../Models/productModel");
const cartModel = require("../Models/cartModel");

// ------------------------------------------------------------------------- Controller -------------------------------------------------------------------------

// POST
// Add to cart
exports.addToCart = asyncHandler(async (req, res) => {
  const userId = req.user;
  const { product_id, quantity } = req.body;
  if (!product_id) {
    res.status(400);
    throw new Error("Please select product properly");
  }
  if (!quantity) {
    res.status(400);
    throw new Error("Please select the quantity");
  }
  const user = await userModel.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("No user found");
  }
  const product = await productModel.findById(product_id);
  if (!product) {
    res.status(404);
    throw new Error("No product found");
  }
  const cart = await cartModel.findOne({ user: userId });

  try {
    if (cart) {
      const productIndex = cart.product.findIndex(
        (prod) => prod.product == product_id
      );

      if (productIndex > -1) {
        let product = cart.product[productIndex];
        product.quantity += parseInt(quantity);

        cart.product[productIndex] = product;
        product.subTotal = parseFloat(
          product.MRP * product.quantity + product.shippingCharge
        ).toFixed(2);
        // cart.total += product.subTotal;
        await cart.save();

        res.status(200).json({
          message: "Cart updated successfully",
          cart: cart.product,
        });
      } else {
        cart.product.push({
          product: product._id,
          seller: product.sellerId,
          name: product.name,
          MRP: product.MRP,
          quantity,
          shippingCharge: product.shippingCharge,
          subTotal: parseFloat(
            product.MRP * quantity + product.shippingCharge
          ).toFixed(2),
        });
        // cart.total += product.subTotal;
        await cart.save();

        res.status(200).json({
          message: "Cart updated successfully",
          cart: cart.product,
        });
      }
    } else {
      const cart = await cartModel.create({
        user: userId,
        product: [
          {
            product: product._id,
            seller: product.sellerId,
            name: product.name,
            MRP: product.MRP,
            quantity,
            shippingCharge: product.shippingCharge,
            subTotal: parseFloat(
              product.MRP * quantity + product.shippingCharge
            ).toFixed(2),
          },
        ],
        // total: product.MRP * quantity,
      });

      res.status(200).json({
        message: "Product added to cart successfully",
        cart: cart.product,
      });
    }
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

// GET
// View Cart
exports.viewCart = asyncHandler(async (req, res) => {
  const user = req.user;
  const cart = await cartModel.findOne({ user });
  if (!cart) {
    res.status(404);
    throw new Error("No cart item");
  }

  const cartTotal = cart.product.reduce(
    (total, product) => total + product.subTotal,
    0
  );

  res
    .status(200)
    .json({ cart: cart.product, cartTotal: parseFloat(cartTotal.toFixed(2)) });
});

// PUT
// Update Cart
exports.updateCart = asyncHandler(async (req, res) => {
  const user = req.user;
  const cart = await cartModel.findOne({ user });
  if (!cart) {
    res.status(404);
    throw new Error("No cart found");
  }

  try {
    const { product_id, quantity } = req.body;
    if (cart) {
      const productIndex = cart.product.findIndex(
        (prod) => prod.product == product_id
      );
      const product = cart.product.find((prod) => prod.product == product_id);

      const subTotal = product.MRP * quantity + product.shippingCharges;

      if (productIndex > -1) {
        let product = cart.product[productIndex];
        product.quantity += parseInt(quantity);

        cart.product[productIndex] = product;
        cart.subTotal += subTotal;
        await cart.save();
      } else {
        res.status(404);
        throw new Error("No cart found");
      }
    }

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

// DELETE
// Remove Cart Item
exports.removeCartItem = asyncHandler(async (req, res) => {
  const userId = req.user;

  const cart = await cartModel.findOne({ user: userId });

  try {
    await cartModel.updateOne(
      { user: userId },
      {
        $pull: {
          product: { product: req.params.product_id },
        },
      }
    );

    res.status(200).json({
      message: "Product Removed",
    });
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

// DELETE
// Clear Cart
exports.clearCart = asyncHandler(async (req, res) => {
  const user = req.user;
  const cart = await cartModel.findOne({ user });
  try {
    await cartModel.findByIdAndDelete(cart._id);
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});
