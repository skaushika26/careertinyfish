const express = require('express');
const router = express.Router();

let applications = [];

router.get('/', (req, res) => {
  res.json(applications);
});

router.post('/', (req, res) => {
  const application = { 
    id: Date.now(), 
    ...req.body, 
    date: new Date().toISOString(),
    status: 'applied'
  };
  applications.unshift(application);
  res.json({ success: true, application });
});

router.patch('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = applications.findIndex(a => a.id === id);
  if (index !== -1) {
    applications[index] = { ...applications[index], ...req.body };
    res.json({ success: true, application: applications[index] });
  } else {
    res.status(404).json({ success: false, message: 'Application not found' });
  }
});

module.exports = router;