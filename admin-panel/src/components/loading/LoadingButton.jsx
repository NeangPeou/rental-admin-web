import { Button, CircularProgress, alpha } from "@mui/material";
import { forwardRef } from "react";

const LoadingButton = forwardRef(({
  children,
  loading = false,
  disabled = false,
  variant = "contained",
  color = "primary",
  size = "medium",
  fullWidth = false,
  sx = {},
  ...props
}, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={loading || disabled}
      sx={{
        borderRadius: 3,
        textTransform: "none",
        fontWeight: 600,
        position: "relative",
        overflow: "hidden",
        ...sx,
      }}
      {...props}
    >
      {/* Text + Spinner Overlay */}
      <span style={{ opacity: loading ? 0 : 1, transition: "opacity 0.2s" }}>
        {children}
      </span>

      {loading && (
        <CircularProgress
          size={24}
          thickness={4.5}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            marginTop: "-12px",
            marginLeft: "-12px",
            color: variant === "contained" ? "inherit" : `${color}.main`,
          }}
        />
      )}

      {/* Optional: Subtle pulse background when loading */}
      {loading && variant === "contained" && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            background: "inherit",
            opacity: 0.3,
            animation: "pulse 1.5s infinite",
          }}
        />
      )}
    </Button>
  );
});

LoadingButton.displayName = "LoadingButton";

export default LoadingButton;