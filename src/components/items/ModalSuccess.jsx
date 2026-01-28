import { Box, Grid, Modal, Stack } from "@mui/material";
import React from "react"
import TypographyMD from "./Typography";
import { CheckCircle, Close } from "@mui/icons-material";

function ModalSuccess({ data, open, onClose, title, subheading }) {

    const styleaddsuccess = {
        bgcolor: 'white',
        outline: "none",
        boxShadow: 0,
        p: 1,
        position: 'absolute',
        top: '8%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: 2
    };

    return (
        <>
            <Modal
                open={open}
                // onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box width={{ xs: 400, md: 450, lg: 450, xl: 450 }} height="auto" sx={styleaddsuccess}>
                    <Grid container spacing={0}>
                        <Grid xs={1} align="left">
                            <CheckCircle sx={{ mt: 1.5, width: "25px", height: "25px", color: "#C4B1AB" }} />
                        </Grid>

                        <Grid xs={10} align="left">
                            <Stack direction="column">
                                <TypographyMD variant='paragraph' label={title} color="#C4B1AB" fontFamily="Laila" marginLeft={0} fontSize="20px" fontWeight={550} align="left" />
                                <TypographyMD variant='paragraph' label={subheading} color="#424242" fontFamily="Laila" marginLeft={0} marginTop={-1.5} fontSize="15px" fontWeight={500} align="left" />
                            </Stack>
                        </Grid>

                        <Grid xs={1} align="right">
                            <Close onClick={onClose} />
                        </Grid>

                    </Grid>

                </Box>
            </Modal>
        </>
    )
}

export default ModalSuccess;