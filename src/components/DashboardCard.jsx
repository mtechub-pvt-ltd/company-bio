import React from "react";
import { Box, Typography } from "@mui/material";

const DashboardCard = ({ icon, heading, value, borderColor = "#E5E7EB" }) => {
  return (
    <Box
      // p={2}
      py={2}
      px={0.8}
      borderRadius={4}
      display="flex"
      alignItems="center"
      bgcolor="#fff"
      border={`2px solid ${borderColor}`}
      boxShadow="none"
      gap={1.3}
      width="100%"         // make card full width of container
      overflow="hidden"    // prevent overflow
    >
      <Box>{icon}</Box>
    

      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap={0.5}
        flex={1}             // allow this box to take remaining space
        minWidth={0}         // crucial for text ellipsis
      >
        <Typography
          variant="subtitle1"
          fontSize="11px"
          fontWeight={500}
          noWrap
          sx={{
            whiteSpace: "wrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "rgb(94, 92, 92)",
          }}
        >
          {heading}
        </Typography>

        <Typography
          variant="body1"
          fontSize="20px"
          fontWeight={500}
          sx={{ fontFamily: "'Poppins', sans-serif", color: "#181818" }}
         
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardCard;
