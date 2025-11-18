import { useState, useEffect } from 'react'
import { Box, Paper, Typography, TextField, Button, Avatar, Grid, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import { useAuth } from '../context/AuthContext.jsx'
import { useTranslation } from 'react-i18next'
import api from '../api/axios.js'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    username: '', phoneNumber: '', passport: '', idCard: '', address: '', gender: ''
  })

  useEffect(() => {
    if (user) {
      setForm({
        username: user.userName || '',
        phoneNumber: user.phoneNumber || '',
        passport: user.passport || '',
        idCard: user.idCard || '',
        address: user.address || '',
        gender: user.gender || ''
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.put('/api/update-profile', {
        id: user.id,                    // REQUIRED by your backend
        username: form.username,
        phoneNumber: form.phoneNumber,
        passport: form.passport,
        idCard: form.idCard,
        address: form.address,
        gender: form.gender
      })

      updateUser(res.data)
      setSuccess(t('profile_updated'))
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      const details = err.response?.data?.detail
      let msg = 'Update failed'
      if (Array.isArray(details)) msg = details.map(d => d.msg).join('; ')
      else if (details) msg = typeof details === 'string' ? details : JSON.stringify(details)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>{t('profile')}</Typography>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Grid container spacing={4}>
          <Grid sx={{ textAlign: 'center' }}>
            <Avatar sx={{ width: 140, height: 140, mx: 'auto' }}>{user.userName[0]}</Avatar>
            <Button startIcon={<PhotoCamera />} sx={{ mt: 2 }}>Change Photo</Button>
          </Grid>
          <Grid>
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid><TextField fullWidth label="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} /></Grid>
                <Grid><TextField fullWidth label={t('phone')} value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} /></Grid>
                <Grid><TextField fullWidth label="Passport" value={form.passport} onChange={e => setForm({...form, passport: e.target.value})} /></Grid>
                <Grid><TextField fullWidth label="ID Card" value={form.idCard} onChange={e => setForm({...form, idCard: e.target.value})} /></Grid>
                <Grid>
                  <FormControl fullWidth>
                    <InputLabel>{t('gender')}</InputLabel>
                    <Select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid><TextField fullWidth multiline rows={3} label={t('address')} value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></Grid>
                <Grid>
                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? 'Saving...' : t('save_changes')}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}