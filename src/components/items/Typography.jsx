import React from "react";
import { Typography } from "@mui/material";

function TypographyMD({
  align,
  color,
  label,
  variant,
  fontWeight,
  fontSize,
  // fontFamily,
  cursor,
  textDecoration,
  marginLeft,
  marginBottom,
  marginTop,
  flex,
  sx = {},
  children
}) {
  const defaultStyles = {
    letterSpacing: "0.00938em",
    // textAlign: "center",
    margin: 0,
    padding: 0,
    // fontFamily: "Poppins, sans-serif",
    fontSize: "20px",
    // fontWeight: 400,
    lineHeight: "170%",
    color: "rgb(23, 43, 77)",
  };

  return (
    <Typography
      variant={variant}
      gutterBottom
      textAlign={align}
      sx={{
        ...defaultStyles, // ✅ global defaults here
        textDecoration,
        cursor,
        flex,
        fontWeight,
        marginLeft,
        marginBottom,
        letterSpacing: '0.5px', // <-- can remove if using default above
        color,
        fontSize,
        marginTop,
        ...sx, // ✅ allow overrides

      }}
    >
      {children || label}
    </Typography>
  );
}

export default TypographyMD;
