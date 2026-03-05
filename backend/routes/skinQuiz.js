const express = require('express');
const { protect } = require('../middleware/auth');
const skinQuizService = require('../services/skinQuizService');
const User = require('../models/User');

const router = express.Router();

// @route   GET api/skin-quiz/questions
// @desc    Get skin quiz questions
// @access  Private
router.get('/questions', protect, (req, res) => {
  try {
    const questions = skinQuizService.getQuizQuestions();
    res.json({ questions });
  } catch (error) {
    console.error('Get quiz questions error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/skin-quiz/submit
// @desc    Submit skin quiz answers and get personalized profile
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ msg: 'Answers are required' });
    }

    // Calculate skin profile from answers
    const skinProfile = skinQuizService.calculateSkinProfile(answers);
    
    // Generate recommendations
    const recommendations = skinQuizService.generateRecommendations(skinProfile);
    
    // Update user's skin profile
    const user = await User.findById(req.user.id);
    user.skinProfile = {
      ...skinProfile,
      createdAt: new Date()
    };
    
    await user.save();
    
    res.json({
      skinProfile,
      recommendations,
      message: 'Skin profile created successfully!'
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET api/skin-quiz/profile
// @desc    Get user's skin profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('skinProfile');
    
    if (!user || !user.skinProfile) {
      return res.status(404).json({ msg: 'No skin profile found' });
    }
    
    res.json({
      skinProfile: user.skinProfile
    });
  } catch (error) {
    console.error('Get skin profile error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT api/skin-quiz/profile
// @desc    Update user's skin profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { skinProfile } = req.body;
    
    if (!skinProfile) {
      return res.status(400).json({ msg: 'Skin profile is required' });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    user.skinProfile = {
      ...user.skinProfile,
      ...skinProfile,
      updatedAt: new Date()
    };
    
    await user.save();
    
    res.json({
      skinProfile: user.skinProfile,
      message: 'Skin profile updated successfully!'
    });
  } catch (error) {
    console.error('Update skin profile error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;