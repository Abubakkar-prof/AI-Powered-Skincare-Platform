const express = require('express');
const { protect } = require('../middleware/auth');
const Routine = require('../models/Routine');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();

// @route   GET api/routines
// @desc    Get user's routines
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const routines = await Routine.find({ userId: req.user.id }).populate('items.productId', 'name brand price images');
    
    res.json({ routines });
  } catch (error) {
    console.error('Get routines error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/routines
// @desc    Create a new routine
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, type, items } = req.body;
    
    if (!name || !type || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: 'Name, type, and items are required' });
    }
    
    // Validate that all products exist
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    
    if (products.length !== productIds.length) {
      return res.status(404).json({ msg: 'One or more products not found' });
    }
    
    const routine = new Routine({
      userId: req.user.id,
      name,
      type,
      items: items.map((item, index) => ({
        productId: item.productId,
        productName: products.find(p => p._id.toString() === item.productId.toString())?.name,
        usageTime: item.usageTime || 'both',
        order: item.order || index + 1,
        notes: item.notes || ''
      }))
    });
    
    await routine.save();
    
    res.json({
      msg: 'Routine created successfully',
      routine: await routine.populate('items.productId', 'name brand price images')
    });
  } catch (error) {
    console.error('Create routine error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT api/routines/:id
// @desc    Update a routine
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, type, items, isActive } = req.body;
    
    const routine = await Routine.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!routine) {
      return res.status(404).json({ msg: 'Routine not found' });
    }
    
    if (name) routine.name = name;
    if (type) routine.type = type;
    if (items && Array.isArray(items)) {
      // Validate products exist
      const productIds = items.map(item => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      
      routine.items = items.map((item, index) => ({
        productId: item.productId,
        productName: products.find(p => p._id.toString() === item.productId.toString())?.name,
        usageTime: item.usageTime || 'both',
        order: item.order || index + 1,
        notes: item.notes || ''
      }));
    }
    if (isActive !== undefined) routine.isActive = isActive;
    
    await routine.save();
    
    res.json({
      msg: 'Routine updated successfully',
      routine: await routine.populate('items.productId', 'name brand price images')
    });
  } catch (error) {
    console.error('Update routine error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE api/routines/:id
// @desc    Delete a routine
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const routine = await Routine.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!routine) {
      return res.status(404).json({ msg: 'Routine not found' });
    }
    
    res.json({ msg: 'Routine deleted successfully' });
  } catch (error) {
    console.error('Delete routine error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/routines/:id/complete
// @desc    Mark routine as completed for today
// @access  Private
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const routine = await Routine.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!routine) {
      return res.status(404).json({ msg: 'Routine not found' });
    }
    
    routine.isCompleted = true;
    routine.completedAt = new Date();
    
    await routine.save();
    
    res.json({
      msg: 'Routine marked as completed',
      routine
    });
  } catch (error) {
    console.error('Complete routine error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/routines/:id/reset
// @desc    Reset routine completion status
// @access  Private
router.post('/:id/reset', protect, async (req, res) => {
  try {
    const routine = await Routine.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!routine) {
      return res.status(404).json({ msg: 'Routine not found' });
    }
    
    routine.isCompleted = false;
    routine.completedAt = undefined;
    
    await routine.save();
    
    res.json({
      msg: 'Routine reset successfully',
      routine
    });
  } catch (error) {
    console.error('Reset routine error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/routines/suggested
// @desc    Get suggested routine based on skin profile
// @access  Private
router.get('/suggested', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('skinProfile');
    
    if (!user || !user.skinProfile) {
      return res.status(400).json({ msg: 'No skin profile found, please complete skin analysis first' });
    }
    
    // Generate routine based on skin profile
    const suggestedRoutine = generateSuggestedRoutine(user.skinProfile);
    
    res.json({ suggestedRoutine });
  } catch (error) {
    console.error('Get suggested routine error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Helper function to generate suggested routine based on skin profile
function generateSuggestedRoutine(skinProfile) {
  const routine = {
    morning: [],
    evening: []
  };
  
  // Morning routine based on skin type and concerns
  routine.morning.push({
    step: 1,
    product: 'Gentle Cleanser',
    purpose: 'Cleanse without stripping natural oils',
    skinTypes: ['all', 'sensitive', 'dry', 'combination', 'oily']
  });
  
  if (skinProfile.skinConcerns.includes('dehydration')) {
    routine.morning.push({
      step: 2,
      product: 'Hydrating Serum',
      purpose: 'Boost moisture levels',
      ingredient: 'Hyaluronic Acid'
    });
  }
  
  if (skinProfile.skinConcerns.includes('aging') || skinProfile.skinConcerns.includes('dark_spots')) {
    routine.morning.push({
      step: 3,
      product: 'Vitamin C Serum',
      purpose: 'Antioxidant protection and brightening',
      ingredient: 'Vitamin C'
    });
  }
  
  routine.morning.push({
    step: 4,
    product: 'Moisturizer',
    purpose: 'Lock in hydration',
    skinTypes: [skinProfile.skinType]
  });
  
  routine.morning.push({
    step: 5,
    product: 'SPF 30+',
    purpose: 'Protect from UV damage',
    essential: true
  });
  
  // Evening routine based on skin type and concerns
  routine.evening.push({
    step: 1,
    product: 'Gentle Cleanser',
    purpose: 'Remove makeup and impurities',
    skinTypes: ['all', 'sensitive', 'dry', 'combination', 'oily']
  });
  
  if (skinProfile.skinConcerns.includes('acne') || skinProfile.skinConcerns.includes('texture')) {
    routine.evening.push({
      step: 2,
      product: 'Exfoliating Treatment',
      purpose: 'Improve skin texture (2-3 times per week)',
      ingredient: 'Salicylic Acid or Glycolic Acid'
    });
  }
  
  if (skinProfile.skinConcerns.includes('aging') || skinProfile.skinConcerns.includes('dark_spots')) {
    routine.evening.push({
      step: 3,
      product: 'Retinol Treatment',
      purpose: 'Address aging concerns',
      ingredient: 'Retinol'
    });
  }
  
  routine.evening.push({
    step: 4,
    product: 'Treatment Serum',
    purpose: 'Target specific concerns',
    ingredient: skinProfile.skinConcerns.includes('dark_spots') ? 'Niacinamide' : 'Peptides'
  });
  
  routine.evening.push({
    step: 5,
    product: 'Night Cream',
    purpose: 'Intensive repair and hydration',
    skinTypes: [skinProfile.skinType]
  });
  
  return routine;
}

module.exports = router;