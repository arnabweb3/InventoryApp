const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const Admin = require("../Models/adminModel");
const { generateToken } = require("../Middleware/validateTokenhandler");

//POST
//Add admin
const addAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error("Please fill all the required field.");
  }
  const isAdmin = await Admin.findOne({ email });
  if (isAdmin) {
    res.status(400);
    throw new Error("Admin already exists with this Email Id");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newAdmin = await Admin.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });
  if (newAdmin) {
    return res.status(201).json({
      message: "New Admin added.",
      admin: {
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
      },
    });
  }
});

//POST
//Admin login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide all the required fields.");
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    res.status(400);
    throw new Error("Admin not found with mail id.");
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Password mismatched");
  }

  const token = generateToken(admin._id);
  res.cookie("token", token, { expiresIn: "1d" });
  res.status(200).json({
    message: "Admin logged in successfully.",
    token,
  });
});

//GET
//Admin logout
const adminLogout = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "Logged Out succesfully",
    });
  } catch (error) {
    res.status(400);
    throw new Error("Some error occured");
  }
});

module.exports = {
  addAdmin,
  adminLogin,
  adminLogout,
};
