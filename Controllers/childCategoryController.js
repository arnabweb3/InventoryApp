const asyncHandler = require("express-async-handler");
const Childcategory = require("../Models/childCategoryModel");
const Category = require("../Models/categoryModel");
const Subcategory = require("../Models/subCategoryModel");

const addChildCategory = asyncHandler(async (req, res) => {
  const { categoryId, subCategoryId, name } = req.body;

  const newChildCategory = await Childcategory.create({
    categoryId,
    subCategoryId,
    name,
  });
  if (newChildCategory) {
    return res.status(201).json({
      message: "New addChildCategory Added.",
      newChildCategory,
    });
  }
});

// const getAllcategories = asyncHandler(async (req, res) => {
//     const categories = await Childcategory.aggregate([
//         {$match:}
//     ])
// })

module.exports = {
  addChildCategory,
};
