const express = require('express');
const router = express.Router();

const dummyJobs = [
  { id: 1, title: 'Frontend Developer', company: 'TechCorp', location: 'Remote', skills: ['React', 'JavaScript', 'CSS'], type: 'Full-time', salary: '$80k-$100k', posted: '2 days ago' },
  { id: 2, title: 'Backend Engineer', company: 'DataFlow', location: 'New York', skills: ['Node.js', 'MongoDB', 'Python'], type: 'Full-time', salary: '$90k-$120k', posted: '3 days ago' },
  { id: 3, title: 'Full Stack Developer', company: 'StartupHub', location: 'San Francisco', skills: ['React', 'Node.js', 'PostgreSQL'], type: 'Remote', salary: '$100k-$130k', posted: '1 week ago' },
  { id: 4, title: 'AI Engineer', company: 'AI Innovations', location: 'Austin', skills: ['Python', 'TensorFlow', 'ML'], type: 'Full-time', salary: '$120k-$150k', posted: '5 days ago' },
  { id: 5, title: 'DevOps Engineer', company: 'CloudNative', location: 'Seattle', skills: ['AWS', 'Docker', 'K8s'], type: 'Contract', salary: '$110k-$140k', posted: '1 day ago' }
];

router.get('/', (req, res) => {
  res.json(dummyJobs);
});

router.get('/:id', (req, res) => {
  const job = dummyJobs.find(j => j.id === parseInt(req.params.id));
  job ? res.json(job) : res.status(404).json({ message: 'Job not found' });
});

module.exports = router;