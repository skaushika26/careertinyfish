const express = require('express');
const router = express.Router();

router.post('/generate', (req, res) => {
  const { resume } = req.body;
  const portfolioUrl = `https://portfolio.careerforge.ai/${resume.name?.toLowerCase().replace(/\s/g, '-') || 'user'}`;
  res.json({ 
    success: true, 
    url: portfolioUrl,
    embedCode: `<iframe src="${portfolioUrl}" width="100%" height="600" frameborder="0"></iframe>`
  });
});

module.exports = router;