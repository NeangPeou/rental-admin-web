import api from "../api/axios.js";

const TypeService = {
  getAll: async () => {
    const res = await api.get("/api/getalltype");
    return res.data;
  },

  create: async (payload) => {
    await api.post("/api/create-type", payload);
  },

  update: async (id, payload) => {
    await api.put(`/api/type/${id}`, payload);
  },

  delete: async (id) => {
    await api.delete(`/api/type/${id}`);
  },

  bulkDelete: async (ids) => {
    const results = {
      success: [],
      inUse: [],
      failed: [],
    };

    await Promise.all(
      ids.map(async (id) => {
        try {
          await api.delete(`/api/type/${id}`);
          results.success.push(id);
        } catch (err) {
          const msg = err.response?.data?.detail || err.message || "";
          if (msg.includes("in use") || msg.includes("cannot be deleted")) {
            results.inUse.push({ id, reason: msg });
          } else {
            results.failed.push({ id, reason: msg });
          }
        }
      })
    );

    return results;
  },
};

export default TypeService;
