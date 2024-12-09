const FoodModel = require('../models/FoodModel');
const cloudinary = require("../utilis/cloudinaryConfig");



const addFoodController = async (req, res) => {
    try {
        const { title, description, price, discount, category } = req.body;
        const files = req.files; // Files are available in req.files
        // Initialize imageUrls array
        let imageUrls = [];

        // Check if files exist in the request
        if (files && files.length > 0) {
            // Upload each file to Cloudinary using buffer
            const uploadPromises = files.map(file => {
                return new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { resource_type: 'auto' }, // Auto-detect file type (image or PDF)
                        (error, result) => {
                            if (error) {
                                reject(error); // Reject the promise if there's an error
                            } else {
                                imageUrls.push(result.secure_url); // Add the URL to imageUrls
                                resolve(); // Resolve the promise when upload is done
                            }
                        }
                    ).end(file.buffer); // Send the buffer to Cloudinary
                });
            });

            // Wait for all uploads to complete
            await Promise.all(uploadPromises); // Wait for all uploads to finish

        }

        // Calculate sale price
        const salePrice = discount ? price - (price * discount / 100) : price;

        // Save food data to the database
        const food = new FoodModel({
            title,
            description,
            price,
            discount,
            category,
            sprice: salePrice,
            images: imageUrls,
        });

        // Save the food item in the database
        const savedFood = await food.save();

        // Send a successful response with the saved food item
        return res.status(201).json({ success: true, message: 'Food added successfully', food: savedFood });
    } catch (error) {
        console.error('Error saving food:', error);
        return res.status(500).json({ success: false, message: 'Error saving food', error });
    }
};



//get all products
const getAllProductsController = async (req, res) => {
    try {
        // Fetch 100 random products using MongoDB's aggregation with $sample
        const products = await ProductModel.aggregate([
            { $sample: { size: 100 } } // Randomly select 100 products
        ]);

        res.status(200).json({ success: true, products });
    } catch (error) {
        // Handle any errors that occur during the database operation
        res.status(500).json({ message: 'Error retrieving products', error });
    }
};
//get categories unique 

const getAllUniqueCategoriesController = async (req, res) => {
    try {
        // Fetch unique category names
        const categories = await ProductModel.distinct("categoryName");

        res.status(200).json({ success: true, categories });
    } catch (error) {
        // Handle any errors that occur during the database operation
        res.status(500).json({ success: false, message: 'Error retrieving categories', error });
    }
};


//related products
const getAllRelatedProductsController = async (req, res) => {
    try {
        const { categoryCode } = req.params;
        const excludeId = req.query.exclude; // Update to match the frontend query param
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (!categoryCode) {
            return res.status(400).json({ success: false, message: 'Category code is required' });
        }

        // Prepare the filter object with ObjectId
        const filter = {
            categoryCode,
            ...(excludeId ? { _id: { $ne: excludeId } } : {}) // Exclude the specific product ID if provided
        };

        const totalProducts = await ProductModel.countDocuments(filter);
        const relatedProducts = await ProductModel.find(filter)
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            relatedProducts,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving products', error });
    }
};
//get all total 

const getTotalProductsController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Get the total number of products
        const totalProducts = await ProductModel.countDocuments();

        // Fetch products with pagination
        const products = await ProductModel.find()
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            products,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving products', error });
    }
};



//category products 

const getAllCategoryProductsController = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (!categoryName) {
            return res.status(400).json({ success: false, message: 'Category is required' });
        }

        // Define the filter based on the categoryName
        const filter = { categoryName };  // Assuming 'categoryName' is the correct field in your Product model

        // Count total products for pagination
        const totalProducts = await ProductModel.countDocuments(filter);

        // Fetch products with pagination
        const relatedProducts = await ProductModel.find(filter)
            .skip((page - 1) * limit) // Skip items for previous pages
            .limit(limit); // Limit the results to the specified amount per page

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            relatedProducts,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error retrieving products', error });
    }
};
//search product
const searchFoodsController = async (req, res) => {
    try {
        const { keyword } = req.params;
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 20; // Default limit of 20 items per page
        const skip = (page - 1) * limit;

        // Search query for food items
        const searchCriteria = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { category: { $regex: keyword, $options: "i" } },

            ],
        };

        // Fetch total count of results for pagination
        const totalResults = await FoodModel.countDocuments(searchCriteria);
        const results = await FoodModel.find(searchCriteria).skip(skip).limit(limit);

        if (!results.length) {
            return res.status(404).json({
                success: false,
                message: "No matching food items found",
            });
        }

        res.status(200).json({
            success: true,
            results,
            totalResults,
            totalPages: Math.ceil(totalResults / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error("Error in Search Food API:", error);
        res.status(500).json({
            success: false,
            message: "Error in Search Food API",
            error: error.message,
        });
    }
};




//update 
const editFoodController = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, discount, category, existingImages = [] } = req.body; // Destructure and default existingImages to an empty array if not provided
        const files = req.files; // Uploaded files
        let newImageUrls = []; // Array to store new image URLs

        // Find the food item in the database
        const food = await FoodModel.findById(id);
        if (!food) {
            return res.status(404).json({ success: false, message: 'Food not found' });
        }

        // Upload new images if files are provided
        if (files && files.length > 0) {
            const uploadPromises = files.map((file) => {
                return new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { resource_type: 'auto' },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                newImageUrls.push(result.secure_url); // Add new image URL to the array
                                resolve();
                            }
                        }
                    ).end(file.buffer);
                });
            });

            // Wait for all images to upload
            await Promise.all(uploadPromises);
        }

        // Determine images to retain (existing images that aren't deleted by the user)
        const imagesToKeep = existingImages;

        // Determine images to delete (those not present in existingImages)
        const imagesToDelete = food.images.filter((img) => !imagesToKeep.includes(img));

        // Delete removed images from Cloudinary
        if (imagesToDelete.length > 0) {
            const deletePromises = imagesToDelete.map((image) => {
                const publicId = image.split('/').pop().split('.')[0]; // Extract public ID from URL
                return cloudinary.uploader.destroy(publicId); // Remove from Cloudinary
            });
            await Promise.all(deletePromises); // Wait for all deletions
        }

        // Update food item details
        food.title = title || food.title;
        food.description = description || food.description;
        food.price = price || food.price;
        food.discount = discount || food.discount;
        food.category = category || food.category;

        // Calculate sale price after discount
        const calculatedSalePrice = food.price - (food.price * (food.discount / 100));
        food.sprice = parseFloat(calculatedSalePrice.toFixed(2)); // Ensure price is a float with 2 decimal places

        // Combine retained images with newly uploaded ones
        food.images = [...imagesToKeep, ...newImageUrls];

        // Save the updated food item
        await food.save();

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Food updated successfully',
            food,
        });
    } catch (error) {
        console.error('Error updating food:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating food',
            error,
        });
    }
};


const getAllFoodsController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 20; // Default limit of 20 items per page
        const skip = (page - 1) * limit;

        // Fetch paginated foods
        const totalFoods = await FoodModel.countDocuments(); // Total number of food items
        const foods = await FoodModel.find().skip(skip).limit(limit);

        if (!foods.length) {
            return res.status(200).json({ success: false, message: "No food items found" });
        }

        return res.status(200).json({
            success: true,
            foods,
            totalPages: Math.ceil(totalFoods / limit),
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching all foods:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching all foods",
            error,
        });
    }
};

const getSingleFoodController = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the food by ID
        const food = await FoodModel.findById(id);

        if (!food) {
            return res.status(404).json({ success: false, message: 'Food item not found' });
        }

        return res.status(200).json({ success: true, message: 'Food item retrieved successfully', food });
    } catch (error) {
        console.error('Error fetching food:', error);
        return res.status(500).json({ success: false, message: 'Error fetching food', error });
    }
};


const deleteFoodController = async (req, res) => {
    try {
        const { id } = req.params;

        const food = await FoodModel.findById(id);
        if (!food) {
            return res.status(200).json({ success: false, message: 'Food not found' });
        }

        // Delete images from Cloudinary
        const deletePromises = food.images.map(image => {
            const publicId = image.split('/').pop().split('.')[0];
            return cloudinary.uploader.destroy(publicId);
        });
        await Promise.all(deletePromises);

        await FoodModel.findByIdAndDelete(id);

        return res.status(200).json({ success: true, message: 'Food deleted successfully' });
    } catch (error) {
        console.error('Error deleting food:', error);
        return res.status(500).json({ success: false, message: 'Error deleting food', error });
    }
};



module.exports = { addFoodController, getAllProductsController, getSingleFoodController, editFoodController, deleteFoodController, getAllRelatedProductsController, getAllCategoryProductsController, getAllFoodsController, getAllUniqueCategoriesController, searchFoodsController, getTotalProductsController };
