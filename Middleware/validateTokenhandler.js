const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

//Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("Unauthorized Access");
      }

      req.user = decoded.id;
      next();
    });
  }
  if (!token) {
    res.status(401);
    throw new Error("Unauthorized Access");
  }
});

// Validation by Cookie

// const validateToken = asyncHandler(async (req, res, next) => {
//   // console.log(req.cookies);
//   const { token } = req.cookies;
//   // console.log(token);
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       res.status(401);
//       throw new Error("Unauthorized Access");
//     }
//     req.user = decoded.id;
//     next();
//   });
//   if (!token) {
//     res.status(404);
//     throw new Error("Unauthorized Access");
//   }
// });

module.exports = { validateToken, generateToken };
