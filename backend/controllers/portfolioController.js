const tinyfishService = require('../services/tinyfishService');

const portfolioStore = new Map();

exports.generatePortfolio = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) return res.status(400).json({ error: 'resumeData is required' });

    const html = await tinyfishService.generatePortfolio(resumeData);
    const id = Date.now().toString();
    portfolioStore.set(id, { id, html, resumeData, createdAt: new Date() });

    res.json({ id, html });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPortfolio = async (req, res) => {
  const portfolio = portfolioStore.get(req.params.id);
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });
  res.json(portfolio);
};
