import api from '../api/axios.js'

const TypeService = {
  getAll: async () => {
    const res = await api.get('/api/getalltype')
    return res.data
  },

  create: async (payload) => {
    await api.post('/api/create-type', payload)
  },

  update: async (id, payload) => {
    await api.put(`/api/type/${id}`, payload)
  },

  delete: async (id) => {
    await api.delete(`/api/type/${id}`)
  },

  bulkDelete: async (ids) => {
    await Promise.all(ids.map(id => api.delete(`/api/type/${id}`)))
  },
}

export default TypeService