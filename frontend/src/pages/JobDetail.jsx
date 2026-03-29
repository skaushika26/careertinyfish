import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { jobsAPI, aiAPI, applicationsAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import './JobDetail.css'

export default function JobDetail() {
  const { id } = useParams()
  const { resume, notify } = useApp()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [customized, setCustomized] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [clLoading, setClLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      const data = await jobsAPI.getById(id)
      // Calculate match score
      const matchScore = calculateMatchScore(data.skills, resume?.skills || [])
      setJob({ ...data, matchScore })
    } catch (error) {
      console.error('Error fetching job:', error)
      notify('Job not found', 'error')
      navigate('/jobs')
    } finally {
      setLoading(false)
    }
  }

  const calculateMatchScore = (jobSkills, userSkills) => {
    if (!userSkills || userSkills.length === 0) return 0
    const matched = jobSkills.filter(skill => 
      userSkills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()) || 
                                 skill.toLowerCase().includes(userSkill.toLowerCase()))
    ).length
    return Math.round((matched / jobSkills.length) * 100)
  }

  const handleCustomize = async () => {
    if (!resume) { 
      notify('Please upload a resume first', 'error')
      navigate('/upload')
      return
    }
    setAiLoading(true)
    try {
      const result = await aiAPI.customize(resume, job)
      setCustomized(result.resume || result)
      setActiveTab('customized')
      notify('Resume customized for this job!')
    } catch (err) {
      console.error('Customize error:', err)
      // Fallback customization
      setCustomized({
        ...resume,
        summary: `${resume.summary || ''} I am excited about the ${job.title} role at ${job.company}.`,
        skills: [...new Set([...(resume.skills || []), ...(job.skills || [])])]
      })
      notify('Resume customized (using fallback)')
    } finally {
      setAiLoading(false)
    }
  }

  const handleCoverLetter = async () => {
    if (!resume) {
      notify('Please upload a resume first', 'error')
      navigate('/upload')
      return
    }
    setClLoading(true)
    try {
      const result = await aiAPI.coverLetter(resume, job)
      setCoverLetter(result.coverLetter)
      setActiveTab('coverletter')
      notify('Cover letter generated!')
    } catch (err) {
      console.error('Cover letter error:', err)
      // Fallback cover letter
      const fallbackLetter = `
Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}.

With my background in ${resume.skills?.slice(0, 3).join(', ') || 'software development'}, I am confident I would be a valuable addition to your team. ${resume.summary || 'My experience includes building scalable applications and solving complex problems.'}

I am particularly drawn to ${job.company} because of your innovative work in the industry. I look forward to discussing how my skills can contribute to your team.

Best regards,
${resume.name || 'Applicant'}
      `
      setCoverLetter(fallbackLetter.trim())
      notify('Cover letter generated (using fallback)')
    } finally {
      setClLoading(false)
    }
  }

  const handleSaveApplication = async () => {
    setSaving(true)
    try {
      await applicationsAPI.create({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        jobUrl: '',
        customizedResume: customized ? JSON.stringify(customized) : '',
        coverLetter: coverLetter,
        status: 'saved',
        date: new Date().toISOString()
      })
      notify('Application saved!')
      navigate('/applications')
    } catch (err) {
      console.error('Save error:', err)
      notify('Failed to save application', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="empty-state">
      <div className="loading-spinner" />
      <p>Loading job details...</p>
    </div>
  )
  
  if (!job) return (
    <div className="empty-state">
      <span className="material-icons">error</span>
      <p>Job not found</p>
      <button className="btn btn-primary" onClick={() => navigate('/jobs')}>Back to Jobs</button>
    </div>
  )

  const getMatchClass = (score) => {
    if (score >= 80) return 'match-high'
    if (score >= 60) return 'match-mid'
    return 'match-low'
  }

  return (
    <div className="job-detail fade-in">
      {/* Header */}
      <div className="jd-header card">
        <div className="jd-header-left">
          <div className="job-logo-xl">
            <span className="material-icons" style={{ fontSize: 40 }}>work</span>
          </div>
          <div>
            <h1 className="jd-title">{job.title}</h1>
            <div className="jd-meta">
              <span><span className="material-icons">business</span>{job.company}</span>
              <span><span className="material-icons">location_on</span>{job.location}</span>
              <span><span className="material-icons">payments</span>{job.salary}</span>
              <span><span className="material-icons">work</span>{job.type}</span>
            </div>
            <div className="tags-list" style={{ marginTop: 12 }}>
              {job.skills?.map(s => <span key={s} className="tag">{s}</span>)}
            </div>
          </div>
        </div>
        <div className="jd-header-right">
          <div className={`match-pill-lg ${getMatchClass(job.matchScore)}`}>
            <span className="material-icons">auto_awesome</span>
            {job.matchScore}% Match
          </div>
          <div className="jd-actions">
            <button className="btn btn-secondary" onClick={handleCustomize} disabled={aiLoading}>
              {aiLoading ? <><div className="loading-spinner" />Customizing...</> : <><span className="material-icons">auto_fix_high</span>AI Customize</>}
            </button>
            <button className="btn btn-ghost" onClick={handleCoverLetter} disabled={clLoading}>
              {clLoading ? <><div className="loading-spinner" />Generating...</> : <><span className="material-icons">description</span>Cover Letter</>}
            </button>
            <button className="btn btn-primary" onClick={handleSaveApplication} disabled={saving}>
              {saving ? <><div className="loading-spinner" />Saving...</> : <><span className="material-icons">bookmark</span>Save Job</>}
            </button>
          </div>
          {!resume && (
            <div className="no-resume-warn">
              <span className="material-icons">info</span> 
              <a href="/upload">Upload a resume</a> to use AI features
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="jd-tabs">
        {[
          { id: 'overview', label: 'Job Overview', icon: 'description' },
          { id: 'customized', label: 'AI Resume', icon: 'auto_fix_high', badge: customized },
          { id: 'coverletter', label: 'Cover Letter', icon: 'edit_note', badge: coverLetter },
        ].map(tab => (
          <button
            key={tab.id}
            className={`jd-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="material-icons">{tab.icon}</span>
            {tab.label}
            {tab.badge && <span className="tab-badge">✓</span>}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="jd-content">
        {activeTab === 'overview' && (
          <div className="card fade-in">
            <h3 className="parsed-section-title"><span className="material-icons">article</span>Job Description</h3>
            <pre className="jd-description">{job.description || 'No description available'}</pre>
          </div>
        )}

        {activeTab === 'customized' && (
          <div className="fade-in">
            {!customized ? (
              <div className="empty-state card">
                <span className="material-icons">auto_fix_high</span>
                <p>Click "AI Customize" to tailor your resume for this job</p>
                <button className="btn btn-primary" onClick={handleCustomize} disabled={aiLoading}>
                  {aiLoading ? 'Customizing...' : 'Customize Now'}
                </button>
              </div>
            ) : (
              <div className="customized-resume">
                <div className="card">
                  <h3 className="parsed-section-title"><span className="material-icons">person</span>Optimized Summary</h3>
                  <p style={{ color: '#334155', fontSize: 14, lineHeight: 1.6 }}>{customized.summary}</p>
                </div>
                <div className="card">
                  <h3 className="parsed-section-title"><span className="material-icons">psychology</span>Optimized Skills</h3>
                  <div className="tags-list">
                    {(customized.skills || []).map(s => <span key={s} className="tag">{s}</span>)}
                  </div>
                </div>
                <div className="card">
                  <h3 className="parsed-section-title"><span className="material-icons">edit_note</span>ATS Optimized Summary</h3>
                  <p style={{ color: '#334155', fontSize: 14 }}>
                    {customized.optimizedSummary || customized.summary}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'coverletter' && (
          <div className="fade-in">
            {!coverLetter ? (
              <div className="empty-state card">
                <span className="material-icons">edit_note</span>
                <p>Click "Cover Letter" to generate an AI cover letter</p>
                <button className="btn btn-primary" onClick={handleCoverLetter} disabled={clLoading}>
                  {clLoading ? 'Generating...' : 'Generate Now'}
                </button>
              </div>
            ) : (
              <div className="card">
                <div className="cl-header">
                  <h3 className="parsed-section-title"><span className="material-icons">edit_note</span>Cover Letter</h3>
                  <button className="btn btn-ghost" style={{ fontSize: 13, padding: '6px 12px' }}
                    onClick={() => { navigator.clipboard.writeText(coverLetter); notify('Copied!') }}>
                    <span className="material-icons">content_copy</span> Copy
                  </button>
                </div>
                <pre className="cl-text">{coverLetter}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}