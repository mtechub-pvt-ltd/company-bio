import { Box, Card, CardContent, Grid } from "@mui/material";
import React from "react";

function CardMD({ content }) {
    return (
        <>

            <Grid container spacing={0}>
                <Grid xs={12} align="center">

                    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                        <Card sx={{ 
                            boxShadow: "none", 
                            background: "#FFFFFF", 
                            borderRadius: "15px", 
                            width: { xs: "95%", sm: "85%", md: "40%", lg: "35%" },
                            // minHeight: { xs: "auto", sm: "500px" },
                            minHeight:"auto",
                            maxWidth: { xs: "400px", sm: "450px", md: "500px" }
                        }} >
                            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>

                                <Grid container spacing={0}>
                                    <Grid xs={12} align="left">
                                        {content}
                                    </Grid>
                                </Grid>

                            </CardContent>
                        </Card>
                    </Box>

                </Grid>
            </Grid>

        </>
    )
}

export default CardMD;