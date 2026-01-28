// src/screens/content/AddSectionModal.jsx
import React, { useState } from "react";
import { Box, Modal, Typography, Button, IconButton, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import toast,{Toaster} from "react-hot-toast";
import url from "../../url";
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 450,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  borderRadius: "12px",
  boxShadow: 24,
  display: "flex",
  flexDirection: "column",
};

function AddSectionModal({ open, handleClose, onSave }) {
      const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    header: "",
    description: "",
    order: 1,
    status: "published",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      // onSave MUST return a Promise
      await onSave(formData);
      handleClose(); // close after successful save
      // optional: clear form if you want
      setFormData({ name: "", header: "", description: "", order: 1, status: "published" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        {/* Sticky Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            position: "sticky",
            top: 0,
            bgcolor: "background.paper",
            zIndex: 1,
            borderRadius: "10px",
          }}
        >
          <Typography variant="h6">     {t("contentManagementPage.modal.addTitle")}</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
        <Box
          sx={{
            p: 2,
            overflowY: "auto",
            flexGrow: 1,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {/* Name */}
          <label className="label">{t("contentManagementPage.modal.fields.name")}</label>
          <input
            type="text"
            className="project_input"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            style={{ width: "100%", height: "40px", marginBottom: "16px" }}
          />

          {/* Header */}
          <label className="label">{t("contentManagementPage.modal.fields.header")}</label>
          <input
            type="text"
            className="project_input"
            value={formData.header}
            onChange={(e) => handleChange("header", e.target.value)}
            style={{ width: "100%", height: "40px", marginBottom: "16px" }}
          />

          {/* Description */}
          <label className="label">{t("contentManagementPage.modal.fields.description")}</label>
          <textarea
            className="project_input"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            style={{ width: "100%", height: "80px", marginBottom: "16px" }}
          />

          {/* Buttons */}
          <Box display="flex" justifyContent="flex-end" mt={3} gap={1}>
            <Button
              onClick={handleClose}
              disabled={saving}
              sx={{ textTransform: "none", borderRadius: "6px", px: 3.5, height: "40px" }}
            >
               {t("contentManagementPage.modal.actions.cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
              sx={{ textTransform: "none", borderRadius: "6px", px: 3.5, height: "40px" }}
              startIcon={
                saving ? <CircularProgress size={16} thickness={5} /> : null
              }
            >
 {saving ? t("contentManagementPage.modal.actions.saving") : t("contentManagementPage.modal.actions.save")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default AddSectionModal;



