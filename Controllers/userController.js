const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const sendEmail = require("../Middleware/email");
const { generateToken } = require("../Middleware/validateTokenhandler");
//Generate Token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
// };

//POST
//Create new user
const createUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    userName,
    email,
    countryCode,
    phoneNumber,
    password,
    status,
    role,
  } = req.body;
  // if (
  //   !firstName ||
  //   !lastName ||
  //   !userName ||
  //   !email ||
  //   !countryCode ||
  //   !phoneNumber ||
  //   !password ||
  //   !status ||
  //   !role
  // ) {
  //   res.status(400);
  //   throw new Error("Please fill all the field");
  // }

  if (Object.keys(req.body).length === 0) {
    res.status(400);
    throw new Error("Please fill all the required fields");
  }
  const isUser = await User.findOne({ email });
  if (isUser) {
    res.status(400);
    throw new Error("User already exists with this email...");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = await User.create({
    firstName,
    lastName,
    userName,
    email,
    countryCode,
    phoneNumber,
    password: hashedPassword,
    status,
    role,
  });
  if (newUser) {
    return res.status(201).json({
      message: "User Created successfully.",
      user: {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userName: newUser.userName,
        email: newUser.email,
        countryCode: newUser.countryCode,
        phoneNumber: newUser.phoneNumber,
        status: newUser.status,
        role: newUser.role,
      },
    });
  }
});

//POST
//Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error("Please provide all fields...");
  }
  const isUser = await User.findOne({ email });
  if (!isUser) {
    res.status(400);
    throw new Error("User not found with this email");
  }
  const isMatch = await bcrypt.compare(password, isUser.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Password mismatched");
  }
  const token = generateToken(isUser._id);
  res.cookie("token", token, { expiresIn: "1d" });
  res.status(200).json({
    message: "User logged in successfully",
    user: {
      firstName: isUser.firstName,
      lastName: isUser.lastName,
      userName: isUser.userName,
      email: isUser.email,
    },
    token,
  });
});

//GET
//Logout
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(400);
    throw new Error("Some error occured");
  }
};

//GET
//Get User
const getUser = asyncHandler(async (req, res) => {
  const userId = req.user;
  const user = await User.findById(userId);
  if (user) {
    return res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("No user is found with this id");
  }
});

//GET
//Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  if (users) {
    return res.status(200).json({
      users,
    });
  } else {
    res.status(404);
    throw new Error("No data found");
  }
});

//PUT
//Update User
const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user;
  const { password } = req.body;
  if (password) {
    res.status(400);
    throw new Error("You can't update your password here");
  }
  const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
    new: true,
  });
  if (updatedUser) {
    return res.status(200).json({
      message: "Profile updated successfully.",
      updatedUser,
    });
  }
});

//PUT
//Update Password
const updatePassword = asyncHandler(async (req, res) => {
  const userId = req.user;
  const user = await User.findById(userId);
  const { currentPassword, newPassword } = req.body;
  const matchedPassword = await bcrypt.compare(currentPassword, user.password);
  if (!matchedPassword) {
    res.status(401);
    throw new Error("Password is not matched");
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { password: hashedNewPassword } },
      { new: true }
    );
    return res.status(200).json({
      message: "Password updated successfully",
      updatedUser,
    });
  }
});

//PUT
//Delete User(Soft Delete)
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("No user found with this id");
  }
  const deletedUser = await User.findByIdAndUpdate(
    id,
    { $set: { status: "inActive" } },
    { new: true }
  );
  res.status(200).json({
    message: "User deleted successfully",
  });
});

//POST
//Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new Error("Kindly provide your Email");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found with this email id");
  }
  const resetToken = await user.createResetPasswordToken();
  // console.log(resetToken);
  await user.save();
  const resetUrl = `<h1>Please follow this link to reset your password.</h1><br><h4><a href=${
    req.protocol
  }://${req.get(
    "host"
  )}/api/users/resetPassword/${resetToken}>Click here.</a></h4>`;

  const data = {
    to: email,
    from: process.env.MAIL_ID,
    subject: "Forgot password link",
    text: "Hey user",
    html: resetUrl,
  };
  try {
    await sendEmail(data);
    res.status(200).json({
      message: "Email sent",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save();
    res.status(500);
    throw new Error("Some internal error occured");
  }
});

//PUT
//Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error("Please provide your new password");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedResetPassword = await bcrypt.hash(password, salt);
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error("Token is invalid or expired. Please try again later");
  }
  user.password = hashedResetPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();
  res.status(200).json({
    message: "Password changed successfully.",
  });
});
module.exports = {
  createUser,
  loginUser,
  logoutUser,
  getUser,
  getAllUsers,
  updateUser,
  updatePassword,
  deleteUser,
  forgotPassword,
  resetPassword,
};
