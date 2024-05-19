const express = require("express");
// const fileUpload = require("../Middleware/upload");
const {
  addSeller,
  getAllSeller,
  getSellerById,
  deleteSeller,
  sellerLogin,
  sendOTP,
  sellerLogout,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require("../Controllers/sellerController");
const { uploadPicture } = require("../utils/awsFunction");
const { validateToken } = require("../Middleware/validateTokenhandler");

const router = express.Router();

router.post(
  "/",
  uploadPicture.fields([
    { name: "legalDocuments[incorporationCertificate]", maxCount: 1 },
    { name: "legalDocuments[partnershipDeed]", maxCount: 1 },
    { name: "legalDocuments[otherDocuments]", maxCount: 1 },
    { name: "identityProof[adhaarCardOrPassport]", maxCount: 1 },
    { name: "identityProof[directorsOrPartnerIdentity]", maxCount: 1 },
  ]),
  addSeller
);
router.post("/sendOtp", sendOTP);
router.post("/login", sellerLogin);
router.get("/logout", validateToken, sellerLogout);
router.get("/", getAllSeller);
router.get("/getSeller/:id", getSellerById);
router.delete("/:id", validateToken, deleteSeller);
router.put("/updatePassword", validateToken, updatePassword);
router.post("/forgotPassword", forgotPassword);
router.put("/resetPassword/:token", resetPassword);

module.exports = router;
