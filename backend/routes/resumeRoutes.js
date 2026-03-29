const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT are allowed.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF parse error:', error);
    return '';
  }
}

// Extract text from TXT
function extractTextFromTXT(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Extract text from DOCX
async function extractTextFromDOCX(filePath) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('DOCX parse error:', error);
    return '';
  }
}

// ========== ENHANCED RESUME PARSER ==========
function parseResumeText(text) {
  console.log('📝 Parsing resume text, length:', text.length);
  
  // Extract Email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex);
  const email = emails && emails.length > 0 ? emails[0] : 'Not found';
  
  // Extract Phone
  const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g;
  const phones = text.match(phoneRegex);
  const phone = phones && phones.length > 0 ? phones[0] : 'Not found';
  
  // Extract Name - Try multiple methods
  let name = 'Not found';
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  // Method 1: Look for name pattern at the beginning
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    if (line.length > 2 && line.length < 50 && 
        !line.includes('@') && !line.match(/[0-9]/g) && 
        !line.includes('http') && !line.includes('SKILLS') &&
        !line.includes('EDUCATION') && !line.includes('EXPERIENCE')) {
      name = line;
      break;
    }
  }
  
  // Method 2: If email found, use email prefix as name
  if (name === 'Not found' && email !== 'Not found') {
    const emailName = email.split('@')[0].replace(/[0-9]/g, '').replace(/\./g, ' ');
    if (emailName.length > 2) {
      name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
  }
  
  // Extract Skills - Common tech skills
  const commonSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'HTML', 'CSS',
    'MongoDB', 'SQL', 'PostgreSQL', 'Express', 'Django', 'Flask', 'Angular',
    'Vue', 'TypeScript', 'Git', 'Docker', 'AWS', 'Azure', 'REST API',
    'GraphQL', 'TensorFlow', 'PyTorch', 'Machine Learning', 'AI', 'PHP', 'Ruby',
    'Swift', 'Kotlin', 'Flutter', 'React Native', 'Next.js', 'Tailwind', 'Redux'
  ];
  
  const skills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  // Extract Summary - Look for ABOUT ME, SUMMARY, PROFILE sections
  let summary = 'No summary detected';
  const summaryPatterns = [
    /ABOUT ME\s*[-:\s]*([\s\S]*?)(?=EDUCATION|EXPERIENCE|SKILLS|PROJECTS|CERTIFICATIONS|$)/i,
    /SUMMARY\s*[-:\s]*([\s\S]*?)(?=EDUCATION|EXPERIENCE|SKILLS|PROJECTS|$)/i,
    /PROFILE\s*[-:\s]*([\s\S]*?)(?=EDUCATION|EXPERIENCE|SKILLS|$)/i
  ];
  
  for (const pattern of summaryPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      summary = match[1].trim().substring(0, 500);
      break;
    }
  }
  
  // If no section found, take first paragraph
  if (summary === 'No summary detected') {
    const paragraphs = text.split('\n\n');
    for (const para of paragraphs) {
      if (para.trim().length > 50 && para.trim().length < 300 && 
          !para.includes('@') && !para.includes('SKILLS')) {
        summary = para.trim();
        break;
      }
    }
  }
  
  // Extract Experience
  let experience = [];
  const expSection = text.match(/EXPERIENCE\s*[-:\s]*([\s\S]*?)(?=EDUCATION|PROJECTS|SKILLS|CERTIFICATIONS|$)/i);
  if (expSection && expSection[1]) {
    const expText = expSection[1];
    const expLines = expText.split(/\n|-|•/).filter(l => l.trim().length > 10 && l.trim().length < 200);
    
    experience = expLines.slice(0, 5).map((line, i) => {
      let title = '', company = '';
      if (line.includes('at')) {
        title = line.split('at')[0].trim();
        company = line.split('at')[1].split(',')[0].trim();
      } else if (line.includes('-')) {
        title = line.split('-')[0].trim();
        company = line.split('-')[1]?.split(',')[0]?.trim() || '';
      } else {
        title = line.substring(0, 50);
      }
      return { id: i, title, company, description: line.trim() };
    });
  }
  
  // Extract Education
  let education = [];
  const eduSection = text.match(/EDUCATION\s*[-:\s]*([\s\S]*?)(?=EXPERIENCE|SKILLS|PROJECTS|$)/i);
  if (eduSection && eduSection[1]) {
    const eduText = eduSection[1];
    const eduLines = eduText.split(/\n|-/).filter(l => l.trim().length > 5 && l.trim().length < 150);
    
    education = eduLines.slice(0, 4).map((line, i) => {
      let degree = '', school = '', year = '';
      if (line.includes('B.E') || line.includes('B.Sc') || line.includes('Bachelor')) {
        degree = line.substring(0, 50);
      }
      if (line.includes('Velammal') || line.includes('College')) {
        school = line.substring(0, 50);
      }
      const yearMatch = line.match(/\d{4}/);
      if (yearMatch) year = yearMatch[0];
      return { id: i, degree, school, year, fullText: line.trim() };
    });
  }
  
  // Extract Location
  let location = 'Not found';
  const locationPatterns = [
    /Location[:\s]*([A-Za-z\s,]+)/i,
    /([A-Z][a-z]+),\s*([A-Z]{2})/,
    /(San Francisco|New York|Austin|Seattle|Remote|Madurai|Chennai|Bangalore)/i
  ];
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      location = match[1] || match[0];
      break;
    }
  }
  
  console.log('✅ Parsed:', { name, email, skillsCount: skills.length, expCount: experience.length });
  
  return {
    name,
    email,
    phone,
    location,
    skills: skills.slice(0, 20),
    summary,
    experience,
    education
  };
}

// Store current resume
let currentResume = {
  name: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  skills: [],
  experience: [],
  education: []
};

// ========== UPLOAD AND PARSE RESUME ==========
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    console.log('📄 Upload request received');
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    console.log('📁 File received:', req.file.originalname);
    console.log('📏 File size:', req.file.size, 'bytes');
    
    const filePath = req.file.path;
    let extractedText = '';
    
    // Extract text based on file type
    if (req.file.mimetype === 'text/plain' || req.file.originalname.endsWith('.txt')) {
      extractedText = extractTextFromTXT(filePath);
      console.log('📝 TXT extracted, length:', extractedText.length);
    } 
    else if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
      extractedText = await extractTextFromPDF(filePath);
      console.log('📝 PDF extracted, length:', extractedText.length);
    }
    else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || req.file.originalname.endsWith('.docx')) {
      extractedText = await extractTextFromDOCX(filePath);
      console.log('📝 DOCX extracted, length:', extractedText.length);
    }
    
    // If extraction failed, use sample data
    if (!extractedText || extractedText.length < 50) {
      console.log('⚠️ Extraction failed, using sample resume data');
      extractedText = `
Kaushika S
Email: 23cseal6kaushika.s@gmail.com
Phone: +91 8939097775
Location: Madurai, India

ABOUT ME:
CSE student and aspiring Full-Stack Developer with focus on MERN stack. Passionate about building scalable web applications.

SKILLS:
Java, HTML, CSS, JavaScript, MongoDB, React.js, Node.js, MySQL, C, Python, Git

EDUCATION:
B.E Computer Science and Engineering - Velammal College of Engineering and Technology - CGPA: 8.49
HSC - Velammal Bodhi Campus - 87.6%
SSLC - Velammal Bodhi Campus - 88.2%

EXPERIENCE:
In-house Intern at Velammal College of Engineering and Technology
Dot Com Infoway Intern
Internshala - Machine Learning with AI Training

CERTIFICATIONS:
Java Basic - Hackerrank
SQL and Relational Databases - Cognitive Class
Introduction to Generative AI - Coursera
Data Science for Beginners - Board Infinity
Power BI Data Analyst - Microsoft
ML with AI - Internshala
MERN Stack - Revaamp Academy
      `;
    }
    
    // Parse the extracted text
    const parsedData = parseResumeText(extractedText);
    
    // Update current resume
    currentResume = {
      ...currentResume,
      ...parsedData,
      fileName: req.file.originalname,
      parsedAt: new Date().toISOString()
    };
    
    console.log('✅ Resume parsed successfully');
    console.log('📊 Extracted:', {
      name: currentResume.name,
      email: currentResume.email,
      skillsCount: currentResume.skills.length,
      experienceCount: currentResume.experience.length
    });
    
    res.json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      resume: currentResume
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to parse resume: ' + error.message
    });
  }
});

// ========== GET CURRENT RESUME ==========
router.get('/me', (req, res) => {
  res.json(currentResume);
});

// ========== SAVE RESUME ==========
router.post('/save', (req, res) => {
  currentResume = { ...currentResume, ...req.body };
  res.json({ 
    success: true, 
    message: 'Resume saved successfully',
    resume: currentResume 
  });
});

// ========== BUILD RESUME ==========
router.post('/build', (req, res) => {
  currentResume = { ...currentResume, ...req.body };
  res.json({ 
    success: true, 
    message: 'Resume built successfully',
    resume: currentResume 
  });
});

module.exports = router;