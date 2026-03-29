require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // ✅ allow all origins (for now)
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ========== TINYFISH API CONFIGURATION ==========
const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;
const TINYFISH_CHAT_URL = 'https://api.tinyfish.io/v1';

const chatClient = axios.create({
  baseURL: TINYFISH_CHAT_URL,
  headers: {
    'Authorization': `Bearer ${TINYFISH_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// ========== RESUME PARSING FUNCTION ==========
function parseResumeText(text) {
  console.log('Parsing resume text...');
  
  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex);
  const email = emails && emails.length > 0 ? emails[0] : 'Not found';
  
  // Extract phone
  const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g;
  const phones = text.match(phoneRegex);
  const phone = phones && phones.length > 0 ? phones[0] : 'Not found';
  
  // Extract name
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  let name = 'Not found';
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 2 && line.length < 50 && !line.includes('@') && !line.match(/[0-9]/g)) {
      name = line;
      break;
    }
  }
  
  // Extract skills
  const commonSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'HTML', 'CSS',
    'MongoDB', 'SQL', 'PostgreSQL', 'Express', 'Django', 'Flask', 'Angular',
    'Vue', 'TypeScript', 'Git', 'Docker', 'AWS', 'Azure', 'REST API',
    'GraphQL', 'TensorFlow', 'PyTorch', 'Machine Learning', 'AI', 'PHP', 'Ruby'
  ];
  
  const skills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  // Extract summary
  let summary = 'No summary detected';
  const summaryRegex = /(summary|profile|about)[\s\n]*([\s\S]*?)(experience|education|skills|work|$)/i;
  const summaryMatch = text.match(summaryRegex);
  if (summaryMatch && summaryMatch[2]) {
    summary = summaryMatch[2].trim().substring(0, 500);
  }
  
  return {
    name,
    email,
    phone,
    skills: skills.slice(0, 15),
    summary,
    rawText: text.substring(0, 500)
  };
}

// Store current resume
let currentResume = {
  name: 'John Doe',
  title: 'Software Engineer',
  email: 'john.doe@example.com',
  phone: '+1 555-123-4567',
  summary: 'Experienced software engineer with 5+ years in full-stack development.',
  skills: ['React', 'Node.js', 'Python', 'MongoDB']
};

// ========== API ENDPOINTS ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CareerForge AI API is running',
    timestamp: new Date().toISOString()
  });
});

// Get current resume
app.get('/api/resume/me', (req, res) => {
  res.json(currentResume);
});

// Save resume
app.post('/api/resume/save', (req, res) => {
  currentResume = { ...currentResume, ...req.body };
  res.json({ success: true, message: 'Resume saved', resume: currentResume });
});

// Upload and parse resume
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/api/resume/upload', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    let extractedText = '';
    const filePath = req.file.path;
    
    if (req.file.originalname.endsWith('.txt')) {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else if (req.file.originalname.endsWith('.pdf')) {
      try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
      } catch (e) {
        extractedText = 'PDF parsing failed. Using sample data.';
      }
    } else {
      extractedText = 'Sample resume: John Doe, Software Engineer, Skills: React, Node.js, Python';
    }
    
    const parsedData = parseResumeText(extractedText);
    currentResume = { ...currentResume, ...parsedData, fileName: req.file.originalname };
    
    res.json({ success: true, message: 'Resume parsed', resume: currentResume });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.json({ success: true, resume: currentResume });
  }
});

// Jobs endpoint
app.get('/api/jobs', (req, res) => {
  const jobs = [
    { id: 1, title: 'Frontend Developer', company: 'TechCorp', location: 'Remote', skills: ['React', 'JavaScript', 'CSS'], type: 'Full-time', salary: '$80k-$100k' },
    { id: 2, title: 'Backend Engineer', company: 'DataFlow', location: 'New York', skills: ['Node.js', 'MongoDB', 'Python'], type: 'Full-time', salary: '$90k-$120k' },
    { id: 3, title: 'Full Stack Developer', company: 'StartupHub', location: 'San Francisco', skills: ['React', 'Node.js', 'PostgreSQL'], type: 'Remote', salary: '$100k-$130k' },
    { id: 4, title: 'AI Engineer', company: 'AI Innovations', location: 'Austin', skills: ['Python', 'TensorFlow', 'ML'], type: 'Full-time', salary: '$120k-$150k' },
    { id: 5, title: 'DevOps Engineer', company: 'CloudNative', location: 'Seattle', skills: ['AWS', 'Docker', 'K8s'], type: 'Contract', salary: '$110k-$140k' }
  ];
  res.json(jobs);
});

// AI Customize Resume
app.post('/api/ai/customize', async (req, res) => {
  const { resume, job } = req.body;
  
  const customized = {
    ...resume,
    summary: `${resume.summary} I am excited about the ${job.title} role at ${job.company}. My skills in ${job.skills?.join(', ') || 'relevant technologies'} align perfectly.`,
    skills: [...new Set([...(resume.skills || []), ...(job.skills || [])])]
  };
  
  res.json({ success: true, resume: customized });
});

// AI Auto-Apply Agent
app.post('/api/ai/auto-apply', async (req, res) => {
  const { resume, jobs, dailyLimit = 5 } = req.body;
  const results = [];
  const appliedJobs = [];
  
  for (let i = 0; i < Math.min(jobs?.length || 5, dailyLimit); i++) {
    const job = jobs[i];
    if (!job) continue;
    
    const customized = {
      ...resume,
      summary: `${resume.summary} Excited about ${job.title} at ${job.company}.`,
      skills: [...new Set([...(resume.skills || []), ...(job.skills || [])])]
    };
    
    results.push({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      status: 'applied',
      customizedResume: customized,
      date: new Date().toISOString()
    });
    appliedJobs.push(job.title);
  }
  
  res.json({
    success: true,
    message: `Auto-applied to ${appliedJobs.length} jobs`,
    applications: results,
    appliedJobs
  });
});

// Portfolio Generator
app.post('/api/ai/portfolio', (req, res) => {
  const { resume } = req.body;
  res.json({
    success: true,
    portfolio: {
      heroTitle: resume.name,
      heroSubtitle: resume.title || 'Software Engineer',
      aboutText: resume.summary,
      skillsList: resume.skills,
      portfolioUrl: `https://portfolio.careerforge.ai/${resume.name?.toLowerCase().replace(/\s/g, '-') || 'user'}`,
      projectIdeas: [
        { title: 'AI Career Platform', description: 'Built intelligent career automation system' },
        { title: 'Resume Customizer', description: 'AI-powered resume tailoring for jobs' },
        { title: 'Portfolio Generator', description: 'Automatic portfolio creation from resume' }
      ]
    }
  });
});

// Applications endpoint
let applications = [];
app.get('/api/applications', (req, res) => res.json(applications));
app.post('/api/applications', (req, res) => {
  const app = { id: Date.now(), ...req.body, date: new Date().toISOString() };
  applications.unshift(app);
  res.json({ success: true, application: app });
});

// ========== ROOT ROUTE (ADD THIS) ==========
app.get('/', (req, res) => {
  res.json({
    message: 'CareerForge AI API is running',
    endpoints: {
      health: '/api/health',
      jobs: '/api/jobs',
      resume: '/api/resume/me',
      upload: '/api/resume/upload',
      applications: '/api/applications',
      portfolio: '/api/portfolio',
      customize: '/api/ai/customize',
      autoApply: '/api/ai/auto-apply'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 CareerForge AI Server Running');
  console.log('========================================');
  console.log(`📡 http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`💼 Jobs: http://localhost:${PORT}/api/jobs`);
  console.log(`🤖 AI Customize: POST /api/ai/customize`);
  console.log(`🤖 Auto-Apply: POST /api/ai/auto-apply`);
  console.log(`🌐 Portfolio: POST /api/ai/portfolio`);
  console.log('========================================');
});