// src/pages/Types.jsx  (or wherever you keep it)
import { useTranslation } from 'react-i18next'
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
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  alpha,
  useTheme,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Search,
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import TypesController from '../controllers/TypesController'

export default function Types() {
  const { t } = useTranslation()
  const theme = useTheme()
  const darkMode = theme.palette.mode === 'dark'

  const {
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
  } = TypesController()

  const columns = [
    {
      field: 'typeCode',
      headerName: t('code'),
      width: 180,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'name',
      headerName: t('name'),
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 500, py: 0.5 }}>
          {params.value}
        </Typography>
      ),
    },
  ]

  const NoRowsOverlay = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'text.secondary',
        gap: 2,
      }}
    >
      <CategoryIcon sx={{ fontSize: 70, opacity: 0.3 }} />
      <Typography variant="h6" fontWeight={600}>
        {t('no_types_found') || 'No property types found'}
      </Typography>
      {search && (
        <Typography variant="body2">
          Try adjusting your search term
        </Typography>
      )}
    </Box>
  )

  const selectedCount = selectedRowIds.length

  return (
    <Paper
      elevation={6}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        width: '100%',
        minHeight: 'calc(100vh - 96px)',
        p: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 1.5 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CategoryIcon sx={{ opacity: 0.7, fontSize: 32 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('property_types') || 'Property Types'}
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('manage_property_type_definitions') || 'Manage property type definitions'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            placeholder={t('search_types') || 'Search types...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              width: { xs: '100%', sm: 300 },
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

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
            >
              {t('create_type') || 'Create Type'}
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              disabled={selectedCount === 0}
              sx={{ borderRadius: 3, textTransform: 'none' }}
            >
              {t('delete') || 'Delete'} ({selectedCount})
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ height: 'calc(100vh - 184px)', width: '100%' }}>
        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={setSelectedRowIds}
          rowSelectionModel={selectedRowIds}
          onRowDoubleClick={(params) => handleEdit(params.row)}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          rowHeight={44}
          density="compact"
          slots={{
            loadingOverlay: LinearProgress,
            noRowsOverlay: NoRowsOverlay,
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-row:hover': {
              bgcolor: alpha('#667eea', darkMode ? 0.15 : 0.07),
              cursor: 'pointer',
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: alpha('#667eea', 0.08),
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>

      {/* Dialog */}
      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editId ? t('edit_type') : t('create_new_type')}
        </DialogTitle>
        <DialogContent>
          {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

          <TextField
            autoFocus
            margin="dense"
            label={t('code')}
            fullWidth
            value={form.type_code}
            onChange={(e) => setForm({ ...form, type_code: e.target.value })}
            error={!!formErrors.type_code}
            helperText={formErrors.type_code}
            disabled={!!editId}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label={t('name')}
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={!!formErrors.name}
            helperText={formErrors.name}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>{t('cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editId ? t('update') : t('create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}