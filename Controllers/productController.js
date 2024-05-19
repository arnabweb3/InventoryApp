const asyncHandler = require("express-async-handler");
const Product = require("../Models/productModel");
const Discount = require("../Models/discountModel");
const Category = require("../Models/categoryModel");
const Subcategory = require("../Models/subCategoryModel");
const Childcategory = require("../Models/childCategoryModel");
const slugify = require("slugify");
const { default: mongoose } = require("mongoose");
const { parse } = require("dotenv");
const User = require("../Models/userModel");

// -------------------------------------Fetch products with discounted price function--------------------------------------
const fetchProducts = (products, discounts) => {
  const productsWithDiscount = [];
  const productsWithoutDiscount = [];
  // const discounts = await Discount.find({ seller: req.user });
  products.forEach((product) => {
    const discount = discounts.find(
      (d) => d.product.toString() == product._id.toString()
    );
    // console.log("discount", discount);
    if (discount) {
      productsWithDiscount.push({
        product,
        discountedPrice: (
          parseFloat(product.MRP) -
          (parseFloat(product.MRP) * parseInt(discount.discount)) / 100
        ).toFixed(2),
      });
    } else {
      productsWithoutDiscount.push({ product });
    }
  });
  const allProducts = [...productsWithDiscount, ...productsWithoutDiscount];
  return allProducts;
};
// ------------------------------------------------------------------------------------------------------------------

//POST
//Add new Product
const addProduct = asyncHandler(async (req, res) => {
  let {
    name,
    description,
    // price,
    category,
    meta,
    tax,
    MRP,
    priceBeforeTax,
    shippingDetails,
    subCategory,
    childCategory,
    brand,
    // manufacturingDate,
    expiryDate,
    // productDetails,
    otherDescription,
    // taxIncluded,
  } = req.body;
  console.log(req.body);
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    throw new Error("Please provide all required field");
  }
  const isCategory = await Category.findById(category);
  if (!isCategory) {
    res.status(400);
    throw new Error("Category not found.");
  }
  if (subCategory) {
    const isSubCat = await Subcategory.aggregate([
      {
        $match: {
          categoryId: mongoose.Types.ObjectId.createFromHexString(category),
        },
      },
      {
        $match: {
          _id: mongoose.Types.ObjectId.createFromHexString(subCategory),
        },
      },
    ]);
    // console.log("Subcat", isSubCat);
    if (isSubCat.length === 0) {
      res.status(200);
      throw new Error("Please select proper category and subcategory.");
    }
  }
  if (childCategory) {
    const isChildCat = await Childcategory.aggregate([
      {
        $match: {
          categoryId: mongoose.Types.ObjectId.createFromHexString(category),
        },
      },
      {
        $match: {
          subCategoryId:
            mongoose.Types.ObjectId.createFromHexString(subCategory),
        },
      },
      {
        $match: {
          _id: mongoose.Types.ObjectId.createFromHexString(childCategory),
        },
      },
    ]);
    // console.log("ChildCat", isChildCat);
    if (isChildCat.length === 0) {
      res.status(400);
      throw new Error(
        "Please select proper category, subcategory and childcategory."
      );
    }
  }

  let productPicture;
  if (req.file) {
    productPicture = req.file.location;
  }
  // console.log(req.file);
  // console.log(req.files);

  // console.log(typeof MRP);
  meta.title = slugify(name);
  const metaSentence = `${slugify(name)}-${slugify(description)}`;
  // console.log(metaSentence);
  const preTag = metaSentence.replace(/\d+/g, "flag"); //converting any number to flag in the metaSentence
  // console.log(preTag);
  const tag = preTag
    .split("-")
    .filter(
      (word) =>
        !(
          word.toLowerCase() === "the" ||
          word.toLowerCase() === "this" ||
          word.toLowerCase() === "a" ||
          word.toLowerCase() === "an" ||
          word.toLowerCase() === "and" ||
          word.toLowerCase() === "is" ||
          word.toLowerCase() === "it" ||
          word.toLowerCase() === "are" ||
          word.toLowerCase() === "in" ||
          word.toLowerCase() === "with" ||
          word.toLowerCase() === "of" ||
          word.toLowerCase() === "for" ||
          word.toLowerCase() === "by" ||
          word === "flag"
        )
    )
    .map((word) => word.toLowerCase());
  // console.log(tag);
  meta.keywords = [...tag, ...req.body.meta.keywords];

  // if (!taxIncluded) {
  //   price = price + (price * (tax * 1)) / 100;
  // }
  // const newProduct = await Product.create({
  //   name,
  //   description,
  //   price,
  //   productPictures,
  //   category,
  //   sellerId: req.user,
  //   meta,
  // });

  if (!MRP && !priceBeforeTax) {
    res.status(400);
    throw new Error("Please put either MRP or priceBeforeTax");
  }
  if (MRP && priceBeforeTax) {
    res.status(400);
    throw new Error("Please put either MRP or priceBeforeTax");
  }

  if (MRP) {
    const tax_amount = parseFloat(MRP) / ((100 + parseFloat(tax)) / 100);

    const newProduct = await Product.create({
      name,
      description,
      // price,
      productPicture,
      category,
      sellerId: req.user,
      meta,
      MRP,
      tax,
      priceBeforeTax: tax_amount.toFixed(2),
      shippingDetails,
      subCategory,
      childCategory,
      brand,
      // manufacturingDate,
      expiryDate,
      // productDetails,
      otherDescription: otherDescription.map((item) => JSON.parse(item)),
    });

    if (newProduct) {
      res.status(201).json({
        message: "Product created successfully",
        newProduct,
      });
    }
  }
  if (priceBeforeTax) {
    const price = (100 * parseFloat(priceBeforeTax)) / 100 + parseFloat(tax);

    const newProduct = await Product.create({
      name,
      description,
      // price,
      productPicture,
      category,
      sellerId: req.user,
      meta,
      MRP: price.toFixed(2),
      tax,
      priceBeforeTax,
      shippingDetails,
      subCategory,
      childCategory,
      brand,
      // manufacturingDate,
      expiryDate,
      // productDetails,
      otherDescription: otherDescription.map((item) => JSON.parse(item)),
    });
    if (newProduct) {
      res.status(201).json({
        message: "Product created successfully",
        newProduct,
      });
    }
  }
});

//GET
//Get all products
// const getProducts = asyncHandler(async (req, res) => {
//   const products = await Product.find({ sellerId: req.user })
//     .populate("category", "_id, name")
//     .populate("subCategory", "_id name")
//     .populate("childCategory", "_id name")
//     .populate("brand", "_id name");
//   if (products.length === 0) {
//     res.status(404);
//     throw new Error("No products found...");
//   } else {
//     res.status(200).json({
//       products,
//     });
//   }
// });

//PUT
//Update a Product
const updateProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const sellerId = req.user;

  const product = await Product.findOne({
    $and: [{ _id: productId }, { sellerId: sellerId }],
  });

  if (!product) {
    res.status(404);
    throw new Error("No product found.");
  }
  if (Object.keys(req.body).length === 0 && !req.file) {
    res.status(400);
    throw new Error("Please provide atleast one field to update");
  }

  const { MRP, priceBeforeTax, tax } = req.body;
  if (MRP && priceBeforeTax) {
    res.status(401);
    throw new Error("Please put either MRP or priceBeforeTax");
  }

  let updateObj = req.body;

  let isTax = tax ? tax : product.tax;

  if (MRP) {
    updateObj.priceBeforeTax = (
      parseFloat(MRP) /
      ((100 + parseFloat(isTax)) / 100)
    ).toFixed(2);
  }
  if (priceBeforeTax) {
    updateObj.MRP = (
      (100 * parseFloat(priceBeforeTax)) / 100 +
      parseFloat(isTax)
    ).toFixed(2);
  }

  if (req.file) {
    updateObj.productPicture = req.file.location;
  }

  // const updatedProduct = await Product.findOneAndUpdate(product, updateObj, {
  //   new: true,
  // });

  const updatedProduct = await Product.findByIdAndUpdate(
    product._id,
    updateObj,
    {
      new: true,
    }
  );
  res.status(200).json({
    message: "Product updated successfully",
    updatedProduct,
  });
});

//DELETE
//Delete a Product(Soft delete)
const deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const sellerId = req.user;
  const product = await Product.findOne({
    $and: [{ _id: productId }, { sellerId: sellerId }],
  });
  if (!product) {
    res.status(404);
    throw new Error("No product found.");
  }
  const deletedProduct = await Product.findOneAndUpdate(
    product,
    { $set: { isDeleted: true } },
    { new: true }
  );
  res.status(200).json({
    message: "Product deleted successfully",
  });
});

//GET
//Get a product by ID
const getProductById = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const sellerId = req.user;
  const discount = await Discount.findOne({ product: productId });
  let discountedPrice;

  const product = await Product.findOne({
    $and: [{ _id: productId }, { sellerId: sellerId }],
  })
    .populate("category", "_id name")
    .populate("subCategory", "_id name")
    .populate("childCategory", "_id name");

  if (!product) {
    res.status(404);
    throw new Error("No Product found.");
  }
  if (discount) {
    discountedPrice =
      parseFloat(product.MRP) -
      (parseFloat(product.MRP) * parseInt(discount.discount)) / 100;
  }
  res.status(200).json({ product, discountedPrice });
});

// 1>---------------------------------------------------------------------------------------
// const getProductsByCategory = asyncHandler(async (req, res) => {
//   const categoryId = req.params.categoryId;
//   const category = await Category.findById({ _id: categoryId });
//   const newCategoryId = new mongoose.Types.ObjectId(categoryId);
//   const subcategory = await Category.aggregate([
//     { $unwind: "$subCategory" },
//     { $match: { "subCategory._id": newCategoryId } },
//   ]);
//   console.log("subcategory", subcategory);

//   if (category && category.subCategory.length > 0) {
//     const childCategoryData = await Category.aggregate([
//       { $match: { _id: newCategoryId } },
//       { $unwind: "$subCategory" },
//       { $unwind: "$subCategory.childCategory" },
//     ]);

//     let childCategoryIds = [];
//     childCategoryData.forEach(async (cat) => {
//       let childCatId = cat.subCategory.childCategory._id;
//       console.log(childCatId);
//       childCategoryIds.push(childCatId);
//     });
//     console.log(childCategoryIds);
//     // console.log("Childcatdata", childCategoryData);

//     let subCategoryIds = [];
//     const subCategoryData = await Category.aggregate([
//       { $match: { _id: newCategoryId } },
//       { $unwind: "$subCategory" },
//     ]);

//     subCategoryData.forEach(async (cat) => {
//       let subCatId = cat.subCategory._id;
//       console.log(subCatId);
//       subCategoryIds.push(subCatId);
//     });
//     // console.log(subCategoryData);
//     // console.log("SubCatdata", subCategoryData);

//     const ids = childCategoryIds.concat(subCategoryIds);
//     console.log("ids", ids);

//     const products = await Product.find({ category: { $in: ids } }).populate(
//       "category"
//     );
//     // console.log(products);
//     res.status(200).json({ products });
//   } else if (
//     subcategory.length !== 0 &&
//     subcategory[0].subCategory.childCategory.length !== 0
//   ) {
//     const data = await Category.aggregate([
//       { $unwind: "$subCategory" },
//       { $match: { "subCategory._id": newCategoryId } },
//       { $unwind: "$subCategory.childCategory" },
//     ]);
//     let ids = [];
//     data.forEach(async (cat) => {
//       let childCatId = cat.subCategory.childCategory._id;
//       console.log(childCatId);
//       ids.push(childCatId);
//       // console.log(ids);
//     });
//     console.log("data", data);
//     const products = await Product.find({ category: { $in: ids } }).populate(
//       "category"
//     );
//     // console.log(products);
//     res.status(200).json({ products });
//   } else {
//     const products = await Product.find({ category: categoryId }).populate(
//       "category"
//     );
//     console.log(products);
//     res.status(200).json({ products });
//   }

//   // console.log(category);
// });
// -------------------------------------------------------------------------------------------

// 2>-------------------------------------------------------------------------------------------
// const getProductsByCategory = asyncHandler(async (req, res) => {
//   const categoryId = req.params.categoryId;
//   const uCategoryId = new mongoose.Types.ObjectId(categoryId);
//   const catId = await Category.findById(categoryId);
//   const subCatId = await Subcategory.findById(categoryId);
//   const childCatId = await Childcategory.findById(categoryId);

//   console.log(catId);
//   console.log(subCatId);
//   console.log(childCatId);
//   // const products = await Product.find().populate("category");

//   if (catId) {
//     const products = await Product.aggregate([
//       { $match: { isDeleted: false } },
//       {
//         $lookup: {
//           from: "childcategories",
//           localField: "category",
//           foreignField: "_id",
//           as: "category_details",
//         },
//       },
//       { $match: { "category_details.categoryId": uCategoryId } },
//     ]);
//     res.status(200).json(products);
//   } else if (subCatId) {
//     const products = await Product.aggregate([
//       { $match: { isDeleted: false } },
//       {
//         $lookup: {
//           from: "childcategories",
//           localField: "category",
//           foreignField: "_id",
//           as: "category_details",
//         },
//       },
//       { $match: { "category_details.subCategoryId": uCategoryId } },
//     ]);
//     res.status(200).json(products);
//   } else {
//     const products = await Product.aggregate([
//       { $match: { isDeleted: false } },
//       {
//         $lookup: {
//           from: "childcategories",
//           localField: "category",
//           foreignField: "_id",
//           as: "category_details",
//         },
//       },
//       { $match: { "category_details._id": uCategoryId } },
//     ]);
//     res.status(200).json(products);
//   }
// });
// -------------------------------------------------------------------------------------------------

// 3>----------------------------------------------------------------------------------------
//GET
//Get products by category
const getProductsByCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;
  const parentCat = await Category.findById(categoryId);
  const subCat = await Subcategory.findById(categoryId);
  const discounts = await Discount.find();
  if (parentCat) {
    const products = await Product.find({ category: categoryId })
      .populate("category", "_id, name")
      .populate("subCategory", "_id name")
      .populate("childCategory", "_id name")
      .populate("brand", "_id name");
    const allProducts = fetchProducts(products, discounts);
    res.status(200).json(allProducts);
  } else if (subCat) {
    const products = await Product.find({ subCategory: categoryId })
      .populate("category", "_id, name")
      .populate("subCategory", "_id name")
      .populate("childCategory", "_id name")
      .populate("brand", "_id name");
    const allProducts = fetchProducts(products, discounts);
    res.status(200).json(allProducts);
  } else {
    const products = await Product.find({ childCategory: categoryId })
      .populate("category", "_id, name")
      .populate("subCategory", "_id name")
      .populate("childCategory", "_id name")
      .populate("brand", "_id name");
    const allProducts = fetchProducts(products, discounts);
    res.status(200).json(allProducts);
  }
});

//GET
//Get products by brand
const getProductsByBrand = asyncHandler(async (req, res) => {
  const { brandId } = req.body;
  const { subCategoryId } = req.query;
  const { childCategoryId } = req.query;
  if (!brandId) {
    res.status(400);
    throw new Error("Please provide brandId.");
  }

  try {
    const discounts = await Discount.find();

    if (childCategoryId) {
      const products = await Product.find({
        $and: [
          { brand: brandId },
          { subCategory: subCategoryId },
          { childCategory: childCategoryId },
        ],
      })
        .populate("category", "_id, name")
        .populate("subCategory", "_id name")
        .populate("childCategory", "_id name")
        .populate("brand", "_id name");
      const allProducts = fetchProducts(products, discounts);

      res.status(200).json(allProducts);
    } else if (subCategoryId) {
      const products = await Product.find({
        $and: [{ brand: brandId }, { subCategory: subCategoryId }],
      })
        .populate("category", "_id, name")
        .populate("subCategory", "_id name")
        .populate("childCategory", "_id name")
        .populate("brand", "_id name");
      const allProducts = fetchProducts(products, discounts);
      res.status(200).json(allProducts);
    } else {
      const products = await Product.find({ brand: brandId })
        .populate("category", "_id, name")
        .populate("subCategory", "_id name")
        .populate("childCategory", "_id name")
        .populate("brand", "_id name");
      const allProducts = fetchProducts(products, discounts);
      res.status(200).json(allProducts);
    }
  } catch (error) {
    res.status(400);
    throw new Error("No products found.");
  }
});

//GET
//Get all products(Seller)
const getProducts = asyncHandler(async (req, res) => {
  // const productsWithDiscount = [];
  // const productsWithoutDiscount = [];

  // --------------------------------------Try automatic search words--------------------------------------------------
  // const { name } = req.query;
  // const pattern = new RegExp(`^${name}`, "i");
  // const preWords = await Product.find({
  //   "meta.keywords": { $regex: pattern },
  // }).select({ "meta.keywords": 1, _id: 0 });
  // const words = preWords
  //   .flatMap((ele) =>
  //     ele.meta.keywords.filter((word) => word.startsWith(name.toLowerCase()))
  //   )
  //   .reduce((acc, curr) => {
  //     if (!acc.includes(curr)) acc.push(curr);
  //     return acc;
  //   }, []);
  // console.log(words);
  // ---------------------------------------------------------------------------------------------------------------

  const products = await Product.find({ sellerId: req.user })
    .populate("category", "_id, name")
    .populate("subCategory", "_id name")
    .populate("childCategory", "_id name")
    .populate("brand", "_id name");

  const discounts = await Discount.find({ seller: req.user });

  const allProducts = fetchProducts(products, discounts);
  res.status(200).json(allProducts);
  // res.status(200).json(words);
});

//GET
//Get all products(Users)
const getAllProducts = asyncHandler(async (req, res) => {
  let discounts;
  let disCountArray;
  if (req.query.discount) {
    discounts = await Discount.find({
      discount: req.query.discount,
    });
    disCountArray = discounts.map((discount) => discount.product);
  } else {
    discounts = await Discount.find();
  }
  let words;
  // console.log(req.query.name);
  if (req.query.name) {
    words = req.query.name.split(" ").map((word) => word.toLowerCase());
  }
  // console.log(words);

  // console.log("disCountArray", disCountArray);
  // console.log("discounts", discounts);
  const exactProduct = await Product.findOne({ name: req.query.name });
  let queryObj;
  if (exactProduct) {
    queryObj = {
      ...(req.query.name && { name: req.query.name }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.subCategory && { subCategory: req.query.subCategory }),
      ...(req.query.childCategory && {
        childCategory: req.query.childCategory,
      }),
      ...(req.query.brand && { brand: req.query.brand }),
      ...(req.query.rating && {
        totalRating: { $gte: req.query.rating, $lte: 5 },
      }),
      ...(req.query.discount && { _id: { $in: disCountArray } }),
    };
  } else {
    queryObj = {
      ...(req.query.name && { "meta.keywords": { $all: words } }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.subCategory && { subCategory: req.query.subCategory }),
      ...(req.query.childCategory && {
        childCategory: req.query.childCategory,
      }),
      ...(req.query.brand && { brand: req.query.brand }),
      ...(req.query.rating && {
        totalRating: { $gte: req.query.rating, $lte: 5 },
      }),
      ...(req.query.discount && { _id: { $in: disCountArray } }),
    };
  }

  // console.log(queryObj);
  const products = await Product.find(queryObj)
    .populate("category", "_id, name")
    .populate("subCategory", "_id name")
    .populate("childCategory", "_id name")
    .populate("brand", "_id name")
    .populate("sellerId", "businessInformation.name -_id")
    .populate("ratings.postedBy", "userName -_id");

  if (products.length === 0) {
    res.status(404);
    throw new Error("No products found.");
  }

  const allProducts = fetchProducts(products, discounts);
  // console.log("allProducts", allProducts);

  let filteredProducts;
  if (req.query.minPrice && !req.query.maxPrice) {
    let filteredProductsWithDiscount = allProducts
      .filter((product) => product.discountedPrice)
      .filter(
        (product) =>
          parseFloat(product.discountedPrice) >= parseFloat(req.query.minPrice)
      );
    // console.log("filteredProductsWithDiscount", filteredProductsWithDiscount);
    let filteredProductsWithoutDiscount = allProducts
      .filter((product) => !product.discountedPrice)
      .filter(
        (product) =>
          parseFloat(product.product.MRP) >= parseFloat(req.query.minPrice)
      );
    // console.log(
    //   "filteredProductsWithoutDiscount",
    //   filteredProductsWithoutDiscount
    // );
    filteredProducts = filteredProductsWithDiscount.concat(
      filteredProductsWithoutDiscount
    );
    res.status(200).json(filteredProducts);
  } else if (req.query.maxPrice && !req.query.minPrice) {
    let filteredProductsWithDiscount = allProducts
      .filter((product) => product.discountedPrice)
      .filter(
        (product) =>
          parseFloat(product.discountedPrice) <= parseFloat(req.query.maxPrice)
      );
    // console.log("filteredProductsWithDiscount", filteredProductsWithDiscount);
    let filteredProductsWithoutDiscount = allProducts
      .filter((product) => !product.discountedPrice)
      .filter(
        (product) =>
          parseFloat(product.product.MRP) <= parseFloat(req.query.maxPrice)
      );
    // console.log(
    //   "filteredProductsWithoutDiscount",
    //   filteredProductsWithoutDiscount
    // );
    filteredProducts = filteredProductsWithDiscount.concat(
      filteredProductsWithoutDiscount
    );
    res.status(200).json(filteredProducts);
  } else if (req.query.minPrice && req.query.maxPrice) {
    let filteredProductsWithDiscount = allProducts
      .filter((product) => product.discountedPrice)
      .filter(
        (product) =>
          parseFloat(product.discountedPrice) >=
            parseFloat(req.query.minPrice) &&
          parseFloat(product.discountedPrice) <= parseFloat(req.query.maxPrice)
      );
    // console.log("filteredProductsWithDiscount", filteredProductsWithDiscount);
    let filteredProductsWithoutDiscount = allProducts
      .filter((product) => !product.discountedPrice)
      .filter(
        (product) =>
          parseFloat(product.product.MRP) >= parseFloat(req.query.minPrice) &&
          parseFloat(product.product.MRP) <= parseFloat(req.query.maxPrice)
      );
    // console.log(
    //   "filteredProductsWithoutDiscount",
    //   filteredProductsWithoutDiscount
    // );
    filteredProducts = filteredProductsWithDiscount.concat(
      filteredProductsWithoutDiscount
    );
    res.status(200).json(filteredProducts);
  } else {
    res.status(200).json(allProducts);
  }
});

//PUT
//Rating
const addRating = asyncHandler(async (req, res) => {
  const userId = req.user;
  const user = await User.findById(userId);

  const { productId, star, comment } = req.body;
  const product = await Product.findById(productId);
  const alreadyRated = product.ratings.find(
    (rating) => rating.postedBy.toString() === userId.toString()
  );
  let updatedRatedProduct;
  if (alreadyRated) {
    updatedRatedProduct = await Product.findOneAndUpdate(
      { ratings: { $elemMatch: alreadyRated } },
      { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
      { new: true }
    );
  } else {
    updatedRatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $push: {
          ratings: {
            star: star,
            comment: comment,
            postedBy: userId,
          },
        },
      },
      { new: true }
    );
  }
  const totalRatingLength = updatedRatedProduct.ratings.length;
  const totlaRatingStar = updatedRatedProduct.ratings.map(
    (rating) => rating.star
  );
  const totalRatingSum = totlaRatingStar.reduce((acc, curr) => {
    return acc + curr;
  }, 0);
  let actualTotalRating = (totalRatingSum / totalRatingLength).toFixed(1);
  const updatedTotalRating = await Product.findByIdAndUpdate(
    productId,
    {
      $set: { totalRating: actualTotalRating },
    },
    { new: true }
  );

  res.status(200).json(updatedTotalRating);
});

module.exports = {
  addProduct,
  getProducts,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductsByCategory,
  getProductsByBrand,
  addRating,
};
