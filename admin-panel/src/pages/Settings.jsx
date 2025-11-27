// src/pages/Settings.jsx
import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Switch,
  Chip,
  alpha,
  Stack
} from '@mui/material'
import {
  Person,
  Lock,
  DarkMode,
  Language,
  Devices,
  AccessTime,
  Public,
  Logout,
  AccountCircle,
  Palette,
  Info
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import useResponsiveGlobal from '../hooks/useResponsiveGlobal' // ← Added

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { darkMode, toggleDarkMode } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const responsive = useResponsiveGlobal() // ← Global responsive

  const [tabValue, setTabValue] = useState(0)

  const [currentTime, setCurrentTime] = useState('')
  const [deviceInfo, setDeviceInfo] = useState('Detecting...')

  // Live Clock (Phnom Penh)
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
    <Box sx={{ bgcolor: 'background.default'}}>
      <Box sx={{ mx: 'auto'}}>

        {/* Gradient Title */}
        <Typography
          variant={responsive.isMobile ? 'h6' : 'h5'}
          fontWeight={600}
          gutterBottom
          sx={{
            background: 'linear-gradient(90deg, #667eea, #764ba2)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          {t('settings')}
        </Typography>

        {/* Tabs + Content Card */}
        <Paper
          elevation={darkMode ? 10 : 6}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: darkMode ? 'rgba(20, 20, 40, 0.85)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Responsive Tabs */}
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant={responsive.isMobile ? 'fullWidth' : 'standard'}
            centered={responsive.isMobile}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
              }
            }}
          >
            <Tab icon={<AccountCircle />} label={t('account')} />
            <Tab icon={<Palette />} label={t('appearance')} />
            <Tab icon={<Info />} label={t('session_info')} />
          </Tabs>

          {/* Tab Panels */}
          <Box>
            {/* === Account Tab === */}
            {tabValue === 0 && (
              <List disablePadding>
                <ListItemButton onClick={() => navigate('/profile')}>
                  <ListItemIcon><Person sx={{ color: '#667eea' }} /></ListItemIcon>
                  <ListItemText primary={t('profile')} secondary={t('edit_personal_info')} />
                </ListItemButton>
                <Divider />
                <ListItemButton onClick={() => navigate('/change-password')}>
                  <ListItemIcon><Lock sx={{ color: '#f093fb' }} /></ListItemIcon>
                  <ListItemText primary={t('change_password')} secondary={t('update_login_credentials')} />
                </ListItemButton>
              </List>
            )}

            {/* === Appearance Tab === */}
            {tabValue === 1 && (
              <List disablePadding>
                <ListItem>
                  <ListItemIcon><DarkMode sx={{ color: '#ffd93d' }} /></ListItemIcon>
                  <ListItemText
                    primary={t('dark_mode')}
                    secondary={darkMode ? t('currently_dark') : t('currently_light')}
                  />
                  <Switch checked={darkMode} onChange={toggleDarkMode} color="primary" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon><Language sx={{ color: '#4facfe' }} /></ListItemIcon>
                  <ListItemText primary={t('language')} secondary={t('select_preferred_language')} />
                  <select
                    value={i18n.language}
                    onChange={handleLanguageChange}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: darkMode ? '#444' : '#ddd',
                      background: darkMode ? '#333' : '#fff',
                      color: 'inherit'
                    }}
                  >
                    <option value="en">🇺🇸</option>
                    <option value="km">🇰🇭</option>
                    <option value="fr">🇫🇷</option>
                  </select>
                </ListItem>
              </List>
            )}

            {/* === Session Info Tab === */}
            {tabValue === 2 && (
              <List disablePadding>
                <ListItem>
                  <ListItemIcon><Public sx={{ color: '#43a047' }} /></ListItemIcon>
                  <ListItemText primary={t('location')} secondary="Phnom Penh, Cambodia" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon><AccessTime sx={{ color: '#ff9800' }} /></ListItemIcon>
                  <ListItemText primary={t('current_time')} secondary={currentTime} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon><Devices sx={{ color: '#2196f3' }} /></ListItemIcon>
                  <ListItemText primary={t('device')} secondary={deviceInfo} />
                </ListItem>
              </List>
            )}
          </Box>

          {/* Logout Button - Always Visible */}
          <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: alpha('#f44336', 0.08) }}>
            <ListItemButton onClick={logout} sx={{ borderRadius: 3, '&:hover': { bgcolor: alpha('#f44336', 0.16) } }}>
              <ListItemIcon><Logout sx={{ color: '#f44336' }} /></ListItemIcon>
              <ListItemText
                primary={<Typography fontWeight={700} color="#f44336">{t('logout')}</Typography>}
                secondary={t('sign_out_from_device')}
              />
            </ListItemButton>
          </Box>
        </Paper>

        {/* User Card - Bottom */}
        <Paper
          elevation={darkMode ? 12 : 8}
          sx={{
            mt: 2,
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            textAlign: 'center',
            background: darkMode
              ? 'linear-gradient(135deg, #16213e, #1a1a2e)'
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(102, 126, 234, 0.3)',
          }}
        >
          <Avatar
            sx={{
              width: responsive.isMobile ? 80 : 100,
              height: responsive.isMobile ? 80 : 100,
              mx: 'auto',
              mb: 2,
              fontSize: responsive.isMobile ? 36 : 48,
              fontWeight: 'bold',
              bgcolor: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {user?.userName?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <Typography variant={responsive.isMobile ? 'h6' : 'h5'} fontWeight={800}>
            {user?.userName || 'Admin User'}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            {user?.phoneNumber || 'admin@rental.com'}
          </Typography>
          <Chip
            label={t('administrator')}
            size="small"
            sx={{
              mt: 2,
              bgcolor: 'rgba(255,255,255,0.3)',
              color: 'white',
              fontWeight: 600,
              backdropFilter: 'blur(10px)'
            }}
          />
        </Paper>
      </Box>
    </Box>
  )
}