const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  skinProfile: {
    skinType: {
      type: String,
      enum: ['normal', 'oily', 'dry', 'combination', 'sensitive']
    },
    skinScore: {
      type: Number,
      min: 0,
      max: 100
    },
    skinConcerns: [{
      type: String,
      enum: ['acne', 'aging', 'dark_spots', 'dehydration', 'sensitivity', 'texture']
    }],
    skinAnalysis: {
      hydration: Number,
      oiliness: Number,
      darkSpots: Number,
      texture: Number
    }
  },
  routines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine'
  }],
  subscriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);