import React from "react";
import { Button } from "@mui/material";

const StatusDisplayChip = ({
  status = "active",
  statusOptions = [],
}) => {
  // Find the correct status object
  const currentOption =
    statusOptions.find(
      (opt) => (opt?.value || "").toLowerCase() === (status || "").toLowerCase()
    ) || {
      label: status || "N/A",
      color: "#E0E0E0",
    };

  return (
    <Button
      disableRipple

      variant="contained"
      sx={{
        backgroundColor: currentOption.color,
        width: "120px",
        padding: "1px",
        color: "#172B4D",
        borderRadius: "5px",
        boxShadow: "none",
        fontFamily: "Roboto",
        letterSpacing: ".5px",
        textTransform: "capitalize",
        cursor: "default",
        "&:hover": {
          backgroundColor: currentOption.color,
          boxShadow: "none",
        },
      }}
    >
      {currentOption.icon}
      {currentOption.label}
    </Button>
  );
};

export default StatusDisplayChip;
