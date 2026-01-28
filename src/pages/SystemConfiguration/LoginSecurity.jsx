import React, { useEffect, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import { Box, Breadcrumbs, Card, CardContent, Checkbox, CircularProgress, FormControl, FormControlLabel, FormHelperText, Grid, IconButton, Radio, RadioGroup, Stack, Tab, Tabs, Typography } from "@mui/material";
import back_arrow from "../../Assets/back_arrow.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TypographyMD from "../../components/items/Typography";
import Inputfield from "../../components/items/Inputfield";
import ButtonMD from "../../components/items/ButtonMD";
import ModalConfirmation from "../../components/items/ModalConfirmation";
import { Check, CheckCircleOutline, Close, Logout, OpenInNew } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { clearAuth, setAuth } from "../../store/slices/authSlice";
import img from "../../Assets/logout.png";
import dummy from "../../Assets/dummy.png";
import url from "../../url";

function LoginSecurity() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, token } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [openmodallogout, setOpenmodallogout] = useState(false);

    // Activity Logs
    const sessionData = [
        {
            type: t("Mobile App"),
            date: "08 May, 2024",
            device: "Galaxy S21",
            location: "Location XYZ, abc"
        },
        {
            type: t("Web"),
            date: "08 May, 2024",
            device: "Macbook Air",
            location: "Location XYZ, abc"
        }
    ];

    const accountExecutives = [
        { name: "Jennifer Michel", date: "23 May, 2024" },
        { name: "John Doe", date: "23 May, 2024" },
        { name: "John Doe", date: "23 May, 2024" },
        { name: "John Doe", date: "23 May, 2024" },
        { name: "John Doe", date: "23 May, 2024" },
        { name: "John Doe", date: "23 May, 2024" },
        { name: "John Doe", date: "23 May, 2024" },
        { name: "John Doe", date: "23 May, 2024" },
        { name: "John Doe", date: "23 May, 2024" },
        { name: "John Doe", date: "23 May, 2024" },
        { name: "John Doe", date: "23 May, 2024" },
    ];

    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const [initialLoader, setInitialLoader] = useState(true);

    useEffect(() => {
        // Simulate a short loading time
        const timer = setTimeout(() => {
            setInitialLoader(false);
        }, 500);

        // Cleanup timeout on unmount
        return () => clearTimeout(timer);
    }, []);

    // Use Redux state instead of API calls
    const imgurl = user?.profile_image || dummy;
    
    // Debug: Check what's in user object
    console.log("LoginSecurity - User from Redux:", user);
    console.log("LoginSecurity - User name:", user?.name);
    console.log("LoginSecurity - User email:", user?.email);
    console.log("LoginSecurity - User profile_image:", user?.profile_image);

    // Fallback: If user data is not in Redux, fetch it
    useEffect(() => {
        const fetchUserData = async () => {
            if ((!user || !user.name || !user.email) && token) {
                try {
                    const res = await fetch(`${url}/super-admin/profile`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();
                    if (!data.error && data.data?.user) {
                        // Update Redux state with fetched user data
                        dispatch(setAuth({
                            token: token,
                            tokenExpiry: null,
                            user: data.data.user,
                            email: data.data.user.email
                        }));
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err);
                }
            }
        };
        fetchUserData();
    }, [user, token, dispatch]);

    // Logout handler
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
                            <>
                                <Grid container spacing={0} sx={{ pl: 1, pr: 1 }} pt={0}>
                                    <Grid xs={12} p={1}>
                                        <Box
                                           display="flex" 
                                           gap={{ xs: 0.5, sm: 1 }} 
                                           px={{ xs: 1, sm: 1.5 }} 
                                           p={{ xs: 0.5, sm: 1 }} 
                                           bgcolor={'white'} 
                                           borderRadius={2} 
                                           py={{ xs: 1, sm: 1.5 }} 
                                           border={'2px solid #dcdfe4'}
                                           sx={{ overflow: 'hidden' }}
                                        >
                                            <Box
                                                onClick={() => navigate(-1)}
                                                component="img"
                                                src={back_arrow}
                                                sx={{ 
                                                    cursor: "pointer", 
                                                    width: { xs: '25px', sm: '30px' },
                                                    flexShrink: 0
                                                }}
                                            />

                                            <Breadcrumbs 
                                                separator="/" 
                                                aria-label="breadcrumb" 
                                                sx={{ 
                                                    pt: 0.5, 
                                                    lineHeight: 1, 
                                                    m: 0,
                                                    overflow: 'hidden',
                                                    '& .MuiBreadcrumbs-separator': {
                                                        fontSize: { xs: '12px', sm: '14px' }
                                                    }
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: 400,
                                                        fontSize: { xs: '12px', sm: '15px' },
                                                        fontFamily: 'Roboto',
                                                        lineHeight: 1.2,
                                                        m: 0,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    color="#626F86"
                                                >
                                                    {t("Settings")}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 400,
                                                        fontSize: { xs: '12px', sm: '15px' },
                                                        fontFamily: 'Roboto',
                                                        lineHeight: 1.2,
                                                        m: 0,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    color="#626F86"
                                                >
                                                    {t("logout")}
                                                </Typography>
                                            </Breadcrumbs>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
                                    <Box sx={{ 
                                        width: { xs: "95%", sm: "90%", md: "60%" }, 
                                        m: { xs: 1, sm: 1.5, md: 0 }, 
                                        textAlign: "start", 
                                        backgroundColor: "white", 
                                        border: "2px solid rgba(9, 30, 66, 0.14)", 
                                        borderRadius: "10px" 
                                    }}>
                                        <Box sx={{ 
                                            borderBottom: 1, 
                                            mb: 2, 
                                            borderColor: 'divider', 
                                            display: 'flex', 
                                            justifyContent: 'flex-start',
                                            overflow: 'hidden'
                                        }}>
                                            <Tabs
                                                value={tabIndex}
                                                onChange={handleTabChange}
                                                variant="scrollable"
                                                scrollButtons="auto"
                                                textColor="primary"
                                                indicatorColor="primary"
                                                sx={{
                                                    width: '100%',
                                                    '& .MuiTab-root': {
                                                        fontWeight: 600,
                                                        fontSize: { xs: '12px', sm: '13px' },
                                                        textTransform: 'none',
                                                        minWidth: { xs: 100, sm: 130 },
                                                        padding: { xs: '6px 8px', sm: '12px 16px' },
                                                    },
                                                    '& .Mui-selected': {
                                                        color: '#1976d2',
                                                    },
                                                    '& .MuiTabs-indicator': {
                                                        backgroundColor: '#1976d2',
                                                    },
                                                }}
                                            >
                                                <Tab label={t("Activity Logs")} />
                                                {/* <Tab label={t("Account Executives")} />
                                                <Tab label={t("Company Admins")} />
                                                <Tab label={t("Workers")} /> */}
                                            </Tabs>
                                        </Box>
                                        {/* Activity Logs Tab - Only this tab is active */}
                                        <Box sx={{ 
                                            pl: { xs: 1, sm: 2 }, 
                                            pr: { xs: 1, sm: 2 } 
                                        }} pt={0}>
                                            {/* User Profile Section - Responsive Layout */}
                                            <Box sx={{ 
                                                border: "1px solid rgba(9, 30, 66, 0.14)", 
                                                borderRadius: "10px", 
                                                p: { xs: 1.5, sm: 2 }, 
                                                mb: 2,
                                                display: "flex",
                                                flexDirection: { xs: "column", sm: "row" },
                                                justifyContent: { xs: "flex-start", sm: "space-between" },
                                                alignItems: { xs: "flex-start", sm: "center" },
                                                gap: { xs: 2, sm: 0 }
                                            }}>
                                                {/* Left side - User Info */}
                                                <Stack 
                                                    direction="row" 
                                                    alignItems="flex-start" 
                                                    spacing={{ xs: 1.5, sm: 2 }}
                                                    sx={{ 
                                                        width: { xs: "100%", sm: "auto" },
                                                        minWidth: 0 // Allows text to wrap properly
                                                    }}
                                                >
                                                    {/* Avatar */}
                                                    <img
                                                        src={imgurl}
                                                        alt="Profile"
                                                        style={{
                                                            width: "50px",
                                                            height: "50px",
                                                            border: "none",
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                            flexShrink: 0 // Prevents avatar from shrinking
                                                        }}
                                                        crossOrigin="anonymous"
                                                        onError={(e) => {
                                                            e.currentTarget.src = dummy;
                                                        }}
                                                    />

                                                    {/* Name and Email */}
                                                    <Box sx={{ 
                                                        display: "flex", 
                                                        flexDirection: "column",
                                                        minWidth: 0, // Allows text to wrap
                                                        flex: 1
                                                    }}>
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={user?.name || user?.full_name || "User"}
                                                            color="#363333"
                                                            fontSize={{ xs: "14px", sm: "16px" }}
                                                            fontWeight={600}
                                                            align="left"
                                                            sx={{
                                                                wordBreak: "break-word",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 1,
                                                                WebkitBoxOrient: "vertical"
                                                            }}
                                                        />
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={user?.email || "user@example.com"}
                                                            color="#939393"
                                                            fontSize={{ xs: "12px", sm: "14px" }}
                                                            fontWeight={400}
                                                            align="left"
                                                            sx={{
                                                                wordBreak: "break-word",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 1,
                                                                WebkitBoxOrient: "vertical"
                                                            }}
                                                        />
                                                    </Box>
                                                </Stack>

                                                {/* Right side - Logout Button */}
                                                <Box sx={{ 
                                                    width: { xs: "100%", sm: "auto" },
                                                    display: "flex",
                                                    justifyContent: { xs: "flex-end", sm: "flex-start" }
                                                }}>
                                                    <ButtonMD
                                                        variant="contained"
                                                        title={t("Logout")}
                                                        startIcon={<Logout />}
                                                        width={{ xs: "fit-content", sm: "fit-content" }}
                                                        borderColor="#DD172C"
                                                        backgroundColor="#DD172C"
                                                        borderRadius="5px"
                                                        disabled={loading}
                                                        onClickTerm={() => setOpenmodallogout(true)}
                                                        sx={{
                                                            fontSize: { xs: "12px", sm: "14px" },
                                                            padding: { xs: "6px 12px", sm: "8px 16px" },
                                                            minWidth: { xs: "auto", sm: "auto" }
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>

                                    
                                    </Box>
                                </div>
                            </>
                        )
                        }

                    </Box>
                }
            />

            {/* Logout Modal */}
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

export default LoginSecurity;