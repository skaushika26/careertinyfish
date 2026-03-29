const tinyfishService = require('../services/tinyfishService');

exports.customizeResume = async (req, res) => {
  try {
    const { resumeData, jobDescription, jobTitle } = req.body;
    if (!resumeData || !jobDescription || !jobTitle) {
      return res.status(400).json({ error: 'resumeData, jobDescription, and jobTitle are required' });
    }
    const result = await tinyfishService.customizeResume(resumeData, jobDescription, jobTitle);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generateCoverLetter = async (req, res) => {
  try {
    const { resumeData, jobTitle, company, jobDescription } = req.body;
    if (!resumeData || !jobTitle || !company) {
      return res.status(400).json({ error: 'resumeData, jobTitle, and company are required' });
    }
    const letter = await tinyfishService.generateCoverLetter(resumeData, jobTitle, company, jobDescription || '');
    res.json({ coverLetter: letter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generatePortfolio = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) return res.status(400).json({ error: 'resumeData is required' });
    const html = await tinyfishService.generatePortfolio(resumeData);
    res.json({ html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getATSScore = async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData) return res.status(400).json({ error: 'resumeData is required' });
    const score = await tinyfishService.scoreATS(resumeData, jobDescription || '');
    res.json(score);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
