import React from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import {
  CheckCircleOutline,
  CancelOutlined,
  HourglassEmpty,
  KeyboardArrowDown,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
const DeletionRequestStatusDropdown = ({
  item,
  anchorEl,
  onOpen,
  onClose,
  onStatusSelect,
}) => {
  const status = item?.status; // backend: PENDING, APPROVED, REJECTED
  const isMenuOpen = Boolean(anchorEl);
const {t} =useTranslation()
  // ICONS
  const getStatusIcon = () => {
    switch (status) {
      case "APPROVED":
        return <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} />;
      case "REJECTED":
        return <CancelOutlined fontSize="17px" sx={{ mr: 1 }} />;
      case "PENDING":
      default:
        return <HourglassEmpty fontSize="17px" sx={{ mr: 1 }} />;
    }
  };

  // COLORS
  const getStatusColor = () => {
    switch (status) {
      case "APPROVED":
        return "#4BCE97"; // green
      case "REJECTED":
        return "#F87168"; // red
      case "PENDING":
      default:
        return "#F5CD47"; // yellow
    }
  };

  // Dropdown only when PENDING
  const dropdownOptions = [
    {
      value: "APPROVED",
    label: t("deletionRequestStatus.approveAction"),
      icon: <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} />,
    },
    {
      value: "REJECTED",
  label: t("deletionRequestStatus.rejectAction"),
      icon: <CancelOutlined fontSize="17px" sx={{ mr: 1 }} />,
    },
  ];

  return (
    <>
      {/* BUTTON */}
      <Button
        variant="contained"
        onClick={(e) => {
          if (status !== "PENDING") return; // no dropdown for approved/rejected
          e.stopPropagation();
          onOpen(e, item);
        }}
        sx={{
          backgroundColor: getStatusColor(),
          boxShadow: "none !important",
          width: "130px",
          padding: "1px",
          color: "#172B4D",
          borderRadius: "5px",
          fontFamily: "Roboto",
          letterSpacing: ".5px",
          textTransform: "capitalize",
          "&:hover": {
            backgroundColor: getStatusColor(),
          },
        }}
      >
        {getStatusIcon()}
     {t(`deletionRequestStatus.${status}`)}
        {status === "PENDING" && (
          <KeyboardArrowDown fontSize="17px" sx={{ ml: 1 }} />
        )}
      </Button>

      {/* DROPDOWN MENU (only for PENDING) */}
<Menu
  anchorEl={anchorEl}
  open={isMenuOpen}
  onClose={onClose}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
  transformOrigin={{ vertical: "top", horizontal: "center" }}
  PaperProps={{
    elevation: 0,
    sx: {
      boxShadow: "none",
      border: "1px solid #e0e0e0",
      minWidth: "130px",   // FIX: wide enough for full text
      width: "130px",
      borderRadius: "6px",
    },
  }}
>
        {dropdownOptions.map(({ value, label, icon }) => (
<MenuItem
  sx={{
    fontSize: "13px",
    whiteSpace: "nowrap",   // prevent multi-line text
    py: 0.8,
  
  }}
  key={value}
  onClick={(e) => {
    e.stopPropagation();
    onStatusSelect(value);
  }}
>
  {icon}
  {label}
</MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DeletionRequestStatusDropdown;
