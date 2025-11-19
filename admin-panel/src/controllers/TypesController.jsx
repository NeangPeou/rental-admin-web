// src/controllers/TypesController.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import TypeService from "../services/TypeService";

export default function TypesController() {
  const { t } = useTranslation();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ type_code: "", name: "" });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TypeService.getAll();
      const formatted = data.map((item) => ({
        id: Number(item.id),
        typeCode: item.typeCode,
        name: item.name,
      }));
      setRows(formatted);
    } catch (err) {
      setError(t("error_fetching_types") || "Failed to load types");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!form.type_code.trim()) errs.type_code = t("code_required");
    else if (!editId && rows.some((r) => r.typeCode === form.type_code.trim()))
      errs.type_code = t("code_already_exists");

    if (!form.name.trim()) errs.name = t("name_required");
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitError("");

    try {
      const payload = {
        type_code: form.type_code.trim(),
        name: form.name.trim(),
      };

      if (editId) {
        await TypeService.update(editId, payload);
      } else {
        await TypeService.create(payload);
      }

      closeDialog();
      fetchTypes();
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.message || "Operation failed";
      setSubmitError(
        msg.includes("already exists") ? t("code_already_exists") : msg
      );
    }
  };

  const openCreateDialog = () => {
    setEditId(null);
    setForm({ type_code: "", name: "" });
    setFormErrors({});
    setSubmitError("");
    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({ type_code: row.typeCode, name: row.name });
    setFormErrors({});
    setSubmitError("");
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditId(null);
    setForm({ type_code: "", name: "" });
    setFormErrors({});
    setSubmitError("");
  };

  const handleBulkDelete = async () => {
    if (selectedRowIds.length === 0) return;

    const confirmMsg =
      selectedRowIds.length === 1
        ? t("confirm_delete_single")
        : t("confirm_delete_multiple", { count: selectedRowIds.length });

    if (!window.confirm(confirmMsg)) return;

    try {
      await TypeService.bulkDelete(selectedRowIds);
      setSelectedRowIds([]);
      fetchTypes();
    } catch (err) {
      console.error(err);
      alert(t("error_deleting_types"));
    }
  };

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;

    const term = search.toLowerCase();
    return rows.filter(
      (row) =>
        row.typeCode.toLowerCase().includes(term) ||
        row.name.toLowerCase().includes(term)
    );
  }, [rows, search]);

  return {
    rows: filteredRows,
    loading,
    error,
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
    filteredRows,
    openCreateDialog,
    handleEdit,
    closeDialog,
    handleSubmit,
    handleBulkDelete,
  };
}
