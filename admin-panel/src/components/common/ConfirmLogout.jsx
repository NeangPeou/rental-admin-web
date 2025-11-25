// src/components/dialogs/ConfirmLogout.jsx
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Typography,
  Box,
  Divider,
  useTheme,
} from "@mui/material";
import { Logout as LogoutIcon, Warning as WarningIcon } from "@mui/icons-material";
import useResponsiveGlobal from "../../hooks/useResponsiveGlobal";
import { useTranslation } from "react-i18next";
import LoadingButton from "../loading/LoadingButton";

export default function ConfirmLogout({
  open,
  onClose,
  onConfirm,
  loading = false,
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const responsive = useResponsiveGlobal();
  const darkMode = theme.palette.mode === "dark";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: darkMode
            ? "0 8px 32px rgba(0,0,0,0.6)"
            : "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${theme.palette.warning.main}`,
            }}
          >
            <WarningIcon color="warning" sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {t("confirm_logout")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("logout_confirmation_message")}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          {t("sure_want_to_logout")}
        </Typography>
      </DialogContent>

      <Divider />

      {/* Actions */}
      <DialogActions sx={{ p: 2, gap: 2 }}>
        <LoadingButton
          onClick={onClose}
          variant="outlined"
          fullWidth={responsive.isMobile}
          disabled={loading}
        >
          {t("cancel")}
        </LoadingButton>

        <LoadingButton
          onClick={onConfirm}
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          loading={loading}
          fullWidth={responsive.isMobile}
          sx={{
            background: "linear-gradient(45deg, #e53935, #c62828)",
            "&:hover": {
              background: "linear-gradient(45deg, #c62828, #b71c1c)",
            },
          }}
        >
          {loading ? t("logging_out") : t("logout")}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}