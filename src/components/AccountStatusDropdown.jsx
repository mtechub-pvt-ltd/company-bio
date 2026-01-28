import React from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import {
  CheckCircleOutline,
  ToggleOff,
  Block,
  KeyboardArrowDown,
  Email,
} from "@mui/icons-material";
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined";
import { useTranslation } from "react-i18next";

const AccountStatusDropdown = ({
  item,
  anchorEl,
  onOpen,
  onClose,
  onStatusSelect,
}) => {
  const { t } = useTranslation();
  const isMenuOpen = Boolean(anchorEl);
  const status = item?.status;

  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} />;
      case "inactive":
        return <ToggleOff fontSize="17px" sx={{ mr: 1 }} />;
      case "blocked":
        return <Block fontSize="17px" sx={{ mr: 1 }} />;
      case "requested":
        return <CloudSyncOutlinedIcon fontSize="17px" sx={{ mr: 1 }} />;
      case "invited":
        return <Email fontSize="17px" sx={{ mr: 1 }} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "#4BCE97";
      case "inactive":
      case "blocked":
        return "#DFE1E6";
      case "requested":
        return "#7E57C2";
      case "invited":
        return "#579DFF";
      default:
        return "#ccc";
    }
  };

  // FIXED: Translated labels with backend-safe values
  const statusOptions = [
    {
      value: "active",
      label: t("accountStatuses.active"),
      icon: <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} />,
    },
    {
      value: "inactive",
      label: t("accountStatuses.inactive"),
      icon: <ToggleOff fontSize="17px" sx={{ mr: 1 }} />,
    },
    // {
    //   value: "blocked",
    //   label: t("accountStatuses.blocked"),
    //   icon: <Block fontSize="17px" sx={{ mr: 1 }} />,
    // },
    // {
    //   value: "requested",
    //   label: t("accountStatuses.requested"),
    //   icon: <CloudSyncOutlinedIcon fontSize="17px" sx={{ mr: 1 }} />,
    // },
    // {
    //   value: "invited",
    //   label: t("accountStatuses.invited"),
    //   icon: <Email fontSize="17px" sx={{ mr: 1 }} />,
    // },
  ];

  const filteredStatusOptions = statusOptions.filter(option => {
  if (status === "active") return option.value === "inactive";
  if (status === "inactive") return option.value === "active";
  return ["active", "inactive"].includes(option.value);
});
  return (
    <>
      {/* BUTTON */}
      <Button
        variant="contained"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(e, item);
        }}
        sx={{
          backgroundColor: getStatusColor(),
          boxShadow: "none !important",
          width: "125px",
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
        {t(`accountStatuses.${status}`)}
        <KeyboardArrowDown fontSize="17px" sx={{ ml: 1 }} />
      </Button>

      {/* DROPDOWN MENU */}
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
            border: "1px solid #e0e0e0",
          },
        }}
      >
        {filteredStatusOptions.map(({ value, label, icon }) => (
          <MenuItem
            key={value}
            onClick={(e) => {
              e.stopPropagation();
              onStatusSelect(value); // backend-safe value
            }}
          >
            {icon}
            {label} {/* translated label */}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default AccountStatusDropdown;
