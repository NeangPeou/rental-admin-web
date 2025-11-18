import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import PeopleIcon from '@mui/icons-material/People'
import CategoryIcon from '@mui/icons-material/Category'
import SettingsIcon from '@mui/icons-material/Settings'
import HistoryIcon from '@mui/icons-material/History'
import PersonIcon from '@mui/icons-material/Person'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Sidebar() {
  const { t } = useTranslation()
  const menu = [
    { text: t('dashboard'), icon: <HomeIcon />, to: '/' },
    { text: t('owners'), icon: <PeopleIcon />, to: '/owners' },
    { text: t('types'), icon: <CategoryIcon />, to: '/types' },
    { text: t('utilities'), icon: <SettingsIcon />, to: '/utilities' },
    { text: t('logs'), icon: <HistoryIcon />, to: '/logs' },
    { text: t('profile'), icon: <PersonIcon />, to: '/profile' },
    { text: t('settings') || 'Settings', icon: <SettingsIcon />, to: '/settings' },
  ]

  return (
    <List>
      {menu.map(item => (
        <ListItem key={item.text} component={Link} to={item.to}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      ))}
    </List>
  )
}