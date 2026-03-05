const express = require('express');
const { protect } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const User = require('../models/User');

const router = express.Router();

// @route   GET api/subscriptions
// @desc    Get user's subscriptions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.id })
      .populate('items.productId', 'name brand price images');
    
    res.json({ subscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/subscriptions
// @desc    Create a new subscription
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, items, frequency, discountPercentage } = req.body;
    
    if (!name || !items || !Array.isArray(items) || items.length === 0 || !frequency) {
      return res.status(400).json({ msg: 'Name, items, and frequency are required' });
    }
    
    // Validate that all products exist
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    
    if (products.length !== productIds.length) {
      return res.status(404).json({ msg: 'One or more products not found' });
    }
    
    // Calculate total amount
    let totalAmount = 0;
    items.forEach(item => {
      const product = products.find(p => p._id.toString() === item.productId.toString());
      if (product) {
        totalAmount += product.price * (item.quantity || 1);
      }
    });
    
    // Apply discount if applicable
    if (discountPercentage && discountPercentage > 0) {
      totalAmount = totalAmount * (1 - discountPercentage / 100);
    }
    
    // Calculate next delivery date based on frequency
    const nextDelivery = calculateNextDelivery(frequency);
    
    const subscription = new Subscription({
      userId: req.user.id,
      name,
      items: items.map(item => ({
        productId: item.productId,
        productName: products.find(p => p._id.toString() === item.productId.toString())?.name,
        quantity: item.quantity || 1,
        frequency: item.frequency || frequency
      })),
      frequency,
      discountPercentage: discountPercentage || 0,
      totalAmount,
      nextDelivery
    });
    
    await subscription.save();
    
    res.json({
      msg: 'Subscription created successfully',
      subscription: await subscription.populate('items.productId', 'name brand price images')
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT api/subscriptions/:id
// @desc    Update a subscription
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, items, frequency, discountPercentage, isActive } = req.body;
    
    const subscription = await Subscription.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!subscription) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }
    
    if (name) subscription.name = name;
    if (frequency) {
      subscription.frequency = frequency;
      subscription.nextDelivery = calculateNextDelivery(frequency);
    }
    if (discountPercentage !== undefined) subscription.discountPercentage = discountPercentage;
    if (isActive !== undefined) subscription.isActive = isActive;
    
    if (items && Array.isArray(items)) {
      // Validate products exist
      const productIds = items.map(item => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      
      subscription.items = items.map(item => ({
        productId: item.productId,
        productName: products.find(p => p._id.toString() === item.productId.toString())?.name,
        quantity: item.quantity || 1,
        frequency: item.frequency || frequency
      }));
      
      // Recalculate total amount
      let totalAmount = 0;
      subscription.items.forEach(item => {
        const product = products.find(p => p._id.toString() === item.productId.toString());
        if (product) {
          totalAmount += product.price * item.quantity;
        }
      });
      
      // Apply discount if applicable
      if (subscription.discountPercentage && subscription.discountPercentage > 0) {
        totalAmount = totalAmount * (1 - subscription.discountPercentage / 100);
      }
      
      subscription.totalAmount = totalAmount;
    }
    
    await subscription.save();
    
    res.json({
      msg: 'Subscription updated successfully',
      subscription: await subscription.populate('items.productId', 'name brand price images')
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE api/subscriptions/:id
// @desc    Cancel a subscription
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!subscription) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }
    
    res.json({ msg: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/subscriptions/:id/activate
// @desc    Activate a subscription
// @access  Private
router.post('/:id/activate', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!subscription) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }
    
    subscription.isActive = true;
    subscription.nextDelivery = calculateNextDelivery(subscription.frequency);
    
    await subscription.save();
    
    res.json({
      msg: 'Subscription activated successfully',
      subscription
    });
  } catch (error) {
    console.error('Activate subscription error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/subscriptions/:id/skip
// @desc    Skip next delivery
// @access  Private
router.post('/:id/skip', protect, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!subscription) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }
    
    // Calculate new next delivery date
    subscription.nextDelivery = calculateNextDelivery(subscription.frequency, true);
    
    await subscription.save();
    
    res.json({
      msg: 'Next delivery skipped',
      subscription
    });
  } catch (error) {
    console.error('Skip delivery error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/subscriptions/suggested
// @desc    Get suggested subscription based on routine
// @access  Private
router.get('/suggested', protect, async (req, res) => {
  try {
    // This would analyze user's routine and suggest products for subscription
    // For now, return a generic suggestion based on skin profile
    
    const user = await User.findById(req.user.id).select('skinProfile routines');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Generate suggested subscription based on skin profile and routine
    const suggestedSubscription = generateSuggestedSubscription(user);
    
    res.json({ suggestedSubscription });
  } catch (error) {
    console.error('Get suggested subscription error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Helper function to calculate next delivery date
function calculateNextDelivery(frequency, skipCurrent = false) {
  const now = new Date();
  let nextDelivery = new Date(now);
  
  switch (frequency) {
    case 'weekly':
      nextDelivery.setDate(nextDelivery.getDate() + (skipCurrent ? 14 : 7));
      break;
    case 'biweekly':
      nextDelivery.setDate(nextDelivery.getDate() + (skipCurrent ? 28 : 14));
      break;
    case 'monthly':
      nextDelivery.setMonth(nextDelivery.getMonth() + (skipCurrent ? 2 : 1));
      break;
    case 'bimonthly':
      nextDelivery.setMonth(nextDelivery.getMonth() + (skipCurrent ? 4 : 2));
      break;
    default:
      nextDelivery.setDate(nextDelivery.getDate() + 30); // Default to monthly
  }
  
  return nextDelivery;
}

// Helper function to generate suggested subscription
function generateSuggestedSubscription(user) {
  // This would analyze user's routine and skin profile to suggest products
  // For now, return a generic suggestion based on skin concerns
  
  const suggestions = [];
  
  if (user.skinProfile?.skinConcerns?.includes('dehydration')) {
    suggestions.push({
      product: 'Hydrating Serum',
      reason: 'Based on your skin analysis showing dehydration concerns',
      frequency: 'monthly',
      quantity: 1
    });
  }
  
  if (user.skinProfile?.skinConcerns?.includes('aging')) {
    suggestions.push({
      product: 'Retinol Treatment',
      reason: 'Recommended for anti-aging based on your age range',
      frequency: 'monthly',
      quantity: 1
    });
  }
  
  if (user.skinProfile?.skinConcerns?.includes('acne')) {
    suggestions.push({
      product: 'Salicylic Acid Cleanser',
      reason: 'Helps manage acne concerns',
      frequency: 'monthly',
      quantity: 1
    });
  }
  
  // Add moisturizer as essential
  suggestions.push({
    product: 'Daily Moisturizer',
    reason: 'Essential for maintaining skin barrier',
    frequency: 'monthly',
    quantity: 1
  });
  
  // Calculate potential savings
  const discountPercentage = suggestions.length > 1 ? 15 : 0; // 15% discount for multi-item subscription
  
  return {
    name: 'Personalized Essentials',
    items: suggestions,
    discountPercentage,
    estimatedSavings: discountPercentage > 0 ? '$15.00' : '$0.00',
    frequency: 'monthly'
  };
}

module.exports = router;