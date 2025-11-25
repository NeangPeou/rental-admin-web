// src/controllers/UtilityTypesController.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import UtilityTypesService from "../services/UtilityTypesService";
import { useSnackbar } from "../components/common/Snackbar";

export default function UtilityTypesController() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "" });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUtilityTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UtilityTypesService.getAll();
      const formatted = data.map((item) => ({
        id: Number(item.id),
        name: item.name,
      }));
      setRows(formatted);
    } catch (err) {
      setError(
        t("error_fetching_utility_types") || "Failed to load utility types"
      );
      snackbar.error(t("error_fetching_utility_types"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilityTypes();
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = t("name_required") || "Name is required";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = { name: form.name.trim() };

      if (editId) {
        await UtilityTypesService.update(editId, payload);
        snackbar.success(t("utility_type_updated") || "Utility type updated!");
      } else {
        await UtilityTypesService.create(payload);
        snackbar.success(t("utility_type_created") || "Utility type created!");
      }

      closeDialog();
      fetchUtilityTypes();
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.message || "Operation failed";
      setSubmitError(
        msg.includes("already exists") ? t("name_already_exists") : msg
      );
      snackbar.error(
        msg.includes("already exists")
          ? t("name_already_exists")
          : t("operation_failed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateDialog = () => {
    setEditId(null);
    setForm({ name: "" });
    setFormErrors({});
    setSubmitError("");
    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setForm({ name: row.name });
    setFormErrors({});
    setSubmitError("");
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditId(null);
    setForm({ name: "" });
    setFormErrors({});
    setSubmitError("");
  };

  const handleBulkDelete = async () => {
    if (selectedRowIds.length === 0) return;

    const confirmed = await window.confirmDelete?.({
      title: t("delete_confirmation"),
      message:
        selectedRowIds.length === 1
          ? t("confirm_delete_one")
          : t("confirm_delete_many", { count: selectedRowIds.length }),
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      const result = await UtilityTypesService.bulkDelete(selectedRowIds);

      setSelectedRowIds([]);
      fetchUtilityTypes();

      if (result.success.length > 0) {
        snackbar.success(
          t("utility_types_deleted") || "Utility types deleted successfully"
        );
      }
      if (result.failed.length > 0) {
        snackbar.error(
          t("some_deletes_failed") || "Some items could not be deleted"
        );
      }
    } catch (err) {
      snackbar.error(t("delete_failed") || "Delete operation failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const term = search.toLowerCase();
    return rows.filter((row) => row.name.toLowerCase().includes(term));
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
    openCreateDialog,
    handleEdit,
    closeDialog,
    handleSubmit,
    handleBulkDelete,
    isSubmitting,
  };
}
