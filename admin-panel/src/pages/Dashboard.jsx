import { Box, Grid, Paper, Typography, LinearProgress, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { People, Apartment, AttachMoney, TrendingUp } from '@mui/icons-material'

export default function Dashboard() {
  const { t } = useTranslation()

  const stats = [
    { label: t('owners'), value: 12, icon: <People />, color: '#667eea', progress: 78 },
    { label: 'Renters', value: 48, icon: <People />, color: '#764ba2', progress: 65 },
    { label: 'Units', value: 36, icon: <Apartment />, color: '#f093fb', progress: 82 },
    { label: 'Revenue', value: '$12,400', icon: <AttachMoney />, color: '#4facfe', progress: 90 },
  ]

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 4 }}>
        Welcome back, Admin
      </Typography>

      <Grid container spacing={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 40px ${alpha(stat.color, 0.2)}`
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: alpha(stat.color, 0.15),
                    color: stat.color,
                    mr: 2
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={800} color={stat.color}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stat.progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(stat.color, 0.1),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: stat.color
                  }
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Activity Chart Placeholder */}
      <Paper sx={{ mt: 6, p: 4, borderRadius: 4, height: 400 }}>
        <Typography variant="h6" gutterBottom>Activity Overview</Typography>
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
          <TrendingUp sx={{ fontSize: 80, opacity: 0.3 }} />
        </Box>
      </Paper>
    </Box>
  )
}