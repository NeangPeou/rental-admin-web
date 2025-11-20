import api from "../api/axios.js";

const UtilityTypesService = {
  getAll: async () => {
    const res = await api.get("/api/getallutilitytype");
    return res.data;
  },

  create: async (payload) => {
    await api.post("/api/create-utility-type", payload);
  },

  update: async (id, payload) => {
    await api.put(`/api/utility-type/${id}`, payload);
  },

  delete: async (id) => {
    await api.delete(`/api/utility-type/${id}`);
  },

  bulkDelete: async (ids) => {
    const results = {
      success: [],
      failed: [],
    };

    await Promise.all(
      ids.map(async (id) => {
        try {
          await api.delete(`/api/utility-type/${id}`);
          results.success.push(id);
        } catch (err) {
          results.failed.push({ id, reason: err.response?.data?.detail || err.message });
        }
      })
    );

    return results;
  },
};

export default UtilityTypesService;