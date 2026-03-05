const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const skinAnalysisService = require('../services/skinAnalysisService');
const User = require('../models/User');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage(); // Store in memory temporarily
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @route   POST api/skin-analysis/analyze
// @desc    Analyze skin from uploaded image
// @access  Private
router.post('/analyze', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No image file provided' });
    }

    // Process and analyze the image
    const imagePath = await skinAnalysisService.processImage(req.file);
    const analysis = await skinAnalysisService.analyzeSkin(imagePath);
    
    // Generate recommendations
    const recommendations = await skinAnalysisService.generateRecommendations(analysis);
    
    // Update user's skin profile
    const user = await User.findById(req.user.id);
    user.skinProfile = {
      skinType: analysis.skinType,
      skinScore: Math.round((analysis.hydration + analysis.texture) / 2), // Simple scoring
      skinConcerns: analysis.concerns,
      skinAnalysis: {
        hydration: analysis.hydration,
        oiliness: analysis.oiliness,
        darkSpots: analysis.darkSpots,
        texture: analysis.texture
      }
    };
    
    await user.save();
    
    res.json({
      analysis,
      recommendations,
      skinProfile: user.skinProfile
    });
  } catch (error) {
    console.error('Skin analysis error:', error);
    res.status(500).json({ msg: 'Server error during skin analysis' });
  }
});

// @route   GET api/skin-analysis/history
// @desc    Get user's skin analysis history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('skinProfile');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json({
      skinProfile: user.skinProfile
    });
  } catch (error) {
    console.error('Get skin analysis history error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/skin-analysis/generate-routine
// @desc    Generate personalized routine based on skin analysis
// @access  Private
router.post('/generate-routine', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('skinProfile');
    
    if (!user || !user.skinProfile) {
      return res.status(400).json({ msg: 'No skin profile found, please complete skin analysis first' });
    }
    
    // Generate routine based on skin concerns
    const routine = generateRoutineFromProfile(user.skinProfile);
    
    res.json({ routine });
  } catch (error) {
    console.error('Generate routine error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Helper function to generate routine based on skin profile
function generateRoutineFromProfile(skinProfile) {
  const routine = {
    morning: [],
    evening: []
  };
  
  // Morning routine based on skin type and concerns
  routine.morning.push({
    step: 1,
    product: 'Gentle Cleanser',
    purpose: 'Cleanse without stripping natural oils'
  });
  
  if (skinProfile.skinConcerns.includes('dehydration')) {
    routine.morning.push({
      step: 2,
      product: 'Hydrating Serum',
      purpose: 'Boost moisture levels'
    });
  }
  
  if (skinProfile.skinConcerns.includes('aging') || skinProfile.skinConcerns.includes('dark_spots')) {
    routine.morning.push({
      step: 3,
      product: 'Vitamin C Serum',
      purpose: 'Antioxidant protection and brightening'
    });
  }
  
  routine.morning.push({
    step: 4,
    product: 'Moisturizer',
    purpose: 'Lock in hydration'
  });
  
  routine.morning.push({
    step: 5,
    product: 'SPF 30+',
    purpose: 'Protect from UV damage'
  });
  
  // Evening routine based on skin type and concerns
  routine.evening.push({
    step: 1,
    product: 'Gentle Cleanser',
    purpose: 'Remove makeup and impurities'
  });
  
  if (skinProfile.skinConcerns.includes('acne') || skinProfile.skinConcerns.includes('texture')) {
    routine.evening.push({
      step: 2,
      product: 'Exfoliating Treatment',
      purpose: 'Improve skin texture (2-3 times per week)'
    });
  }
  
  if (skinProfile.skinConcerns.includes('aging') || skinProfile.skinConcerns.includes('dark_spots')) {
    routine.evening.push({
      step: 3,
      product: 'Retinol Treatment',
      purpose: 'Address aging concerns'
    });
  }
  
  routine.evening.push({
    step: 4,
    product: 'Treatment Serum',
    purpose: 'Target specific concerns'
  });
  
  routine.evening.push({
    step: 5,
    product: 'Night Cream',
    purpose: 'Intensive repair and hydration'
  });
  
  return routine;
}

module.exports = router;