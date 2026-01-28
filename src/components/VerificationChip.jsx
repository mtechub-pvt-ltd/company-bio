import React from "react";
import { Button } from "@mui/material";
import {
  CheckCircleOutline,
  Pending,
  Email,
  DisabledByDefault,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const VerificationStatusDisplayChip = ({ status = "pending" }) => {
  const { t } = useTranslation();

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
        return "#F87168";
      default:
        return "#ccc";
    }
  };

  return (
    <Button
      disableRipple
 
      variant="contained"
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
        cursor: "default",
        "&:hover": {
          backgroundColor: getStatusColor(),
          boxShadow: "none",
        },
      }}
    >
      {getStatusIcon()}
      {t(`statuses.${status}`)}
    </Button>
  );
};

export default VerificationStatusDisplayChip;
