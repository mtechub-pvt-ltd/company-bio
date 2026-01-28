import React, { useEffect, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import { Box, Card, CardContent, CircularProgress, Grid,Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import general_setting from "../../Assets/general_setting.png";
import account_settings from "../../Assets/account_settings.png";
import privacy_and_sharing from "../../Assets/privacy_and_sharing.png";
import notifications from "../../Assets/notifications.png";
import login_and_security from "../../Assets/login_and_security.png";
import system_settings from "../../Assets/system_settings.png";
import finance_and_payout_settings from "../../Assets/finance_and_payout_settings.png";
import { useTranslation } from "react-i18next";
import TypographyMD from "../../components/items/Typography";
import toast from "react-hot-toast";
import ModalConfirmation from "../../components/items/ModalConfirmation";
import img from "../../Assets/logout.png";
import ButtonMD from "../../components/items/ButtonMD";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth, setAuth } from "../../store/slices/authSlice";
function SystemConfiguration() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
        const dispatch = useDispatch();
        const { user, token } = useSelector((state) => state.auth);
const [openmodallogout, setOpenmodallogout] = useState(false);
    const dummySystemConfiguration = [
        // {
        //     icon: <img src={general_setting} alt="..." style={{ width: "45px" }} />,
        //     heading: t("General Settings"),
        //     value: t("Customize your experience with themes, language, and interface preferences."),
        // },
        {
            icon: <img src={account_settings} alt="..." style={{ width: "45px" }} />,
            heading: t("Account Settings"),
            value: t("Update account details, manage linked services, and change your password."),
        },
     
    ];

    const handleNavigation = (heading) => {
        switch (heading) {
            case t("General Settings"):
                navigate(`/general_settings`);
                break;
            case t("Account Settings"):
                navigate(`/account_settings`);
                break;
            case t("Privacy & sharing"):
                navigate(`/privacy_and_sharing`);
                break;
            case t("Notifications"):
                navigate(`/notification`);
                break;
           case t("logout"):
            // OPEN LOGOUT MODAL DIRECTLY
            setOpenmodallogout(true);
            break;
            case t("System Settings"):
                navigate(`/system_settings`);
                break;
            default:
              toast.error("This section is under development.");
        }
    };

    const [initialLoader, setInitialLoader] = useState(true);

    useEffect(() => {
        // Simulate a 2-second loading time
        const timer = setTimeout(() => {
            setInitialLoader(false);
        }, 3000);

        // Cleanup timeout on unmount
        return () => clearTimeout(timer);
    }, []);
  const handleLogout = () => {
        setLoading(true);
        setTimeout(() => {
            dispatch(clearAuth());
            navigate("/");
            setOpenmodallogout(false);
            setLoading(false);
        }, 1000);
    };
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
                                          border:'2px solid #dcdfe4'
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
                                            <Box onClick={() => handleNavigation(item.heading)} sx={{ cursor: "pointer", p: 1, px: 2.5, display: "flex", flexDirection: "column", gap: 0.5, textAlign: "start", backgroundColor: "white", borderRadius: "10px" }}>
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

            <ModalConfirmation
    open={openmodallogout}
    onClose={() => setOpenmodallogout(false)}
    title={t("Logout")}
    data={
        <Stack alignItems="center" spacing={2} p={2}>
            <img src={img} alt="logout" width={100} />
            <TypographyMD
                label={t("Are you sure you want to logout ?")}
                align="center"
                fontSize={13}
                fontWeight={600}
            />
            
            <Stack direction="row" spacing={1}>
                <ButtonMD
                    variant="outlined"
                    title={t("Cancel")}
                    onClickTerm={() => setOpenmodallogout(false)}
                />

                <ButtonMD
                    variant="contained"
                    title={t("Logout")}
                    onClickTerm={handleLogout}
                    disabled={loading}
                />
            </Stack>
        </Stack>
    }
/>

        </>
    )
}

export default SystemConfiguration;