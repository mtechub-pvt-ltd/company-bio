// import { Box, Grid, Modal } from "@mui/material";
// import React from "react"
// import TypographyMD from "./Typography";
// import { Cancel, CancelOutlined, Close } from "@mui/icons-material";

// function ModalConfirmation({ type, data, open, onClose, title }) {
//     const style = {
//         position: 'absolute',
//         top: '50%',
//         left: '50%',
//         transform: 'translate(-50%, -50%)',
//         bgcolor: '#E7EBEE',
//         outline: "none",
//         boxShadow: 0,
//     };

//     const modalWidth = type === "subscription_plan"
//         ? { xs: 350, md: 700, lg: 700, xl: 700 }  // wider modal for subscription_plan
//         : { xs: 350, md: 550, lg: 550, xl: 550 }; // default width

//     return (
//         <Modal
//             open={open}
//             // onClose={handleClose}
//             aria-labelledby="modal-modal-title"
//             aria-describedby="modal-modal-description"
           
//         >
//             <Box width={modalWidth} height="auto" sx={style}>

//                 <Box sx={{ backgroundColor: "transparent", borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
//                     <Grid container spacing={0} pb={0} p={2}>
//                         <Grid xs={1} md={0.7} align="left">
//                             <Cancel onClick={onClose} sx={{ cursor: "pointer", color: "#F22727" }} />
//                         </Grid>
//                         <Grid xs={11} md={11.3} align="left">
//                             <TypographyMD variant='paragraph' label={title} color="#2C384C" marginLeft={0} fontSize="17px" fontFamily="Roboto" fontWeight={650} align="left" />
//                         </Grid>
//                     </Grid>
//                 </Box>

//                 <Box sx={{ mt: -2 }}>
//                     {data}
//                 </Box>

//             </Box>
//         </Modal>
//     )
// }

// export default ModalConfirmation;



import { Box, Grid, Modal, IconButton } from "@mui/material";
import React from "react";
import TypographyMD from "./Typography";
import { Cancel } from "@mui/icons-material";
import warn from "../../../src/Assets/warn.png"
function 
ModalConfirmation({ type, data, open, onClose, title }) {
  const modalWidth = type === "subscription_plan"
    ? { xs: "90vw", sm: 500, md: 700 } // wider modal for subscription_plan
    : { xs: "90vw", sm: 400, md: 550 }; // default width

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: modalWidth,
          maxWidth: { xs: "95vw", sm: "90vw", md: "80vw" },
          bgcolor: "#fff",
          borderRadius: 3,
          boxShadow: 24,
          outline: "none",
          p: { xs: 1.5, sm: 2, md: 3 }, // responsive padding
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #E0E0E0",
            pb: 1.5,
            mb: 2,
          }}
        >
          <TypographyMD
            variant="paragraph"
            label={title}
            color="#2C384C"
            fontSize="18px"
            fontWeight={650}
            fontFamily="Roboto"
          />
          <IconButton onClick={onClose} size="small" sx={{ color: "#F22727" }}>
            <Cancel />
          </IconButton>
        </Box>

        {/* Content */}
        <Box>
          {data}
        </Box>
      </Box>
    </Modal>
  );
}

export default ModalConfirmation;
