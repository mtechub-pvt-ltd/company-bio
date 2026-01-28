import React, { useEffect, useState } from "react";
import SidebarNew from "../components/sidebar/SidebarNew";
import { Box, Card, CardContent, CircularProgress, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import general_setting from "../Assets/general_setting.png";
import account_settings from "../Assets/account_settings.png";
import privacy_and_sharing from "../Assets/privacy_and_sharing.png";
import notifications from "../Assets/notifications.png";
import login_and_security from "../Assets/login_and_security.png";
import system_settings from "../Assets/system_settings.png";
import finance_and_payout_settings from "../Assets/finance_and_payout_settings.png";
import { useTranslation } from "react-i18next";
import TypographyMD from "../components/items/Typography";

function SystemConfiguration() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const dummySystemConfiguration = [
        {
            icon: <img src={general_setting} alt="..." style={{ width: "45px" }} />,
            heading: t("General Settings"),
            value: t("Customize your experience with themes, language, and interface preferences."),
        },
        {
            icon: <img src={account_settings} alt="..." style={{ width: "45px" }} />,
            heading: t("Account Settings"),
            value: t("Update account details, manage linked services, and change your password."),
        },
        {
            icon: <img src={privacy_and_sharing} alt="..." style={{ width: "45px" }} />,
            heading: t("Privacy & sharing"),
            value: t("Adjust data visibility, sharing preferences, and privacy controls."),
        },
        {
            icon: <img src={notifications} alt="..." style={{ width: "45px" }} />,
            heading: t("Notifications"),
            value: t("Choose notification preferences and how you want to be contacted"),
        },
        {
            icon: <img src={login_and_security} alt="..." style={{ width: "45px" }} />,
            heading: t("logout"),
            value: t("logout_description"),
        },
        {
            icon: <img src={system_settings} alt="..." style={{ width: "45px" }} />,
            heading: t("System Settings"),
            value: t("Set global preferences for commissions, payouts, and taxes"),
        },
        {
            icon: <img src={finance_and_payout_settings} alt="..." style={{ width: "45px" }} />,
            heading: t("Finance & Payout Settings"),
            value: t("Choose notification preferences and how you want to be contacted"),
        }
    ];

    const [initialLoader, setInitialLoader] = useState(true);

    useEffect(() => {
        // Simulate a 2-second loading time
        const timer = setTimeout(() => {
            setInitialLoader(false);
        }, 3000);

        // Cleanup timeout on unmount
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <SidebarNew
                componentTitle="Admin"
                componentData={
                    <Box
                        sx={{
                            width: "100%",
                            overflowX: "hidden",
                            height: {
                                xs: "calc(100vh - 70px)",   // extra-small screens (mobile)
                                sm: "calc(100vh - 80px)",   // small screens (tablets)
                                md: "calc(100vh - 85px)",   // medium screens (laptops)
                                lg: "calc(100vh - 85px)",  // large screens (desktops)
                                xl: "calc(100vh - 110px)"   // extra-large screens (big monitors)
                            }
                        }}
                    >
                        {initialLoader ? (
                            <div style={{
                                height: "50vh",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>

                                <CircularProgress size={20} thickness={3} color="primary" />

                            </div>
                        ) : (
                            <Grid container spacing={0} sx={{ pl: 1, pr: 1 }} pt={0}>
                                <Grid xs={12} p={1}>
                                    <Card
                                        sx={{
                                            width: '100%',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '12px',
                                            boxShadow: 'none',
                                            p: 1,
                                        }}
                                    >
                                        <CardContent sx={{ p: 0, '&:last-child': { paddingBottom: 0 } }}>
                                            <Box
                                                display="flex"
                                                flexDirection="column"
                                                px={1.5}
                                            >
                                                <TypographyMD variant='paragraph' label={t("Settings")} color="#003149" fontFamily="Roboto" fontSize="20px" align="left" />

                                                <TypographyMD
                                                    variant="paragraph"
                                                    label={t('Explore and update your settings to make the platform work for you seamlessly.')}
                                                    color="#5E5C5C"
                                                    fontFamily="Roboto"
                                                    fontSize="13px"
                                                    marginTop="-8px"
                                                    fontWeight={450}
                                                    align="left"
                                                />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid container spacing={0}>
                                    {dummySystemConfiguration.map((item, index) => (
                                        <Grid xs={12} md={4} align="center" p={1}>
                                            <Box sx={{ p: 1, px: 2.5, display: "flex", flexDirection: "column", gap: 0.5, textAlign: "start", backgroundColor: "white", borderRadius: "10px" }}>
                                                <Box mb={1}>{item.icon}</Box>
                                                <TypographyMD variant='paragraph' label={item.heading} color="#181818" fontFamily="Roboto" fontSize="20px" align="left" />

                                                <TypographyMD
                                                    variant="paragraph"
                                                    label={item.value}
                                                    color="#5E5C5C"
                                                    fontFamily="Roboto"
                                                    fontSize="13px"
                                                    marginTop="-8px"
                                                    fontWeight={450}
                                                    sx={{ lineHeight: "25px" }}
                                                    align="left"
                                                />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        )
                        }

                    </Box>
                }
            />
        </>
    )
}

export default SystemConfiguration;