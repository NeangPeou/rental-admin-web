import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Button, Box, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material'
import api from '../api/axios.js'
import { useTranslation } from 'react-i18next'

export default function Types() {
  const [rows, setRows] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ type_code: '', name: '' })
  const [editId, setEditId] = useState(null)
  const { t } = useTranslation()

  const columns = [
    { field: 'typeCode', headerName: t('code'), width: 150 },
    { field: 'name', headerName: t('name'), width: 200 },
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

  const fetchTypes = async () => {
    const res = await api.get('/api/getalltype')
    setRows(res.data)
  }

  const handleSubmit = async () => {
    if (editId) {
      await api.put(`/api/type/${editId}`, form)
    } else {
      await api.post('/api/create-type', form)
    }
    setOpen(false)
    fetchTypes()
  }

  const handleEdit = (row) => {
    setEditId(row.id)
    setForm({ type_code: row.typeCode, name: row.name })
    setOpen(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete?')) {
      await api.delete(`/api/type/${id}`)
      fetchTypes()
    }
  }

  useEffect(() => {
    fetchTypes()
  }, [])

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Button variant="contained" onClick={() => { setEditId(null); setForm({ type_code: '', name: '' }); setOpen(true); }} sx={{ mb: 2 }}>
        {t('create')} Type
      </Button>
      <DataGrid rows={rows} columns={columns} />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editId ? 'Edit' : 'Create'} Type</DialogTitle>
        <DialogContent>
          <TextField label="Code" fullWidth margin="dense" value={form.type_code} onChange={e => setForm({ ...form, type_code: e.target.value })} />
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