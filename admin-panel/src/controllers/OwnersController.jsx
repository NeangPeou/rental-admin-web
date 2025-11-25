import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import OwnersService from "../services/OwnersService";
import { useSnackbar } from "../components/common/Snackbar";

let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECTS = 5;
const BASE_DELAY = 2000;

export default function OwnersController() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wsError, setWsError] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  // Unified dialog state (same as Types.jsx)
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
    phoneNumber: "",
    passport: "",
    idCard: "",
    address: "",
    gender: "Male",
  });

  // Validation errors per field (like Types.jsx)
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const GENDERS = ["Male", "Female"];

  // Fetch owners
  const fetchOwners = async () => {
    try {
      setLoading(true);
      const data = await OwnersService.getAll();
      setRows(data);
    } catch (err) {
      snackbar.error(t("failed_to_load_owners"));
    } finally {
      setLoading(false);
    }
  };

  // WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/api/ws/owners`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        reconnectAttempts = 0;
        setWsError(false);
        ws.send(JSON.stringify({ action: "init" }));
      };

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.action === "init") {
          setRows(msg.data || []);
          setLoading(false);
        }
        if (msg.action === "create") {
          setRows((prev) => (prev.some((r) => r.id === msg.data.id) ? prev : [...prev, msg.data]));
        }
        if (msg.action === "update") {
          setRows((prev) => prev.map((r) => (r.id === msg.id ? { ...msg.data, id: msg.id } : r)));
        }
        if (msg.action === "delete") {
          const id = msg.data?.id || msg.id;
          setRows((prev) => prev.filter((r) => r.id !== id));
        }
      };

      ws.onclose = () => {
        if (reconnectAttempts < MAX_RECONNECTS) {
          reconnectAttempts++;
          setTimeout(connectWebSocket, BASE_DELAY * reconnectAttempts);
        } else {
          setWsError(true);
        }
      };
    };

    fetchOwners();
    connectWebSocket();

    return () => ws?.close();
  }, []);

  // Validation (same style as Types.jsx)
  const validateForm = () => {
    const errors = {};

    if (!form.username?.trim()) {
      errors.username = t("username_required");
    } else if (form.username.trim().length < 3) {
      errors.username = t("username_min_3");
    }

    if (!editId && !form.password?.trim()) {
      errors.password = t("password_required");
    } else if (form.password && form.password.length < 4) {
      errors.password = t("password_min_4");
    }

    if (!form.phoneNumber?.trim()) {
      errors.phoneNumber = t("phone_required");
    } else if (!/^\d+$/.test(form.phoneNumber)) {
      errors.phoneNumber = t("phone_only_number");
    } else if (form.phoneNumber.length < 8) {
      errors.phoneNumber = t("phone_min_8");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm({
      username: "",
      password: "",
      phoneNumber: "",
      passport: "",
      idCard: "",
      address: "",
      gender: "Male",
    });
    setFormErrors({});
    setSubmitError("");
  };

  const openCreate = () => {
    setEditId(null);
    resetForm();
    setOpen(true);
  };

  const openUpdate = (owner) => {
    const latest = rows.find((r) => r.id === owner.id) || owner;

    setEditId(latest.id);
    setForm({
      username: latest.userID || "",           // Clean username from backend
      password: "",
      phoneNumber: latest.phoneNumber || "",
      passport: latest.passport || "",
      idCard: latest.idCard || "",
      address: latest.address || "",
      gender: latest.gender || "Male",
    });
    setFormErrors({});
    setSubmitError("");
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditId(null);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitError("");

    const payload = { id: editId };

    if (editId) {
      // Always send username if filled → backend needs it to set userID!
      if (form.username?.trim()) {
        payload.username = form.username.trim();
      }
      if (form.password?.trim()) payload.password = form.password.trim();
      if (form.phoneNumber) payload.phoneNumber = form.phoneNumber || null;
      if (form.passport) payload.passport = form.passport || null;
      if (form.idCard) payload.idCard = form.idCard || null;
      if (form.address) payload.address = form.address || null;
      if (form.gender) payload.gender = form.gender;
    } else {
      // Create
      Object.assign(payload, {
        username: form.username.trim(),
        password: form.password,
        phoneNumber: form.phoneNumber || null,
        passport: form.passport || null,
        idCard: form.idCard || null,
        address: form.address || null,
        gender: form.gender,
      });
    }

    try {
      if (editId) {
        await OwnersService.update(editId, payload);
        snackbar.success(t("owner_updated"));
      } else {
        await OwnersService.create(payload);
        snackbar.success(t("owner_created"));
      }
      closeDialog();
    } catch (err) {
      const msg = err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || t("operation_failed");
      setSubmitError(msg);
      snackbar.error(msg);
    }
  };
  const handleBulkDelete = async () => {
    if (selectedRowIds.length === 0) return;

    const count = selectedRowIds.length;
    const confirmed = await window.confirmDelete?.({
      title: t("delete_confirmation"),
      message: count === 1 ? t("confirm_delete_one_owner") : t("confirm_delete_many_owners", { count }),
    });

    if (!confirmed) return;

    try {
      const result = await OwnersService.bulkDelete(selectedRowIds);
      setSelectedRowIds([]);
      fetchOwners();

      if (result.success.length > 0)
        snackbar.success(t("owners_deleted_success", { count: result.success.length }));
      if (result.failed.length > 0) snackbar.warning(t("owners_in_use_multiple"));
    } catch (err) {
      snackbar.error(t("delete_failed"));
    }
  };

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.toLowerCase();
    return rows.filter((r) =>
      r.userName?.toLowerCase().includes(term) ||
      r.userID?.toLowerCase().includes(term) ||
      r.phoneNumber?.includes(term)
    );
  }, [rows, search]);

  return {
    rows: filteredRows,
    loading,
    wsError,
    search,
    setSearch,
    selectedRowIds,
    setSelectedRowIds,

    open,
    editId,
    form,
    setForm,
    formErrors,
    submitError,
    GENDERS,

    openCreate,
    openUpdate,
    closeDialog,
    handleSubmit,
    handleBulkDelete,
  };
}