// src/pages/Owners.jsx
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
  Divider,
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
  } = OwnersController();

  const selectedCount = selectedRowIds.length;

  const columns = [
    {
      field: "userName",
      headerName: t("username"),
      flex: 1,
      renderCell: (p) => (
        <Chip label={p.value} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
      ),
    },
    {
      field: "gender",
      headerName: t("gender"),
      width: 120,
      renderCell: (p) => (
        <Chip
          icon={p.value === "Male" ? <MaleIcon /> : <FemaleIcon />}
          label={t(p.value.toLowerCase())}
          size="small"
          color={p.value === "Male" ? "primary" : "secondary"}
          variant="outlined"
        />
      ),
    },
    { field: "phoneNumber", headerName: t("phone"), width: 140 },
    { field: "idCard", headerName: t("id_card"), width: 140 },
    { field: "passport", headerName: t("passport"), width: 140 },
    { field: "address", headerName: t("address"), flex: 1, minWidth: 150 },
  ];

  const FormContainer = responsive.useDrawerOnMobile ? Drawer : Dialog;
  const formProps = responsive.useDrawerOnMobile
    ? { 
       anchor: "bottom", 
       PaperProps: { 
        sx: { 
          borderRadius: "16px 16px 0 0", 
          maxHeight: "90vh", 
          width: '100%' 
        } 
      } 
    }
    : { 
      maxWidth: responsive.dialogMaxWidth, 
      fullWidth: true 
    };

  return (
    <Paper 
      elevation={6} 
      sx={{ 
        borderRadius: 4, 
        overflow: "hidden", 
        bgcolor: "background.paper", 
        width: "100%", 
        minHeight: "calc(100vh - 96px)"
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: {xs: 2, sm: 2}, 
          display: "flex", 
          flexDirection: responsive.headerFlexDirection, 
          justifyContent: "space-between", 
          alignItems: responsive.headerAlignItems,
          alignItems: "center", 
          gap: 2 
        }}
      >
        <Box sx={{width: { xs: '100%', sm: 'auto' } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PersonIcon 
              sx={{ 
                opacity: 0.7, 
                fontSize: responsive.isMobile ? 28 : 32 
              }} 
            />
              <Typography 
                variant={responsive.isMobile ? "h6" : "h5"} 
                sx={{ fontWeight: 500, 
                background: "linear-gradient(90deg, #667eea, #764ba2)", 
                backgroundClip: "text", 
                WebkitTextFillColor: "transparent" 
                }}
              >
                {t("owners")}
              </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("manage_owners_accounts")}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: responsive.buttonStackDirection, gap: 2, width: { xs: '100%', sm: 'auto' }}}>
          <TextField
            placeholder={t("search_owners")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ 
              width: responsive.searchWidth, 
              bgcolor: alpha("#667eea", 0.05), 
              borderRadius: 3,
              '& .MuiOutlinedInput-root': { borderRadius: 3 },
            }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />
          <Stack direction={responsive.buttonStackDirection} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={openCreate} 
              fullWidth={responsive.isMobile}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
            >
              {t("add_owner")}
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<DeleteIcon />} 
              onClick={handleBulkDelete} 
              disabled={!selectedCount} 
              fullWidth={responsive.isMobile}
              sx={{ borderRadius: 3, textTransform: 'none' }}
            >
              {t("delete")} ({selectedCount})
            </Button>
          </Stack>
        </Box>
      </Box>

      {(wsError || submitError) && (
        <Alert severity="warning" sx={{ m: 2 }}>
          {wsError ? t("realtime_offline") : submitError}
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
          onRowDoubleClick={(p) => openUpdate(p.row)}
          slots={{ loadingOverlay: LinearProgress }}
          pageSizeOptions={[10, 25, 50, 100]}
          density="compact"
          sx={{ "& .MuiDataGrid-row:hover": { cursor: "pointer", bgcolor: alpha("#667eea", 0.04) } }}
        />
      </Box>

      {/* Unified Create/Edit Dialog – Exactly like Types */}
      <FormContainer 
        open={open} 
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            closeDialog();
          }
        }}
        {...formProps}
        {...(!responsive.useDrawerOnMobile
          ? {
              PaperProps: {
                sx: {
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: (theme) => theme.shadows[24],
                  width: '100%',
                  maxWidth: responsive.dialogMaxWidth,
                },
              },
            }
          : {})}
      >
        {/* Mobile Header */}
        {responsive.useDrawerOnMobile && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              p: 2, 
              borderBottom: 1, 
              borderColor: 'divider' 
            }}
          >
            <Typography variant="h6">{editId ? t("update_owner") : t("add_owner")}</Typography>
            <Button onClick={closeDialog} sx={{ minWidth: 'auto' }}><CloseIcon /></Button>
          </Box>
        )}

        {/* Desktop Header */}
        {!responsive.useDrawerOnMobile && (
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              px: 3,
              py: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <PersonIcon />
              </Box>
              <div>
                <Typography variant="h6" fontWeight={700}>
                  {editId ? t("update_owner_profile") : t("add_new_owner")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {editId ? t("update_owner_info") : t("fill_owner_details")}
                </Typography>
              </div>
            </Box>
            <Button onClick={closeDialog}><CloseIcon /></Button>
          </Box>
        )}
        <Divider sx={{ mx: 1, opacity: 0.8 }} />
        <DialogContent sx={{ px: { xs: 2, sm: 4 } }}>
          {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

          <Stack spacing={1}>
            <TextField
              label={t("username")}
              fullWidth
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              error={!!formErrors.username}
              helperText={formErrors.username}
              sx={{ "& .MuiInputBase-root": { borderRadius: 3 } }}
            />

            <TextField
              label={t("password")}
              type="password"
              fullWidth
              required={!editId}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={!editId ? "" : t("leave_empty_to_keep")}
              error={!!formErrors.password}
              helperText={formErrors.password}
              sx={{ "& .MuiInputBase-root": { borderRadius: 3 } }}
            />

            <TextField
              label={t("phone")}
              fullWidth
              required
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              error={!!formErrors.phoneNumber}
              helperText={formErrors.phoneNumber}
              sx={{ "& .MuiInputBase-root": { borderRadius: 3 } }}
            />

            <TextField
              label={t("passport")}
              fullWidth
              value={form.passport}
              onChange={(e) => setForm({ ...form, passport: e.target.value })}
              sx={{ "& .MuiInputBase-root": { borderRadius: 3 } }}
            />

            <TextField
              label={t("id_card")}
              fullWidth
              value={form.idCard}
              onChange={(e) => setForm({ ...form, idCard: e.target.value })}
              sx={{ "& .MuiInputBase-root": { borderRadius: 3 } }}
            />

            <TextField
              label={t("address")}
              fullWidth
              multiline
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              sx={{ "& .MuiInputBase-root": { borderRadius: 3 } }}
            />

            <TextField
              select
              label={t("gender")}
              fullWidth
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              sx={{ "& .MuiInputBase-root": { borderRadius: 3 } }}
            >
              {GENDERS.map((g) => (
                <MenuItem key={g} value={g}>{t(g.toLowerCase())}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <Divider sx={{ mx: 1, opacity: 0.8 }} />
        <DialogActions sx={{ p: 2, gap: 1, pt: 1 }}>
          <Button onClick={closeDialog} fullWidth={responsive.isMobile} sx={{ borderRadius: 3 }}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} variant="contained" fullWidth={responsive.isMobile} sx={{ borderRadius: 3 }}>
            {editId ? t("update") : t("create")}
          </Button>
        </DialogActions>
      </FormContainer>
    </Paper>
  );
}