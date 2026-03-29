import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { resumeAPI } from '../services/api'
import './ResumeUpload.css'

export default function ResumeUpload() {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed] = useState(null)
  const [step, setStep] = useState('upload')
  const fileRef = useRef()
  const { setResume, notify } = useApp()
  const navigate = useNavigate()

  const handleFile = (f) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowed.includes(f.type) && !f.name.match(/\.(pdf|docx|txt)$/i)) {
      notify('Please upload a PDF, DOCX, or TXT file', 'error')
      return
    }
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    try {
      const result = await resumeAPI.upload(file)
      console.log('Upload result:', result)
      
      const resumeData = result.resume || result
      setParsed(resumeData)
      setStep('preview')
      notify('Resume parsed successfully!')
    } catch (err) {
      console.error('Upload error:', err)
      notify(err.message || 'Failed to parse resume', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    if (parsed) {
      setResume(parsed)
      notify('Resume saved! Ready to find jobs.')
      navigate('/jobs')
    }
  }

  if (step === 'preview' && parsed) {
    const data = {
      name: parsed.name || 'Not found',
      email: parsed.email || 'Not found',
      phone: parsed.phone || 'Not found',
      location: parsed.location || 'Not found',
      skills: parsed.skills || [],
      summary: parsed.summary || 'No summary detected',
      experience: parsed.experience || [],
      education: parsed.education || []
    }

    return (
      <div className="resume-upload fade-in">
        <div className="page-header">
          <div>
            <h1 className="section-title">Resume Parsed ✨</h1>
            <p className="section-subtitle">Review what AI extracted from your resume</p>
          </div>
          <div className="ai-badge"><span className="material-icons">auto_awesome</span>AI Parsed</div>
        </div>

        <div className="parsed-grid">
          <div className="card">
            <h3 className="parsed-section-title"><span className="material-icons">person</span> Contact</h3>
            <div className="parsed-fields">
              <Field label="Name" value={data.name} />
              <Field label="Email" value={data.email} />
              <Field label="Phone" value={data.phone} />
              <Field label="Location" value={data.location} />
            </div>
          </div>

          <div className="card">
            <h3 className="parsed-section-title"><span className="material-icons">psychology</span> Skills ({data.skills.length})</h3>
            <div className="tags-list">
              {data.skills.length > 0 ? (
                data.skills.map(s => <span key={s} className="tag">{s}</span>)
              ) : (
                <span className="text-muted">No skills detected</span>
              )}
            </div>
          </div>

          <div className="card parsed-summary">
            <h3 className="parsed-section-title"><span className="material-icons">notes</span> Summary</h3>
            <p className="summary-text">{data.summary}</p>
          </div>

          <div className="card">
            <h3 className="parsed-section-title"><span className="material-icons">work</span> Experience ({data.experience.length})</h3>
            {data.experience.length > 0 ? (
              data.experience.map((ex, i) => (
                <div key={i} className="exp-item">
                  <div className="exp-title">{ex.title || 'Position'}</div>
                  <div className="exp-company">{ex.company || ''}</div>
                </div>
              ))
            ) : (
              <span className="text-muted">No experience detected</span>
            )}
          </div>

          <div className="card">
            <h3 className="parsed-section-title"><span className="material-icons">school</span> Education</h3>
            {data.education.length > 0 ? (
              data.education.map((ed, i) => (
                <div key={i} className="exp-item">
                  <div className="exp-title">{ed.degree || 'Degree'}</div>
                  <div className="exp-company">{ed.school || ''}</div>
                </div>
              ))
            ) : (
              <span className="text-muted">No education detected</span>
            )}
          </div>
        </div>

        <div className="upload-actions">
          <button className="btn btn-ghost" onClick={() => setStep('upload')}>
            <span className="material-icons">arrow_back</span> Re-upload
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            <span className="material-icons">check</span> Use This Resume
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="resume-upload fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">Upload Resume</h1>
          <p className="section-subtitle">Upload your resume and let AI parse it instantly</p>
        </div>
        <div className="ai-badge"><span className="material-icons">auto_awesome</span>AI Parsing</div>
      </div>

      <div className="upload-container">
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt"
            style={{ display: 'none' }}
            onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
          />
          {file ? (
            <>
              <span className="material-icons drop-icon drop-ready">description</span>
              <div className="drop-title">{file.name}</div>
              <div className="drop-sub">{(file.size / 1024).toFixed(0)} KB · Ready to parse</div>
            </>
          ) : (
            <>
              <span className="material-icons drop-icon">cloud_upload</span>
              <div className="drop-title">Drop your resume here</div>
              <div className="drop-sub">or click to browse · PDF, DOCX, or TXT · Max 5MB</div>
            </>
          )}
        </div>

        <div className="upload-features">
          {[
            { icon: 'psychology', text: 'AI-powered text extraction' },
            { icon: 'manage_search', text: 'ATS keyword analysis' },
            { icon: 'travel_explore', text: 'Auto job matching' },
          ].map(f => (
            <div key={f.text} className="upload-feature">
              <span className="material-icons">{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="upload-actions">
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || loading}
            style={{ minWidth: 200 }}
          >
            {loading ? (
              <><div className="loading-spinner" /> Parsing with AI...</>
            ) : (
              <><span className="material-icons">auto_awesome</span> Parse Resume</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="parsed-field">
      <span className="parsed-label">{label}</span>
      <span className="parsed-value">{value || <em style={{ color: 'var(--text-muted)' }}>Not found</em>}</span>
    </div>
  )
}