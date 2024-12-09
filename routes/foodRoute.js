const express = require("express");
const multer = require('multer');
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { getAllRelatedProductsController, getAllCategoryProductsController, getAllUniqueCategoriesController, getSingleFoodController, editFoodController, deleteFoodController, addFoodController, searchFoodsController, getAllFoodsController } = require("../controllers/foodController");
const router = express.Router();
const upload = multer();

router.post('/add', upload.array('images', 10), requireSignIn, isAdmin, addFoodController);
router.get('/get-foods', getAllFoodsController);
router.get('/categories', getAllUniqueCategoriesController);
router.get('/get-related-products/:categoryCode', getAllRelatedProductsController);
router.get('/category-products/:categoryName', getAllCategoryProductsController);
router.get('/single-food/:id', getSingleFoodController);
router.get('/search/:keyword', searchFoodsController);
router.put('/update-food/:id', upload.array('newImages', 10), requireSignIn, isAdmin, editFoodController);
router.delete('/delete-food/:id', requireSignIn, isAdmin, deleteFoodController);

module.exports = router;
