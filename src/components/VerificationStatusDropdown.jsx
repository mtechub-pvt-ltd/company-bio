
import React from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import {
  CheckCircleOutline,
  Pending,
  KeyboardArrowDown,
  Email,
  DisabledByDefault,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const VerificationStatusDropdown = ({
  item,
  anchorEl,
  onOpen,
  onClose,
  onStatusSelect,
}) => {
  const isMenuOpen = Boolean(anchorEl);
  const status = item?.verification_status;
  const { t } = useTranslation();
const isPending = status === "pending";
  const getStatusIcon = () => {
    switch (status) {
      case "verified":
        return <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} />;
      case "pending":
        return <Pending fontSize="17px" sx={{ mr: 1 }} />;
      case "rejected":
        return <DisabledByDefault fontSize="17px" sx={{ mr: 1 }} />;
      default:
        return <Email fontSize="17px" sx={{ mr: 1 }} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "verified":
        return "#2196F3";
      case "pending":
        return "#FF9800";
      case "rejected":
        return "#D32F2F";
      default:
        return "#ccc";
    }
  };

  // Status options (value stays same, label is translated)
  const statusOptions = [
    {
      value: "verified",
      label: t("statuses.verified"),
      icon: <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} />,
    },
  
    {
      value: "rejected",
      label: t("statuses.rejected"),
      icon: <DisabledByDefault fontSize="17px" sx={{ mr: 1 }} />,
    },
  ];

  return (
    <>
      {/* BUTTON */}
      <Button
  variant="contained"
  onClick={(e) => {
    if (!isPending) return;
    e.stopPropagation();
    onOpen(e, item);
  }}
  sx={{
    backgroundColor: getStatusColor(),
    width: "140px",
    padding: "1px",
    color: "#172B4D",
    borderRadius: "5px",
    boxShadow: "none",
    fontFamily: "Roboto",
    letterSpacing: ".5px",
    textTransform: "capitalize",
    cursor: isPending ? "pointer" : "default",
    "&:hover": {
      backgroundColor: getStatusColor(),
      boxShadow: "none",
    },
  }}
>
  {getStatusIcon()}
  {t(`statuses.${status}`)}

  {isPending && (
    <KeyboardArrowDown fontSize="17px" sx={{ ml: 1 }} />
  )}
</Button>
      {/* <Button
        variant="contained"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(e, item);
        }}
        sx={{
          backgroundColor: getStatusColor(),
          width: "140px",
          padding: "1px",
          color: "#172B4D",
          borderRadius: "5px",
          boxShadow: "none",
          fontFamily: "Roboto",
          letterSpacing: ".5px",
          textTransform: "capitalize",
          "&:hover": {
            backgroundColor: getStatusColor(),
            boxShadow: "none",
          },
        }}
      >
        {getStatusIcon()}
        
       
        {t(`statuses.${status}`)}

        <KeyboardArrowDown fontSize="17px" sx={{ ml: 1 }} />
      </Button> */}

      {/* DROPDOWN */}
    {isPending && (
  <Menu
    anchorEl={anchorEl}
    open={isMenuOpen}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    transformOrigin={{ vertical: "top", horizontal: "left" }}
    onClick={(e) => e.stopPropagation()}
    PaperProps={{
      elevation: 0,
      sx: {
        boxShadow: "none",
        border: "1px solid #eee",
      },
    }}
  >
    {statusOptions.map(({ value, label, icon }) => (
      <MenuItem
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
)}
    </>
  );
};

export default VerificationStatusDropdown;


