import { useState } from 'react'
import { TextField, Button, Container, Typography, Box, Paper, Alert } from '@mui/material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={10} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight={700} color="primary">
            Rental Admin
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
            {t('login')}
          </Typography>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              label={t('username')}
              fullWidth
              margin="normal"
              required
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
            <TextField
              label={t('password')}
              type="password"
              fullWidth
              margin="normal"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.5, fontWeight: 600 }}>
              {t('login')}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}