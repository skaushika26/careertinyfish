import axios from 'axios'

// Fallback to hardcoded URL if env var is missing
const BASE_URL = import.meta.env.VITE_API_URL || 'https://careertinyfish.onrender.com'

console.log('API BASE URL:', BASE_URL) // Remove after debugging

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
})

// RESUME
export const resumeAPI = {
  upload: async (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    const res = await axios.post(`${BASE_URL}/api/resume/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },
  get: async () => (await api.get('/resume/me')).data,
  save: async (data) => (await api.post('/resume/save', data)).data
}

// JOBS
export const jobsAPI = {
  getAll: async () => (await api.get('/jobs')).data,
  getById: async (id) => (await api.get(`/jobs/${id}`)).data
}

// APPLICATIONS
export const applicationsAPI = {
  getAll: async () => (await api.get('/applications')).data,
  create: async (data) => (await api.post('/applications', data)).data
}

// AI
export const aiAPI = {
  customize: async (resume, job) => (await api.post('/ai/customize', { resume, job })).data,
  autoApply: async (resume, jobs) => (await api.post('/ai/auto-apply', { resume, jobs })).data,
  portfolio: async (resume) => (await api.post('/ai/portfolio', { resume })).data
}

export default api