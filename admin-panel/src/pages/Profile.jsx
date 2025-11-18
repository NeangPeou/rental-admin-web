import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, TextField, Button, Avatar, Alert,
  FormControl, InputLabel, Select, MenuItem, Stack, CircularProgress
} from '@mui/material'
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
        id: user.id,
        ...form
      })
      updateUser(res.data)
      setSuccess(t('profile_updated'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Box
      sx={{
        height: "100%",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: 4
        }}
      >
        {/* Avatar */}
        <Box textAlign="center" mb={2}>
          <Avatar sx={{ width: 80, height: 80, mx: 'auto', fontSize: 32 }}>
            {user.userName[0]}
          </Avatar>
          <Button
            startIcon={<PhotoCamera />}
            size="small"
            sx={{ mt: 1, textTransform: 'none' }}
          >
            {t('change_photo')}
          </Button>
        </Box>

        {/* Alerts */}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label={t('username')}
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              size="small"
            />
            <TextField
              fullWidth
              label={t('phone')}
              value={form.phoneNumber}
              onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
              size="small"
            />
            <TextField
              fullWidth
              label="Passport"
              value={form.passport}
              onChange={e => setForm({ ...form, passport: e.target.value })}
              size="small"
            />
            <TextField
              fullWidth
              label="ID Card"
              value={form.idCard}
              onChange={e => setForm({ ...form, idCard: e.target.value })}
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>{t('gender')}</InputLabel>
              <Select
                value={form.gender}
                label={t('gender')}
                onChange={e => setForm({ ...form, gender: e.target.value })}
              >
                <MenuItem value="Male">{t('male')}</MenuItem>
                <MenuItem value="Female">{t('female')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('address')}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              size="small"
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ width: '100%', py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : t('save_changes')}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}
