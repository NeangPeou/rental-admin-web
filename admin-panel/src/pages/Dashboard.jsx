// src/pages/Dashboard.jsx
import { useEffect, useState, useRef } from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  alpha,
  useTheme,
  CircularProgress,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import {
  People,
  Category,
  Settings,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import useResponsiveGlobal from '../hooks/useResponsiveGlobal'
import TypeService from '../services/TypeService'
import UtilityTypesService from '../services/UtilityTypesService'

const Item = ({ children, elevation = 6, sx, ...props }) => (
  <Paper
    elevation={elevation}
    sx={{
      p: 3,
      borderRadius: 4,
      height: '100%',
      background: (theme) =>
        theme.palette.mode === 'dark'
          ? alpha('#1a1a2e', 0.8)
          : '#fff',
      border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      ...sx,
    }}
    {...props}
  >
    {children}
  </Paper>
)

export default function Dashboard() {
  const { t } = useTranslation()
  const [ownersCount, setOwnersCount] = useState(null)
  const [typesCount, setTypesCount] = useState(null)
  const [utilityTypesCount, setUtilityTypesCount] = useState(null)
  const wsRef = useRef(null)

  // Real-time Owners
  useEffect(() => {
    if (wsRef.current) return
    const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/api/ws/owners`
    const connect = () => {
      wsRef.current = new WebSocket(wsUrl)
      wsRef.current.onopen = () => wsRef.current.send(JSON.stringify({ action: 'init' }))
      wsRef.current.onmessage = (e) => {
        const msg = JSON.parse(e.data)
        if (msg.action === 'init') setOwnersCount(msg.data.length)
        if (msg.action === 'create') setOwnersCount(c => c + 1)
        if (msg.action === 'delete') setOwnersCount(c => Math.max(0, c - 1))
      }
      wsRef.current.onclose = () => setTimeout(connect, 3000)
    }
    connect()
    return () => wsRef.current?.close()
  }, [])

  useEffect(() => {
    Promise.all([TypeService.getAll(), UtilityTypesService.getAll()])
      .then(([types, utils]) => {
        setTypesCount(types.length)
        setUtilityTypesCount(utils.length)
      })
      .catch(() => {
        setTypesCount(0)
        setUtilityTypesCount(0)
      })
  }, [])

  const cards = [
    { title: t('total_owners'), value: ownersCount ?? <CircularProgress size={36} />, icon: <People sx={{ fontSize: 48 }} />, color: '#667eea' },
    { title: t('property_types'), value: typesCount ?? '...', icon: <Category sx={{ fontSize: 48 }} />, color: '#f093fb' },
    { title: t('utility_types'), value: utilityTypesCount ?? '...', icon: <Settings sx={{ fontSize: 48 }} />, color: '#a8edea' },
  ]

  const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 16000 },
    { month: 'May', revenue: 22000 },
    { month: 'Jun', revenue: 25000 },
  ]

  const propertyByType = [
    { name: 'Apartment', value: 45 },
    { name: 'House', value: 30 },
    { name: 'Condo', value: 15 },
    { name: 'Land', value: 10 },
  ]

  const monthlyGrowth = [
    { month: 'Jan', owners: 120, properties: 180 },
    { month: 'Feb', owners: 135, properties: 195 },
    { month: 'Mar', owners: 148, properties: 220 },
    { month: 'Apr', owners: 165, properties: 245 },
    { month: 'May', owners: 182, properties: 280 },
    { month: 'Jun', owners: 205, properties: 320 },
  ]

  const COLORS = ['#667eea', '#f093fb', '#a8edea', '#43e97b']

  return (
    <Box>
      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          background: 'linear-gradient(90deg, #667eea, #764ba2)',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2,
        }}
      >
        {t('dashboard')}
      </Typography>

      <Grid container spacing={3} columns={24}>
        <Grid size={{ xs: 24, md: 8}} sx={{size: "small", height: "200px"}}
        >
          <Item sx={{ background: `linear-gradient(135deg, ${alpha('#667eea', 0.15)}, ${alpha('#667eea', 0.05)})` }}>
            <Box sx={{ textAlign: 'center'}}>
              <Box sx={{ p: 1, borderRadius: '50%', background: alpha('#667eea', 0.2), display: 'inline-flex', mb: 1 }}>
                {cards[0].icon}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#667eea' }}>
                {cards[0].value}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                {cards[0].title}
              </Typography>
            </Box>
          </Item>
        </Grid>

        {/* === RIGHT SECTION: 16/24 === */}
       
          <Grid size={{ xs: 24, md: 8 }} sx={{size: "small", height: "200px"}}>
            <Item sx={{ background: `linear-gradient(135deg, ${alpha('#f093fb', 0.15)}, ${alpha('#f093fb', 0.05)})` }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ p: 1, borderRadius: '50%', background: alpha('#f093fb', 0.2), display: 'inline-flex', mb: 1 }}>
                  {cards[1].icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#f093fb' }}>
                  {cards[1].value}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                  {cards[1].title}
                </Typography>
              </Box>
            </Item>
          </Grid>

          <Grid size={{ xs: 24, md: 8 }} sx={{size: "small", height: "200px"}}>
            <Item sx={{ background: `linear-gradient(135deg, ${alpha('#a8edea', 0.15)}, ${alpha('#a8edea', 0.05)})` }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ p: 1, borderRadius: '50%', background: alpha('#a8edea', 0.2), display: 'inline-flex', mb: 1 }}>
                  {cards[2].icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#a8edea' }}>
                  {cards[2].value}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                  {cards[2].title}
                </Typography>
              </Box>
            </Item>
          </Grid>
        {/* === FULL WIDTH CHARTS BELOW === */}
        <Grid size={24}>
          <Grid container spacing={3}>
            {/* Revenue Trend */}
            <Grid size={{ xs: 24, lg: 12 }}>
              <Item>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  {t('revenue_trend') || 'Revenue Trend'}
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={4} />
                  </LineChart>
                </ResponsiveContainer>
              </Item>
            </Grid>

            {/* Property Distribution */}
            <Grid size={{ xs: 24, lg: 12 }}>
              <Item>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  {t('properties_by_type') || 'Properties by Type'}
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={propertyByType} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                      {propertyByType.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Item>
            </Grid>

            {/* Growth Comparison */}
            <Grid size={{ xs: 24, lg: 12 }}>
              <Item>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  {t('growth_comparison') || 'Growth Comparison'}
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={monthlyGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="owners" fill="#667eea" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="properties" fill="#f093fb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Item>
            </Grid>

            {/* Occupancy Rate */}
            <Grid size={{ xs: 24, lg: 12 }}>
              <Item sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                  {t('occupancy_rate') || 'Occupancy Rate'}
                </Typography>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={[{ value: 94.2 }, { value: 5.8 }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={120}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                    >
                      <Cell fill="#667eea" />
                      <Cell fill="#e0e0e0" />
                    </Pie>
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={48} fontWeight="bold" fill="#667eea">
                      94.2%
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </Item>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}