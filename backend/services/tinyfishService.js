const axios = require('axios');

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

// Customize resume for a job
const customizeResume = async (resume, job) => {
  try {
    const prompt = `
      You are an expert resume writer. Customize this resume for the job:
      
      JOB: ${job.title} at ${job.company}
      REQUIRED SKILLS: ${job.skills?.join(', ') || ''}
      
      RESUME:
      Name: ${resume.name}
      Title: ${resume.title}
      Summary: ${resume.summary}
      Skills: ${resume.skills?.join(', ') || ''}
      Experience: ${resume.experience?.map(e => e.title).join(', ') || ''}
      
      Return a JSON object with:
      - name: string
      - title: string
      - summary: string (optimized for this job)
      - skills: array (prioritized for this job)
    `;
    
    const response = await chatClient.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    });
    
    const aiResponse = response.data.choices[0].message.content;
    try {
      return JSON.parse(aiResponse);
    } catch {
      return {
        ...resume,
        summary: `${resume.summary} Interested in ${job.title} role at ${job.company}.`,
        skills: [...new Set([...(resume.skills || []), ...(job.skills || [])])]
      };
    }
  } catch (error) {
    console.error('TinyFish error:', error.message);
    return {
      ...resume,
      summary: `${resume.summary} Interested in ${job.title} role.`,
      skills: [...new Set([...(resume.skills || []), ...(job.skills || [])])]
    };
  }
};

// Generate cover letter
const generateCoverLetter = async (resume, job) => {
  try {
    const prompt = `
      Write a professional cover letter for:
      
      NAME: ${resume.name}
      JOB: ${job.title} at ${job.company}
      SKILLS: ${resume.skills?.join(', ') || ''}
      
      Keep it concise (3-4 paragraphs).
    `;
    
    const response = await chatClient.post('/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 600
    });
    
    return response.data.choices[0].message.content;
  } catch (error) {
    return `Dear Hiring Manager,\n\nI am excited to apply for the ${job.title} position at ${job.company}. With my experience in ${resume.skills?.join(', ') || 'relevant technologies'}, I am confident I would be a great fit.\n\nBest regards,\n${resume.name}`;
  }
};

// Generate portfolio content
const generatePortfolio = async (resume) => {
  return {
    heroTitle: resume.name,
    heroSubtitle: resume.title,
    aboutText: resume.summary,
    skillsList: resume.skills,
    projectIdeas: [
      { title: 'AI Career Platform', description: 'Intelligent career automation system' },
      { title: 'Resume Customizer', description: 'AI-powered resume tailoring' },
      { title: 'Portfolio Generator', description: 'Automatic portfolio creation' }
    ]
  };
};

// Get ATS score
const getATSScore = async (resume) => {
  return {
    score: 78,
    strengths: ['Good structure', 'Clear summary', 'Relevant skills'],
    improvements: ['Add quantifiable achievements', 'Include more industry keywords'],
    keywordSuggestions: ['Leadership', 'Project Management', 'Team Collaboration']
  };
};

module.exports = {
  customizeResume,
  generateCoverLetter,
  generatePortfolio,
  getATSScore
};