// src/pages/Types.jsx
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
  DialogContent,
  DialogActions,
  Stack,
  alpha,
  Drawer,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Search,
  Close as CloseIcon,
} from '@mui/icons-material'
import { DataGrid } from '@mui/x-data-grid'
import TypesController from '../controllers/TypesController'
import useResponsiveGlobal from '../hooks/useResponsiveGlobal' // ← Add this

export default function Types() {
  const { t } = useTranslation()
  const responsive = useResponsiveGlobal()

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

  // Responsive columns: hide code chip on mobile if needed
  const columns = [
    {
      field: 'typeCode',
      headerName: t('code'),
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
              fontSize: responsive.isMobile ? '0.69rem' : '0.8rem',
            }}
          />
        </Typography>
        
      ),
    },
    {
      field: 'name',
      headerName: t('name'),
      flex: 1,
      minWidth: responsive.isMobile ? 150 : 200,
      renderCell: (params) => (
        <Typography
          noWrap
          variant
          sx={{
            fontWeight: 500,
            fontSize: responsive.isMobile ? '0.69rem' : '0.8rem',
          }}
        >
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
        p: 2,
      }}
    >
      <CategoryIcon sx={{ fontSize: responsive.isMobile ? 50 : 70, opacity: 0.3 }} />
      <Typography variant={responsive.isMobile ? 'subtitle1' : 'h6'} fontWeight={600} align="center">
        {t('no_types_found') || 'No property types found'}
      </Typography>
      {search && (
        <Typography variant="body2" align="center">
          {t('no_types_found_search')}
        </Typography>
      )}
    </Box>
  )

  const selectedCount = selectedRowIds.length

  // Dialog or Drawer based on screen size
  const FormContainer = responsive.useDrawerOnMobile ? Drawer : Dialog

  const formContainerProps = responsive.useDrawerOnMobile
    ? {
        anchor: 'bottom',
        PaperProps: {
          sx: {
            borderRadius: '16px 16px 0 0',
            maxHeight: '90vh',
            width: '100%',
          },
        },
      }
    : {
        maxWidth: responsive.dialogMaxWidth,
        fullWidth: true,
      }

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CategoryIcon sx={{ opacity: 0.7, fontSize: responsive.isMobile ? 28 : 32 }} />
            <Typography
              variant={responsive.isMobile ? 'h6' : 'h5'}
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
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('manage_property_type_definitions') || 'Manage property type definitions'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: responsive.buttonStackDirection, gap: 2, width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            placeholder={t('search_types') || 'Search types...'}
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
              onClick={openCreateDialog}
              fullWidth={responsive.isMobile}
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
              fullWidth={responsive.isMobile}
              sx={{ borderRadius: 3, textTransform: 'none' }}
            >
              {t('delete') || 'Delete'} ({selectedCount})
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ height: responsive.dataGridHeight, width: '100%' }}>
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
          initialState={{ pagination: { paginationModel: { pageSize: responsive.isMobile ? 10 : 25 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          rowHeight={44}
          density={'compact'}
          slots={{
            loadingOverlay: LinearProgress,
            noRowsOverlay: NoRowsOverlay,
          }}
          sx={{
            borderTop: '1px solid grey.300',
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer',
            },
          }}
        />
      </Box>

      {/* Responsive Dialog / Drawer with enhanced (beautiful) dialog styling */}
      <FormContainer
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            closeDialog();
          }
        }}
        {...formContainerProps}
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
        {/* Drawer header remains compact for mobile */}
        {responsive.useDrawerOnMobile && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">
              {editId ? t('edit_type') : t('create_new_type')}
            </Typography>
            <Button onClick={closeDialog} sx={{ minWidth: 'auto' }}>
              <CloseIcon />
            </Button>
          </Box>
        )}

        {/* Beautiful Dialog header for desktop/tablet */}
        {!responsive.useDrawerOnMobile && (
          <>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CategoryIcon />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {editId ? t('edit_type') : t('create_new_type')}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {editId ? t('edit_type_subtitle') : t('create_type_subtitle')}
                  </Typography>
                </Box>
              </Box>

              <Button onClick={closeDialog} sx={{ minWidth: 'auto' }}>
                <CloseIcon />
              </Button>
            </Box>
          </>
        )}

        <DialogContent sx={{ pb: 1, px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2 } }}>
          {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

          <Stack spacing={2}>
            <TextField
              margin="dense"
              label={t('code')}
              fullWidth
              value={form.type_code}
              onChange={(e) => setForm({ ...form, type_code: e.target.value })}
              error={!!formErrors.type_code}
              helperText={formErrors.type_code}
              disabled={!!editId}
              sx={{
                "& .MuiInputBase-root": { borderRadius: 3 },
              }}
            />

            <TextField
              margin="dense"
              label={t('name')}
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{
                "& .MuiInputBase-root": { borderRadius: 3 },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 1, gap: 1 }}>
          <Button onClick={closeDialog} fullWidth={responsive.isMobile} sx={{ borderRadius: 3 }}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} variant="contained" fullWidth={responsive.isMobile} sx={{ borderRadius: 3 }}>
            {editId ? t('update') : t('create')}
          </Button>
        </DialogActions>
      </FormContainer>
    </Paper>
  )
}