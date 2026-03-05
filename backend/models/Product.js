const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'treatment', 'mask', 'eye_care', 'lip_care']
  },
  ingredients: [{
    name: String,
    percentage: Number,
    function: String
  }],
  skinTypes: [{
    type: String,
    enum: ['normal', 'oily', 'dry', 'combination', 'sensitive']
  }],
  skinConcerns: [{
    type: String,
    enum: ['acne', 'aging', 'dark_spots', 'dehydration', 'sensitivity', 'texture']
  }],
  conflictIngredients: [{
    type: String
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  images: [{
    url: String,
    alt: String
  }],
  videoUrl: String,
  inStock: {
    type: Boolean,
    default: true
  },
  inventory: {
    quantity: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);