import axios from 'axios'

// ✅ FIXED BASE URL (IMPORTANT)
const API_BASE_URL = import.meta.env.VITE_API_URL + '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ========== RESUME API ==========
export const resumeAPI = {
  upload: async (file) => {
    const formData = new FormData()
    formData.append('resume', file)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/resume/upload`, // ✅ FIXED
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
      return response.data
    } catch (err) {
      console.error('UPLOAD ERROR:', err.response?.data || err.message)
      throw new Error(
        err.response?.data?.message || 'Backend not reachable'
      )
    }
  },

  get: async () => {
    const response = await api.get('/resume/me') // ✅ AUTO FIXED
    return response.data
  },

  save: async (resumeData) => {
    const response = await api.post('/resume/save', resumeData)
    return response.data
  }
}

// ========== JOBS API ==========
export const jobsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/jobs') // ✅ FIXED
      return response.data
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return []
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/jobs/${id}`)
      return response.data
    } catch (error) {
      throw new Error('Job not found')
    }
  }
}

// ========== APPLICATIONS API ==========
export const applicationsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/applications') // ✅ FIXED
      return response.data
    } catch (error) {
      return []
    }
  },

  create: async (application) => {
    try {
      const response = await api.post('/applications', application)
      return response.data
    } catch (error) {
      return { success: false }
    }
  }
}

// ========== AI API ==========
export const aiAPI = {
  customize: async (resume, job) => {
    try {
      const response = await api.post('/ai/customize', { resume, job }) // ✅ FIXED
      return response.data
    } catch (error) {
      return { success: false }
    }
  },

  autoApply: async (resume, jobs) => {
    try {
      const response = await api.post('/ai/auto-apply', { resume, jobs }) // ✅ FIXED
      return response.data
    } catch (error) {
      return { success: false }
    }
  },

  portfolio: async (resume) => {
    try {
      const response = await api.post('/ai/portfolio', { resume }) // ✅ FIXED
      return response.data
    } catch (error) {
      return { success: false }
    }
  }
}

export default api