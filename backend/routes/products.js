const express = require('express');
const { protect } = require('../middleware/auth');
const Product = require('../models/Product');
const ingredientService = require('../services/ingredientService');

const router = express.Router();

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, brand, search, page = 1, limit = 12 } = req.query;
    
    // Build query
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (brand) {
      query.brand = new RegExp(brand, 'i');
    }
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'ingredients.name': new RegExp(search, 'i') }
      ];
    }
    
    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/products/check-compatibility
// @desc    Check if products are compatible for user
// @access  Private
router.post('/check-compatibility', protect, async (req, res) => {
  try {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({ msg: 'At least two product IDs are required' });
    }
    
    // Get products from database
    const products = await Product.find({ _id: { $in: productIds } });
    
    if (products.length !== productIds.length) {
      return res.status(404).json({ msg: 'One or more products not found' });
    }
    
    // Extract all ingredients from products
    const allIngredients = [];
    const productIngredients = {};
    
    products.forEach(product => {
      const ingredientNames = product.ingredients.map(ing => ing.name.toLowerCase());
      allIngredients.push(...ingredientNames);
      productIngredients[product._id] = ingredientNames;
    });
    
    // Check for conflicts
    const conflicts = ingredientService.checkConflicts(allIngredients);
    
    // For each product, also check against user's skin profile if available
    const userConflicts = [];
    
    // This would check against user's skin profile in the future
    // For now, we'll just return general conflicts
    
    res.json({
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        ingredients: p.ingredients
      })),
      conflicts,
      hasConflicts: conflicts.length > 0,
      message: conflicts.length > 0 
        ? 'Potential conflicts detected between products' 
        : 'These products appear to be compatible'
    });
  } catch (error) {
    console.error('Check product compatibility error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/products/:id/review
// @desc    Add a review for a product
// @access  Private
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment, skinType, skinConcerns } = req.body;
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Add review
    const review = {
      user: req.user.id,
      rating,
      comment,
      skinType,
      skinConcerns: skinConcerns || [],
      date: Date.now()
    };
    
    product.reviews.push(review);
    
    // Recalculate average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating.average = totalRating / product.reviews.length;
    product.rating.count = product.reviews.length;
    
    await product.save();
    
    res.json({
      msg: 'Review added successfully',
      product: {
        id: product._id,
        rating: product.rating
      }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;
    
    const products = await Product.find({ category })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments({ category });
    
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;