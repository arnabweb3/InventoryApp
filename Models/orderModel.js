const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
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
      },
    ],
    subTotal: {
      type: Number,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Order", orderSchema);
