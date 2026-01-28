import React from "react";
import { Typography, styled } from "@mui/material";
import { useMediaQuery,} from "@mui/material";
import { useTheme } from "@mui/material/styles";
// Styled component for customized typography
const StyledTypography = styled(Typography)(({ theme, customStyle }) => ({
  fontFamily: customStyle?.fontFamily || "Nunito, sans-serif",
  fontWeight: customStyle?.fontWeight || 500,
  fontSize: customStyle?.fontSize || "28px",
  lineHeight: customStyle?.lineHeight || "170%",
  letterSpacing: customStyle?.letterSpacing || "0%",
  textAlign: customStyle?.textAlign || "center",
  color: customStyle?.color || theme.palette.text.primary,
  margin: customStyle?.margin || 0,
  padding: customStyle?.padding || 0,
}));

const CustomText = ({ variant = "body1", children, customStyle,sx = {}, ...props }) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  
    
  return (
    <StyledTypography variant={variant} customStyle={customStyle} {...props}       sx={sx} >
      {children}
    </StyledTypography>
  );
};
  export const textStyles = {
      // Heading styles
      h1: {
        // fontFamily: "Volkhov, serif",
   fontFamily: 'Poppins, sans-serif',
        // fontFamily: "Poppins, sans-serif",
  fontSize:"60px",
        fontWeight: 700,
        lineHeight: "110%",
        letterSpacing: "0%",

      },
      h2: {
   fontFamily: 'Poppins, sans-serif',
        fontSize: "46px",
        fontWeight: 600,
        lineHeight: "110%",
        letterSpacing: "0%",
      },
      h3: {
    fontSize: "40px",
          fontFamily: 'Poppins, sans-serif',
        fontWeight: 700,
        lineHeight: "110%",
        letterSpacing: "0%",
      },
      h4: {
          fontFamily: 'Poppins, sans-serif',
        fontSize: "30px",
        fontWeight: 500,
        lineHeight: "110%",
        letterSpacing: "0%",
      },
      h5: {
           fontFamily: 'Poppins, sans-serif',
        fontSize: "20px",
        fontWeight: 600,
        lineHeight: "34px",
        letterSpacing: "0%",
      },
      h6:{
            fontFamily: 'Poppins, sans-serif',
        fontSize:"16px",
        color:"#252430",
        lineHeight:"26px",

        fontWeight:500
      },
      // Body text styles
      body1: {
       fontFamily: 'Poppins, sans-serif',
        fontSize: "27px",
        fontWeight: 500,
        lineHeight: "150%",
        letterSpacing: "0%",
        color: "#363333", // Secondary text color
      },
      body2:{
           fontFamily: 'Poppins, sans-serif',
        fontSize: "22px",
        fontWeight: 500,
        lineHeight: "150%",
        letterSpacing: "0%",
        color: "#363333", 
      },
      body3:{
         fontFamily: 'Poppins, sans-serif',
        fontSize: "18px",
        fontWeight: 400,
        lineHeight: "140%",
        letterSpacing: "0%",
        color: "#363333", 
      },
      body4:{
        fontFamily: 'Poppins, sans-serif',
        fontSize: "16px",
        fontWeight: 400,
        lineHeight: "22px",
        letterSpacing: "0%",
        color: "#868282",  
        letterSpacing:"1px"
      },
          body5:{
        fontFamily: 'Poppins, sans-serif',
        fontSize: "15px",
        fontWeight: 400,
        lineHeight: "22px",
        letterSpacing: "0%",
        color: "#868282",  
        letterSpacing:"1px"
      },
         body6:{
       fontFamily: 'Nunito Sans, sans-serif',
     fontSize: "16px",
   fontWeight: 700, 
   color: '#212121'
      }
      
      // Additional styles can be added here
    }
// Predefined styles that can be used across the application

export default CustomText;