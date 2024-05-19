const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a product name."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add product description."],
      trim: true,
    },
    // price: {
    //   type: Number,
    //   required: [true, "Please add product price"],
    // },
    productPicture: {
      type: String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subCategory",
    },
    childCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "childCategory",
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    meta: {
      title: String,
      keywords: [String],
      description: String,
    },
    // taxIncluded: {
    //   type: Boolean,
    //   default: false,
    // },
    MRP: {
      type: String,
    },
    tax: {
      type: String,
    },
    priceBeforeTax: {
      type: String,
    },
    shippingDetails: {
      shippingCharge: { type: Number, required: true },
      freeShipping: { type: Boolean },
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Please add product Brand."],
    },
    // manufacturingDate: {
    //   type: Date,
    //   required: true,
    // },
    expiryDate: {
      type: Date,
    },
    // productDetails: {
    //   type: Object,
    // },

    ratings: [
      {
        star: {
          type: Number,
        },
        comment: {
          type: String,
        },
        postedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        ratedOn: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    totalRating: {
      type: Number,
      default: 0,
    },
    otherDescription: [],
  },

  { timestamps: true }
);

productSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: false });
  next();
});

module.exports = mongoose.model("Product", productSchema);
