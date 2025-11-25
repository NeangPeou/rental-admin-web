// src/controllers/TypesController.jsx (UPDATED)
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import TypeService from "../services/TypeService";
import { useSnackbar } from "../components/common/Snackbar";

export default function TypesController() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      snackbar.error(t("error_fetching_types"));
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
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        type_code: form.type_code.trim(),
        name: form.name.trim(),
      };

      if (editId) {
        await TypeService.update(editId, payload);
        snackbar.success(t("type_updated") || "Type updated!");
      } else {
        await TypeService.create(payload);
        snackbar.success(t("type_created") || "Type created!");
      }

      closeDialog();
      fetchTypes();
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.message || "Operation failed";
      setSubmitError(
        msg.includes("already exists") ? t("code_already_exists") : msg
      );
      snackbar.error(
        msg.includes("already exists")
          ? t("code_already_exists")
          : t("operation_failed")
      );
    } finally{
      setIsSubmitting(false);
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

    const count = selectedRowIds.length;

    // Confirm dialog
    const confirmed = await window.confirmDelete?.({
      title: t("delete_confirmation"),
      message: count === 1 ? t("confirm_delete_one") : t("confirm_delete_many"), // គ្មាន {count} ទេ
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      const result = await TypeService.bulkDelete(selectedRowIds);

      // Refresh UI
      setSelectedRowIds([]);
      fetchTypes();

      // Success message
      if (result.success.length > 0) {
        snackbar.success(t("types_deleted")); // តែមួយឃ្លា: "បានលុបប្រភេទដោយជោគជ័យ"
      }

      // In use – show name only when exactly 1
      if (result.inUse.length === 1) {
        const usedTypeName =
          rows.find((r) => r.id === result.inUse[0].id)?.name || "ប្រភេទនេះ";
        snackbar.warning(`${t("type_in_use_single")}៖ «${usedTypeName}»`);
      }
      // More than 1 in use
      else if (result.inUse.length > 1) {
        snackbar.warning(t("types_in_use_multiple"));
      }

      // All selected are in use
      if (result.success.length === 0 && result.inUse.length === count) {
        snackbar.warning(t("all_types_in_use"));
      }

      // Other errors
      if (result.failed.length > 0) {
        snackbar.error(t("some_deletes_failed"));
      }
    } catch (err) {
      console.error(err);
      snackbar.error(t("delete_failed"));
    } finally{
      setLoading(false);
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
    openCreateDialog,
    handleEdit,
    closeDialog,
    handleSubmit,
    handleBulkDelete,
    isSubmitting,
  };
}
