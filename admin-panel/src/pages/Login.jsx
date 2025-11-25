import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Stack,
  InputAdornment,
  IconButton,
  Zoom,
  Snackbar,
  Alert,
  Slide,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useResponsiveGlobal from "../hooks/useResponsiveGlobal";
import LoadingButton from "../components/loading/LoadingButton.jsx";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ username: false, password: false });
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "error",
  });
  const [shake, setShake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const responsive = useResponsiveGlobal();

  // Validation
  const usernameError =
    touched.username && !form.username.trim()
      ? t("username_required")
      : touched.username && form.username.trim().length < 2
      ? t("username_too_short")
      : "";

  const passwordError = touched.password && !form.password ? t("password_required") : touched.password && form.password.length < 3 ? t("password_too_short") : "";
  const isFormValid =form.username.trim().length >= 2 && form.password.length >= 3;

  const showToast = (message, type = "error") => {
    setToast({ open: true, message, type });
  };

  const handleCloseToast = () => setToast({ ...toast, open: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToast({ open: false, message: "" });

    setTouched({ username: true, password: true });

    if (!isFormValid) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setIsSubmitting(true);

    try {
      await login(form.username.trim(), form.password);
      navigate("/");
    } catch (err) {
      const rawDetail = err.response?.data?.detail || "";
      // Extract message safely from string, array, or object
      let message = "";
      if (typeof rawDetail === "string") {
        message = rawDetail;
      } else if (Array.isArray(rawDetail) && rawDetail[0]?.msg) {
        message = rawDetail[0].msg;
      } else if (rawDetail?.msg) {
        message = rawDetail.msg;
      }

      if (message.includes("Invalid username")) {
        showToast(t("invalid_username"));
      } else if (message.includes("Invalid password")) {
        showToast(t("invalid_password"));
      } else if (message.includes("Only admins can log in to this app")) {
        showToast(t("only_admins_allowed"), "warning");
      } else {
        showToast(t("login_failed_try_again"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Beautiful Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.type}
          variant="filled"
          icon={false}
          sx={{
            borderRadius: 3,
            fontSize: "1.02rem",
            fontWeight: 400,
            minWidth: 300,
            bgcolor: toast.type === "warning" ? "#ff9800" : "#d32f2f",
            color: "white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
          action={
            <IconButton
              size="small"
              onClick={handleCloseToast}
              sx={{ color: "white" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: { xs: 2, sm: 3 },
        }}
      >
        <Zoom in={true} timeout={700}>
          <Paper
            elevation={20}
            sx={{
              width: "100%",
              maxWidth: responsive.isMobile ? 420 : 940,
              borderRadius: 5,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              animation: shake ? "shake 0.6s ease-in-out" : "none",
              "@keyframes shake": {
                "0%, 100%": { transform: "translateX(0)" },
                "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-10px)" },
                "20%, 40%, 60%, 80%": { transform: "translateX(10px)" },
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                minHeight: 500,
              }}
            >
              {/* Left Banner */}
              <Box
                sx={{
                  flex: 1,
                  bgcolor: "primary.main",
                  color: "#fff",
                  display: { xs: "none", md: "flex" },
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  p: 8,
                  backgroundImage:
                    "linear-gradient(135deg, #023F6B 0%, #16213e 100%)",
                }}
              >
                <Typography variant="h5" fontWeight={900} gutterBottom>
                  {t("welcome_back")}
                </Typography>
                <Typography
                  textAlign="center"
                  sx={{ opacity: 0.95, maxWidth: 380, lineHeight: 1.8 }}
                >
                  {t("manage_your_rental_system_efficiently_and_securely")}
                </Typography>
              </Box>

              {/* Right Form */}
              <Box
                sx={{
                  flex: 1,
                  p: { xs: 5, sm: 8 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight={900}
                  textAlign="center"
                  gutterBottom
                  sx={{
                    background:
                      "linear-gradient(135deg, #066BB4FF 0%, #7E9EF8FF 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Rental Admin
                </Typography>

                <Typography
                  variant="h7"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mb: 4 }}
                >
                  {t("login_to_your_account")}
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      label={t("username")}
                      fullWidth
                      // required
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                      onBlur={() => setTouched({ ...touched, username: true })}
                      error={!!usernameError}
                      helperText={usernameError}
                      size="large"
                      sx={{ "& .MuiInputBase-root": { borderRadius: 3 } }}
                    />

                    <TextField
                      label={t("password")}
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      onBlur={() => setTouched({ ...touched, password: true })}
                      error={!!passwordError}
                      helperText={passwordError}
                      size="large"
                      sx={{ "& .MuiInputBase-root": { borderRadius: 3 } }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <LoadingButton
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      sx={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        py: 1.8,
                        borderRadius: 3,
                        textTransform: "none",
                        background: "linear-gradient(135deg, #023F6B 0%, #023F6B 100%)",
                        boxShadow: "0 8px 25px rgba(2, 63, 107, 0.4)",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 12px 30px rgba(2, 63, 107, 0.5)",
                        },
                      }}
                    >
                      {isSubmitting ? t("logging_in") : t("login")}
                    </LoadingButton>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Zoom>
      </Box>
    </>
  );
}
