const asyncHandler = require("express-async-handler");
const Brand = require("../Models/brandModel");

//POST
//Create Brand
const createBrand = asyncHandler(async (req, res) => {
  const { name, category } = req.body;
  if (!name || !category) {
    res.status(400);
    throw new Error("Please fill all required field.");
  }
  const existingBrand = await Brand.findOne({ name });
  if (existingBrand) {
    res.status(400);
    throw new Error("Brand already exists");
  }
  let logo;
  if (req.file) {
    logo = req.file.location;
  }
  const newBrand = await Brand.create({
    name,
    category,
    logo,
  });
  res.status(201).json({
    message: "Brand created successfully.",
    newBrand,
  });
});

//GET
//Get all brands
const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find().populate("category");
  if (brands.length <= 0) {
    res.status(400);
    throw new Error("No brands found.");
  }
  res.status(200).json(brands);
});

//GET
//get brand by name
const getBrandByName = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const brand = await Brand.findOne({ name }).populate("category");
  res.status(200).json(brand);
});

//PUT
//Update brand
const updateBrand = asyncHandler(async (req, res) => {
  const { brandId } = req.params;
  const { name, category } = req.body;
  const brand = await Brand.findById(brandId);
  if (!brand) {
    res.status(400);
    throw new Error("Brand does not exists.");
  }
  if (Object.keys(req.body).length === 0 && !req.file) {
    res.status(400);
    throw new Error("Please provide atleast one field to update");
  }
  const updateObj = req.body;
  if (req.file) {
    updateObj.logo = req.file.location;
  }
  const updatedBrand = await Brand.findByIdAndUpdate(brandId, updateObj, {
    new: true,
  });
  res.status(200).json({
    message: "Brand updated successfully.",
    updatedBrand,
  });
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { brandId } = req.params;
  const brand = await Brand.findById(brandId);
  if (!brand) {
    res.status(400);
    throw new Error("Brand not found.");
  }
  const deletedBrand = await Brand.findByIdAndDelete(brandId);
  res.status(200).json({
    message: "Brand deleted successfully.",
  });
});

module.exports = {
  createBrand,
  getAllBrands,
  getBrandByName,
  updateBrand,
  deleteBrand,
};
