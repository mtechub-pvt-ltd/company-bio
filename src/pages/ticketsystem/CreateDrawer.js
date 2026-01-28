
















import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, Modal, OutlinedInput, Button, CircularProgress } from "@mui/material";
import { Cancel } from "@mui/icons-material";
import TypographyMD from "../../components/items/Typography";
import MultiSelectDropdown from "../../components/MultiSelectionDropdown";
import SingleSelectionDropdown from "../../components/SingleSelectionDropdown";
import CustomButton from "../../components/CustomButton";
import { toast } from "react-hot-toast";
import url from "../../url";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

export default function CreateTicketModal({ open, onClose, onSave }) {
  const { token } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const [form, setForm] = useState({
    subject: "",
    category: "",
    priority: "",
    description: "",
    file: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingPrio, setLoadingPrio] = useState(false);
  const [saving, setSaving] = useState(false);

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCats(true);
        const res = await fetch(`${url}/tickets/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!json.error) {
          setCategories(json.data.categories || []);
        }
      } finally {
        setLoadingCats(false);
      }
    };
    if (open) fetchCategories();
  }, [open, token]);

  // Fetch priorities
useEffect(() => {
  const fetchPriorities = async () => {
    try {
      setLoadingPrio(true);
      const res = await fetch(`${url}/tickets/priorities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (!json.error) {
        // Map to objects with { label, value } for dropdown
        const prios = (json.data.priorities || []).map((p) => ({
          label: p.label, // text shown in dropdown
          value: p.value, // value sent to API
        }));
        setPriorities(prios);
      }
    } catch {
      toast.error("Failed to load priorities");
    } finally {
      setLoadingPrio(false);
    }
  };

  if (open) fetchPriorities();
}, [open, token]);


  // File logic
  const attachFile = (file) => {
    if (!file) return;
    setField("file", file);
    if (file.type?.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };
  const handleFilePick = (e) => attachFile(e.target.files?.[0]);
  const clearFile = () => {
    setField("file", null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);



  const handleSave = async () => {
  if (!form.subject || !form.category || !form.priority) {
    toast.error("Please fill all required fields");
    return;
  }

  try {
    setSaving(true);
    const fd = new FormData();
    fd.append("subject", form.subject);
    fd.append("description", form.description);
    fd.append("category", form.category); // send "hardware", not label
    fd.append("priority", form.priority); // send "high"

    if (form.file) fd.append("attachments", form.file);

    const res = await fetch(`${url}/tickets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // do NOT set Content-Type manually
      },
      body: fd,
    });

    const text = await res.text();
    console.log("Server response:", text);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = JSON.parse(text);

    if (!json.error) {
      toast.success("Ticket created successfully!");
      onSave?.(json.data.ticket);
      onClose();
      setForm({ subject: "", category: "", priority: "", description: "", file: null });
      setPreviewUrl(null);
    } else {
      toast.error(json.message || "Failed to create ticket");
    }
  } catch (err) {
    toast.error("Failed to create ticket");
    console.error(err);
  } finally {
    setSaving(false);
  }
};


  const modalStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100vh",
    bgcolor: "#E7EBEE",
    outline: "none",
    boxShadow: 0,
    display: "flex",
    flexDirection: "column",
    width: { xs: "100vw", sm: 400, md: 450, lg: 450, xl: 450 },
    maxWidth: { xs: "100vw", sm: "90vw" },
    p: { xs: 0.5, sm: 1 },
  };

  const fieldSx = {
    height: "38px",
    borderRadius: "6px",
    border: "2px solid rgba(9, 30, 66, 0.14)",
    backgroundColor: "#fff",
    fontSize: 14,
    "&:hover": { borderColor: "#006EC2" },
    "&.Mui-focused": { borderColor: "#006EC2" },
    color: "rgba(27, 27, 27, 0.67)",
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Header */}
        <Grid container spacing={0} pb={0}>
          <Grid xs={1} align="left">
            <Cancel onClick={onClose} sx={{ cursor: "pointer", color: "#F22727" }} />
          </Grid>
          <Grid xs={11} align="left">
            <TypographyMD
              variant="paragraph"
              label={t("createTicket.title")}
              color="#2C384C"
              fontSize="17px"
              fontWeight={650}
              align="left"
            />
          </Grid>
        </Grid>


         <Box
                  sx={{
                    mt: 1,
                    p: { xs: 1, sm: 2 },
                    bgcolor: "white",
                    flex: 1,
                    overflowY: "auto",
                    borderRadius: { xs: 0, sm: 1 },
                    mx: { xs: 0.5, sm: 0 },
                  }}
                >


        {/* Body */}
        <Box sx={{ mt: 2, overflowY: "auto", flex: 1 }}>
          {/* Subject */}
          <Box sx={{ mt: 1 }}>
            <label>{t("createTicket.subject")}<span className="red_asterisk">*</span></label>
            <OutlinedInput
              value={form.subject}
              onChange={(e) => setField("subject", e.target.value)}
              placeholder={t("Enter subject...")}
              sx={{ width: "100%", ...fieldSx, outline: "none",
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none", 
    }, }}
            />
          </Box>

          {/* Category & Priority */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: { xs: 1, sm: 2 }, mt: 1 }}>
            {/* <SingleSelectionDropdown
              label={<>{t("createTicket.category")}<span className="red_asterisk">*</span></>}
              name="category"
              values={form.category}
              onChange={(e) => setField("category", Array.isArray(e.target.value) ? e.target.value[0] : e.target.value)}
              options={categories.map((c) => c.label)}
              disabled={loadingCats}
            /> */}
            <SingleSelectionDropdown
  label="Category"
  values={form.category}
  onChange={(e) => {
    const selectedLabel = Array.isArray(e.target.value) ? e.target.value[0] : e.target.value;
    const catObj = categories.find(c => c.label === selectedLabel);
    setField("category", catObj?.value || ""); // send "hardware"
  }}
  options={categories.map(c => c.label)}
/>

            {/* <SingleSelectionDropdown
              label={<>{t("createTicket.priority")}<span className="red_asterisk">*</span></>}
              name="priority"
              values={form.priority}
              onChange={(e) => setField("priority", e.target.value)}
              options={priorities}
              placeholder={loadingPrio ? "Loading..." : "Select"}
              disabled={loadingPrio}
            /> */}
           <SingleSelectionDropdown
  label="Priority"
  values={form.priority}
  onChange={(e) => {
    const selectedLabel = Array.isArray(e.target.value) ? e.target.value[0] : e.target.value;
    const prioObj = priorities.find(p => p.label === selectedLabel);
    setField("priority", prioObj?.value || "");
  }}
  options={priorities.map(p => p.label)} // show labels
  disabled={loadingPrio}
/>


          </Box>

          {/* Description */}
          <Box sx={{ mt: 1 }}>
            <label>{t("createTicket.description")}</label>
           <OutlinedInput
  value={form.description}
  onChange={(e) => setField("description", e.target.value)}
  placeholder={t("Enter description...")}
  multiline
  minRows={4}
  sx={{
    width: "100%",
    borderRadius: 2,
    ...fieldSx,
    height: "100px !important",
    outline: "none",
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none", 
    },
  }}
/>

          </Box>

          {/* File Upload */}
          <Box sx={{ mt: 2 }}>
            <label style={{ fontSize: { xs: "13px", sm: "15px" } }}>{t("createTicket.proof")}</label>
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: "2px dashed #C1C7D0",
                borderRadius: 1,
                height: { xs: 80, sm: 120 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                bgcolor: "#FAFBFC",
                color: "#5E6C84",
                fontSize: { xs: "12px", sm: "14px" },
                textAlign: "center",
                px: 1,
              }}
            >
              {form.file ? `Attached: ${form.file.name}` : t("createTicket.uploadPlaceholder")}
            </Box>
            <input type="file" hidden ref={fileInputRef} onChange={handleFilePick} accept="image/*" />
            {previewUrl && (
              <Box sx={{ 
                mt: 1.5, 
                p: { xs: 0.5, sm: 1 }, 
                border: "1px solid #E4E6EF", 
                borderRadius: 1, 
                display: "flex", 
                alignItems: "center", 
                gap: { xs: 0.5, sm: 1 },
                flexDirection: { xs: "column", sm: "row" }
              }}>
                <img 
                  src={previewUrl} 
                  alt="preview" 
                  style={{ 
                    width: { xs: 60, sm: 96 }, 
                    height: { xs: 60, sm: 96 }, 
                    objectFit: "cover", 
                    borderRadius: 6 
                  }} 
                />
                <Box sx={{ flex: 1, minWidth: 0, textAlign: { xs: "center", sm: "left" } }}>
                  <Box sx={{ 
                    fontSize: { xs: 11, sm: 13 }, 
                    color: "#172B4D", 
                    whiteSpace: "nowrap", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis" 
                  }}>
                    {form.file?.name}
                  </Box>
                  <Box sx={{ fontSize: { xs: 10, sm: 12 }, color: "#6B778C", mt: 0.25 }}>
                    {(form.file?.size / 1024).toFixed(1)} KB
                  </Box>
                </Box>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={clearFile} 
                  sx={{ 
                    textTransform: "none",
                    fontSize: { xs: "10px", sm: "12px" },
                    minWidth: { xs: "auto", sm: "auto" },
                    px: { xs: 1, sm: 2 }
                  }}
                >
                  {t("createTicket.remove")}
                </Button>
              </Box>
            )}
          </Box>

          {/* Save Button */}
          <Box sx={{ mt: 3 }}>
            <CustomButton
              label={
                saving ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} thickness={5} sx={{ color: "#fff" }} />
                    {t("save")}
                  </Box>
                ) : (
                  t("save")
                )
              }
              onClick={handleSave}
              disabled={saving}
            />
          </Box>
        </Box>
                </Box>

      </Box>
    </Modal>
  );
}









