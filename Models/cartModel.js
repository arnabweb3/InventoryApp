const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Seller",
        },
        name: {
          type: String,
        },
        MRP: {
          type: Number,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        shippingCharge: {
          type: Number,
        },
        subTotal: {
          type: Number,
        },
      },
    ],
    // total: {
    //   type: Number,
    // },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Cart", cartSchema);
