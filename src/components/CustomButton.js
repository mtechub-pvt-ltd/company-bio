import React from "react";
import { Button as MuiButton, styled } from "@mui/material";
import PropTypes from "prop-types";

// Custom styled Button component based on MUI Button
const StyledButton = styled(MuiButton)(
  ({ theme, buttonVariant, size, fullWidth }) => {
    // Define custom colors
    const colors = {
      primary: {
        main: "var(--primary, #006EC2)",
        hover: "#0058a0",
        contrastText: "#FFFFFF",
      },
      tertiary: {
        main: "var(--Tertiary, #003149)",
        hover: "#00263a",
        contrastText: "#FFFFFF",
      },
    };

    const sizes = {
      small: {
        padding: "6px 10px 6px 10px",
        fontSize: "0.875rem",
      },
      medium: {
        padding: "px 18px px 18px",
        fontSize: "1rem",
      },
      large: {
        padding: "8px 50px 8px 50px",
        fontSize: "1.125rem",
      },
      normal:{
        padding: "0px 15px 0px 15px",
        fontSize: "0.875rem",
      }
    };

    const colorStyles = colors[buttonVariant] || colors.primary;
    const sizeStyles = sizes[size] || sizes.medium;

    return {
      backgroundColor: colorStyles.main,
      color: colorStyles.contrastText,
      borderRadius: "4.34px",
      textTransform: "none",
      fontWeight: 400,
      boxShadow: "none",
   fontFamily: 'Poppins, sans-serif',
       
      padding: sizeStyles.padding,
      fontSize: sizeStyles.fontSize,
      minHeight:
        size === "small" ? "30px" : size === "large" ? "52px" :size==="medium"?"42px":"42px",
      width: fullWidth ? "100%" : "auto",
      "&:hover": {
        backgroundColor: colorStyles.hover,
        boxShadow: "none",
      },
      "&.MuiButton-outlined": {
        backgroundColor: "transparent",
        color: colors.primary.main,
        border: `1px solid ${colors.primary.main}`,
        "&:hover": {
          backgroundColor: "rgba(0, 110, 194, 0.05)",
          borderColor: colors.primary.main,
        },
      },
      "&.Mui-disabled": {
        backgroundColor: "#CCCCCC",
        color: "#666666",
      },
      "& .MuiButton-startIcon": {
        marginRight: "8px",
      },
      transition: "background-color 0.2s, opacity 0.2s",
    };
  }
);

/**
 * CustomButton component - A reusable button component for the BiometricPro website
 */
const CustomButton = ({
  variant = "primary",
  size = "medium",
  label,
  onClick,
  disabled = false,
  startIcon,
  endIcon,
  className = "",
  fullWidth = false,
  outlined = false,
  ...props
}) => {

  const getMuiVariant = () => {
    if (outlined) return "outlined";
    return "contained";
  };

  // Map our custom sizes to MUI sizes
  const getMuiSize = () => {
    if (size === "large") return "large";
    if (size === "small") return "small";
    if (size === "normal") return "normal";
    return "medium";
  };

  return (
    <StyledButton
      variant={getMuiVariant()}
      size={getMuiSize()}
      disabled={disabled}
      onClick={onClick}
      startIcon={startIcon}
      endIcon={endIcon}
      className={className}
      fullWidth={fullWidth}
      buttonVariant={variant} 
      sx={props.sx} // ✅ Add this line to support external styling!
  {...props}

      // {...props}
    >
      {label}
    </StyledButton>
  );
};

CustomButton.propTypes = {
  /** Button style variant */
  variant: PropTypes.oneOf(["primary", "tertiary"]),
  /** Button size */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Button text */
  label: PropTypes.string.isRequired,
  /** Click handler function */
  onClick: PropTypes.func,
  /** Whether the button is disabled */
  disabled: PropTypes.bool,
  /** Icon to display at the start of the button */
  startIcon: PropTypes.node,
  /** Icon to display at the end of the button */
  endIcon: PropTypes.node,
  /** Additional CSS class */
  className: PropTypes.string,
  /** Whether the button should take full width */
  fullWidth: PropTypes.bool,
  /** Whether the button should have outlined style */
  outlined: PropTypes.bool,
};

export default CustomButton;