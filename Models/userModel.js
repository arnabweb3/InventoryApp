const mongoose = require("mongoose");
const crypto = require("crypto");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please add your First name"],
    },
    lastName: {
      type: String,
      required: [true, "Please add your Last name"],
    },
    userName: {
      type: String,
      required: [true, "Please add your User name"],
    },
    email: {
      type: String,
      required: [true, "Please add your Email"],
      unique: true,
    },
    countryCode: {
      type: String,
      required: [true, "Please add your country code"],
      default: "+91",
    },
    phoneNumber: {
      type: Number,
      required: [true, "Please add your Phone number"],
      minLength: 10,
      maxLength: 10,
    },
    password: {
      type: String,
      required: [true, "Please add your Password"],
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "inActive"],
      required: true,
    },
    role: {
      type: [],
      required: true,
    },
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true }
);

userSchema.methods.createResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  // console.log(resetToken, this.passwordResetToken);
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
