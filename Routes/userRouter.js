const express = require("express");
const {
  createUser,
  loginUser,
  getUser,
  updateUser,
  logoutUser,
  getAllUsers,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteUser,
} = require("../Controllers/userController");
const { validateToken } = require("../Middleware/validateTokenhandler");

const router = express.Router();

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/logout", validateToken, logoutUser);
router.get("/getUser", validateToken, getUser);
router.get("/getAllUsers", validateToken, getAllUsers);
router.put("/", validateToken, updateUser);
router.put("/updatePassword", validateToken, updatePassword);
router.put("/deleteUser/:id", validateToken, deleteUser);
router.post("/forgotPassword", forgotPassword);
router.put("/resetPassword/:token", resetPassword);

module.exports = router;
