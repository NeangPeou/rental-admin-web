// src/controllers/ChangePasswordController.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // ← Add this
import { useAuth } from "../context/AuthContext.jsx";
import ChangePasswordService from "../services/ChangePasswordService.jsx";
import { getDeviceName } from "../utils/deviceDetector.js";

export default function ChangePasswordController() {
  const { t } = useTranslation(); // ← Add this
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState("");

  // Detect device once
  useEffect(() => {
    const detect = async () => {
      try {
        const name = await getDeviceName();
        setDeviceInfo(JSON.stringify({ Model: name, Version: navigator.userAgent }));
      } catch {
        setDeviceInfo(JSON.stringify({ info: navigator.userAgent }));
      }
    };
    detect();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const toggleShow = (field) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Validation on submit — all messages translated
  const validate = () => {
    const newErrors = {};

    if (!form.currentPassword.trim()) {
      newErrors.currentPassword = t("current_password_required");
    }

    if (!form.newPassword.trim()) {
      newErrors.newPassword = t("new_password_required");
    } else if (form.newPassword.length < 3) {
      newErrors.newPassword = t("password_min_3_chars");
    } else if (form.newPassword === form.currentPassword) {
      newErrors.newPassword = t("new_password_must_be_different");
    }

    if (form.confirmPassword !== form.newPassword) {
      newErrors.confirmPassword = t("passwords_do_not_match");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });

    if (!validate()) return;

    setLoading(true);

    try {
      await ChangePasswordService.changePassword({
        id: user.id,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
        deviceInfo: deviceInfo || null,
      });

      setSuccess(true);
      setTimeout(() => {
        logout();
        navigate("/login", { replace: true });
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.detail || "";
      setErrors((prev) => ({
        ...prev,
        currentPassword: msg.includes("Incorrect")
          ? t("current_password_incorrect")
          : "",
      }));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => navigate(-1);

  return {
    form,
    show,
    errors,
    loading,
    success,
    handleChange,
    toggleShow,
    handleSubmit,
    goBack,
  };
}