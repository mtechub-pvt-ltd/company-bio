import React from "react";
import {
  Box,
  Drawer,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {useTranslation} from "react-i18next";
const ContactDetailsDrawer = ({ open, onClose, data }) => {
  const {t}=useTranslation()
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 380,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "white",
          mt:9
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#E8EAED",
            padding: "14px 16px",
            borderBottom: "1px solid #D0D4D9",
          }}
        >
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>

          <Typography
            sx={{ fontSize: "18px", fontWeight: 600, color: "#333" }}
          >
           {t("drawer_request_details")}
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ padding: 3, flex: 1 }}>

          {[
            { label:t("drawer_id"), value: data?.id },
            { label: t("drawer_name"), value: data?.name },
            { label: t("drawer_email"), value: data?.email },
            { label: t("drawer_subject"), value: data?.subject },
            { label:t("drawer_message"), value: data?.message },
          ].map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                borderRadius: "6px",
       
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#555",
                  fontSize: "14px",
                }}
              >
                {item.label}
              </Typography>

              <Typography
                sx={{
                  fontWeight: 400,
                  color: "#111",
                  fontSize: "14px",
                  textAlign: "right",
                     // *** FIXES ***
    whiteSpace: "normal",    // allow wrapping
    wordBreak: "break-word", // break long words
    maxWidth: "200px",  
                }}
              >
                {item.value || "-"}
              </Typography>
            </Box>
          ))}

        </Box>
      </Box>
    </Drawer>
  );
};

export default ContactDetailsDrawer;
