import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Avatar,
  Switch,
  Chip,
  Stack,
  alpha
} from '@mui/material'
import {
  Person,
  Lock,
  Notifications,
  Palette,
  Language,
  DarkMode,
  Devices,
  AccessTime,
  Public,
  Logout,
  ChevronRight
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { darkMode, toggleDarkMode } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [currentTime, setCurrentTime] = useState('')
  const [deviceInfo, setDeviceInfo] = useState('Detecting...')

  // Live Clock (Phnom Penh Time)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Phnom_Penh',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      })
      setCurrentTime(now)
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  // Device Detection
  useEffect(() => {
    const ua = navigator.userAgent
    let os = 'Unknown OS'
    let browser = 'Unknown Browser'

    if (/Windows/i.test(ua)) os = 'Windows'
    else if (/Mac/i.test(ua)) os = 'macOS'
    else if (/Linux/i.test(ua)) os = 'Linux'
    else if (/Android/i.test(ua)) os = 'Android'
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'

    if (/Chrome/i.test(ua)) browser = 'Chrome'
    else if (/Firefox/i.test(ua)) browser = 'Firefox'
    else if (/Safari/i.test(ua)) browser = 'Safari'
    else if (/Edg/i.test(ua)) browser = 'Edge'

    setDeviceInfo(`${os} • ${browser}`)
  }, [])

  const handleLanguageChange = (e) => {
    const lang = e.target.value
    i18n.changeLanguage(lang)
    localStorage.setItem('i18nextLng', lang)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2, sm: 4 } }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        
        {/* Header */}
        <Typography
          variant="h4"
          fontWeight={800}
          gutterBottom
          sx={{
            background: darkMode
              ? 'linear-gradient(90deg, #667eea, #764ba2)'
              : 'linear-gradient(90deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4
          }}
        >
          {t('settings')}
        </Typography>

        {/* Main Settings Card */}
        <Paper
          elevation={darkMode ? 8 : 3}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: darkMode
              ? 'rgba(20, 20, 40, 0.8)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >

          {/* Account Section */}
          <List disablePadding>
            <ListItem sx={{ bgcolor: alpha('#667eea', 0.1), py: 2 }}>
              <ListItemText
                primary={<Typography fontWeight={700} color="primary">Account</Typography>}
                secondary="Manage your profile and security"
              />
            </ListItem>

            <ListItemButton onClick={() => navigate('/profile')} sx={{ py: 2.5 }}>
              <ListItemIcon><Person sx={{ color: '#667eea' }} /></ListItemIcon>
              <ListItemText primary={t('profile')} secondary="Edit personal information" />
              <ChevronRight color="action" />
            </ListItemButton>

            <ListItemButton sx={{ py: 2.5 }}>
              <ListItemIcon><Lock sx={{ color: '#f093fb' }} /></ListItemIcon>
              <ListItemText primary="Change Password" secondary="Update your login credentials" />
              <ChevronRight color="action" />
            </ListItemButton>

            <Divider />
          </List>

          {/* Appearance Section */}
          <List disablePadding>
            <ListItem sx={{ bgcolor: alpha('#764ba2', 0.1), py: 2 }}>
              <ListItemText
                primary={<Typography fontWeight={700} color="secondary">Appearance</Typography>}
                secondary="Customize how the app looks"
              />
            </ListItem>

            <ListItem sx={{ py: 2.5 }}>
              <ListItemIcon><DarkMode sx={{ color: '#ffd93d' }} /></ListItemIcon>
              <ListItemText
                primary={t('dark_mode')}
                secondary={darkMode ? "Currently in dark mode" : "Currently in light mode"}
              />
              <ListItemSecondaryAction>
                <Switch checked={darkMode} onChange={toggleDarkMode} color="primary" />
              </ListItemSecondaryAction>
            </ListItem>

            <ListItem sx={{ py: 2.5 }}>
              <ListItemIcon><Language sx={{ color: '#4facfe' }} /></ListItemIcon>
              <ListItemText
                primary={t('language')}
                secondary="Language"
              />
              <ListItemSecondaryAction>
                <select
                  value={i18n.language}
                  onChange={handleLanguageChange}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: 'divider',
                    background: darkMode ? '#1a1a2e' : '#f5f5f5',
                    color: 'inherit',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="en">english</option>
                  <option value="km">khmer</option>
                  <option value="fr">french</option>
                </select>
              </ListItemSecondaryAction>
            </ListItem>

            <Divider />
          </List>

          {/* Session Info */}
          <List disablePadding>
            <ListItem sx={{ bgcolor: alpha('#43a047', 0.1), py: 2 }}>
              <ListItemText
                primary={<Typography fontWeight={700} color="success.main">Session Information</Typography>}
                secondary="Your current login details"
              />
            </ListItem>

            <ListItem sx={{ py: 2 }}>
              <ListItemIcon><Public sx={{ color: '#43a047' }} /></ListItemIcon>
              <ListItemText primary="Location" secondary="Phnom Penh, Cambodia" />
            </ListItem>

            <ListItem sx={{ py: 2 }}>
              <ListItemIcon><AccessTime sx={{ color: '#ff9800' }} /></ListItemIcon>
              <ListItemText primary="Current Time" secondary={currentTime} />
            </ListItem>

            <ListItem sx={{ py: 2 }}>
              <ListItemIcon><Devices sx={{ color: '#2196f3' }} /></ListItemIcon>
              <ListItemText primary="Device" secondary={deviceInfo} />
            </ListItem>

            <Divider />
          </List>

          {/* Logout */}
          <List disablePadding>
            <ListItemButton
              onClick={logout}
              sx={{
                py: 3,
                bgcolor: alpha('#f44336', 0.1),
                '&:hover': { bgcolor: alpha('#f44336', 0.2) }
              }}
            >
              <ListItemIcon>
                <Logout sx={{ color: '#f44336' }} />
              </ListItemIcon>
              <ListItemText
                primary={<Typography fontWeight={700} color="#f44336">{t('logout')}</Typography>}
                secondary="Sign out from this device"
              />
            </ListItemButton>
          </List>
        </Paper>

        {/* User Profile Card at Bottom */}
        <Paper
          elevation={darkMode ? 10 : 4}
          sx={{
            mt: 6,
            p: 4,
            borderRadius: 4,
            textAlign: 'center',
            background: darkMode
              ? 'linear-gradient(135deg, #16213e, #1a1a2e)'
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white'
          }}
        >
          <Avatar
            sx={{
              width: 90,
              height: 90,
              mx: 'auto',
              mb: 2,
              fontSize: 40,
              fontWeight: 'bold',
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {user?.userName?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <Typography variant="h5" fontWeight={700}>
            {user?.userName || 'Admin User'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
            {user?.phoneNumber || 'admin@rental.com'}
          </Typography>
          <Chip
            label="Administrator"
            size="small"
            sx={{
              mt: 2,
              bgcolor: 'rgba(255,255,255,0.3)',
              color: 'white',
              fontWeight: 600
            }}
          />
        </Paper>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 4 }}>
          © 2025 Rental Admin Panel • All rights reserved
        </Typography>
      </Box>
    </Box>
  )
}