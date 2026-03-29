import React, { createContext, useState, useContext, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { resumeAPI } from '../services/api'

const AppContext = createContext()

export const useApp = () => useContext(AppContext)

export function AppProvider({ children }) {
  const [resume, setResume] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [resumeLoaded, setResumeLoaded] = useState(false)

  // Load saved resume on startup
  useEffect(() => {
    loadSavedResume()
  }, [])

  const loadSavedResume = async () => {
    try {
      const savedResume = await resumeAPI.get()
      if (savedResume && savedResume.name) {
        setResume(savedResume)
        setResumeLoaded(true)
        console.log('✅ Resume loaded from storage:', savedResume.name)
      }
    } catch (error) {
      console.log('No saved resume found')
    }
  }

  const notify = (message, type = 'success') => {
    if (type === 'error') {
      toast.error(message)
    } else {
      toast.success(message)
    }
  }

  const updateResume = (newResume) => {
    setResume(newResume)
    setResumeLoaded(true)
    // Save to backend
    resumeAPI.save(newResume).catch(console.error)
  }

  const value = {
    resume,
    setResume: updateResume,
    applications,
    setApplications,
    loading,
    setLoading,
    resumeLoaded,
    notify
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}