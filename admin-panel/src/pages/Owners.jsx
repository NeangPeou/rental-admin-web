import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Paper, Typography, Button, Chip } from '@mui/material'
import api from '../api/axios.js'
import { useTranslation } from 'react-i18next'

let ws = null

export default function Owners() {
  const [rows, setRows] = useState([])
  const { t } = useTranslation()

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'userName', headerName: t('username'), width: 180, renderCell: p => <strong>{p.value}</strong> },
    { field: 'userID', headerName: 'User ID', width: 120 },
    { field: 'phoneNumber', headerName: 'Phone', width: 150 },
    { field: 'gender', headerName: 'Gender', width: 100, renderCell: p => <Chip label={p.value} size="small" /> },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: () => (
        <Button size="small" color="error" variant="outlined">
          {t('delete')}
        </Button>
      )
    }
  ]

  useEffect(() => {
    api.get('/api/owners').then(res => setRows(res.data))

    ws = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/api/ws/owners`)
    ws.onopen = () => ws.send(JSON.stringify({ action: 'init' }))
    ws.onmessage = e => {
      const msg = JSON.parse(e.data)
      if (msg.action === 'init') setRows(msg.data)
      if (msg.action === 'create') setRows(prev => [...prev, msg.data])
      if (msg.action === 'update') setRows(prev => prev.map(r => r.id === msg.id ? msg.data : r))
      if (msg.action === 'delete') setRows(prev => prev.filter(r => r.id !== msg.id))
    }
    return () => ws?.close()
  }, [])

  return (
    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {t('owners')} ({rows.length})
      </Typography>
      <Box sx={{ height: 600 }}>
        <DataGrid rows={rows} columns={columns} pageSize={10} />
      </Box>
    </Paper>
  )
}