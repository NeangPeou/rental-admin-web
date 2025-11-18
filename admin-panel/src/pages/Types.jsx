// Types.jsx
import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  Stack
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../api/axios.js'
import { useTranslation } from 'react-i18next'

export default function Types() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ type_code: '', name: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [selectedRows, setSelectedRows] = useState(new Set())

  const { t } = useTranslation()

  const columns = [
    { field: 'typeCode', headerName: t('code'), flex: 1 },
    { field: 'name', headerName: t('name'), flex: 2 },
  ]

  const fetchTypes = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/getalltype')
      const formatted = res.data.map(item => ({
        id: Number(item.id),
        typeCode: item.typeCode,
        name: item.name
      }))
      setRows(formatted)
    } catch (err) {
      console.error('Fetch error:', err)
      alert(t('error_fetching_types') || 'Failed to load types')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!form.type_code.trim()) newErrors.type_code = t('code_required')
    else if (!editId) {
      const exists = rows.some(r => r.typeCode === form.type_code.trim())
      if (exists) newErrors.type_code = t('code_already_exists')
    }
    if (!form.name.trim()) newErrors.name = t('name_required')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setSubmitError('')

    try {
      const payload = { type_code: form.type_code.trim(), name: form.name.trim() }

      if (editId) {
        await api.put(`/api/type/${editId}`, payload)
      } else {
        await api.post('/api/create-type', payload)
      }

      closeDialog()
      fetchTypes()
      alert(editId ? t('type_updated_success') : t('type_created_success'))
    } catch (err) {
      const msg = err.response?.data?.detail || 'Operation failed'
      setSubmitError(msg.includes('already exists') ? t('code_already_exists') : msg)
    }
  }

  const handleEdit = (row) => {
    setEditId(row.id)
    setForm({ type_code: row.typeCode || '', name: row.name || '' })
    setErrors({})
    setSubmitError('')
    setOpen(true)
  }

  const handleBulkDelete = async () => {
    const selectedIds = Array.from(selectedRows)
    if (selectedIds.length === 0) return

    const confirmMsg = selectedIds.length === 1
      ? t('confirm_delete_single')
      : t('confirm_delete_multiple', { count: selectedIds.length })

    if (!window.confirm(confirmMsg)) return

    try {
      await Promise.all(selectedIds.map(id => api.delete(`/api/type/${id}`)))
      setSelectedRows(new Set())
      fetchTypes()
      alert(t('types_deleted_success', { count: selectedIds.length }))
    } catch (err) {
      console.error('Delete error:', err)
      alert(t('error_deleting_types'))
    }
  }

  const handleRowDoubleClick = (params) => {
    handleEdit(params.row)
  }

  const closeDialog = () => {
    setOpen(false)
    setEditId(null)
    setForm({ type_code: '', name: '' })
    setErrors({})
    setSubmitError('')
  }

  const openCreateDialog = () => {
    setEditId(null)
    setForm({ type_code: '', name: '' })
    setErrors({})
    setSubmitError('')
    setOpen(true)
  }

  useEffect(() => {
    fetchTypes()
  }, [])

  const selectedCount = selectedRows.size

  return (
    <Box sx={{ height: 700, width: '100%', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('property_types') || 'Property Types'}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button variant="contained" onClick={openCreateDialog}>
          {t('create')} Type
        </Button>

        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleBulkDelete}
          disabled={selectedCount === 0}
        >
          {t('delete_selected')} ({selectedCount})
        </Button>

        {selectedCount > 0 && (
          <Typography color="text.secondary">
            {selectedCount} {selectedCount === 1 ? t('item_selected') : t('items_selected')}
          </Typography>
        )}
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        checkboxSelection
        getRowId={(row) => row.id}
        disableRowSelectionOnClick
        onRowSelectionModelChange={(newSelection) => {
          // Fix: Safely extract ids array (handles object, array, or null)
          let ids = []
          if (Array.isArray(newSelection)) {
            ids = newSelection
          } else if (newSelection && typeof newSelection === 'object' && newSelection.ids) {
            ids = Array.isArray(newSelection.ids) ? newSelection.ids : Array.from(newSelection.ids || [])
          }
          setSelectedRows(new Set(ids))
        }}
        onRowClick={(params, event) => {
          event.defaultMuiPrevented = true
        }}
        onRowDoubleClick={handleRowDoubleClick}
        pageSizeOptions={[10, 25, 50, 100]}
        sx={{
          '& .MuiDataGrid-row:hover': {
            cursor: 'pointer',
            backgroundColor: 'action.hover'
          },
          boxShadow: 2,
          border: 1,
          borderColor: 'divider'
        }}
      />

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
            error={!!errors.type_code}
            helperText={errors.type_code}
            disabled={!!editId}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label={t('name')}
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>{t('cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editId ? t('update') : t('create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}