import api from "../api/axios.js";

const ChangePasswordService = {
  changePassword: async (payload) => {
    const response = await api.put("/api/change-password", payload);
    return response.data;
  },
};

export default ChangePasswordService;