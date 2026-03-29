import React, { useState, useEffect } from 'react'
import { applicationsAPI } from '../services/api'
import './Tracker.css'

export default function Tracker() {
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interviewing: 0,
    offered: 0,
    rejected: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const data = await applicationsAPI.getAll()
      setApplications(data)
      
      // Calculate stats
      const newStats = {
        total: data.length,
        applied: data.filter(a => a.status === 'applied').length,
        interviewing: data.filter(a => a.status === 'interviewing').length,
        offered: data.filter(a => a.status === 'offered').length,
        rejected: data.filter(a => a.status === 'rejected').length
      }
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'status-applied'
      case 'interviewing': return 'status-interviewing'
      case 'offered': return 'status-offered'
      case 'rejected': return 'status-rejected'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="empty-state">
        <div className="loading-spinner"></div>
        <p>Loading tracker...</p>
      </div>
    )
  }

  return (
    <div className="tracker fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">Application Tracker</h1>
          <p className="section-subtitle">Track your job application progress</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.applied}</div>
          <div className="stat-label">Applied</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.interviewing}</div>
          <div className="stat-label">Interviewing</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.offered}</div>
          <div className="stat-label">Offers</div>
        </div>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="progress-section card">
          <h3>Application Progress</h3>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div className="progress-fill applied" style={{ width: `${(stats.applied / stats.total) * 100}%` }}></div>
              <div className="progress-fill interviewing" style={{ width: `${(stats.interviewing / stats.total) * 100}%` }}></div>
              <div className="progress-fill offered" style={{ width: `${(stats.offered / stats.total) * 100}%` }}></div>
              <div className="progress-fill rejected" style={{ width: `${(stats.rejected / stats.total) * 100}%` }}></div>
            </div>
            <div className="progress-labels">
              <span><span className="dot applied"></span> Applied</span>
              <span><span className="dot interviewing"></span> Interview</span>
              <span><span className="dot offered"></span> Offer</span>
              <span><span className="dot rejected"></span> Rejected</span>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="applications-list">
        <h3>All Applications</h3>
        {applications.length === 0 ? (
          <div className="empty-state card">
            <span className="material-icons">inbox</span>
            <p>No applications yet</p>
            <a href="/jobs" className="btn btn-primary">Browse Jobs</a>
          </div>
        ) : (
          applications.map((app, index) => (
            <div key={app.id || index} className="application-card card">
              <div className="application-header">
                <div className="application-info">
                  <h4 className="application-title">{app.jobTitle}</h4>
                  <div className="application-meta">
                    <span><span className="material-icons">business</span> {app.company}</span>
                    <span><span className="material-icons">location_on</span> {app.location || 'Remote'}</span>
                    <span><span className="material-icons">calendar_today</span> {new Date(app.appliedDate || app.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={`application-status ${getStatusColor(app.status)}`}>
                  {app.status || 'applied'}
                </div>
              </div>
              {app.matchScore && (
                <div className="application-match">
                  <span className="match-label">Match Score:</span>
                  <span className={`match-value ${app.matchScore >= 80 ? 'high' : app.matchScore >= 60 ? 'mid' : 'low'}`}>
                    {app.matchScore}%
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}