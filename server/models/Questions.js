const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  company: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    index: true
  },
  difficulty: { 
    type: String, 
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  frequency: { 
    type: Number, 
    min: 0,
    max: 100,
    default: 0
  },
  acceptanceRate: { 
    type: String,
    default: '0%'
  },
  link: { 
    type: String,
    required: true,
    trim: true
  },
  topics: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Index for faster queries
questionSchema.index({ company: 1, difficulty: 1 });
questionSchema.index({ company: 1, frequency: -1 });

module.exports = mongoose.model('Question', questionSchema);