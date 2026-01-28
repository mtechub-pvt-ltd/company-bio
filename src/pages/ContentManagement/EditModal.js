import React, { useState, useEffect } from "react";
import {
  Box,
  Modal,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import url from "../../url";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 550,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  borderRadius: "14px",
  boxShadow: 24,
  display: "flex",
  flexDirection: "column",
  px: 1.5,
};

function EditSectionItemModal({ open, handleClose, sectionId, items, item, onUpdated }) {
  const [values, setValues] = useState({ title: "", description: "", list: [] });
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (item) {
      let parsedList = [];
      try {
        parsedList = item.list
          ? Array.isArray(item.list)
            ? item.list
            : JSON.parse(item.list)
          : [];
      } catch (err) {
        parsedList = [];
      }

      setValues({
        title: item.title || "",
        description: item.description || "",
        list: parsedList,
      });
    }
  }, [item]);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index, field, value) => {
    setValues((prev) => {
      const updated = [...prev.list];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, list: updated };
    });
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const updatedItems = items.map((i) =>
        i.id === item.id
          ? {
              title: values.title,
              description: values.description,
              list: values.list,
            }
          : {
              title: i.title,
              description: i.description,
              list: Array.isArray(i.list) ? i.list : JSON.parse(i.list || "[]"),
            }
      );

      const res = await fetch(`${url}/content/sections/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updatedItems }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.message);

      toast.success(t("editItemModal.messages.success"));
      handleClose();
      onUpdated && onUpdated();
    } catch (err) {
      console.error(err);
      toast.error(err.message || t("editItemModal.messages.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        {/* Header */}
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
          <Typography variant="h6">{t("editItemModal.title")}</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box
          sx={{
            p: 2,
            overflowY: "auto",
            flexGrow: 1,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {/* Title */}
          <label className="label">{t("editItemModal.fields.title")}</label>
          <TextField
            fullWidth
            size="small"
            value={values.title}
            onChange={(e) => handleChange("title", e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
                border: "2px solid #091E4224",
                "& fieldset": { border: "none" },
                "&.Mui-focused": { border: "2px solid #006EC2" },
              },
            }}
          />

          {/* Description */}
          <label className="label">{t("editItemModal.fields.description")}</label>
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            value={values.description}
            onChange={(e) => handleChange("description", e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
                border: "2px solid #091E4224",
                "& fieldset": { border: "none" },
                "&.Mui-focused": { border: "2px solid #006EC2" },
              },
            }}
          />

          {/* Feature List */}
          <Box sx={{ maxHeight: "200px", overflowY: "auto", paddingRight: "8px" }}>
            {values.list.map((f, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <label className="label">{t("editItemModal.fields.featureTitle")}</label>
                <TextField
                  fullWidth
                  size="small"
                  value={f.name}
                  onChange={(e) => handleFeatureChange(index, "name", e.target.value)}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      border: "2px solid #091E4224",
                      "& fieldset": { border: "none" },
                      "&.Mui-focused": { border: "2px solid #006EC2" },
                    },
                  }}
                />

                <label className="label">{t("editItemModal.fields.featureDescription")}</label>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  value={f.value}
                  onChange={(e) => handleFeatureChange(index, "value", e.target.value)}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      border: "2px solid #091E4224",
                      "& fieldset": { border: "none" },
                      "&.Mui-focused": { border: "2px solid #006EC2" },
                    },
                  }}
                />

                {item?.sectionName === "Home_Features_Website_Cards" && (
                  <>
                    <label className="label">{t("editItemModal.fields.navigationUrl")}</label>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="https://example.com/page"
                      value={f.url || ""}
                      onChange={(e) => handleFeatureChange(index, "url", e.target.value)}
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "6px",
                          border: "2px solid #091E4224",
                          "& fieldset": { border: "none" },
                          "&.Mui-focused": { border: "2px solid #006EC2" },
                        },
                      }}
                    />

                    {/* REPLACED ICON UPLOAD WITH SIMPLE FIELD */}
                    <label className="label">{t("editItemModal.fields.featureIcon")}</label>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter icon name or icon URL"
                      value={f.icon_image_url || ""}
                      onChange={(e) =>
                        handleFeatureChange(index, "icon_image_url", e.target.value)
                      }
                      sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "6px",
                          border: "2px solid #091E4224",
                          "& fieldset": { border: "none" },
                          "&.Mui-focused": { border: "2px solid #006EC2" },
                        },
                      }}
                    />
                  </>
                )}
              </Box>
            ))}
          </Box>

          {/* Buttons */}
          <Box display="flex" justifyContent="flex-end" mt={3} gap={1}>
            <Button
              onClick={handleClose}
              disabled={saving}
              sx={{ textTransform: "none", borderRadius: "6px", px: 3.5, height: "40px" }}
            >
              {t("editItemModal.actions.cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdate}
              disabled={saving}
              sx={{ textTransform: "none", borderRadius: "6px", px: 3.5, height: "40px" }}
              startIcon={saving ? <CircularProgress size={16} thickness={5} /> : null}
            >
              {saving
                ? t("editItemModal.actions.updating")
                : t("editItemModal.actions.update")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default EditSectionItemModal;















