import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { resumeAPI, aiAPI } from '../services/api'
import './ResumeBuilder.css'

const EMPTY_EXP = { company: '', title: '', startDate: '', endDate: '', description: '' }
const EMPTY_EDU = { school: '', degree: '', field: '', graduationYear: '' }

const INITIAL = {
  name: '', email: '', phone: '', location: '', summary: '',
  skills: [], experience: [{ ...EMPTY_EXP }], education: [{ ...EMPTY_EDU }], certifications: []
}

export default function ResumeBuilder() {
  const { setResume, notify, resume: contextResume } = useApp()
  const navigate = useNavigate()
  const [data, setData] = useState(INITIAL)
  const [skillInput, setSkillInput] = useState('')
  const [certInput, setCertInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [atsResult, setAtsResult] = useState(null)
  const [activeSection, setActiveSection] = useState('contact')
  const [loading, setLoading] = useState(true)

  // Load existing resume from context on mount
  useEffect(() => {
    if (contextResume && contextResume.name) {
      setData({
        name: contextResume.name || '',
        email: contextResume.email || '',
        phone: contextResume.phone || '',
        location: contextResume.location || '',
        summary: contextResume.summary || '',
        skills: contextResume.skills || [],
        experience: contextResume.experience?.length ? contextResume.experience : [{ ...EMPTY_EXP }],
        education: contextResume.education?.length ? contextResume.education : [{ ...EMPTY_EDU }],
        certifications: contextResume.certifications || []
      })
    }
    setLoading(false)
  }, [contextResume])

  const set = (field, value) => setData(d => ({ ...d, [field]: value }))

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !data.skills.includes(s)) {
      set('skills', [...data.skills, s])
      setSkillInput('')
    }
  }

  const removeSkill = (s) => set('skills', data.skills.filter(x => x !== s))

  const addCert = () => {
    const c = certInput.trim()
    if (c) { set('certifications', [...data.certifications, c]); setCertInput('') }
  }

  const removeCert = (c) => set('certifications', data.certifications.filter(x => x !== c))

  const updateExp = (i, field, value) => {
    const exps = [...data.experience]
    exps[i] = { ...exps[i], [field]: value }
    set('experience', exps)
  }

  const addExp = () => set('experience', [...data.experience, { ...EMPTY_EXP }])
  const removeExp = (i) => set('experience', data.experience.filter((_, idx) => idx !== i))

  const updateEdu = (i, field, value) => {
    const edu = [...data.education]
    edu[i] = { ...edu[i], [field]: value }
    set('education', edu)
  }

  const addEdu = () => set('education', [...data.education, { ...EMPTY_EDU }])
  const removeEdu = (i) => set('education', data.education.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!data.name) { 
      notify('Please enter your name', 'error')
      return
    }
    
    setSaving(true)
    try {
      // Prepare the resume data
      const resumeData = {
        name: data.name,
        title: data.title || 'Software Engineer',
        email: data.email,
        phone: data.phone,
        location: data.location,
        summary: data.summary,
        skills: data.skills,
        experience: data.experience.filter(exp => exp.title || exp.company),
        education: data.education.filter(edu => edu.school || edu.degree),
        certifications: data.certifications
      }
      
      // Save via API
      const result = await resumeAPI.build(resumeData)
      
      // Update context
      setResume(result.resume || resumeData)
      
      notify('Resume saved successfully!')
      navigate('/jobs')
    } catch (err) {
      console.error('Save error:', err)
      // Fallback: save to context directly
      const resumeData = {
        name: data.name,
        title: 'Software Engineer',
        email: data.email,
        phone: data.phone,
        location: data.location,
        summary: data.summary,
        skills: data.skills,
        experience: data.experience.filter(exp => exp.title || exp.company),
        education: data.education.filter(edu => edu.school || edu.degree),
        certifications: data.certifications
      }
      setResume(resumeData)
      notify('Resume saved locally!')
      navigate('/jobs')
    } finally {
      setSaving(false)
    }
  }

  const handleATSScore = async () => {
    setScoring(true)
    setAtsResult(null)
    try {
      const resumeData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        summary: data.summary,
        skills: data.skills,
        experience: data.experience.filter(exp => exp.title || exp.company),
        education: data.education.filter(edu => edu.school || edu.degree)
      }
      const result = await aiAPI.atsScore(resumeData)
      setAtsResult(result)
      setActiveSection('ats')
      notify('ATS analysis complete!')
    } catch (err) {
      console.error('ATS error:', err)
      // Fallback ATS score
      setAtsResult({
        overallScore: 75,
        sections: {
          name: { score: data.name ? 100 : 0, feedback: data.name ? 'Good' : 'Missing' },
          contact: { score: (data.email || data.phone) ? 100 : 0, feedback: 'Contact info' },
          summary: { score: data.summary?.length > 50 ? 80 : 40, feedback: data.summary?.length > 50 ? 'Good' : 'Too short' },
          skills: { score: Math.min(data.skills.length * 12, 100), feedback: `${data.skills.length} skills added` },
          experience: { score: Math.min(data.experience.filter(e => e.title).length * 35, 100), feedback: `${data.experience.filter(e => e.title).length} experiences` },
          education: { score: data.education.filter(e => e.school).length ? 100 : 0, feedback: data.education.filter(e => e.school).length ? 'Added' : 'Missing' }
        },
        improvements: [
          data.name ? '' : 'Add your full name',
          !data.summary || data.summary.length < 50 ? 'Write a longer professional summary (200-400 characters)' : '',
          data.skills.length < 5 ? `Add ${5 - data.skills.length} more skills` : '',
          data.experience.filter(e => e.title).length < 1 ? 'Add at least one work experience' : ''
        ].filter(Boolean),
        strengths: [
          data.name ? 'Name provided' : '',
          data.skills.length > 0 ? `${data.skills.length} skills listed` : '',
          data.summary ? 'Summary section completed' : ''
        ].filter(Boolean)
      })
      notify('ATS analysis complete (fallback mode)')
    } finally {
      setScoring(false)
    }
  }

  const SECTIONS = [
    { id: 'contact', label: 'Contact', icon: 'person' },
    { id: 'summary', label: 'Summary', icon: 'notes' },
    { id: 'skills', label: 'Skills', icon: 'psychology' },
    { id: 'experience', label: 'Experience', icon: 'work' },
    { id: 'education', label: 'Education', icon: 'school' },
    { id: 'certifications', label: 'Certifications', icon: 'workspace_premium' },
    { id: 'ats', label: 'ATS Score', icon: 'analytics', badge: atsResult ? atsResult.overallScore : null },
  ]

  if (loading) {
    return (
      <div className="resume-builder fade-in">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading resume...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="resume-builder fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">Resume Builder</h1>
          <p className="section-subtitle">Build an ATS-optimized resume from scratch</p>
        </div>
        <div className="builder-header-actions">
          <button className="btn btn-ghost" onClick={handleATSScore} disabled={scoring}>
            {scoring ? <><div className="loading-spinner" />Scoring...</> : <><span className="material-icons">analytics</span>ATS Score</>}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><div className="loading-spinner" />Saving...</> : <><span className="material-icons">save</span>Save Resume</>}
          </button>
        </div>
      </div>

      <div className="builder-layout">
        {/* Section Nav */}
        <div className="builder-nav">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`builder-nav-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              <span className="material-icons">{s.icon}</span>
              <span>{s.label}</span>
              {s.badge != null && <span className="nav-badge">{s.badge}</span>}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="builder-form card">
          {activeSection === 'contact' && (
            <div className="fade-in">
              <h3 className="builder-section-title"><span className="material-icons">person</span>Contact Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Full Name *</label>
                  <input className="input" placeholder="Jane Smith" value={data.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label">Email</label>
                  <input className="input" type="email" placeholder="jane@example.com" value={data.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">Phone</label>
                  <input className="input" placeholder="+1 (555) 000-0000" value={data.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label">Location</label>
                  <input className="input" placeholder="San Francisco, CA" value={data.location} onChange={e => set('location', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'summary' && (
            <div className="fade-in">
              <h3 className="builder-section-title"><span className="material-icons">notes</span>Professional Summary</h3>
              <p className="builder-hint">Write 2–4 sentences highlighting your top skills, experience level, and career goals. This is the first thing ATS and recruiters read.</p>
              <div className="form-group">
                <label className="label">Summary</label>
                <textarea
                  className="input"
                  style={{ minHeight: 160 }}
                  placeholder="Results-driven software engineer with 5+ years of experience building scalable web applications..."
                  value={data.summary}
                  onChange={e => set('summary', e.target.value)}
                />
                <div className="char-count">{data.summary.length} chars · Aim for 200–400</div>
              </div>
            </div>
          )}

          {activeSection === 'skills' && (
            <div className="fade-in">
              <h3 className="builder-section-title"><span className="material-icons">psychology</span>Skills</h3>
              <p className="builder-hint">Add technical and soft skills. Use exact keywords from job descriptions to improve ATS matching.</p>
              <div className="skill-input-row">
                <input
                  className="input"
                  placeholder="e.g. React, Python, Project Management..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <button className="btn btn-primary" onClick={addSkill}>
                  <span className="material-icons">add</span> Add
                </button>
              </div>
              <div className="tags-list" style={{ marginTop: 16 }}>
                {data.skills.map(s => (
                  <span key={s} className="tag">
                    {s}
                    <span className="material-icons" onClick={() => removeSkill(s)}>close</span>
                  </span>
                ))}
                {data.skills.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>No skills added yet</span>}
              </div>
            </div>
          )}

          {activeSection === 'experience' && (
            <div className="fade-in">
              <h3 className="builder-section-title"><span className="material-icons">work</span>Work Experience</h3>
              {data.experience.map((exp, i) => (
                <div key={i} className="entry-card">
                  <div className="entry-header">
                    <span className="entry-num">Position {i + 1}</span>
                    {data.experience.length > 1 && (
                      <button className="btn-icon-danger" onClick={() => removeExp(i)}>
                        <span className="material-icons">delete</span>
                      </button>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label">Job Title</label>
                      <input className="input" placeholder="Software Engineer" value={exp.title} onChange={e => updateExp(i, 'title', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">Company</label>
                      <input className="input" placeholder="Acme Corp" value={exp.company} onChange={e => updateExp(i, 'company', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label">Start Date</label>
                      <input className="input" placeholder="Jan 2022" value={exp.startDate} onChange={e => updateExp(i, 'startDate', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">End Date</label>
                      <input className="input" placeholder="Present" value={exp.endDate} onChange={e => updateExp(i, 'endDate', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Description</label>
                    <textarea
                      className="input"
                      placeholder="• Led development of core product features using React and Node.js&#10;• Reduced load time by 40% through code splitting and caching&#10;• Mentored 3 junior engineers"
                      value={exp.description}
                      onChange={e => updateExp(i, 'description', e.target.value)}
                      style={{ minHeight: 120 }}
                    />
                  </div>
                </div>
              ))}
              <button className="btn btn-ghost" onClick={addExp}>
                <span className="material-icons">add</span> Add Another Position
              </button>
            </div>
          )}

          {activeSection === 'education' && (
            <div className="fade-in">
              <h3 className="builder-section-title"><span className="material-icons">school</span>Education</h3>
              {data.education.map((edu, i) => (
                <div key={i} className="entry-card">
                  <div className="entry-header">
                    <span className="entry-num">Degree {i + 1}</span>
                    {data.education.length > 1 && (
                      <button className="btn-icon-danger" onClick={() => removeEdu(i)}>
                        <span className="material-icons">delete</span>
                      </button>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label">School</label>
                      <input className="input" placeholder="University of California" value={edu.school} onChange={e => updateEdu(i, 'school', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">Degree</label>
                      <input className="input" placeholder="Bachelor of Science" value={edu.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="label">Field of Study</label>
                      <input className="input" placeholder="Computer Science" value={edu.field} onChange={e => updateEdu(i, 'field', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">Graduation Year</label>
                      <input className="input" placeholder="2020" value={edu.graduationYear} onChange={e => updateEdu(i, 'graduationYear', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn btn-ghost" onClick={addEdu}>
                <span className="material-icons">add</span> Add Another Degree
              </button>
            </div>
          )}

          {activeSection === 'certifications' && (
            <div className="fade-in">
              <h3 className="builder-section-title"><span className="material-icons">workspace_premium</span>Certifications</h3>
              <p className="builder-hint">Add professional certifications to boost your ATS score and credibility.</p>
              <div className="skill-input-row">
                <input
                  className="input"
                  placeholder="e.g. AWS Certified Solutions Architect, PMP..."
                  value={certInput}
                  onChange={e => setCertInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())}
                />
                <button className="btn btn-primary" onClick={addCert}>
                  <span className="material-icons">add</span> Add
                </button>
              </div>
              <div className="certs-list" style={{ marginTop: 16 }}>
                {data.certifications.map(c => (
                  <div key={c} className="cert-item">
                    <span className="material-icons cert-icon">workspace_premium</span>
                    <span>{c}</span>
                    <button className="btn-icon-danger" onClick={() => removeCert(c)}>
                      <span className="material-icons">close</span>
                    </button>
                  </div>
                ))}
                {data.certifications.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No certifications added yet</div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'ats' && (
            <div className="fade-in">
              <h3 className="builder-section-title"><span className="material-icons">analytics</span>ATS Score Analysis</h3>
              {!atsResult ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <span className="material-icons">analytics</span>
                  <p>Run ATS analysis to see how your resume scores</p>
                  <button className="btn btn-primary" onClick={handleATSScore} disabled={scoring}>
                    {scoring ? 'Analyzing...' : 'Run Analysis'}
                  </button>
                </div>
              ) : (
                <div className="ats-results">
                  <div className="ats-overall">
                    <div className="ats-score-circle">
                      <svg viewBox="0 0 100 100" width="120" height="120">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="42"
                          fill="none"
                          stroke={atsResult.overallScore >= 80 ? '#10b981' : atsResult.overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 42 * atsResult.overallScore / 100} ${2 * Math.PI * 42}`}
                          style={{ transition: 'stroke-dasharray 1s ease' }}
                        />
                      </svg>
                      <div className="ats-score-text">
                        <span className="ats-score-num">{atsResult.overallScore}</span>
                        <span className="ats-score-label">/ 100</span>
                      </div>
                    </div>
                    <div>
                      <div className="ats-rating">
                        {atsResult.overallScore >= 80 ? '🟢 Excellent' : atsResult.overallScore >= 60 ? '🟡 Good' : '🔴 Needs Work'}
                      </div>
                    </div>
                  </div>

                  <div className="ats-breakdown">
                    {atsResult.sections && Object.entries(atsResult.sections).map(([key, val]) => (
                      <div key={key} className="ats-section-row">
                        <span className="ats-section-name">{key}</span>
                        <div className="ats-bar-wrap">
                          <div className="ats-bar" style={{
                            width: `${val.score}%`,
                            background: val.score >= 80 ? '#10b981' : val.score >= 60 ? '#f59e0b' : '#ef4444'
                          }} />
                        </div>
                        <span className="ats-section-score">{val.score}</span>
                        <span className="ats-section-feedback">{val.feedback}</span>
                      </div>
                    ))}
                  </div>

                  {atsResult.improvements?.length > 0 && (
                    <div className="ats-tips">
                      <h4><span className="material-icons">lightbulb</span> Improvements</h4>
                      {atsResult.improvements.map((tip, i) => (
                        <div key={i} className="tip-item"><span className="material-icons">arrow_forward</span>{tip}</div>
                      ))}
                    </div>
                  )}

                  {atsResult.strengths?.length > 0 && (
                    <div className="ats-tips">
                      <h4><span className="material-icons">star</span> Strengths</h4>
                      {atsResult.strengths.map((s, i) => (
                        <div key={i} className="tip-item strength"><span className="material-icons">check</span>{s}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        <div className="builder-preview">
          <div className="preview-header">
            <span className="material-icons">visibility</span> Live Preview
          </div>
          <div className="preview-resume">
            {data.name && <div className="prev-name">{data.name}</div>}
            {(data.email || data.phone || data.location) && (
              <div className="prev-contact">
                {[data.email, data.phone, data.location].filter(Boolean).join(' · ')}
              </div>
            )}
            {data.summary && (
              <div className="prev-section">
                <div className="prev-section-title">Summary</div>
                <p className="prev-text">{data.summary}</p>
              </div>
            )}
            {data.skills.length > 0 && (
              <div className="prev-section">
                <div className="prev-section-title">Skills</div>
                <p className="prev-text">{data.skills.join(' · ')}</p>
              </div>
            )}
            {data.experience.some(e => e.title || e.company) && (
              <div className="prev-section">
                <div className="prev-section-title">Experience</div>
                {data.experience.filter(e => e.title || e.company).map((e, i) => (
                  <div key={i} className="prev-entry">
                    <div className="prev-entry-title">{e.title} {e.company && `— ${e.company}`}</div>
                    <div className="prev-entry-date">{[e.startDate, e.endDate || 'Present'].filter(Boolean).join(' – ')}</div>
                  </div>
                ))}
              </div>
            )}
            {data.education.some(e => e.school || e.degree) && (
              <div className="prev-section">
                <div className="prev-section-title">Education</div>
                {data.education.filter(e => e.school || e.degree).map((e, i) => (
                  <div key={i} className="prev-entry">
                    <div className="prev-entry-title">{e.degree} {e.field && `in ${e.field}`}</div>
                    <div className="prev-entry-date">{e.school} {e.graduationYear && `· ${e.graduationYear}`}</div>
                  </div>
                ))}
              </div>
            )}
            {!data.name && !data.summary && data.skills.length === 0 && (
              <div className="prev-empty">Start filling in your details to see a preview</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}