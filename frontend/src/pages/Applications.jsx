import React, { useEffect, useState } from 'react'
import { applicationsAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import './Applications.css'

const STATUSES = ['saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn']
const STATUS_COLORS = {
  saved: 'gray', applied: 'blue', interviewing: 'accent',
  offer: 'green', rejected: 'red', withdrawn: 'yellow'
}
const STATUS_ICONS = {
  saved: 'bookmark', applied: 'send', interviewing: 'record_voice_over',
  offer: 'celebration', rejected: 'cancel', withdrawn: 'undo'
}

export default function Applications() {
  const { notify } = useApp()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = () => {
    applicationsAPI.getAll()
      .then(setApps)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await applicationsAPI.update(id, { status })
      setApps(apps.map(a => a.id === id ? updated : a))
      notify(`Status updated to ${status}`)
    } catch (err) {
      notify(err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return
    try {
      await applicationsAPI.delete(id)
      setApps(apps.filter(a => a.id !== id))
      notify('Application deleted')
    } catch (err) {
      notify(err.message, 'error')
    }
  }

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter)

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length
    return acc
  }, {})

  return (
    <div className="applications fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">Application Tracker</h1>
          <p className="section-subtitle">Track and manage all your job applications in one place</p>
        </div>
      </div>

      {/* Pipeline */}
      <div className="pipeline">
        {STATUSES.map(s => (
          <button
            key={s}
            className={`pipeline-stage ${filter === s ? 'active' : ''} stage-${STATUS_COLORS[s]}`}
            onClick={() => setFilter(filter === s ? 'all' : s)}
          >
            <span className="material-icons">{STATUS_ICONS[s]}</span>
            <span className="stage-label">{s}</span>
            <span className="stage-count">{counts[s]}</span>
          </button>
        ))}
        <button
          className={`pipeline-stage ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <span className="material-icons">apps</span>
          <span className="stage-label">all</span>
          <span className="stage-count">{apps.length}</span>
        </button>
      </div>

      {loading ? (
        <div className="empty-state"><div className="loading-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <span className="material-icons">assignment</span>
          <p>{filter === 'all' ? 'No applications yet. Browse jobs to get started!' : `No ${filter} applications`}</p>
        </div>
      ) : (
        <div className="app-table">
          <div className="app-table-header">
            <span>Position</span>
            <span>Status</span>
            <span>Applied</span>
            <span>Actions</span>
          </div>
          {filtered.map(app => (
            <div key={app.id} className="app-table-row">
              <div className="app-position">
                <div className="app-job-title">{app.jobTitle}</div>
                <div className="app-job-company">{app.company}</div>
              </div>
              <div>
                <select
                  className={`status-select status-${STATUS_COLORS[app.status]}`}
                  value={app.status}
                  onChange={e => handleStatusChange(app.id, e.target.value)}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="app-date">
                {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '—'}
              </div>
              <div className="app-row-actions">
                {app.status === 'saved' && (
                  <button
                    className="btn btn-success"
                    style={{ padding: '6px 12px', fontSize: 13 }}
                    onClick={() => handleStatusChange(app.id, 'applied')}
                  >
                    <span className="material-icons">send</span> Mark Applied
                  </button>
                )}
                <button
                  className="btn btn-danger"
                  style={{ padding: '6px 10px', fontSize: 13 }}
                  onClick={() => handleDelete(app.id)}
                >
                  <span className="material-icons">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
