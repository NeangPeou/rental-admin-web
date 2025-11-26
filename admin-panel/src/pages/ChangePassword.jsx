// src/pages/ChangePassword.jsx
import { useTranslation } from "react-i18next";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  CheckCircleOutline,
  Logout,
} from "@mui/icons-material";
import ChangePasswordController from "../controllers/ChangePasswordController";

export default function ChangePassword() {
  const { t } = useTranslation(); // ← Add this

  const {
    form,
    show,
    errors,
    loading,
    success,
    handleChange,
    toggleShow,
    handleSubmit,
    goBack,
  } = ChangePasswordController();

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ maxWidth: 480, width: "100%" }}>
        <Paper
          elevation={12}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            backdropFilter: "blur(20px)",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          {/* Success Screen */}
          {success ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "background.default",
              }}
            >
              <CheckCircleOutline sx={{ fontSize: 80, mb: 3 }} />
              <Typography variant="h5" fontWeight={800} gutterBottom>
                {t("password_changed_successfully")}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 4 }}>
                {t("logged_out_for_security")}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                <Logout />
                <Typography variant="body2">
                  {t("redirecting_to_login")}
                </Typography>
              </Box>
            </Box>
          ) : ( 
            <>
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <IconButton onClick={goBack} sx={{ position: "absolute", left: 12, top: 12}}>
                  <ArrowBack />
                </IconButton>
                <Typography variant="h6" fontWeight={800}>
                  {t("change_password")}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  {t("secure_your_account_with_new_password")}
                </Typography>
              </Box>

              <Box sx={{ p: 4, pt: 0 }}>
                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label={t("current_password")}
                    name="currentPassword"
                    type={show.current ? "text" : "password"}
                    value={form.currentPassword}
                    onChange={handleChange}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword}
                    margin="dense"
                    sx={{
                      "& .MuiInputBase-root": { borderRadius: 3 }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => toggleShow("current")}>
                            {show.current ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label={t("new_password")}
                    name="newPassword"
                    type={show.new ? "text" : "password"}
                    value={form.newPassword}
                    onChange={handleChange}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword}
                    margin="normal"
                    sx={{
                      "& .MuiInputBase-root": { borderRadius: 3 }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => toggleShow("new")}>
                            {show.new ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    label={t("confirm_new_password")}
                    name="confirmPassword"
                    type={show.confirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    margin="normal"
                    sx={{
                      "& .MuiInputBase-root": { borderRadius: 3 }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => toggleShow("confirm")}>
                            {show.confirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    

                  />

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      mt: 2,
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      textTransform: "none",
                      background: "linear-gradient(135deg, #023F6B 0%, #023F6B 100%)",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={28} color="inherit" />
                    ) : (
                      t("update_password")
                    )}
                  </Button>
                </form>

                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                  {t("you_will_be_logged_out_after_change")}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}