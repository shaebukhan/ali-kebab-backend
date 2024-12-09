const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { createCategoryController, updateCategoryController, categoryController, deleteCategoryController, singleCategoryController } = require("../controllers/categoryController");
const router = express.Router();
//routes 
//create category
router.post('/create-category', requireSignIn, isAdmin, createCategoryController);
//update category 
router.put("/update-category/:id", requireSignIn, isAdmin, updateCategoryController);
//All categories 
router.get("/get-category", categoryController);
//get single category
router.get("/single-category/:slug", singleCategoryController);
//delete category 
router.delete("/delete-category/:id", requireSignIn, isAdmin, deleteCategoryController);

module.exports = router;