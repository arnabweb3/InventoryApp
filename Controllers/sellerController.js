const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Seller = require("../Models/sellerModel");
const sendEmail = require("../Middleware/email");
const { generateToken } = require("../Middleware/validateTokenhandler");

//Generate Token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
// };

//POST
//Add Seller
const addSeller = asyncHandler(async (req, res) => {
  //   console.log(req.body);
  // console.log(req.files);
  //   console.log(req.files["legalDocuments[incorporationCertificate]"][0].filename);
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    throw new Error("Please provide all the required fields");
  }
  const businessInformation = req.body.businessInformation;
  const contactInformation = req.body.contactInformation;
  const bankAccountDetails = req.body.bankAccountDetails;
  const taxInformation = req.body.taxInformation;
  const password = req.body.password;
  const category = req.body.category;

  const { email } = req.body.contactInformation;
  const { phone } = req.body.contactInformation;
  const existSellerEmail = await Seller.findOne({
    "contactInformation.email": email,
  });
  if (existSellerEmail) {
    res.status(400);
    throw new Error("Seller already exists with this Email");
  }
  const existSellerPhone = await Seller.findOne({
    "contactInformation.phone": phone,
  });

  if (existSellerPhone) {
    res.status(400);
    throw new Error("Seller already exists with this Phone number");
  }

  if (!req.files["legalDocuments[incorporationCertificate]"]) {
    res.status(400);
    throw new Error("Please provide your Incorporate Certificate.");
  }

  if (!req.files["legalDocuments[partnershipDeed]"]) {
    res.status(400);
    throw new Error("Please provide your Partnership Deed.");
  }

  if (!req.files["identityProof[adhaarCardOrPassport]"]) {
    res.status(400);
    throw new Error("Please provide your Adhaar Card Or Passport.");
  }

  if (!req.files["identityProof[directorsOrPartnerIdentity]"]) {
    res.status(400);
    throw new Error(
      "Please provide your Directors or Partner Identity document."
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let legalDocuments = {};
  (legalDocuments.incorporationCertificate =
    req.files["legalDocuments[incorporationCertificate]"][0].location),
    (legalDocuments.partnershipDeed =
      req.files["legalDocuments[partnershipDeed]"][0].location);

  if (req.files["legalDocuments[otherDocuments]"]) {
    legalDocuments.otherDocuments =
      req.files["legalDocuments[otherDocuments]"][0].location;
  }

  const identityProof = {
    adhaarCardOrPassport:
      req.files["identityProof[adhaarCardOrPassport]"][0].location,
    directorsOrPartnerIdentity:
      req.files["identityProof[directorsOrPartnerIdentity]"][0].location,
  };

  const newSeller = await Seller.create({
    businessInformation,
    contactInformation,
    bankAccountDetails,
    taxInformation,
    legalDocuments,
    identityProof,
    password: hashedPassword,
    category,
  });
  if (newSeller) {
    return res.status(201).json({
      message: "New seller added",
      newSeller,
    });
  }
});

//POST
//SendOTP
const sendOTP = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (Object.keys(req.body).length === 0) {
    res.status(400);
    throw new Error("Please fill all required field.");
  }
  const isSeller = await Seller.findOne({ "contactInformation.email": email });
  if (!isSeller) {
    res.status(404);
    throw new Error("No seller found with this Email.");
  }
  const isMatch = await bcrypt.compare(password, isSeller.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Password mismatched");
  }

  const min = 1000;
  const max = 9999;

  const otp = Math.floor(Math.random() * (max - min + 1) + min);
  // console.log(otp);
  const updatedSeller = await Seller.findOneAndUpdate(
    { "contactInformation.email": email },
    { $set: { otp: otp } },
    { new: true }
  );
  const data = {
    to: email,
    from: process.env.MAIL_ID,
    subject: "Login OTP",
    text: "Hey seller please find your login OTP",
    html: `<h1>Hey seller your login OTP is ${updatedSeller.otp}</h1>`,
  };

  try {
    await sendEmail(data);
    // console.log("Email sent");
    setTimeout(() => {
      updatedSeller.otp = undefined;
      updatedSeller.save();
    }, 60000);

    res.status(200).json({
      message: "OTP sent to your Email.",
    });
  } catch (error) {
    res.status(500);
    console.log(error);
    throw new Error("Some internal error occured.", error);
  }
});

//POST
//Seller login
const sellerLogin = asyncHandler(async (req, res) => {
  const { email, password, otp } = req.body;
  if ((!email, !password)) {
    res.status(400);
    throw new Error("Please provide all required fields.");
  }
  if (!otp) {
    res.status(400);
    throw new Error("Please enter OTP.");
  }
  const isSeller = await Seller.findOne({ "contactInformation.email": email });
  if (!isSeller) {
    res.status(404);
    throw new Error("No seller found with this Email.");
  }
  const isMatch = await bcrypt.compare(password, isSeller.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Password mismatched");
  }
  const otpValid = await Seller.findOne({
    $and: [{ "contactInformation.email": email }, { otp: otp }],
  });
  if (!otpValid) {
    res.status(400);
    throw new Error("OTP is invalid");
  }
  const token = generateToken(isSeller._id);
  res.cookie("token", token, {
    expiresIn: "1d",
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({
    message: "Seller logged in successfully",
    sellerInformation: isSeller.contactInformation,
    token,
  });
});

//GET
//Seller logout
const sellerLogout = asyncHandler(async (req, res) => {
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

//GET
//Get all seller
const getAllSeller = asyncHandler(async (req, res) => {
  const sellers = await Seller.find();
  if (sellers.length === 0) {
    res.status(404);
    throw new Error("No seller found.");
  }
  res.status(200).json(sellers);
});

//GET
//Get seller by ID
const getSellerById = asyncHandler(async (req, res) => {
  const sellerId = req.params.id;
  const seller = await Seller.findById({ _id: sellerId });
  if (!seller) {
    res.status(404);
    throw new Error("No seller found with this ID");
  } else {
    res.status(200).json(seller);
  }
});

//DELETE
//Delete seller
const deleteSeller = asyncHandler(async (req, res) => {
  const sellerId = req.params.id;
  const deletedSeller = await Seller.findByIdAndDelete(sellerId);
  if (!deletedSeller) {
    res.status(404);
    throw new Error("No seller found.");
  }
  res.status(200).json({
    message: "Seller deleted successfully.",
  });
});

//PUT
//Update password
const updatePassword = asyncHandler(async (req, res) => {
  const sellerId = req.user;
  const seller = await Seller.findById(sellerId);
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please fill all fields to update your password.");
  }
  const matchedPassword = await bcrypt.compare(
    currentPassword,
    seller.password
  );
  if (!matchedPassword) {
    res.status(400);
    throw new Error("Please provide your correct existing password.");
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    const updatedSeller = await Seller.findByIdAndUpdate(
      sellerId,
      { $set: { password: hashedNewPassword } },
      { new: true }
    );
  }
  return res.status(200).json({
    message: "Password updated successfully",
  });
});

//POST
//Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Please provide your Email.");
  }
  const seller = await Seller.findOne({ "contactInformation.email": email });
  if (!seller) {
    res.status(404);
    throw new Error("No seller found with this email id.");
  }
  const resetToken = await seller.createResetPasswordToken();
  // console.log(resetToken);
  await seller.save();

  const resetUrl = `<h1>Please follow this link to reset your password.</h1><br><h4><a href=http://localhost:3000/reset-password/${resetToken}>Click here.</a></h4>`;

  const data = {
    to: email,
    from: process.env.MAIL_ID,
    subject: "Forgot password link",
    text: "Hey Seller please follow this link.",
    html: resetUrl,
  };
  try {
    await sendEmail(data);
    res.status(200).json({
      message: "Email sent",
    });
  } catch (error) {
    seller.passwordResetToken = undefined;
    seller.passwordResetTokenExpires = undefined;
    seller.save();
    res.status(500);
    throw new Error("Some internal error occured");
  }
});

//PUT
//Reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error("Please provide your new password.");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedResetPassword = await bcrypt.hash(password, salt);
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const seller = await Seller.findOne({
    passwordResetToken: resetToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!seller) {
    res.status(400);
    throw new Error("Token is invalid or expired. Please try again later");
  }
  seller.password = hashedResetPassword;
  seller.passwordResetToken = undefined;
  seller.passwordResetTokenExpires = undefined;
  await seller.save();
  res.status(200).json({
    message: "Password changed successfully.",
  });
});

module.exports = {
  addSeller,
  sendOTP,
  getAllSeller,
  getSellerById,
  deleteSeller,
  sellerLogin,
  sellerLogout,
  updatePassword,
  forgotPassword,
  resetPassword,
};
