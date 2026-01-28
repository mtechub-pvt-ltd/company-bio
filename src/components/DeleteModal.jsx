import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  TextField,
} from "@mui/material";
import deletemodel from "../Assets/deletemodel.svg";
import  { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getApiMessage, showToast } from "../helper_functions/messageHandler";
import { toast } from "react-hot-toast";

const DeleteAccountExecutiveModal = ({
  open,
  onClose,
  onConfirm,
  loading,
  name,
  message,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState(false);
  const {t}=useTranslation()
useEffect(() => {
  if (open) {
    setReason("");
    setError(false);
  }
}, [open]);
  const handleSubmit = () => {
    console.log("DeleteModal handleSubmit called, reason:", reason);
    if (!reason.trim()) {
      console.log("Reason is empty, setting error");
      setError(true);
      return;
    }
    setError(false);
    console.log("Calling onConfirm with reason:", reason);
    onConfirm(reason); // send reason to API
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, p: 1.5 } }}
    >
      {/* ICON */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <img src={deletemodel} style={{ width: "60px", height: "60px" }} alt="" />
      </Box>


      <DialogContent>
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontSize: "14px",
            textAlign: "center",
            mb: 2,
          }}
        >
  {message || t("deleteExecutiveModal.message")}
        </Typography>

        {/* LABEL + ASTERISK */}
        <Typography
          sx={{
            fontFamily: "Poppins",
            fontSize: "14px",
            fontWeight: 500,
            mb: 1,
          }}
        >
          {t("deleteExecutiveModal.reasonLabel")}  <span style={{ color: "red" }}>*</span>
        </Typography>

        {/* TEXTAREA */}
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
   placeholder={t("deleteExecutiveModal.reasonPlaceholder")}
          error={error}
helperText={error ? t("deleteExecutiveModal.reasonRequired") : ""}
          sx={{
            "& .MuiInputBase-root": {
              fontFamily: "Poppins",
            },
          }}
        />
      </DialogContent>

      {/* ACTION BUTTONS */}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none", fontFamily: "Poppins" }}
        >
         {t("deleteExecutiveModal.cancel")}
        </Button>

        <Button
          variant="contained"
          color="error"
          disabled={loading}
          onClick={handleSubmit}
          sx={{
            textTransform: "none",
            fontFamily: "Poppins",
            backgroundColor: "#F44336",
            "&:hover": { backgroundColor: "#D32F2F" },
          }}
        >
          {loading ? (
            <CircularProgress size={18} sx={{ color: "white" }} />
          ) : (
          t("deleteExecutiveModal.delete")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountExecutiveModal;
