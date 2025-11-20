import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  TextField,
  InputAdornment,
  alpha,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Person,
  Info,
  Warning,
  Error as ErrorIcon,
  CheckCircle,
  History,
  Search,
} from "@mui/icons-material";
import SystemLogsController from "../controllers/SystemLogsController";
import useResponsiveGlobal from "../hooks/useResponsiveGlobal";

const getLogTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case "info":
      return "info";
    case "warning":
      return "warning";
    case "error":
      return "error";
    case "success":
      return "success";
    default:
      return "default";
  }
};

const getLogTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "info":
      return <Info fontSize="small" />;
    case "warning":
      return <Warning fontSize="small" />;
    case "error":
      return <ErrorIcon fontSize="small" />;
    case "success":
      return <CheckCircle fontSize="small" />;
    default:
      return <Info fontSize="small" />;
  }
};

export default function SystemLogs() {
  const { t } = useTranslation();
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";
  const responsive = useResponsiveGlobal();

  const { rows, loading, error, search, setSearch } = SystemLogsController();

  const columns = [
    {
      field: "user_id",
      headerName: t("user"),
      width: responsive.isMobile ? 130 : 160,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Person sx={{ fontSize: 16, opacity: 0.7, color: "text.secondary" }} />
          <Typography variant="body3" fontSize={13} noWrap>
            {params.row.userName}
          </Typography>
        </Box>
      ),
    },
    {
      field: "action",
      headerName: t("action"),
      width: responsive.isMobile ? 140 : 190,
      renderCell: (params) => (
        <Typography
          sx={{
            fontWeight: 500,
            color: "primary.main",
            textTransform: "capitalize",
            fontSize: responsive.isMobile ? "0.75rem" : "0.75rem",
          }}
          variant="body3" 
          noWrap
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "logType",
      headerName: t("type"),
      width: 110,
      renderCell: (params) => (
        <Typography component="div">
          <Chip
            icon={getLogTypeIcon(params.value)}
            label={params.value}
            size="small"
            color={getLogTypeColor(params.value)}
            sx={{ fontWeight: 700, fontSize: "0.7rem" }}
          />
        </Typography>
        
      ),
    },
    {
      field: "message",
      headerName: t("message"),
      flex: 1,
      minWidth: responsive.isMobile ? 180 : 320,
      renderCell: (params) => (
        <Typography
          variant="body3"
          sx={{
            fontFamily: '"Roboto Mono", monospace',
            fontSize: responsive.isMobile ? "0.75rem" : "0.75rem",
            lineHeight: 1.5,
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "hostName",
      headerName: t("host"),
      width: responsive.isMobile ? 120 : 150,
      renderCell: (params) => (
        <Typography component="div">
          <Chip 
          label={params.value} 
          size="small" 
          variant="outlined" 
          sx={{ fontSize: "0.7rem" }}
          />
        </Typography>
      ),
    },
    {
      field: "created_at",
      headerName: t("time"),
      width: responsive.isMobile ? 140 : 180,
      renderCell: (params) => (
        <Typography component="div">
          <Chip 
            label={params.value} 
            size="small" 
            variant="outlined" 
            sx={{ fontSize: "0.7rem" }}
          />
        </Typography>
      ),
    },
  ];

  const NoRowsOverlay = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "text.secondary",
        gap: 2,
      }}
    >
      <History sx={{ fontSize: responsive.isMobile ? 60 : 80, opacity: 0.3 }} />
      <Typography variant={responsive.isMobile ? "subtitle2" : "h7"} fontWeight={600}>
        {search ? t("no_logs_found_search") : t("no_logs_found")}
      </Typography>
    </Box>
  );

  return (
    <Paper
      elevation={6}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: "background.paper",
        width: "100%",
        minHeight: "calc(100vh - 96px)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 2 },
          display: "flex",
          flexDirection: responsive.headerFlexDirection,
          justifyContent: "space-between",
          alignItems: responsive.headerAlignItems,
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <History sx={{ opacity: 0.7, fontSize: responsive.isMobile ? 28 : 32 }} />
            <Typography
              variant={responsive.isMobile ? "h6" : "h5"}
              sx={{
                fontWeight: 500,
                background: "linear-gradient(90deg, #667eea, #764ba2)",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("system_logs")}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("view_all_system_activities")}
          </Typography>
        </Box>

        <TextField
          placeholder={t("search_logs")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            width: responsive.searchWidth,
            background: alpha("#667eea", 0.05),
            borderRadius: 3,
            "& .MuiOutlinedInput-root": { borderRadius: 3 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ opacity: 0.7 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Table */}
      <Box sx={{ height: responsive.dataGridHeight, width: "100%" }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: responsive.isMobile ? 10 : 25 } },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          rowHeight={44}
          density="compact"
          slots={{
            loadingOverlay: LinearProgress,
            noRowsOverlay: NoRowsOverlay,
          }}
          sx={{
            borderTop: "1px solid",
            borderColor: "divider",
            "& .MuiDataGrid-row:hover": {
              bgcolor: alpha("#667eea", darkMode ? 0.15 : 0.07),
              cursor: "pointer",
            },
          }}
        />
      </Box>
    </Paper>
  );
}