import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import SystemLogService from "../services/SystemLogService";
import { useSnackbar } from "../components/common/Snackbar";

export default function SystemLogsController() {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SystemLogService.getAll();

      const formatted = data.map((log, idx) => ({
        ...log,
        id: log.id || log._id || idx + 1,
        userName: log.userName || log.user_id || t("unknown_user"),
        hostName: log.hostName || log.ip || "N/A",
      }));

      setRows(formatted);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to load logs";
      setError(t("failed_to_load_logs") || "Failed to load system logs");
      snackbar.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Client-side search
  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;

    const term = search.toLowerCase();
    return rows.filter((log) => {
      return (
        String(log.userName || "").toLowerCase().includes(term) ||
        String(log.action || "").toLowerCase().includes(term) ||
        String(log.message || "").toLowerCase().includes(term) ||
        String(log.logType || "").toLowerCase().includes(term) ||
        String(log.hostName || "").toLowerCase().includes(term)
      );
    });
  }, [rows, search]);

  return {
    rows: filteredRows,
    loading,
    error,
    search,
    setSearch,
  };
}