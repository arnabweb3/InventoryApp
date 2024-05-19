const asyncHandler = require("express-async-handler");
const Subcategory = require("../Models/subCategoryModel");

const addSubCategory = asyncHandler(async (req, res) => {
  const { categoryId, name } = req.body;

  const newSubCategory = await Subcategory.create({
    categoryId,
    name,
  });
  if (newSubCategory) {
    return res.status(201).json({
      message: "New newSubCategory Added.",
      newSubCategory,
    });
  }
});

module.exports = {
  addSubCategory,
};
