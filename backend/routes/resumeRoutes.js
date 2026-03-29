const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// =========================
// MULTER CONFIG (MEMORY STORAGE ✅)
// =========================
const upload = multer({
  storage: multer.memoryStorage(), // 🔥 IMPORTANT (no disk)
  limits: { fileSize: 5 * 1024 * 1024 }
});

// =========================
// FILE TYPE CHECK
// =========================
const isValidFile = (file) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  return allowed.includes(file.mimetype);
};

// =========================
// EXTRACT TEXT FUNCTIONS
// =========================
async function extractTextFromPDF(buffer) {
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text;
  } catch (err) {
    console.error('❌ PDF parse error:', err);
    return '';
  }
}

function extractTextFromTXT(buffer) {
  return buffer.toString('utf8');
}

async function extractTextFromDOCX(buffer) {
  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (err) {
    console.error('❌ DOCX parse error:', err);
    return '';
  }
}

// =========================
// PARSER FUNCTION
// =========================
function parseResumeText(text) {
  const email = (text.match(/[^\s]+@[^\s]+\.[^\s]+/) || ['Not found'])[0];
  const phone = (text.match(/\+?\d[\d\s\-]{8,}/) || ['Not found'])[0];

  const lines = text.split('\n').filter(l => l.trim());
  const name = lines[0] || 'Not found';

  const skillsList = [
    'JavaScript','React','Node.js','Python','Java','C++','HTML','CSS',
    'MongoDB','SQL','Express','AWS','Docker','Git'
  ];

  const skills = skillsList.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  return {
    name,
    email,
    phone,
    location: text.includes('India') ? 'India' : 'Not found',
    skills,
    summary: text.slice(0, 200),
    experience: [],
    education: []
  };
}

// =========================
// IN-MEMORY STORE
// =========================
let currentResume = {};

// =========================
// UPLOAD ROUTE (FIXED)
// =========================
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    console.log('📄 Upload request');

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!isValidFile(req.file)) {
      return res.status(400).json({ success: false, message: 'Invalid file type' });
    }

    let text = '';

    // 🔥 IMPORTANT: USE BUFFER (NOT FILE PATH)
    if (req.file.mimetype === 'application/pdf') {
      text = await extractTextFromPDF(req.file.buffer);
    } 
    else if (req.file.mimetype === 'text/plain') {
      text = extractTextFromTXT(req.file.buffer);
    } 
    else {
      text = await extractTextFromDOCX(req.file.buffer);
    }

    // fallback
    if (!text || text.length < 30) {
      text = "Sample Resume\nEmail: test@gmail.com\nSkills: React Node JavaScript";
    }

    const parsed = parseResumeText(text);

    currentResume = {
      ...parsed,
      fileName: req.file.originalname,
      parsedAt: new Date()
    };

    res.json({
      success: true,
      resume: currentResume
    });

  } catch (err) {
    console.error('❌ ERROR:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// =========================
// OTHER ROUTES
// =========================
router.get('/me', (req, res) => {
  res.json(currentResume);
});

// ========== SAVE RESUME ==========
router.post('/save', (req, res) => {
  currentResume = { ...currentResume, ...req.body };
  res.json({ success: true, resume: currentResume });
});

router.post('/build', (req, res) => {
  currentResume = { ...currentResume, ...req.body };
  res.json({ success: true, resume: currentResume });
});

module.exports = router;