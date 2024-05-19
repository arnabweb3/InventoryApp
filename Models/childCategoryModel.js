const mongoose = require("mongoose");

const childCategorySchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subCategory",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("childCategory", childCategorySchema);
