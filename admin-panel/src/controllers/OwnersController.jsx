// src/controllers/OwnersController.jsx
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

  // Form states
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  const [createForm, setCreateForm] = useState({
    username: "", password: "", phoneNumber: "", passport: "", idCard: "", address: "", gender: "Male"
  });
  const [updateForm, setUpdateForm] = useState({
    username: "", password: "", phoneNumber: "", passport: "", idCard: "", address: "", gender: "Male"
  });
  const [formError, setFormError] = useState("");

  const GENDERS = ["Male", "Female"];

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const data = await OwnersService.getAll();
      setRows(data);
    } catch (err) {
      snackbar.error(t("failed_to_load_owners") || "Failed to load owners");
    } finally {
      setLoading(false);
    }
  };

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
          setRows(prev => prev.some(r => r.id === msg.data.id) ? prev : [...prev, msg.data]);
        }
        if (msg.action === "update") {
          setRows(prev => prev.map(r => r.id === msg.id ? { ...msg.data, id: msg.id } : r));
        }
        if (msg.action === "delete") {
          const deletedId = msg.data?.id || msg.id;
          setRows(prev => prev.filter(r => r.id !== deletedId));
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

  const resetCreateForm = () => {
    setCreateForm({ username: "", password: "", phoneNumber: "", passport: "", idCard: "", address: "", gender: "Male" });
    setFormError("");
  };

  const handleCreateOpen = () => {
    resetCreateForm();
    setOpenCreate(true);
  };

  const handleUpdateOpen = (owner) => {
    setSelectedOwner(owner);
    setUpdateForm({
      username: owner.userID || "",
      password: "",
      phoneNumber: owner.phoneNumber || "",
      passport: owner.passport || "",
      idCard: owner.idCard || "",
      address: owner.address || "",
      gender: owner.gender || "Male",
    });
    setFormError("");
    setOpenUpdate(true);
  };

  const handleDeleteOpen = (owner = null) => {
    if (owner) {
      setSelectedOwner(owner);
      setSelectedRowIds([owner.id]);
    }
    setOpenDelete(true);
  };

  const handleCreate = async () => {
    setFormError("");
    if (!createForm.username.trim() || !createForm.password.trim()) {
      setFormError(t("username_and_password_required"));
      return;
    }

    try {
      await OwnersService.create({
        username: createForm.username.trim(),
        password: createForm.password,
        phoneNumber: createForm.phoneNumber || null,
        passport: createForm.passport || null,
        idCard: createForm.idCard || null,
        address: createForm.address || null,
        gender: createForm.gender,
      });
      setOpenCreate(false);
      snackbar.success(t("owner_created"));
    } catch (err) {
      setFormError(err.response?.data?.detail?.[0]?.msg || t("create_failed"));
    }
  };

  const handleUpdate = async () => {
    setFormError("");
    const payload = {};

    if (updateForm.username.trim() && updateForm.username !== (selectedOwner.userID || "")) payload.username = updateForm.username.trim();
    if (updateForm.password) payload.password = updateForm.password;
    if (updateForm.phoneNumber !== (selectedOwner.phoneNumber || "")) payload.phoneNumber = updateForm.phoneNumber || null;
    if (updateForm.passport !== (selectedOwner.passport || "")) payload.passport = updateForm.passport || null;
    if (updateForm.idCard !== (selectedOwner.idCard || "")) payload.idCard = updateForm.idCard || null;
    if (updateForm.address !== (selectedOwner.address || "")) payload.address = updateForm.address || null;
    if (updateForm.gender !== selectedOwner.gender) payload.gender = updateForm.gender;

    if (Object.keys(payload).length === 0) {
      setOpenUpdate(false);
      return;
    }

    try {
      await OwnersService.update(selectedOwner.id, payload);
      setOpenUpdate(false);
      snackbar.success(t("owner_updated"));
    } catch (err) {
      setFormError(err.response?.data?.detail?.[0]?.msg || t("update_failed"));
    }
  };

  // EXACTLY LIKE TypesController — with inUse detection
  const handleBulkDelete = async () => {
    if (selectedRowIds.length === 0 && !selectedOwner) return;

    const idsToDelete = selectedOwner ? [selectedOwner.id] : selectedRowIds;
    const count = idsToDelete.length;

    const confirmed = await window.confirmDelete?.({
      title: t("delete_confirmation"),
      message: count === 1
        ? t("confirm_delete_one_owner")
        : t("confirm_delete_many_owners", { count }),
    });

    if (!confirmed) return;

    try {
      const result = await OwnersService.bulkDelete(idsToDelete);

      // Refresh data
      fetchOwners();
      setSelectedRowIds([]);
      setSelectedOwner(null);
      setOpenDelete(false);

      // Success feedback
      if (result.success.length > 0) {
        snackbar.success(t("owners_deleted_success", { count: result.success.length }));
      }

      // In use warning
      if (result.inUse.length === 1) {
        const usedOwner = rows.find(r => r.id === result.inUse[0].id);
        snackbar.warning(t("owner_in_use_single", { name: usedOwner?.userName || "Owner" }));
      } else if (result.inUse.length > 1) {
        snackbar.warning(t("owners_in_use_multiple"));
      }

      if (result.success.length === 0 && result.inUse.length === count) {
        snackbar.warning(t("all_owners_in_use"));
      }

      if (result.failed.length > 0) {
        snackbar.error(t("owner_some_deletes_failed"));
      }
    } catch (err) {
      snackbar.error(t("delete_failed"));
    }
  };

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.toLowerCase();
    return rows.filter(row =>
      row.userName?.toLowerCase().includes(term) ||
      row.userID?.toLowerCase().includes(term) ||
      row.phoneNumber?.includes(term)
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
    openCreate,
    openUpdate,
    openDelete,
    selectedOwner,
    createForm,
    setCreateForm,
    updateForm,
    setUpdateForm,
    formError,
    GENDERS,
    handleCreateOpen,
    handleUpdateOpen,
    handleDeleteOpen,
    handleCreate,
    handleUpdate,
    handleBulkDelete,  // Now used in UI
    setOpenCreate,
    setOpenUpdate,
    setOpenDelete,
  };
}