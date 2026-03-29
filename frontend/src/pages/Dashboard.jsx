import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { applicationsAPI, jobsAPI } from '../services/api'
import './Dashboard.css'

const STATUS_COLORS = {
  saved: 'gray', applied: 'blue', interviewing: 'accent',
  offer: 'green', rejected: 'red', withdrawn: 'yellow'
}

export default function Dashboard() {
  const { resume } = useApp()
  const [apps, setApps] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([applicationsAPI.getAll(), jobsAPI.getAll()])
      .then(([a, j]) => { setApps(a); setJobs(j) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: apps.length,
    applied: apps.filter(a => a.status === 'applied').length,
    interviewing: apps.filter(a => a.status === 'interviewing').length,
    offers: apps.filter(a => a.status === 'offer').length,
  }

  const quickActions = [
    { to: '/resume/upload', icon: 'upload_file', label: 'Upload Resume', desc: 'Parse with AI', color: 'accent' },
    { to: '/resume/build', icon: 'edit_document', label: 'Build Resume', desc: 'ATS-optimized builder', color: 'blue' },
    { to: '/jobs', icon: 'travel_explore', label: 'Find Jobs', desc: 'AI-matched listings', color: 'green' },
    { to: '/portfolio', icon: 'web', label: 'Gen Portfolio', desc: 'AI-generated site', color: 'yellow' },
  ]

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <div className="dashboard-greeting">
          <span className="greeting-emoji">👋</span>
          <div>
            <h1 className="section-title">
              Welcome{resume?.parsedData?.name ? `, ${resume.parsedData.name.split(' ')[0]}` : ' back'}
            </h1>
            <p className="section-subtitle">Your AI-powered career platform is ready.</p>
          </div>
        </div>
        <div className="ai-badge">
          <span className="material-icons">auto_awesome</span>
          TinyFish AI Enabled
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Applications', value: stats.total, icon: 'assignment', color: 'accent' },
          { label: 'Applied', value: stats.applied, icon: 'send', color: 'blue' },
          { label: 'Interviewing', value: stats.interviewing, icon: 'record_voice_over', color: 'green' },
          { label: 'Offers', value: stats.offers, icon: 'celebration', color: 'yellow' },
        ].map(stat => (
          <div key={stat.label} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              <span className="material-icons">{stat.icon}</span>
            </div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Quick Actions</h2>
        <div className="quick-actions">
          {quickActions.map(a => (
            <Link key={a.to} to={a.to} className={`quick-card quick-${a.color}`}>
              <span className="material-icons quick-icon">{a.icon}</span>
              <div className="quick-label">{a.label}</div>
              <div className="quick-desc">{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="dashboard-bottom">
        {/* Recent Applications */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title" style={{ fontSize: '16px' }}>Recent Applications</h2>
            <Link to="/applications" className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '13px' }}>
              View all <span className="material-icons" style={{ fontSize: '16px' }}>arrow_forward</span>
            </Link>
          </div>
          {loading ? (
            <div className="empty-state"><div className="loading-spinner" /></div>
          ) : apps.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons">assignment</span>
              <p>No applications yet</p>
              <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
            </div>
          ) : (
            <div className="app-list">
              {apps.slice(0, 5).map(app => (
                <div key={app.id} className="app-row">
                  <div className="app-info">
                    <div className="app-title">{app.jobTitle}</div>
                    <div className="app-company">{app.company}</div>
                  </div>
                  <span className={`badge badge-${STATUS_COLORS[app.status] || 'gray'}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Matched Jobs */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title" style={{ fontSize: '16px' }}>Top Job Matches</h2>
            <Link to="/jobs" className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '13px' }}>
              View all <span className="material-icons" style={{ fontSize: '16px' }}>arrow_forward</span>
            </Link>
          </div>
          {loading ? (
            <div className="empty-state"><div className="loading-spinner" /></div>
          ) : (
            <div className="app-list">
              {jobs.slice(0, 5).map(job => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="app-row app-row-link">
                  <div className="job-logo" style={{ background: job.color }}>{job.logo}</div>
                  <div className="app-info">
                    <div className="app-title">{job.title}</div>
                    <div className="app-company">{job.company}</div>
                  </div>
                  <div className={`match-score ${job.matchScore >= 80 ? 'match-high' : job.matchScore >= 60 ? 'match-mid' : 'match-low'}`}>
                    {job.matchScore}%
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
