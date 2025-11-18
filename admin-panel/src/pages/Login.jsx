// Login.jsx
import { useState } from 'react'
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  Stack,
  InputAdornment,
  IconButton
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Paper
        elevation={12}
        sx={{
          display: 'flex',
          width: '100%',
          maxWidth: 800,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >
        {/* Left Banner */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'primary.main',
            color: '#fff',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: 400
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome Back!
          </Typography>
          <Typography variant="body1" textAlign="center">
            Manage your rental system efficiently and securely.
          </Typography>
        </Box>

        {/* Right Login Form */}
        <Box sx={{ flex: 1, p: 5 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Rental Admin
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {t('login')}
          </Typography>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Stack spacing={2}>
              <TextField
                label={t('username')}
                fullWidth
                required
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                size="medium"
              />
              <TextField
                label={t('password')}
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                size="medium"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  mt: 1,
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #5a67d8, #6b46c1)'
                  }
                }}
              >
                {t('login')}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
