const mongoose = require("mongoose");
const crypto = require("crypto");
const sellerSchema = new mongoose.Schema(
  {
    businessInformation: {
      name: {
        type: String,
        required: [true, "Please provide your business name"],
      },
      type: {
        type: String,
        required: [true, "Please provide your business type"],
      },
      gstRegistrationNumber: {
        type: String,
        required: [true, "Please provide your GST number"],
      },
    },
    contactInformation: {
      name: {
        type: String,
        required: [true, "Please provide your full name"],
      },
      email: {
        type: String,
        required: [true, "Please provide your Email address"],
        unique: true,
      },
      phone: {
        type: String,
        required: [true, "Please provide your Phone number"],
        unique: true,
      },
      businessAddress: {
        type: String,
        required: [true, "Please provide your business address"],
      },
    },
    bankAccountDetails: {
      bankAccountNumber: {
        type: String,
        required: [true, "Please provide your bank account number"],
        unique: true,
      },
      ifscCode: {
        type: String,
        required: [true, "Please provide your IFSC code"],
      },
      accountHolderName: {
        type: String,
        required: [true, "Please provide account holder name"],
      },
    },
    taxInformation: {
      panCardDetails: {
        type: String,
        required: [true, "Please provide PAN card details"],
      },
      gstin: {
        type: String,
        required: [true, "Please provide GST number"],
      },
    },
    legalDocuments: {
      incorporationCertificate: {
        type: String,
        required: [true, "Please provide Incorporation Certificate"],
      },
      partnershipDeed: {
        type: String,
        required: [true, "Please provide Partnership deed"],
      },
      otherDocuments: {
        type: String,
      },
    }, //All fields are in Image

    identityProof: {
      adhaarCardOrPassport: {
        type: String,
        required: [true, "Please provide your any address proof"],
      },
      directorsOrPartnerIdentity: {
        type: String,
        required: [true, "Please provide your Director or partnership proof"],
      },
    }, //all fields are in Image
    password: {
      type: String,
      required: [true, "Please provide your password"],
    },
    otp: {
      type: Number,
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
  },
  { timestamps: true }
);

sellerSchema.methods.createResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  // console.log(resetToken, this.passwordResetToken);
  return resetToken;
};

module.exports = mongoose.model("Seller", sellerSchema);
