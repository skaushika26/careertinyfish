const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: String, default: 'default-user' },
  jobId: String,
  jobTitle: String,
  company: String,
  jobUrl: String,
  status: {
    type: String,
    enum: ['saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn'],
    default: 'saved'
  },
  customizedResume: String,
  coverLetter: String,
  notes: String,
  appliedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', applicationSchema);
