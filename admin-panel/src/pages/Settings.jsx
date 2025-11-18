// src/pages/Settings.jsx
import { useState, useEffect } from 'react'
import {
  Box, List, ListItem, ListItemText, ListItemIcon, ListItemButton,
  Divider, Typography, Switch, Avatar, Paper
} from '@mui/material'
import {
  Person, Lock, Notifications, Palette, Language,
  HelpOutline, Feedback, Logout, Devices, Public, AccessTime
} from '@mui/icons-material'
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { darkMode, toggleDarkMode } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [language, setLanguage] = useState(i18n.language || 'en')
  const [currentTime, setCurrentTime] = useState('')
  const [deviceInfo, setDeviceInfo] = useState('Detecting...')

  // Real-time clock (updates every second)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const timeStr = now.toLocaleString('en-US', {
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
      setCurrentTime(timeStr)
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  // Detect real device & browser
  useEffect(() => {
    const ua = navigator.userAgent
    let os = 'Unknown'
    let browser = 'Unknown'
    let version = ''

    if (/Windows NT/.test(ua)) os = 'Windows'
    else if (/Mac OS X/.test(ua)) os = 'macOS'
    else if (/Linux/.test(ua)) os = 'Linux'
    else if (/Android/.test(ua)) os = 'Android'
    else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'

    if (/Chrome\/[\d.]+/.test(ua) && !/Edg/.test(ua)) { browser = 'Chrome'; version = ua.match(/Chrome\/([\d.]+)/)?.[1] || '' }
    else if (/Firefox\/[\d.]+/.test(ua)) { browser = 'Firefox'; version = ua.match(/Firefox\/([\d.]+)/)?.[1] || '' }
    else if (/Edg\/[\d.]+/.test(ua)) { browser = 'Edge'; version = ua.match(/Edg\/([\d.]+)/)?.[1] || '' }
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) { browser = 'Safari'; version = ua.match(/Version\/([\d.]+)/)?.[1] || '' }

    setDeviceInfo(`${os} • ${browser} ${version.split('.')[0]}`)
  }, [])

  const handleLanguageChange = (e) => {
    const lang = e.target.value
    setLanguage(lang)
    i18n.changeLanguage(lang)
    localStorage.setItem('i18nextLng', lang)
  }

  const sections = [
    { title: "Account Settings", items: [
      { icon: <Person />, text: t('my_account') || "My Account", onClick: () => navigate('/profile') },
      { icon: <Lock />, text: t('privacy_safety') || "Privacy & Safety" },
      { icon: <Notifications />, text: t('notifications') || "Notifications" },
    ]},
    { title: "App Settings", items: [
      { icon: <Palette />, text: t('appearance') || "Appearance" },
      { icon: <DarkModeIcon />, text: t('dark_mode') || "Dark Mode", action: <Switch checked={darkMode} onChange={toggleDarkMode} /> },
      { icon: <Language />, text: t('language') || "Language", action: (
        <select value={language} onChange={handleLanguageChange}
          style={{ border:'none', background:'transparent', fontSize:'14px', outline:'none' }}>
          <option value="en">English</option>
          <option value="km">ភាសាខ្មែរ</option>
        </select>
      )},
    ]},
    { title: "Support", items: [
      { icon: <HelpOutline />, text: t('help') || "Help" },
      { icon: <Feedback />, text: t('feedback') || "Feedback" },
    ]},
    { title: "", items: [
      { icon: <Logout color="error" />, text: t('log_out') || "Log Out", onClick: logout },
    ]},
    { title: "Session Info", items: [
      { icon: <Public />, text: "Location", subtitle: "Cambodia" },
      { icon: <AccessTime />, text: "Current Time", subtitle: currentTime },
      { icon: <Devices />, text: t('device_info') || "Device Info", subtitle: deviceInfo },
    ]}
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h5" fontWeight={700} sx={{ px: 2, mb: 3 }}>
        {t('settings') || 'Settings'}
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mx: 'auto', maxWidth: 600 }}>
        <List disablePadding>
          {sections.map((section, idx) => (
            <Box key={idx}>
              {section.title && (
                <Typography variant="overline" sx={{
                  px: 3, py: 1.5, bgcolor: 'grey.100', color: 'text.secondary',
                  fontWeight: 600, fontSize: '11px', display: 'block'
                }}>
                  {section.title}
                </Typography>
              )}

              {section.items.map((item, i) => (
                <ListItem key={i} disablePadding>
                  <ListItemButton onClick={item.onClick || (() => {})} sx={{ py: 2, px: 3 }}>
                    <ListItemIcon sx={{ minWidth: 44, color: item.color || 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      secondary={item.subtitle || null}
                      primaryTypographyProps={{ fontWeight: 500, sx: { wordBreak: 'break-word' } }}
                      sx={{ my: 0, pr: 2 }}
                    />
                    {item.action && typeof item.action !== 'function' && item.action}
                    {!item.action && !item.subtitle && (
                      <ListItemIcon sx={{ minWidth: 32, justifyContent: 'flex-end' }}>
                        <Typography color="text.secondary">›</Typography>
                      </ListItemIcon>
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
              {idx < sections.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Paper>

      {/* User Card */}
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Avatar sx={{ width: 80, height: 80, mx: 'auto', fontSize: 32 }}>
          {user?.userName?.[0]?.toUpperCase() || 'A'}
        </Avatar>
        <Typography variant="h6" sx={{ mt: 1 }}>{user?.userName || 'Admin'}</Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.phoneNumber || 'admin@rental.com'}
        </Typography>
      </Box>
    </Box>
  )
}