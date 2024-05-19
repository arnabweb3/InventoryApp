const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: [true, "Category already exists"],
  },
  subCategory: [
    {
      subCategoryName: {
        type: String,
        trim: true,
      },
      childCategory: [
        {
          childCategoryName: {
            type: String,
            trim: true,
          },
        },
      ],
    },
  ],
  // parentId: {
  //   type: String,
  // },
});

module.exports = mongoose.model("Category", categorySchema);
