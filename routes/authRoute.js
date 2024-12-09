const express = require("express");
const { registerController, loginController, forgotPasswordController, logoutController, resetPasswordController, getAlluserController, profileUpdateController, addUserAdminController, getSingleUserController, userUpdateController, getAllData, deleteUserController } = require("../controllers/authController");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

//Register Route
router.post("/register", registerController);

//login route
router.post("/login", loginController);

//logout
router.post("/logout", logoutController);
//Forgot password 
router.post("/forgot-password", forgotPasswordController);
//reset password 
router.post("/reset-password/:token", resetPasswordController);
//get all data 
router.get("/all-data", requireSignIn, isAdmin, getAllData);
//get all users
router.get("/get-users", requireSignIn, isAdmin, getAlluserController);

//update profile
router.post("/update-profile/:id", requireSignIn, profileUpdateController);
//update user 
router.post("/update-user/:id", requireSignIn, isAdmin, userUpdateController);
//add user by admin 
router.post("/add-user", requireSignIn, isAdmin, addUserAdminController);
//get single user 
router.get("/get-user/:id", requireSignIn, isAdmin, getSingleUserController);
router.delete("/delete-user/:id", requireSignIn, isAdmin, deleteUserController);


module.exports = router;