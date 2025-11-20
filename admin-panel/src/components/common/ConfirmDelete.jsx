// src/components/common/ConfirmDelete.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useSnackbar } from './Snackbar';
import { useState } from 'react';
import { t } from 'i18next';

let resolvePromise;
let rejectPromise;

export const ConfirmDelete = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const theme = useTheme();
  const snackbar = useSnackbar();

  const handleConfirm = () => {
    setOpen(false);
    resolvePromise(true);
  };

  const handleCancel = () => {
    setOpen(false);
    resolvePromise(false);
  };

  // Public function to trigger dialog
  const showConfirm = ({ title = 'Confirm Delete', message }) => {
    setTitle(title);
    setMessage(message);
    setOpen(true);

    return new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });
  };

  // Expose globally
  window.confirmDelete = showConfirm; // Optional: direct access
  ConfirmDelete.show = showConfirm;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DeleteForeverIcon color="error" />
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} sx={{ textTransform: 'none' }}>
          <Typography>{t("cancel")}</Typography>
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          startIcon={<DeleteForeverIcon />}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          <Typography>{t("delete")}</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};