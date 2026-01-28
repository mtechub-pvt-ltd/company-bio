import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import warn from '../Assets/warn.png'
export default function LocationHelperModal({ open, onClose, onRefresh }) {
  // ✅ Detect if mobile (basic check with userAgent)
  const isMobile = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", right: 12, top: 12, color: "grey.500" }}
      >
        <CloseIcon />
      </IconButton>

      {/* Icon + Title */}
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 600,
          fontSize: "1.25rem",
        }}
      >
       <img src={warn} alt=""  width={70} style={{marginBottom:2}}/>
        <br />
        Turn on location to continue
      </DialogTitle>

      <Divider />

      {/* Instructions */}
      <DialogContent sx={{ textAlign: "center" }}>
        {!isMobile ? (
          <>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <b>Chrome/Edge:</b> Click the padlock in the address bar → Site
              settings → Location → Allow, then reload.
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <b>Firefox:</b> Click the shield/info icon → Permissions →
              Location → Allow, then reload.
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <b>Safari (macOS):</b> Safari Settings → Websites → Location →
              Allow, then reload.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <b>iOS Safari/Chrome:</b> Settings → Safari/Chrome → Location →
              While Using the App; or Settings → Privacy & Security → Location
              Services.
            </Typography>
            <Typography variant="body1">
              <b>Android Chrome:</b> Tap padlock → Permissions → Location →
              Allow → Refresh.
            </Typography>
          </>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          justifyContent: "center",
          pb: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={onRefresh}
          sx={{ px: {xs:2,md:4}, borderRadius: 2 }}
        >
          I’ve enabled it
        </Button>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ px:{xs:2,md:4}, borderRadius: 2 }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
