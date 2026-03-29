import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { jobsAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import './JobBoard.css'

export default function JobBoard() {
  const { resume } = useApp()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    const skills = resume?.parsedData?.skills || []
    jobsAPI.getAll(skills)
      .then(setJobs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [resume])

  const filtered = jobs.filter(j => {
    const q = filter.toLowerCase()
    const matchText = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.skills.some(s => s.toLowerCase().includes(q))
    const matchType = typeFilter === 'all' || j.type.toLowerCase().includes(typeFilter)
    return matchText && matchType
  })

  return (
    <div className="job-board fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">Job Board</h1>
          <p className="section-subtitle">
            {resume ? 'Jobs ranked by AI match score against your resume' : 'Upload your resume to see personalized match scores'}
          </p>
        </div>
        {resume && (
          <div className="ai-badge"><span className="material-icons">auto_awesome</span>AI Matched</div>
        )}
      </div>

      <div className="job-filters">
        <div style={{ position: 'relative', flex: 1 }}>
          <span className="material-icons search-icon">search</span>
          <input
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="Search jobs, companies, skills..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <select className="input" style={{ width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="contract">Contract</option>
          <option value="part-time">Part-time</option>
        </select>
      </div>

      {loading ? (
        <div className="empty-state"><div className="loading-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons">search_off</span>
          <p>No jobs match your search</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {filtered.map(job => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="job-card card card-hover">
              <div className="job-card-header">
                <div className="job-logo-lg" style={{ background: job.color }}>{job.logo}</div>
                <div className="job-match-badge">
                  <div className={`match-pill ${job.matchScore >= 80 ? 'match-high' : job.matchScore >= 60 ? 'match-mid' : 'match-low'}`}>
                    {job.matchScore}% match
                  </div>
                </div>
              </div>
              <div className="job-card-body">
                <div className="job-title">{job.title}</div>
                <div className="job-company">{job.company}</div>
                <div className="job-meta">
                  <span><span className="material-icons">location_on</span>{job.location}</span>
                  <span><span className="material-icons">payments</span>{job.salary}</span>
                </div>
                <div className="tags-list" style={{ marginTop: 12 }}>
                  {job.skills.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
              </div>
              <div className="job-card-footer">
                <span className="badge badge-gray">{job.type}</span>
                <span className="job-date">Posted {new Date(job.postedDate).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
