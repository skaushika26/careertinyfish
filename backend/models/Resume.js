const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: { type: String, default: 'default-user' },
  fileName: String,
  rawText: String,
  parsedData: {
    name: String,
    email: String,
    phone: String,
    location: String,
    summary: String,
    skills: [String],
    experience: [{
      company: String,
      title: String,
      startDate: String,
      endDate: String,
      description: String,
    }],
    education: [{
      school: String,
      degree: String,
      field: String,
      graduationYear: String,
    }],
    certifications: [String],
  },
  atsScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resume', resumeSchema);
