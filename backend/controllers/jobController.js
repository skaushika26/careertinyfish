const { v4: uuidv4 } = require('uuid');

// Dummy job listings for demo
const DUMMY_JOBS = [
  {
    id: uuidv4(),
    title: 'Senior Frontend Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA (Remote)',
    type: 'Full-time',
    salary: '$140,000 - $180,000',
    postedDate: '2025-03-20',
    description: `We are looking for a Senior Frontend Engineer to join our growing team.

Requirements:
- 5+ years of React experience
- Strong TypeScript skills
- Experience with state management (Redux, Zustand)
- Performance optimization expertise
- REST API and GraphQL experience
- CI/CD familiarity

Responsibilities:
- Build and maintain complex React applications
- Mentor junior developers
- Collaborate with design and backend teams
- Drive frontend architecture decisions`,
    skills: ['React', 'TypeScript', 'Redux', 'GraphQL', 'Node.js'],
    logo: 'TC',
    color: '#4F46E5',
    matchScore: 0,
  },
  {
    id: uuidv4(),
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Austin, TX (Hybrid)',
    type: 'Full-time',
    salary: '$110,000 - $140,000',
    postedDate: '2025-03-22',
    description: `Join our fast-moving startup as a Full Stack Developer.

Requirements:
- 3+ years full stack experience
- React and Node.js proficiency
- MongoDB or PostgreSQL experience
- Docker and AWS knowledge
- Strong problem-solving skills

Responsibilities:
- Build end-to-end features
- Maintain backend APIs
- Deploy and monitor production systems
- Participate in agile sprints`,
    skills: ['React', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
    logo: 'SX',
    color: '#059669',
    matchScore: 0,
  },
  {
    id: uuidv4(),
    title: 'Machine Learning Engineer',
    company: 'AI Dynamics',
    location: 'New York, NY (Remote)',
    type: 'Full-time',
    salary: '$160,000 - $200,000',
    postedDate: '2025-03-18',
    description: `AI Dynamics is hiring a Machine Learning Engineer to work on cutting-edge NLP systems.

Requirements:
- MS/PhD in CS, ML, or related field
- 3+ years Python experience
- PyTorch or TensorFlow expertise
- NLP/LLM experience preferred
- Strong math background (linear algebra, statistics)

Responsibilities:
- Train and fine-tune ML models
- Build data pipelines
- Deploy models to production
- Research and implement state-of-the-art techniques`,
    skills: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Machine Learning'],
    logo: 'AD',
    color: '#DC2626',
    matchScore: 0,
  },
  {
    id: uuidv4(),
    title: 'DevOps Engineer',
    company: 'CloudBase Systems',
    location: 'Seattle, WA (Remote)',
    type: 'Full-time',
    salary: '$130,000 - $165,000',
    postedDate: '2025-03-21',
    description: `CloudBase Systems is seeking a DevOps Engineer to scale our infrastructure.

Requirements:
- 4+ years DevOps/SRE experience
- Kubernetes and Docker expertise
- AWS or GCP certification preferred
- CI/CD pipeline experience (Jenkins, GitHub Actions)
- Infrastructure as Code (Terraform, Pulumi)

Responsibilities:
- Manage and scale Kubernetes clusters
- Build and maintain CI/CD pipelines
- Monitor system reliability
- Reduce deployment time and increase uptime`,
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'],
    logo: 'CB',
    color: '#D97706',
    matchScore: 0,
  },
  {
    id: uuidv4(),
    title: 'Backend Engineer (Python)',
    company: 'DataStream Co.',
    location: 'Chicago, IL (Hybrid)',
    type: 'Full-time',
    salary: '$120,000 - $155,000',
    postedDate: '2025-03-19',
    description: `DataStream is looking for a Backend Engineer to build high-throughput data systems.

Requirements:
- 3+ years Python backend experience
- FastAPI or Django REST Framework
- PostgreSQL and Redis proficiency
- Celery/task queue experience
- Message brokers (Kafka, RabbitMQ)

Responsibilities:
- Design and build scalable APIs
- Optimize database performance
- Build async data processing pipelines
- Write comprehensive tests`,
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Kafka'],
    logo: 'DS',
    color: '#7C3AED',
    matchScore: 0,
  },
  {
    id: uuidv4(),
    title: 'React Native Developer',
    company: 'MobileFirst Labs',
    location: 'Boston, MA (Remote)',
    type: 'Contract',
    salary: '$80 - $110/hr',
    postedDate: '2025-03-23',
    description: `MobileFirst Labs needs a React Native Developer for a 6-month engagement.

Requirements:
- 3+ years React Native experience
- iOS and Android deployment experience
- Native module bridging knowledge
- Redux or Context API state management
- Expo familiarity a plus

Responsibilities:
- Build cross-platform mobile features
- Fix platform-specific bugs
- Optimize app performance
- Coordinate with QA team`,
    skills: ['React Native', 'iOS', 'Android', 'Redux', 'Expo'],
    logo: 'ML',
    color: '#0891B2',
    matchScore: 0,
  },
];

function calculateMatchScore(job, skills = []) {
  if (!skills.length) return Math.floor(Math.random() * 40) + 50;
  const userSkills = skills.map(s => s.toLowerCase());
  const jobSkills = job.skills.map(s => s.toLowerCase());
  const matched = jobSkills.filter(s => userSkills.some(u => u.includes(s) || s.includes(u)));
  return Math.min(100, Math.floor((matched.length / jobSkills.length) * 100) + Math.floor(Math.random() * 15));
}

exports.getJobs = async (req, res) => {
  const { skills } = req.query;
  const userSkills = skills ? skills.split(',') : [];
  const jobs = DUMMY_JOBS.map(job => ({
    ...job,
    matchScore: calculateMatchScore(job, userSkills)
  })).sort((a, b) => b.matchScore - a.matchScore);
  res.json(jobs);
};

exports.getJobById = async (req, res) => {
  const job = DUMMY_JOBS.find(j => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
};

exports.matchJobs = async (req, res) => {
  const { skills = [], title = '', experience = [] } = req.body;
  const jobs = DUMMY_JOBS.map(job => ({
    ...job,
    matchScore: calculateMatchScore(job, skills)
  })).sort((a, b) => b.matchScore - a.matchScore);
  res.json(jobs);
};
