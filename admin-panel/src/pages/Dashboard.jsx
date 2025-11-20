import { Box, Grid, Paper, Typography, LinearProgress, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { People, Apartment, AttachMoney, TrendingUp } from '@mui/icons-material'
import useResponsiveGlobal from '../hooks/useResponsiveGlobal'

export default function Dashboard() {
  const { t } = useTranslation()
  const responsive = useResponsiveGlobal()

  const scaleValue = responsive.isMobile
    ? 0.86
    : responsive.isTablet
      ? 0.94
      : 1

  const stats = [
    { label: t('owners'), value: 12, icon: <People />, color: '#667eea', progress: 78 },
    { label: t('renters'), value: 48, icon: <People />, color: '#764ba2', progress: 65 },
    { label: t('units'), value: 36, icon: <Apartment />, color: '#f093fb', progress: 82 },
    { label: t('revenue'), value: '$12000', icon: <AttachMoney />, color: '#4facfe', progress: 90 }
  ]

  return (
    <Box
      sx={{
        transform: `scale(${scaleValue})`,
        transformOrigin: 'top left',
        width: `${100 / scaleValue}%`,
        transition: '0.25s ease'
      }}
    >
      {/* Dashboard Title */}
      <Typography
        variant={responsive.isMobile ? 'h6' : 'h5'}
        fontWeight={800}
        gutterBottom
        sx={{ mb: responsive.isMobile ? 2 : 1 }}
      >
        {t('welcome_back')}, Admin
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={responsive.isMobile ? 3 : 4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
            <Paper
              elevation={1}
              sx={{
                p: responsive.isMobile ? 3 : 4,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 40px ${alpha(stat.color, 0.2)}`
                },
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
                  <Typography
                    variant={responsive.isMobile ? 'h4' : 'h3'}
                    fontWeight={800}
                    color={stat.color}
                  >
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

      <Paper
        elevation={2}
        sx={{
          mt: 2,
          p: responsive.isMobile ? 3 : 4,
          borderRadius: 4,
          height: responsive.isMobile ? 280 : 400
        }}
      >
        <Typography variant="h6" gutterBottom>
          {t('activity_overview')}
        </Typography>

        <Box
          sx={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary'
          }}
        >
          <TrendingUp sx={{ fontSize: responsive.isMobile ? 60 : 80, opacity: 0.3 }} />
        </Box>
      </Paper>
    </Box>
  )
}
