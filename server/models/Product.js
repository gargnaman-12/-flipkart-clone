const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  brand: { type: String, default: 'Flipkart' },
  category: { type: String, index: true, default: 'General' },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, min: 0 },
  discountPercent: { type: Number, min: 0, max: 95 },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  description: { type: String, default: '' },
  highlights: { type: [String], default: [] },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  ratingCount: { type: Number, min: 0, default: 0 },
  reviews: { type: [reviewSchema], default: [] },
  inStock: { type: Boolean, default: true }
});

module.exports = mongoose.model('Product', productSchema);