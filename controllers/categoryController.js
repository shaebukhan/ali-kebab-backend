const CategoryModel = require("../models/CategoryModel");
const slugify = require("slugify");

//create category
const createCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(401).send({
                message: "Name is Required"
            });
        }
        //existing category 
        const existingCategory = await CategoryModel.findOne({ name });
        if (existingCategory) {
            return res.status(200).send({
                success: true,
                message: "Category Already Exists !!"
            });
        }
        const category = await new CategoryModel({ name, slug: slugify(name) }).save();
        if (category) {
            return res.status(201).send({
                success: true,
                message: "New Category Created SuccessFully !!",
                category
            });
        } else {
            return res.status(500).send({
                success: false,
                message: "Error in creating Category Api !!"
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in creating Category Api",
            error
        });
    }

};

//update category 
const updateCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        const category = await CategoryModel.findByIdAndUpdate(id, { name, slug: slugify(name) }, { new: true });
        res.status(200).send({
            success: true,
            message: "Category Updated SuccessFully !!",
            category
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in update Category Api",
            error
        });
    }
};
//get all categories 
const categoryController = async (req, res) => {
    try {
        const category = await CategoryModel.find({});
        res.status(200).send({
            success: true,
            message: "All Categories listed SuccessFully !!",
            category
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting All Categories Api",
            error
        });
    }
};

//delete category controller 
const deleteCategoryController = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;
        const category = await CategoryModel.findByIdAndDelete(id);
        res.status(200).send({
            success: true,
            message: "Category Deleted SuccessFully !!",
            category
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in Delete Category Api",
            error
        });
    }
};
//single category controller 
const singleCategoryController = async (req, res) => {
    try {
        const category = await CategoryModel.findOne({ slug: req.params.slug });
        if (!category) {
            return res.status(404).send({
                success: false,
                message: "No category found with this Name",
            });
        }
        res.status(200).send({
            success: true,
            message: "Category found successfully",
            category
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error in getting single category",
            error
        });
    }
};



module.exports = { createCategoryController, updateCategoryController, categoryController, deleteCategoryController, singleCategoryController };