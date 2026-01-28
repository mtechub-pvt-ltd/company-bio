import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Box
} from "@mui/material";
import { toast } from "react-hot-toast";
import warn from "../../Assets/warn.png"
import { useTranslation } from "react-i18next";
import { getApiMessage, showToast } from "../../helper_functions/messageHandler"; 

const DeletionRequestActionModal = ({
  open,
  onClose,
  action, // "APPROVE" or "REJECT"
  item,
  onSubmit,
  loading,
}) => {
  const [comment, setComment] = useState("");
const {t} =useTranslation()
  const actionLabel = action === "APPROVE" ? t("deletionRequestModaapprove")
  : t("deletionRequestModareject");
  const actionColor = action === "APPROVE" ? "#4BCE97" : "#F87168";

  const handleSubmit = async () => {
    try {
      const result = await onSubmit(comment);

      // Success Toast
  showToast(
      toast.success,
      result,
      t("deletionRequestModasuccessApprove") // fallback translation
    );
      // Auto-close after 1 sec
      setTimeout(() => {
        setComment("");
        onClose();
      }, 1000);

    } catch (error) {
      // Error Toast
        showToast(
      toast.error,
      error,
      t("deletionRequestModaerror")
    );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, p: 1.5 },
      }}
    >
     <Box sx={{display:"flex",justifyContent:"center",mt:2,}}>
<img src={warn} style={{width:"60px",height:"60px"}}/>
</Box>
      <DialogContent>
        <Typography
          sx={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "16px",
            mb: 2,
          }}
        >
  {t("deletionRequestModamessage", {
    action: actionLabel.toLowerCase()
  })}        </Typography>

        <TextField
          fullWidth
          multiline
          minRows={3}
  placeholder={t("deletionRequestModaplaceholder")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "6px",
              fontFamily: "Poppins, sans-serif",
              padding: "6px",
            },
            "& textarea": {
              fontFamily: "Poppins, sans-serif",
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={() => {
            setComment("");
            onClose();
          }}
          sx={{
            fontFamily: "Poppins",
            textTransform: "none",
          }}
        >
     {t("deletionRequestModacancel")}
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            backgroundColor: actionColor,
            textTransform: "none",
            fontFamily: "Poppins, sans-serif",
            "&:hover": {
              backgroundColor: actionColor,
            },
          }}
        >
          {loading ? (
            <CircularProgress size={18} sx={{ color: "white" }} />
          ) : (
            actionLabel
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeletionRequestActionModal;
