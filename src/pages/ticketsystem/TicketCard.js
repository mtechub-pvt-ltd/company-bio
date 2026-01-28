import React from "react";
import { Card, CardContent, Box, Typography } from "@mui/material";
import CustomText, { textStyles } from "../../components/CustomText";
const TicketCard = ({
  icon,
  title,
  description,
  iconSize = 40,
  cardSx = {},
  titleSx = {},
  descriptionSx = {},
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      elevation={0}
      sx={{
        display: "flex",
        cursor: "pointer",
        alignItems: "center",
        pl: 1,
        py: 1.5,
        ...cardSx,
        border: "2px solid #091E4224",
        borderRadius: 4,
      }}
    >
      <Box
        sx={{
          width: iconSize,
          height: iconSize,
          mr: 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src={icon}
          alt="icon"
          sx={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </Box>

      <Box>
        <CustomText
          sx={{
            ...textStyles.body5,
            color: "#5E5C5C",
            ...titleSx,
            fontFamily: "Nunito Sans, sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            pt: 0,
            textAlign: "left",
            letterSpacing: "0px !important",
          }}
        >
          {title}
        </CustomText>

        <CustomText
          sx={{
            ...textStyles.h2,
            color: "#181818",
            ...descriptionSx,
            fontSize: "20px",
            fontWeight: 500,
            pt: 0.5,
            textAlign: "left",
            letterSpacing: "0px !important",
          }}
        >
          {description}
        </CustomText>
      </Box>
    </Card>
  );
};

export default TicketCard;
