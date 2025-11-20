import { useEffect, useState } from 'react'
import {
  DataGrid,
} from '@mui/x-data-grid'
import {
  Box,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  alpha,
  useTheme,
  TextField,
  InputAdornment,
} from '@mui/material'
import {
  Person, Info, Warning, Error as ErrorIcon, CheckCircle, History, Search
} from '@mui/icons-material'
import api from '../api/axios.js'
import { useTranslation } from 'react-i18next'

// Log Type color
const getLogTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'info': return 'info'
    case 'warning': return 'warning'
    case 'error': return 'error'
    case 'success': return 'success'
    default: return 'default'
  }
}

// Log type icon
const getLogTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'info': return <Info fontSize="small" />
    case 'warning': return <Warning fontSize="small" />
    case 'error': return <ErrorIcon fontSize="small" />
    case 'success': return <CheckCircle fontSize="small" />
    default: return <Info fontSize="small" />
  }
}

export default function SystemLogs() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState("") // 🔥 custom search
  const { t } = useTranslation()
  const theme = useTheme()
  const darkMode = theme.palette.mode === 'dark'

  // Columns
  const columns = [
    {
      field: 'user_id',
      headerName: t('user'),
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
          <Person sx={{ fontSize: 16, opacity: 0.7, color: 'text.secondary' }} />
          <Typography fontWeight={400}>
            {params.row.userName}
          </Typography>
        </Box>
      )
    },
    {
      field: 'action',
      headerName: t('action'),
      width: 190,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 400, color: 'primary.main', textTransform: 'capitalize' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'logType',
      headerName: t('type'),
      width: 120,
      renderCell: (params) => (
        <Chip
          icon={getLogTypeIcon(params.value)}
          label={params.value}
          size="small"
          color={getLogTypeColor(params.value)}
          sx={{ fontWeight: 700 }}
        />
      )
    },
    {
      field: 'message',
      headerName: t('message'),
      flex: 1,
      minWidth: 320,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ py: 0.4, lineHeight: 1.6, fontFamily: '"Roboto Mono", monospace' }}
        >
          {params.value}
        </Typography>
      )
    },
    {
      field: 'hostName',
      headerName: t('host'),
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value} size="small" variant="outlined" />
      )
    },
    { field: 'created_at', headerName: t('time'), width: 200 }
  ]

  // Data load
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await api.get('/api/system-logs')

        const formatted = res.data.map((log, idx) => ({
          ...log,
          id: log.id || log._id || idx
        }))

        setRows(formatted)
      } catch (err) {
        setError(t('failed_to_load_logs'))
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [t])

  // 🔍 filter rows
  const filteredRows = rows.filter((log) => {
    const s = search.toLowerCase()
    return (
      log.userName?.toLowerCase().includes(s) ||
      log.action?.toLowerCase().includes(s) ||
      log.message?.toLowerCase().includes(s) ||
      log.logType?.toLowerCase().includes(s) ||
      log.hostName?.toLowerCase().includes(s)
    )
  })

  // Empty UI
  const NoRowsOverlay = () => (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'text.secondary',
      gap: 2
    }}>
      <History sx={{ fontSize: 70, opacity: 0.3 }} />
      <Typography variant="h6" fontWeight={600}>{t('no_logs_found')}</Typography>
    </Box>
  )

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

      {/* 🔥 Header + Search Bar */}
      <Box
        sx={{
          p: { xs: 2, sm: 2 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          gap: 2,
          alignItems: { xs: 'flex-start', sm: 'center' }
        }}
      >
        {/* Title */}
        <Box>
          {/* Title Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <History sx={{ opacity: 0.7, fontSize: 28 }} />

            <Typography
              variant="h5"
              sx={{
                fontWeight: 500,
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {t('system_logs')}
            </Typography>
          </Box>

          {/* Subtitle */}
          <Typography variant="body1" color="text.secondary">
            {t('view_all_system_activities')}
          </Typography>
        </Box>

        {/* 🔍 Search Input */}
        <TextField
          placeholder={t('search_logs')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            width: { xs: '100%', sm: 320 },
            background: alpha('#667eea', 0.05),
            borderRadius: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ opacity: 0.7 }} />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Data Table */}
      <Box sx={{ height: 'calc(100vh - 184px)', width: '100%' }}>
        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } }
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          rowHeight={44}
          density="compact"
          slots={{
            loadingOverlay: LinearProgress,
            noRowsOverlay: NoRowsOverlay
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-row:hover': {
              bgcolor: alpha('#667eea', darkMode ? 0.15 : 0.07),
              cursor: 'pointer',
            },
          }}
        />
      </Box>
    </Paper>
  )
}
