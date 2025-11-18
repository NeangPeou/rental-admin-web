import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Box, Typography } from '@mui/material'
import api from '../api/axios.js'
import { useTranslation } from 'react-i18next'

export default function SystemLogs() {
  const [rows, setRows] = useState([])
  const { t } = useTranslation()

  const columns = [
    { field: 'user_id', headerName: 'User', width: 100 },
    { field: 'action', headerName: t('action'), width: 150 },
    { field: 'logType', headerName: 'Type', width: 100 },
    { field: 'message', headerName: t('message'), width: 400 },
    { field: 'hostName', headerName: 'Host', width: 150 },
    { field: 'created_at', headerName: t('time'), width: 180 }
  ]

  useEffect(() => {
    api.get('/api/system-logs').then(res => setRows(res.data))
  }, [])

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{t('logs')}</Typography>
      <DataGrid rows={rows} columns={columns} />
    </Box>
  )
}