process.env.NODE_ENV = "test";
const Product = require("../Models/productModel");

after((done) => {
  Product.deleteMany({}).then(success=>done()).catch((err)=>console.log(err))
});


