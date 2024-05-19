const asyncHandler = require("express-async-handler");

const Category = require("../Models/categoryModel");
const Subcategory = require("../Models/subCategoryModel");
const Childcategory = require("../Models/childCategoryModel");
const { default: mongoose } = require("mongoose");

//Recursive to fetch category
// function fetchCategories(categories, parentId = null) {
//   const categoryList = [];
//   let category;
//   if (parentId == null) {
//     category = categories.filter((cat) => cat.parentId == undefined);
//   } else {
//     category = categories.filter((cat) => cat.parentId == parentId);
//   }
//   for (let cate of category) {
//     categoryList.push({
//       _id: cate._id,
//       name: cate.name,
//       children: fetchCategories(categories, cate._id),
//     });
//   }
//   return categoryList;
// }

//POST
//1-addCategory---->
const addCategory = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    res.status(400);
    throw new Error("Please provide Category name.");
  }
  const isCategory = await Category.findOne({ name: req.body.name });
  if (isCategory) {
    res.status(400);
    throw new Error("Category already exists.");
  }
  const categoryObj = {
    name: req.body.name,
  };
  // if (req.body.subCategory) {
  //   categoryObj.subCategory = req.body.subCategory;
  // }

  const newCategory = await Category.create(categoryObj);
  if (newCategory) {
    return res.status(201).json({
      message: "New Category Added.",
      newCategory,
    });
  }
});

// 2-AddCategory---->
// const addCategory = asyncHandler(async (req, res) => {
//   const { name } = req.body;
//   const newCategory = await Category.create({ name });
//   if (newCategory) {
//     return res.status(201).json({
//       message: "New Category Added.",
//       newCategory,
//     });
//   }
// });

// const addChildCategory = asyncHandler(async (req, res) => {
//   const { parentCatName, name } = req.body;
//   const existingSubcat = await Category.findOneAndUpdate(
//     { "subCategory.subCategoryName": parentCatName },
//     {
//       $set: {
//         "subCategory.childCategory": {
//           $push: { childCategory: { childCategoryName: name } },
//         },
//       },
//     },
//     { new: true }
//   );
//   console.log(existingSubcat);

//   res.status(200).json(existingSubcat);
// });

//PUT
//Add sub category
const addSubCategory = asyncHandler(async (req, res) => {
  const { category_id } = req.query;
  const { subCategoryName } = req.body;
  if (!category_id || !subCategoryName) {
    res.status(400);
    throw new Error("Please fill all required fileds.");
  }
  const isCategory = await Category.findById(category_id);
  if (!isCategory) {
    res.status(400);
    throw new Error("Category not found.");
  }
  const isSubcategory = await Subcategory.findOne({
    $and: [{ categoryId: category_id }, { name: subCategoryName }],
  });
  if (isSubcategory) {
    res.status(400);
    throw new Error("Subcategory already exists.");
  }

  const newSubcategory = await Subcategory.create({
    categoryId: category_id,
    name: subCategoryName,
  });

  const updatedCategory = await Category.findOneAndUpdate(
    { _id: category_id },
    {
      $push: {
        subCategory: {
          subCategoryName: newSubcategory.name,
          _id: newSubcategory._id,
        },
      },
    },
    { new: true }
  );
  res.status(200).json(updatedCategory);
});

//PUT
//Add child category
const addChildCategory = asyncHandler(async (req, res) => {
  // const { category_id, subCategory_id } = req.params;
  const { category_id, subCategory_id } = req.query;
  const { childCategoryName } = req.body;
  if (!category_id || !subCategory_id || !childCategoryName) {
    res.status(400);
    throw new Error("Please fill all required fields.");
  }

  const uCategory_id = new mongoose.Types.ObjectId(category_id);
  const uSubcategory_id = new mongoose.Types.ObjectId(subCategory_id);
  // console.log(req.body);
  const isChildcategory = await Childcategory.aggregate([
    { $match: { categoryId: uCategory_id } },
    { $match: { subCategoryId: uSubcategory_id } },
    { $match: { name: childCategoryName } },
  ]);
  // console.log(isChildcategory);
  if (isChildcategory.length > 0) {
    res.status(400);
    throw new Error("Childcategory already exists.");
  }

  const isCatMatch = await Subcategory.aggregate([
    { $match: { categoryId: uCategory_id } },
    { $match: { _id: uSubcategory_id } },
  ]);
  // console.log(isCatMatch);
  if (isCatMatch.length > 0) {
    const newChildCategory = await Childcategory.create({
      categoryId: category_id,
      subCategoryId: subCategory_id,
      name: childCategoryName,
    });

    const subCategory = await Category.updateOne(
      { _id: category_id },
      {
        $push: {
          "subCategory.$[elm1].childCategory": {
            _id: newChildCategory._id,
            childCategoryName: newChildCategory.name,
          },
        },
      },
      {
        arrayFilters: [
          {
            "elm1._id": subCategory_id,
          },
        ],
      }
    );

    res.status(200).json(subCategory);
  } else {
    res.status(400);
    throw new Error("Please select correct Category and Subcategory ");
  }
});

//GET
//Get all categories
const getCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  addCategory,
  getCategories,
  addSubCategory,
  addChildCategory,
};
