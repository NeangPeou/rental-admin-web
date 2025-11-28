// src/components/common/LoadingScreen.jsx
import { Box, CircularProgress, Typography } from '@mui/material'
import { useTheme as useAppTheme } from '../../context/ThemeContext.jsx'

export default function LoadingScreen() {
  const { darkMode } = useAppTheme()

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: darkMode 
          ? 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)' 
          : 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'all 0.5s ease',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 4,
          boxShadow: '0 0 40px rgba(102, 126, 234, 0.6)',
        }}
      >
        <Typography variant="h4" color="white" fontWeight={900}>
          A
        </Typography>
      </Box>
      <CircularProgress 
        size={60} 
        thickness={4} 
        sx={{ 
          color: '#667eea',
          mb: 3 
        }} 
      />
      <Typography 
        variant="h6" 
        sx={{ 
          color: darkMode ? '#ccc' : '#444',
          fontWeight: 500,
          letterSpacing: 1
        }}
      >
        Loading Admin Panel...
      </Typography>
    </Box>
  )
}