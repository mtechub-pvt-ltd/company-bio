import { Box, Grid, Modal } from "@mui/material";
import React from "react";
import TypographyMD from "./Typography";
import { Cancel, CancelOutlined, Close } from "@mui/icons-material";

function ModalAdd({ type, data, open, onClose, title }) {
  const style = {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100vh", // Full height modal
    bgcolor: "#E7EBEE",
    outline: "none",
    boxShadow: 0,
    display: "flex", // To support content layout
    flexDirection: "column",
    // Responsive positioning for xs screens
    left: { xs: 0, sm: "auto" },
    right: { xs: 0, sm: 0 },
  };

  // const modalWidth =
  //   type === "subscription_plan"
  //     ? { xs: "100vw", sm: 500, md: 550, lg: 500, xl: 500 } // full width on xs, fixed width on larger screens
  //     : { xs: "100vw", sm: 500, md: 550, lg: 500, xl: 500 }; // full width on xs, fixed width on larger screens
  const modalWidth = {  xs: "100vw", sm: 500, md: 550, lg: 500, xl: 500  } // full width on xs, fixed width on larger screens
     
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box width={modalWidth} sx={style}> 
        <Box
          sx={{
            backgroundColor: "transparent",
            borderTopLeftRadius: { xs: 0, sm: 10 },
            borderTopRightRadius: { xs: 0, sm: 10 },
          }}
        >
          <Grid container spacing={0} pb={0} p={{ xs: 1.5, sm: 2 }}>
            <Grid xs={1} md={0.7} align="left">
              <Cancel
                onClick={onClose}
                sx={{ 
                  cursor: "pointer", 
                  color: "#F22727",
                  fontSize: { xs: "20px", sm: "24px" }
                }}
              />
            </Grid>
            <Grid xs={11} md={11.3} align="left">
              <TypographyMD
                variant="paragraph"
                label={title}
                color="#2C384C"
                marginLeft={0}
                fontSize={{ xs: "16px", sm: "17px" }}
                fontFamily="Roboto"
                fontWeight={650}
                align="left"
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: -2 }}>{data}</Box>
      </Box>
    </Modal>
  );
}

export default ModalAdd;
