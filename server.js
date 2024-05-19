const express = require("express");
const dotenv = require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { dbConnect } = require("./Connection/dbConnect");
const errorHandler = require("./Middleware/errorHandler");

//Importing Routes
const adminRoutes = require("./Routes/adminRoutes");
const userRoute = require("./Routes/userRouter");
const productRouter = require("./Routes/productRouter");
const sellerRouter = require("./Routes/sellerRouter");
const discountRoutes = require("./Routes/discountRoutes");
const couponRoutes = require("./Routes/couponRoutes");
const categoryRoutes = require("./Routes/categoryRoutes");
const cartRoutes = require("./Routes/cartRoutes");
const brandRoutes = require("./Routes/brandRouter");
const subCategoryRoutes = require("./Routes/subCategoryRoutes");
const childCategoryRoutes = require("./Routes/childCategoryRoutes");

const port = process.env.PORT || 4000;

const app = express();
dbConnect();
app.use(
  cors({
    origin: ["http://localhost:3000", "https://snow-ui-kappa.vercel.app"],
    // origin: "http://localhost:3000",
    // origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/", (req, res) => {
  res.send(`Inventory -> Server Running Successfully"!`);
});

app.use("/api/users", userRoute);
app.use("/api/products", productRouter);
app.use("/api/sellers", sellerRouter);
app.use("/api/discount", discountRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/subCategory", subCategoryRoutes);
app.use("/api/childCategory", childCategoryRoutes);

app.use(errorHandler);
module.exports = app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
