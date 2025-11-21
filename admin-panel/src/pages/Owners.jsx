import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  LinearProgress,
  Alert,
  TextField,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  Stack,
  alpha,
  Drawer,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Search,
  Close as CloseIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import OwnersController from "../controllers/OwnersController";
import useResponsiveGlobal from "../hooks/useResponsiveGlobal";

export default function Owners() {
  const { t } = useTranslation();
  const responsive = useResponsiveGlobal();

  const {
    rows,
    loading,
    wsError,
    search,
    setSearch,
    selectedRowIds,
    setSelectedRowIds,
    openCreate,
    openUpdate,
    createForm,
    setCreateForm,
    updateForm,
    setUpdateForm,
    formError,
    GENDERS,
    handleCreateOpen,
    handleUpdateOpen,
    handleBulkDelete,
    handleCreate,
    handleUpdate,
    setOpenCreate,
    setOpenUpdate,
  } = OwnersController();

  const selectedCount = selectedRowIds.length;

  const columns = [
    {
      field: "userName",
      headerName: t("username"),
      flex: 1,
      minWidth: 120,
      width: responsive.isMobile ? 100 : 180,
      renderCell: (params) => (
        <Typography component="div">
          <Chip
            label={params.value}
            size="small"
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: responsive.isMobile ? '0.75rem' : '0.75rem',
            }}
          />
        </Typography>
        
      ),
    },
    {
      field: "gender",
      headerName: t("gender"),
      width: responsive.isMobile ? 100 : 180,
      renderCell: (p) => (
        <Typography component="div">
          <Chip
            icon={p.value === "Male" ? <MaleIcon /> : <FemaleIcon />}
            label={t(p.value.toLowerCase())}
            size="small"
            color={p.value === "Male" ? "primary" : "secondary"}
            variant="outlined"
            sx={{
              fontWeight: 600,
              fontSize: responsive.isMobile ? '0.75rem' : '0.75rem',
            }}
          />
        </Typography>
      ),
    },
    {
      field: "phoneNumber",
      headerName: t("phone"),
      width: responsive.isMobile ? 140 : 170,
      renderCell: (params) => (
        <Typography
          noWrap
          variant
          sx={{
            fontWeight: 500,
            fontSize: responsive.isMobile ? '0.75rem' : '0.75rem',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "idCard",
      headerName: t("id_card"),
      width: responsive.isMobile ? 140 : 170,
      renderCell: (params) => (
        <Typography
          noWrap
          variant
          sx={{
            fontWeight: 500,
            fontSize: responsive.isMobile ? '0.75rem' : '0.75rem',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "passport",
      headerName: t("passport"),
      width: responsive.isMobile ? 140 : 170,
      renderCell: (params) => (
        <Typography
          noWrap
          variant
          sx={{
            fontWeight: 500,
            fontSize: responsive.isMobile ? '0.75rem' : '0.75rem',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "address",
      headerName: t("address"),
      flex: 1,
      width: responsive.isMobile ? 140 : 170,
      renderCell: (params) => (
        <Typography
          noWrap
          variant="body3"
          sx={{
            fontWeight: 500,
            fontSize: responsive.isMobile ? '0.75rem' : '0.75rem',
          }}
        >
          {params.value}
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
        gap: 2,
        p: 3,
      }}
    >
      <PersonIcon
        sx={{ fontSize: responsive.isMobile ? 60 : 80, opacity: 0.3 }}
      />
      <Typography variant="h6" fontWeight={600} align="center">
        {t("no_owners_found")}
      </Typography>
    </Box>
  );

  const FormContainer = responsive.useDrawerOnMobile ? Drawer : Dialog;
  const formContainerProps = responsive.useDrawerOnMobile
    ? {
        anchor: "bottom",
        PaperProps: {
          sx: { borderRadius: "16px 16px 0 0", maxHeight: "90vh" },
        },
      }
    : { maxWidth: responsive.dialogMaxWidth, fullWidth: true };

  return (
    <Paper
      elevation={6}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        width: '100%',
        minHeight: 'calc(100vh - 96px)',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 2 },
          display: 'flex',
          flexDirection: responsive.headerFlexDirection,
          justifyContent: 'space-between',
          alignItems: responsive.headerAlignItems,
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }} >
            <PersonIcon
              sx={{ opacity: 0.8, fontSize: responsive.isMobile ? 28 : 32 }}
            />
            <Typography
              variant={responsive.isMobile ? "h6" : "h5"}
              sx={{
                fontWeight: 500,
                background: "linear-gradient(90deg, #667eea, #764ba2)",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("owners")}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("manage_owners_accounts")}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: responsive.buttonStackDirection, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            placeholder={t("search_owners")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              width: responsive.searchWidth,
              background: alpha('#667eea', 0.05),
              borderRadius: 3,
              '& .MuiOutlinedInput-root': { borderRadius: 3 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ opacity: 0.7 }} />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction={responsive.buttonStackDirection} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateOpen}
              fullWidth={responsive.isMobile}
              sx={{ borderRadius: 3, textTransform: "none", fontWeight: 600 }}
            >
              {t("add_owner")}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              disabled={selectedCount === 0}
              fullWidth={responsive.isMobile}
              sx={{ borderRadius: 3, textTransform: "none" }}
            >
              {t("delete")} ({selectedCount})
            </Button>
          </Stack>
        </Box>
      </Box>

      {wsError && (
        <Alert severity="warning" sx={{ mx: 3, mb: 2, borderRadius: 2 }}>
          {t("realtime_offline")}
        </Alert>
      )}

      <Box sx={{ height: responsive.dataGridHeight, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={setSelectedRowIds}
          rowSelectionModel={selectedRowIds}
          onRowDoubleClick={(p) => handleUpdateOpen(p.row)}
          slots={{
            loadingOverlay: LinearProgress,
            noRowsOverlay: NoRowsOverlay,
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          rowHeight={44}
          density="compact"
          sx={{
            borderTop: "1px solid gey.300",
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
              bgcolor: alpha("#667eea", 0.04),
            },
          }}
        />
      </Box>

      {/* Form Dialog/Drawer */}
      <FormContainer
        open={openCreate || openUpdate}
        onClose={(e, r) =>
          r !== "backdropClick" &&
          r !== "escapeKeyDown" &&
          (openCreate ? setOpenCreate(false) : setOpenUpdate(false))
        }
        {...formContainerProps}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 24,
            maxWidth: responsive.dialogMaxWidth,
          },
        }}
      >
        {responsive.useDrawerOnMobile && (
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">
              {openCreate ? t("add_owner") : t("update_owner")}
            </Typography>
            <Button
              onClick={() =>
                openCreate ? setOpenCreate(false) : setOpenUpdate(false)
              }
            >
              <CloseIcon />
            </Button>
          </Box>
        )}

        {!responsive.useDrawerOnMobile && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 3,
              pb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <PersonIcon />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {openCreate ? t("add_new_owner") : t("update_owner_profile")}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {openCreate
                    ? t("fill_owner_details")
                    : t("update_owner_info")}
                </Typography>
              </Box>
            </Box>
            <Button
              onClick={() =>
                openCreate ? setOpenCreate(false) : setOpenUpdate(false)
              }
            >
              <CloseIcon />
            </Button>
          </Box>
        )}

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Stack spacing={2.5}>
            <TextField
              label={t("username")}
              fullWidth
              value={openCreate ? createForm.username : updateForm.username}
              onChange={(e) =>
                openCreate
                  ? setCreateForm((p) => ({ ...p, username: e.target.value }))
                  : setUpdateForm((p) => ({ ...p, username: e.target.value }))
              }
            />
            <TextField
              label={t("password")}
              type="password"
              fullWidth
              value={openCreate ? createForm.password : updateForm.password}
              onChange={(e) =>
                openCreate
                  ? setCreateForm((p) => ({ ...p, password: e.target.value }))
                  : setUpdateForm((p) => ({ ...p, password: e.target.value }))
              }
              helperText={openCreate ? t("required") : t("leave_empty_to_keep")}
            />
            <TextField
              label={t("phone")}
              fullWidth
              value={
                openCreate ? createForm.phoneNumber : updateForm.phoneNumber
              }
              onChange={(e) =>
                openCreate
                  ? setCreateForm((p) => ({
                      ...p,
                      phoneNumber: e.target.value,
                    }))
                  : setUpdateForm((p) => ({
                      ...p,
                      phoneNumber: e.target.value,
                    }))
              }
            />
            <TextField
              label={t("passport")}
              fullWidth
              value={openCreate ? createForm.passport : updateForm.passport}
              onChange={(e) =>
                openCreate
                  ? setCreateForm((p) => ({ ...p, passport: e.target.value }))
                  : setUpdateForm((p) => ({ ...p, passport: e.target.value }))
              }
            />
            <TextField
              label={t("id_card")}
              fullWidth
              value={openCreate ? createForm.idCard : updateForm.idCard}
              onChange={(e) =>
                openCreate
                  ? setCreateForm((p) => ({ ...p, idCard: e.target.value }))
                  : setUpdateForm((p) => ({ ...p, idCard: e.target.value }))
              }
            />
            <TextField
              label={t("address")}
              fullWidth
              multiline
              rows={2}
              value={openCreate ? createForm.address : updateForm.address}
              onChange={(e) =>
                openCreate
                  ? setCreateForm((p) => ({ ...p, address: e.target.value }))
                  : setUpdateForm((p) => ({ ...p, address: e.target.value }))
              }
            />
            <TextField
              select
              label={t("gender")}
              fullWidth
              value={openCreate ? createForm.gender : updateForm.gender}
              onChange={(e) =>
                openCreate
                  ? setCreateForm((p) => ({ ...p, gender: e.target.value }))
                  : setUpdateForm((p) => ({ ...p, gender: e.target.value }))
              }
            >
              {GENDERS.map((g) => (
                <MenuItem key={g} value={g}>
                  {t(g.toLowerCase())}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
          <Button
            onClick={() =>
              openCreate ? setOpenCreate(false) : setOpenUpdate(false)
            }
            fullWidth={responsive.isMobile}
            sx={{ borderRadius: 3 }}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={openCreate ? handleCreate : handleUpdate}
            variant="contained"
            fullWidth={responsive.isMobile}
            sx={{ borderRadius: 3, textTransform: "none", fontWeight: 600 }}
          >
            {openCreate ? t("create_owner") : t("update_owner")}
          </Button>
        </DialogActions>
      </FormContainer>
    </Paper>
  );
}
