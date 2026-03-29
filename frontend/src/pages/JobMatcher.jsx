import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsAPI, aiAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import './JobMatcher.css'

export default function JobMatcher() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterType, setFilterType] = useState('')
  const [autoApplying, setAutoApplying] = useState(false)
  const [autoApplyResult, setAutoApplyResult] = useState(null)
  const { resume, resumeLoaded, notify } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const data = await jobsAPI.getAll()
      const userSkills = resume?.skills || []
      const jobsWithMatch = data.map(job => ({
        ...job,
        matchScore: calculateMatchScore(job.skills, userSkills)
      }))
      jobsWithMatch.sort((a, b) => b.matchScore - a.matchScore)
      setJobs(jobsWithMatch)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMatchScore = (jobSkills, userSkills) => {
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

  // ========== AUTO-APPLY FUNCTION ==========
  const handleAutoApply = async () => {
    if (!resumeLoaded || !resume) {
      notify('Please upload a resume first', 'error')
      navigate('/resume/upload')
      return
    }

    setAutoApplying(true)
    setAutoApplyResult(null)

    try {
      const topJobs = jobs.slice(0, 5)
      notify('🤖 Auto-Apply Agent started! Processing jobs...')
      
      const result = await aiAPI.autoApply(resume, topJobs, 5)
      
      if (result.success) {
        setAutoApplyResult(result)
        notify(`✅ Applied to ${result.appliedJobs.length} jobs successfully!`)
        fetchJobs()
      } else {
        notify(result.message || 'Auto-apply failed', 'error')
      }
    } catch (error) {
      console.error('Auto-apply error:', error)
      notify('Failed to auto-apply', 'error')
    } finally {
      setTimeout(() => setAutoApplying(false), 2000)
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = filterLocation ? job.location.toLowerCase().includes(filterLocation.toLowerCase()) : true
    const matchesType = filterType ? job.type === filterType : true
    return matchesSearch && matchesLocation && matchesType
  })

  const handleJobClick = (job) => {
    navigate(`/jobs/${job.id}`)
  }

  const getMatchColor = (score) => {
    if (score >= 80) return 'match-high'
    if (score >= 60) return 'match-mid'
    return 'match-low'
  }

  if (loading) {
    return (
      <div className="empty-state">
        <div className="loading-spinner"></div>
        <p>Loading jobs...</p>
      </div>
    )
  }

  return (
    <div className="job-matcher fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">Job Board</h1>
          <p className="section-subtitle">Find your next opportunity</p>
        </div>
        <div className="header-actions">
          {/* AUTO-APPLY BUTTON */}
          <button 
            className="btn-auto-apply" 
            onClick={handleAutoApply}
            disabled={autoApplying || !resumeLoaded}
          >
            {autoApplying ? (
              <><div className="loading-spinner-small"></div> Auto-Applying...</>
            ) : (
              <><span className="material-icons">auto_awesome</span> AI Auto-Apply</>
            )}
          </button>
          
          {resumeLoaded && resume ? (
            <div className="resume-badge">
              <span className="material-icons">check_circle</span>
              {resume.skills?.length || 0} skills
            </div>
          ) : (
            <div className="resume-badge-warning">
              <span className="material-icons">warning</span>
              <a href="/resume/upload">Upload resume</a>
            </div>
          )}
        </div>
      </div>

      {/* AUTO-APPLY RESULT DISPLAY */}
      {autoApplyResult && (
        <div className="auto-apply-result success">
          <div className="result-header">
            <span className="material-icons">check_circle</span>
            <span>Auto-Apply Complete!</span>
          </div>
          <div className="result-stats">
            <div className="stat">
              <span className="stat-value">{autoApplyResult.totalApplied}</span>
              <span className="stat-label">Jobs Applied</span>
            </div>
            <div className="stat">
              <span className="stat-value">{autoApplyResult.totalProcessed}</span>
              <span className="stat-label">Processed</span>
            </div>
          </div>
          <div className="applied-jobs-list">
            {autoApplyResult.appliedJobs?.slice(0, 5).map((job, i) => (
              <div key={i} className="applied-job-item">
                <span className="material-icons">check</span>
                {job}
              </div>
            ))}
          </div>
          <button 
            className="btn-view-applications"
            onClick={() => navigate('/applications')}
          >
            View Applications →
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar card">
        <div className="filter-group">
          <span className="material-icons">search</span>
          <input 
            type="text" 
            placeholder="Search jobs or companies..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <span className="material-icons">location_on</span>
          <input 
            type="text" 
            placeholder="Location" 
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <span className="material-icons">work</span>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Remote">Remote</option>
          </select>
        </div>
      </div>

      {/* Job List */}
      <div className="jobs-list">
        {filteredJobs.length === 0 ? (
          <div className="empty-state card">
            <span className="material-icons">search_off</span>
            <p>No jobs found</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div 
              key={job.id} 
              className="job-card card"
              onClick={() => handleJobClick(job)}
            >
              <div className="job-header">
                <div className="job-info">
                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-meta">
                    <span><span className="material-icons">business</span>{job.company}</span>
                    <span><span className="material-icons">location_on</span>{job.location}</span>
                    <span><span className="material-icons">payments</span>{job.salary}</span>
                    <span><span className="material-icons">work</span>{job.type}</span>
                  </div>
                  <div className="skills-list">
                    {job.skills.slice(0, 5).map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                    {job.skills.length > 5 && <span className="skill-tag">+{job.skills.length - 5}</span>}
                  </div>
                </div>
                <div className="match-badge">
                  <div className={`match-score ${getMatchColor(job.matchScore)}`}>
                    <span className="material-icons">auto_awesome</span>
                    {job.matchScore}% Match
                  </div>
                </div>
              </div>
              <p className="job-description">{job.description?.substring(0, 120)}...</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}