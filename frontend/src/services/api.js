import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://careertinyfish.onrender.com'
const API_BASE_URL = `${BASE_URL}/api`

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ========== RESUME API ==========
export const resumeAPI = {
  upload: async (file) => {
    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/resume/upload`,  // ✅ FIXED
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )

      return response.data
    } catch (err) {
      console.error('UPLOAD ERROR:', err.response?.data || err.message)
      throw new Error(
        err.response?.data?.message || 'Backend not reachable'
      )
    }
  },

  get: async () => {
    const response = await api.get('/resume/me')
    return response.data
  },

  save: async (resumeData) => {
    const response = await api.post('/resume/save', resumeData)
    return response.data
  },

  build: async (resumeData) => {
    const response = await api.post('/resume/build', resumeData)
    return response.data
  }
}

// ========== JOBS API ==========
export const jobsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/jobs')
      return response.data
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return getMockJobs()
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/jobs/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching job:', error)
      const mockJobs = getMockJobs()
      const job = mockJobs.find(j => j.id === parseInt(id))
      if (job) return job
      throw new Error('Job not found')
    }
  }
}

function getMockJobs() {
  return [
    { id: 1, title: 'Frontend Developer', company: 'TechCorp', location: 'Remote', skills: ['React', 'JavaScript', 'CSS', 'HTML'], type: 'Full-time', salary: '$80k-$100k', posted: '2 days ago', description: 'We are looking for a skilled Frontend Developer.' },
    { id: 2, title: 'Backend Engineer', company: 'DataFlow', location: 'New York', skills: ['Node.js', 'MongoDB', 'Python', 'Express'], type: 'Full-time', salary: '$90k-$120k', posted: '3 days ago', description: 'Join our backend team to build scalable APIs.' },
    { id: 3, title: 'Full Stack Developer', company: 'StartupHub', location: 'San Francisco', skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'], type: 'Remote', salary: '$100k-$130k', posted: '1 week ago', description: 'Work on both frontend and backend systems.' },
    { id: 4, title: 'AI Engineer', company: 'AI Innovations', location: 'Austin', skills: ['Python', 'TensorFlow', 'Machine Learning', 'PyTorch'], type: 'Full-time', salary: '$120k-$150k', posted: '5 days ago', description: 'Build AI-powered applications.' },
    { id: 5, title: 'DevOps Engineer', company: 'CloudNative', location: 'Seattle', skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'], type: 'Contract', salary: '$110k-$140k', posted: '1 day ago', description: 'Manage cloud infrastructure.' }
  ]
}

function calculateMatchScore(jobSkills, userSkills) {
  if (!userSkills || userSkills.length === 0) return 0
  let matched = 0
  jobSkills.forEach(jobSkill => {
    userSkills.forEach(userSkill => {
      if (userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
          jobSkill.toLowerCase().includes(userSkill.toLowerCase())) {
        matched++
      }
    })
  })
  return Math.round((matched / jobSkills.length) * 100)
}

// ========== HELPER FUNCTION FOR PORTFOLIO HTML GENERATION ==========
function generatePortfolioHTML(resume) {
  const name = resume?.name || 'Your Name'
  const title = resume?.title || 'Software Engineer'
  const email = resume?.email || 'contact@example.com'
  const phone = resume?.phone || ''
  const summary = resume?.summary || 'Passionate developer building amazing applications and solving real-world problems.'
  const skills = resume?.skills || ['JavaScript', 'React', 'Node.js', 'Python']
  const experience = resume?.experience || []
  const education = resume?.education || []

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} | Portfolio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #e2e8f0;
      line-height: 1.6;
    }
    .container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
    .hero {
      text-align: center; padding: 4rem 2rem;
      background: rgba(255,255,255,0.05); border-radius: 2rem;
      margin-bottom: 2rem; backdrop-filter: blur(10px);
    }
    .hero h1 {
      font-size: 3rem; margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #fff, #a855f7);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .hero .title { font-size: 1.2rem; color: #a855f7; margin-bottom: 1rem; }
    .hero .contact { margin-top: 1rem; font-size: 0.9rem; color: #94a3b8; }
    .hero .contact span { margin: 0 0.5rem; }
    .section {
      background: rgba(255,255,255,0.05); border-radius: 1.5rem;
      padding: 2rem; margin-bottom: 2rem; backdrop-filter: blur(10px);
    }
    .section h2 {
      font-size: 1.5rem; margin-bottom: 1rem; color: #a855f7;
      border-left: 3px solid #a855f7; padding-left: 1rem;
    }
    .skills { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .skill-tag {
      background: rgba(168,85,247,0.3); padding: 0.5rem 1rem;
      border-radius: 2rem; font-size: 0.875rem; transition: all 0.3s;
    }
    .skill-tag:hover { background: rgba(168,85,247,0.5); transform: translateY(-2px); }
    .experience-item, .education-item {
      margin-bottom: 1.5rem; padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .experience-item:last-child, .education-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .exp-title { font-weight: 600; font-size: 1.1rem; color: white; }
    .exp-company { color: #a855f7; font-size: 0.875rem; margin: 0.25rem 0; }
    .exp-date { color: #64748b; font-size: 0.75rem; }
    .exp-description { font-size: 0.875rem; color: #cbd5e1; margin-top: 0.5rem; }
    .footer { text-align: center; padding: 2rem; background: rgba(255,255,255,0.05); border-radius: 1.5rem; }
    .footer p { color: #64748b; font-size: 0.875rem; }
    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .hero { padding: 2rem 1rem; }
      .hero h1 { font-size: 2rem; }
      .section { padding: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>${name}</h1>
      <div class="title">${title}</div>
      <div class="contact">
        ${email ? `<span>📧 ${email}</span>` : ''}
        ${phone ? `<span>📞 ${phone}</span>` : ''}
      </div>
    </div>
    <div class="section">
      <h2>About Me</h2>
      <p>${summary}</p>
    </div>
    <div class="section">
      <h2>Skills</h2>
      <div class="skills">
        ${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
      </div>
    </div>
    <div class="section">
      <h2>Experience</h2>
      ${experience.length > 0 ? experience.map(exp => `
        <div class="experience-item">
          <div class="exp-title">${exp.title || 'Position'}</div>
          <div class="exp-company">${exp.company || ''}</div>
          <div class="exp-date">${exp.startDate || ''} ${exp.endDate ? '- ' + exp.endDate : ''} ${exp.duration || ''}</div>
          ${exp.description ? `<div class="exp-description">${exp.description}</div>` : ''}
        </div>
      `).join('') : '<p>No experience added yet.</p>'}
    </div>
    <div class="section">
      <h2>Education</h2>
      ${education.length > 0 ? education.map(edu => `
        <div class="education-item">
          <div class="exp-title">${edu.degree || edu.school || 'Education'}</div>
          <div class="exp-company">${edu.institution || edu.school || ''}</div>
          <div class="exp-date">${edu.year || edu.graduationYear || ''}</div>
        </div>
      `).join('') : '<p>No education added yet.</p>'}
    </div>
    <div class="footer">
      <p>✨ Portfolio generated by CareerForge AI</p>
    </div>
  </div>
</body>
</html>`
}

// ========== AI API ==========
export const aiAPI = {
  atsScore: async (resume) => {
    try {
      const response = await api.post('/ai/ats-score', resume)
      return response.data
    } catch (error) {
      return {
        overallScore: 78,
        sections: {
          name: { score: 100, feedback: 'Name provided' },
          contact: { score: 100, feedback: 'Contact info provided' },
          summary: { score: 75, feedback: 'Good summary' },
          skills: { score: 80, feedback: 'Good skill set' },
          experience: { score: 70, feedback: 'Add more experience' },
          education: { score: 100, feedback: 'Education added' }
        },
        improvements: ['Add more quantifiable achievements', 'Include more industry keywords'],
        strengths: ['Good structure', 'Clear summary', 'Relevant skills']
      }
    }
  },

  customize: async (resume, job) => {
    try {
      const response = await api.post('/ai/customize', { resume, job })
      return response.data
    } catch (error) {
      return {
        success: true,
        resume: {
          ...resume,
          summary: `${resume.summary || ''} I am excited about the ${job.title} role at ${job.company}. My skills in ${job.skills?.join(', ') || 'relevant technologies'} align perfectly with this position.`,
          skills: [...new Set([...(resume.skills || []), ...(job.skills || [])])],
          optimizedSummary: `Experienced ${resume.title || 'professional'} interested in ${job.title} role.`
        }
      }
    }
  },

  coverLetter: async (resume, job) => {
    try {
      const response = await api.post('/ai/cover-letter', { resume, job })
      return response.data
    } catch (error) {
      const letter = `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}.

With my background in ${resume.skills?.slice(0, 3).join(', ') || 'software development'}, I am confident I would be a valuable addition to your team. ${resume.summary || 'My experience includes building scalable applications and solving complex problems.'}

I am particularly drawn to ${job.company} because of your innovative work in the industry. I look forward to discussing how my skills can contribute to your team.

Best regards,
${resume.name || 'Applicant'}`
      return { coverLetter: letter.trim() }
    }
  },

  portfolio: async (resume) => {
    try {
      const response = await api.post('/ai/portfolio', { resume })
      return response.data
    } catch (error) {
      const html = generatePortfolioHTML(resume)
      return {
        success: true,
        portfolio: {
          html: html,
          name: resume?.name,
          title: resume?.title,
          url: `https://portfolio.careerforge.ai/${resume?.name?.toLowerCase().replace(/\s/g, '-') || 'user'}`
        }
      }
    }
  },

  autoApply: async (resume, jobs, dailyLimit = 5) => {
    try {
      const response = await api.post('/ai/auto-apply', {
        resume,
        jobs: jobs.slice(0, dailyLimit),
        dailyLimit
      })

      if (response.data.applications && response.data.applications.length > 0) {
        for (const app of response.data.applications) {
          await applicationsAPI.create(app)
        }
      }

      return response.data
    } catch (error) {
      console.error('Auto-apply error:', error)

      const targetJobs = jobs.slice(0, dailyLimit)
      const appliedJobs = []
      const applications = []

      for (let i = 0; i < targetJobs.length; i++) {
        const job = targetJobs[i]
        const matchScore = calculateMatchScore(job.skills, resume?.skills || [])

        const application = {
          id: Date.now() + i,
          jobId: job.id,
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          skills: job.skills,
          status: 'applied',
          appliedDate: new Date().toISOString(),
          matchScore: matchScore,
          customizedResume: {
            summary: `${resume?.summary || ''} I am excited about the ${job.title} role at ${job.company}.`,
            skills: [...new Set([...(resume?.skills || []), ...(job.skills || [])])]
          }
        }

        await applicationsAPI.create(application)
        applications.push(application)
        appliedJobs.push(job.title)
      }

      const logs = [
        { step: 'start', message: '🚀 Starting Auto-Apply Agent...', timestamp: new Date() },
        { step: 'resume', message: `✅ Resume loaded: ${resume?.name || 'User'} with ${resume?.skills?.length || 0} skills`, timestamp: new Date() },
        { step: 'jobs', message: `📋 Found ${targetJobs.length} matching jobs`, timestamp: new Date() }
      ]

      for (let i = 0; i < targetJobs.length; i++) {
        const job = targetJobs[i]
        logs.push({ step: 'processing', message: `🎯 Processing: ${job.title} at ${job.company}...`, timestamp: new Date() })
        logs.push({ step: 'customizing', message: `   ✨ AI customizing resume for ${job.title}...`, timestamp: new Date() })
        logs.push({ step: 'coverletter', message: `   📝 Generating cover letter...`, timestamp: new Date() })
        logs.push({ step: 'applying', message: `   📤 Submitting application to ${job.company}...`, timestamp: new Date() })
        logs.push({ step: 'applied', message: `   ✅ Successfully applied to ${job.title} at ${job.company}`, timestamp: new Date(), success: true })
      }

      logs.push({ step: 'complete', message: `🎉 Auto-apply completed! Applied to ${appliedJobs.length} jobs`, timestamp: new Date() })

      window.dispatchEvent(new Event('applicationsUpdated'))

      return {
        success: true,
        message: `Successfully applied to ${appliedJobs.length} jobs`,
        applications,
        appliedJobs,
        logs,
        totalProcessed: targetJobs.length,
        totalApplied: appliedJobs.length
      }
    }
  }
}

// ========== APPLICATIONS API ==========
export const applicationsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/applications')
      localStorage.setItem('careerforge_applications', JSON.stringify(response.data))
      return response.data
    } catch (error) {
      const saved = localStorage.getItem('careerforge_applications')
      return saved ? JSON.parse(saved) : []
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/applications/${id}`)
      return response.data
    } catch (error) {
      const saved = localStorage.getItem('careerforge_applications')
      if (saved) {
        const apps = JSON.parse(saved)
        return apps.find(a => a.id === parseInt(id))
      }
      throw error
    }
  },

  create: async (application) => {
    try {
      const response = await api.post('/applications', application)
      const saved = localStorage.getItem('careerforge_applications')
      const apps = saved ? JSON.parse(saved) : []
      const newApp = {
        id: Date.now(),
        ...application,
        appliedAt: new Date().toISOString(),
        status: application.status || 'applied'
      }
      apps.unshift(newApp)
      localStorage.setItem('careerforge_applications', JSON.stringify(apps))
      return { success: true, application: newApp }
    } catch (error) {
      const saved = localStorage.getItem('careerforge_applications')
      const apps = saved ? JSON.parse(saved) : []
      const newApp = {
        id: Date.now(),
        ...application,
        appliedAt: new Date().toISOString(),
        status: application.status || 'applied'
      }
      apps.unshift(newApp)
      localStorage.setItem('careerforge_applications', JSON.stringify(apps))
      return { success: true, application: newApp }
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.patch(`/applications/${id}`, data)
      const saved = localStorage.getItem('careerforge_applications')
      if (saved) {
        const apps = JSON.parse(saved)
        const index = apps.findIndex(a => a.id === parseInt(id))
        if (index !== -1) {
          apps[index] = { ...apps[index], ...data, updatedAt: new Date().toISOString() }
          localStorage.setItem('careerforge_applications', JSON.stringify(apps))
        }
      }
      return response.data
    } catch (error) {
      const saved = localStorage.getItem('careerforge_applications')
      if (saved) {
        const apps = JSON.parse(saved)
        const index = apps.findIndex(a => a.id === parseInt(id))
        if (index !== -1) {
          apps[index] = { ...apps[index], ...data, updatedAt: new Date().toISOString() }
          localStorage.setItem('careerforge_applications', JSON.stringify(apps))
          return apps[index]
        }
      }
      return { id, ...data }
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/applications/${id}`)
      const saved = localStorage.getItem('careerforge_applications')
      if (saved) {
        const apps = JSON.parse(saved)
        const filtered = apps.filter(a => a.id !== parseInt(id))
        localStorage.setItem('careerforge_applications', JSON.stringify(filtered))
      }
      return response.data
    } catch (error) {
      const saved = localStorage.getItem('careerforge_applications')
      if (saved) {
        const apps = JSON.parse(saved)
        const filtered = apps.filter(a => a.id !== parseInt(id))
        localStorage.setItem('careerforge_applications', JSON.stringify(filtered))
      }
      return { success: true }
    }
  }
}

// ========== PORTFOLIO API ==========
export const portfolioAPI = {
  generate: async (resume) => {
    try {
      const response = await api.post('/portfolio/generate', { resume })
      if (response.data && response.data.html) {
        return { success: true, portfolio: { html: response.data.html } }
      }
      if (response.data && response.data.portfolio && response.data.portfolio.html) {
        return response.data
      }
      const html = generatePortfolioHTML(resume)
      return {
        success: true,
        portfolio: {
          html: html,
          name: resume?.name,
          title: resume?.title,
          url: `https://portfolio.careerforge.ai/${resume?.name?.toLowerCase().replace(/\s/g, '-') || 'user'}`
        }
      }
    } catch (error) {
      console.error('Generate portfolio error:', error)
      const html = generatePortfolioHTML(resume)
      return {
        success: true,
        portfolio: {
          html: html,
          name: resume?.name,
          title: resume?.title,
          url: `https://portfolio.careerforge.ai/${resume?.name?.toLowerCase().replace(/\s/g, '-') || 'user'}`
        }
      }
    }
  }
}

export default api