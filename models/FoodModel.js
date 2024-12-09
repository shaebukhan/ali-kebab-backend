const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    sprice: { type: Number, },
    discount: { type: Number, required: false, default: 0 },
    category: { type: String, required: true },
    images: { type: [String], required: false, default: [] },
}, {
    timestamps: true
});

module.exports = mongoose.model('Food', FoodSchema);
