const express = require('express');
const { protect } = require('../middleware/auth');
const ingredientService = require('../services/ingredientService');

const router = express.Router();

// @route   GET api/ingredients
// @desc    Get all ingredients
// @access  Public
router.get('/', (req, res) => {
  try {
    const ingredients = ingredientService.getAllIngredients();
    res.json({ ingredients });
  } catch (error) {
    console.error('Get ingredients error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/ingredients/search
// @desc    Search for an ingredient
// @access  Public
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    const ingredient = ingredientService.findIngredient(q);
    
    if (!ingredient) {
      return res.status(404).json({ msg: 'Ingredient not found' });
    }
    
    res.json({ ingredient });
  } catch (error) {
    console.error('Search ingredient error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/ingredients/:id
// @desc    Get ingredient details by ID
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const ingredient = ingredientService.getIngredientById(id);
    
    if (!ingredient) {
      return res.status(404).json({ msg: 'Ingredient not found' });
    }
    
    res.json({ ingredient });
  } catch (error) {
    console.error('Get ingredient details error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/ingredients/check-conflict
// @desc    Check for conflicts between ingredients
// @access  Public
router.post('/check-conflict', (req, res) => {
  try {
    const { ingredients } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length < 2) {
      return res.status(400).json({ msg: 'At least two ingredients are required' });
    }
    
    const conflicts = ingredientService.checkConflicts(ingredients);
    
    res.json({ 
      conflicts,
      hasConflicts: conflicts.length > 0,
      message: conflicts.length > 0 
        ? 'Conflicts detected between ingredients' 
        : 'No conflicts detected'
    });
  } catch (error) {
    console.error('Check conflict error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/ingredients/product-conflict
// @desc    Check for conflicts between product ingredients
// @access  Private
router.post('/product-conflict', protect, (req, res) => {
  try {
    const { product1Ingredients, product2Ingredients } = req.body;
    
    if (!product1Ingredients || !Array.isArray(product1Ingredients) ||
        !product2Ingredients || !Array.isArray(product2Ingredients)) {
      return res.status(400).json({ msg: 'Both product ingredient lists are required' });
    }
    
    // Combine ingredients from both products
    const allIngredients = [...product1Ingredients, ...product2Ingredients];
    const conflicts = ingredientService.checkConflicts(allIngredients);
    
    res.json({ 
      conflicts,
      hasConflicts: conflicts.length > 0,
      message: conflicts.length > 0 
        ? 'Potential conflicts detected between products' 
        : 'No conflicts detected between products'
    });
  } catch (error) {
    console.error('Check product conflict error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/ingredients/by-concern/:concern
// @desc    Get ingredients for specific skin concern
// @access  Public
router.get('/by-concern/:concern', (req, res) => {
  try {
    const { concern } = req.params;
    
    const ingredients = ingredientService.getIngredientsForConcerns([concern]);
    
    res.json({ 
      concern,
      ingredients,
      count: ingredients.length 
    });
  } catch (error) {
    console.error('Get ingredients by concern error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/ingredients/by-skin-type/:skinType
// @desc    Get ingredients suitable for specific skin type
// @access  Public
router.get('/by-skin-type/:skinType', (req, res) => {
  try {
    const { skinType } = req.params;
    
    const ingredients = ingredientService.getIngredientsForSkinType(skinType);
    
    res.json({ 
      skinType,
      ingredients,
      count: ingredients.length 
    });
  } catch (error) {
    console.error('Get ingredients by skin type error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;