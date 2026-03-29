import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ResumeUpload from './pages/ResumeUpload'
import ResumeBuilder from './pages/ResumeBuilder'
import JobBoard from './pages/JobMatcher'  // JobBoard is JobMatcher - where jobs are displayed
import JobDetail from './pages/JobDetail'
import Applications from './pages/Applications'
import Portfolio from './pages/Portfolio'
import AgentRunner from './pages/AgentRunner'
import Tracker from './pages/Tracker'
import { AppProvider } from './context/AppContext'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="resume/upload" element={<ResumeUpload />} />
            <Route path="resume/build" element={<ResumeBuilder />} />
            <Route path="jobs" element={<JobBoard />} />  {/* Job Board - View all jobs */}
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="applications" element={<Applications />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="agent" element={<AgentRunner />} />
            <Route path="tracker" element={<Tracker />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}