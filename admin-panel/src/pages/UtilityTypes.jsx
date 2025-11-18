import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Button, Box, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material'
import api from '../api/axios.js'
import { useTranslation } from 'react-i18next'

export default function UtilityTypes() {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '' })
  const [editId, setEditId] = useState(null)
  const { t } = useTranslation()

  const columns = [
    { field: 'name', headerName: t('name'), width: 250 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <>
          <Button size="small" onClick={() => handleEdit(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>Delete</Button>
        </>
      )
    }
  ]

  const fetch = async () => {
    const res = await api.get('/api/getallutilitytype')
    setRows(res.data)
  }

  const handleSubmit = async () => {
    if (editId) {
      await api.put(`/api/utility-type/${editId}`, form)
    } else {
      await api.post('/api/create-utility-type', form)
    }
    setOpen(false)
    fetch()
  }

  const handleEdit = (row) => {
    setEditId(row.id)
    setForm({ name: row.name })
    setOpen(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete?')) {
      await api.delete(`/api/utility-type/${id}`)
      fetch()
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Button variant="contained" onClick={() => { setEditId(null); setForm({ name: '' }); setOpen(true); }} sx={{ mb: 2 }}>
        {t('create')} Utility
      </Button>
      <DataGrid rows={rows} columns={columns} />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editId ? 'Edit' : 'Create'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="dense" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}