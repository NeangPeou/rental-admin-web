import api from "../api/axios.js";

const SystemLogService = {
  getAll: async () => {
    const res = await api.get("/api/system-logs");
    return res.data;
  },
};

export default SystemLogService;