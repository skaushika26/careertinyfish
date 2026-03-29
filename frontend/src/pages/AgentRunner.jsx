import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { jobsAPI, aiAPI } from '../services/api'
import './AgentRunner.css'

export default function AgentRunner() {
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState([])
  const [result, setResult] = useState(null)
  const { resume, resumeLoaded, notify } = useApp()

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }])
  }

  const startAgent = async () => {
    if (!resumeLoaded || !resume) {
      notify('Please upload a resume first', 'error')
      return
    }

    setRunning(true)
    setLogs([])
    setResult(null)
    
    addLog('🚀 Starting AI Auto-Apply Agent...', 'success')
    await new Promise(r => setTimeout(r, 500))
    
    addLog(`📄 Resume loaded: ${resume.name || 'User'} with ${resume.skills?.length || 0} skills`)
    await new Promise(r => setTimeout(r, 500))
    
    addLog('🔍 Fetching matching jobs...')
    
    try {
      const jobs = await jobsAPI.getAll()
      const topJobs = jobs.slice(0, 5)
      
      addLog(`📋 Found ${topJobs.length} matching jobs`)
      await new Promise(r => setTimeout(r, 800))
      
      addLog('🤖 AI customizing resumes and applying...')
      
      const result = await aiAPI.autoApply(resume, topJobs, 5)
      
      if (result.success) {
        for (const job of result.appliedJobs) {
          addLog(`   ✅ Applied to ${job}`, 'success')
          await new Promise(r => setTimeout(r, 400))
        }
        
        addLog(`🎉 Auto-apply completed! Applied to ${result.appliedJobs.length} jobs`, 'success')
        setResult(result)
        notify(`✅ Applied to ${result.appliedJobs.length} jobs successfully!`)
      } else {
        addLog(`❌ Auto-apply failed: ${result.message}`, 'error')
      }
    } catch (error) {
      console.error('Agent error:', error)
      addLog(`❌ Error: ${error.message}`, 'error')
      notify('Failed to run auto-apply agent', 'error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="agent-runner fade-in">
      <div className="page-header">
        <div>
          <h1 className="section-title">AI Auto-Apply Agent</h1>
          <p className="section-subtitle">Let AI customize and submit applications automatically</p>
        </div>
        {resumeLoaded && resume && (
          <div className="resume-badge">
            <span className="material-icons">check_circle</span>
            {resume.skills?.length || 0} skills
          </div>
        )}
      </div>

      <div className="agent-card card">
        <div className="agent-config">
          <h3>Agent Configuration</h3>
          <div className="config-list">
            <div className="config-item">
              <span className="material-icons">analytics</span>
              <span>Analyze your resume</span>
            </div>
            <div className="config-item">
              <span className="material-icons">search</span>
              <span>Find matching jobs</span>
            </div>
            <div className="config-item">
              <span className="material-icons">auto_fix_high</span>
              <span>Customize resume for each job</span>
            </div>
            <div className="config-item">
              <span className="material-icons">description</span>
              <span>Generate cover letters</span>
            </div>
            <div className="config-item">
              <span className="material-icons">send</span>
              <span>Submit applications automatically</span>
            </div>
          </div>
        </div>
        
        <button 
          className="btn-start-agent" 
          onClick={startAgent}
          disabled={running || !resumeLoaded}
        >
          {running ? (
            <><div className="loading-spinner-small"></div> Agent Running...</>
          ) : (
            <><span className="material-icons">smart_toy</span> Start Auto-Apply Agent</>
          )}
        </button>
        
        {!resumeLoaded && (
          <div className="warning-message">
            <span className="material-icons">warning</span>
            Please <a href="/resume/upload">upload a resume</a> first
          </div>
        )}
      </div>

      <div className="logs-terminal">
        <div className="logs-header">
          <span className="material-icons">terminal</span>
          <span>Agent Logs</span>
          {logs.length > 0 && <span className="log-count">{logs.length} events</span>}
        </div>
        {logs.length === 0 ? (
          <div className="logs-empty">
            <span className="material-icons">smart_toy</span>
            <p>Click "Start Auto-Apply Agent" to begin</p>
          </div>
        ) : (
          <div className="logs-list">
            {logs.map((log, i) => (
              <div key={i} className={`log-line ${log.type}`}>
                <span className="log-time">[{log.time}]</span>
                <span className="log-message">{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {result && result.applications && result.applications.length > 0 && (
        <div className="results-card card">
          <h3>✅ Applications Submitted</h3>
          <div className="applications-list">
            {result.applications.map((app, i) => (
              <div key={i} className="application-item">
                <span className="material-icons">check_circle</span>
                <div>
                  <div className="app-title">{app.jobTitle}</div>
                  <div className="app-company">{app.company}</div>
                </div>
                <span className="app-status">Applied</span>
              </div>
            ))}
          </div>
          <button 
            className="btn-view-applications"
            onClick={() => window.location.href = '/applications'}
          >
            View All Applications →
          </button>
        </div>
      )}
    </div>
  )
}