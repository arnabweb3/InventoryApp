const mongoose = require("mongoose");
const { MONGODB_URI_DEV, MONGODB_URI_TEST } = process.env;

let mongoDbUri =
  process.env.NODE_ENV === "development" ||
  process.env.NODE_ENV === "production"
    ? MONGODB_URI_DEV
    : MONGODB_URI_TEST;

const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(mongoDbUri);
    console.log(`DATABASE CONNECTED AT :-> ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { dbConnect };
