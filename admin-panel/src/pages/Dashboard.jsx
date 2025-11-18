import { Box, Grid, Paper, Typography, LinearProgress } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function Dashboard() {
  const { t } = useTranslation()

  const stats = [
    { label: t('owners'), value: 12, color: 'success' },
    { label: 'Renters', value: 48, color: 'info' },
    { label: 'Units', value: 36, color: 'warning' },
    { label: 'Revenue', value: '$12,400', color: 'error' }
  ]

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('welcome')} Admin
      </Typography>
      <Grid container spacing={3}>
        {stats.map(stat => (
          <Grid xs={12} sm={6} md={3} key={stat.label}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h3" fontWeight={700} color={`${stat.color}.main`}>
                {stat.value}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {stat.label}
              </Typography>
              <LinearProgress variant="determinate" value={75} sx={{ mt: 2 }} color={stat.color} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}