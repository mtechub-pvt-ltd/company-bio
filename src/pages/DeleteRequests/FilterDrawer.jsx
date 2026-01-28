import React, { useEffect, useState } from "react";
import { Box, Drawer, IconButton, Button } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTranslation } from "react-i18next";
const statusOptions = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

const DeletionRequestFilterDrawer = ({ open, onClose, filters, onApply }) => {
  const [localFilters, setLocalFilters] = useState(filters);
const {t} =useTranslation()
  useEffect(() => {
    if (open) setLocalFilters(filters);
  }, [open, filters]);

  const applyFilters = () => {
    onApply(localFilters);
    onClose();
  };

  const clearFilters = () => {
    const cleared = { status: "" };
    onApply(cleared);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 350, mt:9,},
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2, py: 2, display: "flex", alignItems: "center",justifyContent:"space-between",backgroundColor: "#F5F6F8" , }}>
        <IconButton onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
        <Box sx={{ fontSize: 18, fontFamily: "Poppins", fontWeight: 600 }}>
     {t("deletionFilter.title")}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: 3 }}>
        
        {/* Status Filter */}
        <Box sx={{ mb: 3,mt:2, }}>
          <Box sx={{ fontSize: 16, fontFamily: "Poppins", mb: 1 }}>
       {t("deletionFilter.status")}
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {statusOptions.map((opt) => {
              const isSelected = localFilters.status === opt.key;
              return (
                <Button
                  key={opt.key}
                  variant="outlined"
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      status: isSelected ? "" : opt.key,
                    }))
                  }
                  sx={{
                    borderRadius: "6px",
                    textTransform: "none",
                    fontFamily: "Poppins",
                    px: 2,
                    py: 0.8,
                    border: isSelected
                      ? "2px solid #006EC2"
                      : "2px solid #D0D7DE",
                    color: isSelected ? "#006EC2" : "#333",
                  }}
                >
               {t(`deletionFilter.${opt.key.toLowerCase()}`)}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Apply + Clear */}
        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={applyFilters}
            sx={{
              backgroundColor: "#006EC2",
              fontFamily: "Poppins",
              textTransform: "none",
            }}
          >
          {t("deletionFilter.apply")}
          </Button>

          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{
              textTransform: "none",
              fontFamily: "Poppins",
              borderColor: "#006EC2",
              color: "#006EC2",
            }}
          >
     {t("deletionFilter.clear")}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default DeletionRequestFilterDrawer;
