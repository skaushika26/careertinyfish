const fs = require('fs');
const { extractTextFromFile } = require('../utils/resumeParser');
const { parseResume, scoreATS } = require('../services/tinyfishService');

// In-memory store (replace with MongoDB in production)
const resumeStore = new Map();

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const rawText = await extractTextFromFile(req.file.path);
    const parsedData = await parseResume(rawText);

    const resume = {
      id: req.file.filename.split('.')[0],
      fileName: req.file.originalname,
      rawText,
      parsedData,
      atsScore: 0,
      createdAt: new Date(),
    };

    resumeStore.set(resume.id, resume);

    // Clean up file
    fs.unlink(req.file.path, () => {});

    res.json({ success: true, resume });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getResume = async (req, res) => {
  const resume = resumeStore.get(req.params.id);
  if (!resume) return res.status(404).json({ error: 'Resume not found' });
  res.json(resume);
};

exports.updateResume = async (req, res) => {
  const resume = resumeStore.get(req.params.id);
  if (!resume) return res.status(404).json({ error: 'Resume not found' });

  const updated = { ...resume, parsedData: { ...resume.parsedData, ...req.body }, updatedAt: new Date() };
  resumeStore.set(req.params.id, updated);
  res.json(updated);
};

exports.buildResume = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) return res.status(400).json({ error: 'Resume data required' });

    const id = Date.now().toString();
    const resume = {
      id,
      fileName: 'built-resume.json',
      rawText: '',
      parsedData: resumeData,
      atsScore: 0,
      createdAt: new Date(),
    };

    resumeStore.set(id, resume);
    res.json({ success: true, resume });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getATSScore = async (req, res) => {
  try {
    const resume = resumeStore.get(req.params.id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const { jobDescription } = req.body;
    const score = await scoreATS(resume.parsedData, jobDescription);

    // Update stored score
    resume.atsScore = score.overallScore;
    resumeStore.set(req.params.id, resume);

    res.json(score);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
