// src/components/common/Snackbar.jsx
import { useState } from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

let openSnackbarFn; // Will hold the function to trigger snackbar from anywhere

export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success'); // success, error, warning, info

  const openSnackbar = ({ message, severity = 'success' }) => {
    setMessage(message);
    setSeverity(severity);
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  // Expose the function globally so any file can call it
  openSnackbarFn = openSnackbar;

  return (
    <>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 500 }}
          action={
            <IconButton size="small" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Hook to use in any component
export const useSnackbar = () => {
  return {
    success: (msg) => openSnackbarFn?.({ message: msg, severity: 'success' }),
    error: (msg) => openSnackbarFn?.({ message: msg || 'Something went wrong', severity: 'error' }),
    info: (msg) => openSnackbarFn?.({ message: msg, severity: 'info' }),
    warning: (msg) => openSnackbarFn?.({ message: msg, severity: 'warning' }),
  };
};