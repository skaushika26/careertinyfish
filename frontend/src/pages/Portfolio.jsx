import React, { useState } from 'react'
import { portfolioAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import './Portfolio.css'

export default function Portfolio() {
  const { resume, notify } = useApp()
  const [loading, setLoading] = useState(false)
  const [portfolioData, setPortfolioData] = useState(null)
  const [view, setView] = useState('preview')

  const handleGenerate = async () => {
    if (!resume) { 
      notify('Please upload a resume first', 'error')
      return
    }
    
    setLoading(true)
    setPortfolioData(null)
    
    try {
      const result = await portfolioAPI.generate(resume)
      console.log('Portfolio result:', result)
      
      if (result.success && result.portfolio) {
        setPortfolioData(result.portfolio)
        notify('Portfolio generated successfully!')
      } else if (result.html) {
        // If backend returns HTML directly
        setPortfolioData({ html: result.html })
        notify('Portfolio generated!')
      } else {
        // Fallback - create portfolio from resume data
        const generatedPortfolio = generatePortfolioFromResume(resume)
        setPortfolioData(generatedPortfolio)
        notify('Portfolio generated (offline mode)')
      }
    } catch (err) {
      console.error('Portfolio error:', err)
      // Fallback - generate portfolio from resume data
      const generatedPortfolio = generatePortfolioFromResume(resume)
      setPortfolioData(generatedPortfolio)
      notify('Portfolio generated (offline mode)', 'info')
    } finally {
      setLoading(false)
    }
  }

  const generatePortfolioFromResume = (resume) => {
    const name = resume.name || 'Your Name'
    const title = resume.title || 'Software Engineer'
    const summary = resume.summary || 'Passionate developer building amazing applications.'
    const skills = resume.skills || ['JavaScript', 'React', 'Node.js']
    const experience = resume.experience || []
    const education = resume.education || []
    
    const html = `<!DOCTYPE html>
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
      text-align: center;
      padding: 4rem 2rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 2rem;
      margin-bottom: 2rem;
      backdrop-filter: blur(10px);
    }
    .hero h1 { font-size: 3rem; margin-bottom: 0.5rem; background: linear-gradient(135deg, #fff, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 1.2rem; color: #94a3b8; margin-bottom: 1rem; }
    .section {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 1.5rem;
      padding: 2rem;
      margin-bottom: 2rem;
      backdrop-filter: blur(10px);
    }
    .section h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #a855f7;
      border-left: 3px solid #a855f7;
      padding-left: 1rem;
    }
    .skills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .skill-tag {
      background: rgba(168, 85, 247, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-size: 0.875rem;
    }
    .experience-item, .education-item {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .exp-title { font-weight: 600; font-size: 1.1rem; color: white; }
    .exp-company { color: #a855f7; font-size: 0.875rem; margin: 0.25rem 0; }
    .exp-date { color: #64748b; font-size: 0.75rem; }
    .contact {
      text-align: center;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 1.5rem;
    }
    .contact a { color: #a855f7; text-decoration: none; }
    @media (max-width: 768px) {
      .container { padding: 1rem; }
      .hero h1 { font-size: 2rem; }
      .hero { padding: 2rem 1rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <h1>${name}</h1>
      <p>${title}</p>
      <p>${summary.substring(0, 200)}</p>
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
          <div class="exp-date">${exp.duration || exp.startDate || ''} ${exp.endDate ? '- ' + exp.endDate : ''}</div>
        </div>
      `).join('') : '<p>No experience added yet.</p>'}
    </div>
    
    <div class="section">
      <h2>Education</h2>
      ${education.length > 0 ? education.map(edu => `
        <div class="education-item">
          <div class="exp-title">${edu.degree || edu.school || 'Education'}</div>
          <div class="exp-company">${edu.institution || ''}</div>
          <div class="exp-date">${edu.year || edu.graduationYear || ''}</div>
        </div>
      `).join('') : '<p>No education added yet.</p>'}
    </div>
    
    <div class="contact">
      <p>Connect with me: <a href="#">LinkedIn</a> | <a href="#">GitHub</a> | <a href="#">Twitter</a></p>
      <p>✨ Portfolio generated by CareerForge AI</p>
    </div>
  </div>
</body>
</html>`
    
    return { html, name, title, skills, summary, experience, education }
  }

  const handleDownload = () => {
    if (!portfolioData || !portfolioData.html) {
      notify('No portfolio to download', 'error')
      return
    }
    
    const blob = new Blob([portfolioData.html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${resume?.name?.replace(/\s+/g, '-') || 'portfolio'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Portfolio downloaded!')
  }

  return (
    <div className="portfolio-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">Portfolio Generator</h1>
          <p className="section-subtitle">Generate a beautiful personal portfolio website with AI</p>
        </div>
        <div className="ai-badge">
          <span className="material-icons">auto_awesome</span>
          TinyFish AI
        </div>
      </div>

      {!resume ? (
        <div className="empty-state card" style={{ padding: 60, textAlign: 'center' }}>
          <span className="material-icons" style={{ fontSize: 56, color: '#8b5cf6', opacity: 0.6 }}>web</span>
          <p style={{ fontSize: 16, color: '#64748b', marginTop: 16 }}>
            Upload your resume first to generate a portfolio
          </p>
          <a href="/resume/upload" className="btn-primary" style={{ display: 'inline-block', marginTop: 20 }}>
            Upload Resume
          </a>
        </div>
      ) : !portfolioData ? (
        <div className="portfolio-cta card">
          <div className="portfolio-cta-text">
            <h2>One click to your portfolio</h2>
            <p>TinyFish AI will generate a complete, responsive portfolio website from your resume — ready to host anywhere.</p>
            <ul className="portfolio-features">
              {['Dark themed, modern design', 'Skills, experience & education sections', 'Mobile responsive', 'Download as HTML — host anywhere'].map(f => (
                <li key={f}>
                  <span className="material-icons">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <button 
              className="btn-primary" 
              style={{ marginTop: 24, padding: '12px 32px', fontSize: '1rem' }}
              onClick={handleGenerate} 
              disabled={loading}
            >
              {loading ? (
                <><div className="loading-spinner" /> Generating portfolio...</>
              ) : (
                <><span className="material-icons">auto_awesome</span> Generate Portfolio</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="portfolio-result">
          <div className="portfolio-toolbar">
            <div className="portfolio-tabs">
              {['preview', 'code'].map(v => (
                <button 
                  key={v} 
                  className={`portfolio-tab ${view === v ? 'active' : ''}`} 
                  onClick={() => setView(v)}
                >
                  <span className="material-icons">{v === 'preview' ? 'visibility' : 'code'}</span>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" onClick={handleGenerate} disabled={loading}>
                <span className="material-icons">refresh</span> Regenerate
              </button>
              <button className="btn-primary" onClick={handleDownload}>
                <span className="material-icons">download</span> Download HTML
              </button>
            </div>
          </div>

          {view === 'preview' ? (
            <div className="portfolio-iframe-wrap">
              <iframe
                title="Portfolio Preview"
                className="portfolio-iframe"
                srcDoc={portfolioData.html}
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          ) : (
            <div className="code-view">
              <pre className="code-block">{portfolioData.html}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}