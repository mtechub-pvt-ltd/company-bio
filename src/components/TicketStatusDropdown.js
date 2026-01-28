import React, { useState } from "react";
import { Box, Menu, MenuItem, Typography } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";

// Icons
import active from "../Assets/Dashboard/active.svg";
import inactive from "../Assets/Dashboard/inactive.svg";
import trial from "../Assets/Dashboard/trial.svg";
import invited from "../Assets/Dashboard/invited.svg";
import request from "../Assets/Dashboard/request.svg";
import process from "../Assets/Dashboard/process.svg";
import overdue from "../Assets/Dashboard/overdue.svg";
import close from "../Assets/Dashboard/close.svg";
import open1 from "../Assets/Dashboard/open1.svg";
import reopen from "../Assets/Dashboard/reopen.svg";
import received from "../Assets/received.svg";
import pending from "../Assets/pending.svg";
import badge from "../Assets/Dashboard/badge.svg";

const TicketStatusDropdown = ({
  currentStatus = "open",
  onChange = () => {},
  statusOptions = [],
  loading = false,
}) => {
  const { t } = useTranslation();

  // --- Mappings (keep your existing keys; case-sensitive) ---
  const statusIcons = {
    resolved: active,
    resolved: active,
    active: active,
    new: invited,
    escalated: inactive,
    requested: request,
    returned: active,
    low: badge,
    medium: badge,
    high: badge,
    critical: badge,
    closed: close,
    open: open1,
    reopened: reopen,
    Processing: process,
    Overdue: overdue,
    Paid: received,
    Received: received,
    pending: pending,
    trial: trial,
    Invited: invited,
    Requested: request,
    Verified: active,
    in_progress: overdue,
  };

  const statusStyles = {
    resolved: { backgroundColor: "#4BCE97", color: "#164B35" },
    high: { backgroundColor: "#FEA362", color: "#702E00" },
    in_progress: { backgroundColor: "#FEA362", color: "#702E00" },
    reopened: { backgroundColor: "#57D5FF", color: "#095C6C" },
    closed: { backgroundColor: "#C1F2A0", color: "#215922" },
    low: { backgroundColor: "#BCBFC2", color: "#44546F" },
    new: { backgroundColor: "#579DFF", color: "#09326C" },
    medium: { backgroundColor: "#579DFF", color: "#09326C" },
    escalated: { backgroundColor: "#F87168", color: "#5D1F1A" },
    critical: { backgroundColor: "#F87168", color: "#5D1F1A" },
    open: { backgroundColor: "#F5CD47", color: "#533F04" },
    Processing: { backgroundColor: "#EAE6FF", color: "#403294" },
    Overdue: { backgroundColor: "#FFD5CC", color: "#5D1F1A" },
    Paid: { backgroundColor: "#C1F2A0", color: "#215922" },
    Received: { backgroundColor: "#D3F1FF", color: "#095C6C" },
    Invited: { backgroundColor: "#E6F0FF", color: "#09326C" },
    Requested: { backgroundColor: "#F0F5FF", color: "#09326C" },
    Verified: { backgroundColor: "#C1F2A0", color: "#215922" },
    trial: { backgroundColor: "#F0F0F0", color: "#44546F" },
    pending: { backgroundColor: "#FFF0B3", color: "#533F04" },
    active: { backgroundColor: "#E3FCEF", color: "#164B35" },
    requested: { backgroundColor: "#F0F5FF", color: "#09326C" },
    returned: { backgroundColor: "#E3FCEF", color: "#164B35" },
    Pending: { backgroundColor: "#F5CD47", color: "#533F04" },
    pending: { backgroundColor: "#F5CD47", color: "#533F04" },
  };

  // Optional label overrides (translated key mapping)
  const displayStatusLabels = {
    initiated: "Processing",
    success: "Paid",
    failed: "Failed",
  };

  const resolvedLabel =
    displayStatusLabels[currentStatus] || currentStatus || "open";

  // --- Menu state ---
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = (status) => {
    setAnchorEl(null);
    if (status) onChange(status);
  };

  // --- Fallbacks to avoid crashes on unknown statuses ---
  const style = statusStyles[currentStatus] || {
    backgroundColor: "#EEE",
    color: "#333",
  };
  const iconSrc = statusIcons[currentStatus] || badge;

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.25,
          px: 1,
          py: 0.5,
          borderRadius: "4px",
          fontWeight: 400,
          fontFamily: "Poppins, sans-serif",
          fontSize: "13px",
          cursor: "pointer", // 👈 always clickable
          width: 'fit-content',
          minWidth: '120px',
          ...style,
        }}
      >
        {loading ? (
          <CircularProgress
            size={14}
            thickness={5}
            sx={{ color: style.color, marginRight: 0 }} // 🔹 same as text color
          />
        ) : (
          <img
            src={iconSrc}
            alt={currentStatus}
            style={{ width: 16, height: 16, marginRight: 0 }}
          />
        )}
        <Typography 
          sx={{ 
            fontSize: "13px", 
            color: style.color || "#333333",
            marginLeft: 0,
            marginRight: 0,
            paddingLeft: 0,
            paddingRight: 0
          }}
        >
          {t(`statuses.${resolvedLabel}`)}
        </Typography>

        {/* 👇 Always show dropdown icon */}
        <ArrowDropDownIcon
          sx={{ fontSize: 18, color: style.color || "#333" }}
        />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={() => handleClose(null)}
        elevation={2}
      >
        {statusOptions.map((status) => {
          const itemIcon = statusIcons[status] || badge;
          return (
            <MenuItem key={status} onClick={() => handleClose(status)}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <img
                  src={itemIcon}
                  alt={status}
                  style={{ width: 16, height: 16 }}
                />
                <Typography
                  sx={{ fontFamily: "Poppins, sans-serif", fontSize: "13px" }}
                >
                  {t(`statuses.${status}`)}
                </Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default TicketStatusDropdown;
