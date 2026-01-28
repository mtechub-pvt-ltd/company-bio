import React, { useEffect, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import { Box, Breadcrumbs, Card, CardContent, Checkbox, CircularProgress, FormControl, FormControlLabel, FormHelperText, Grid, Radio, RadioGroup, Tab, Tabs, Typography } from "@mui/material";
import back_arrow from "../../Assets/back_arrow.png";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TypographyMD from "../../components/items/Typography";
import Inputfield from "../../components/items/Inputfield";
import ButtonMD from "../../components/items/ButtonMD";
import { Check, CheckCircleOutline, Close } from "@mui/icons-material";

function Notification() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // account executives
    const [accountNotifications, setAccountNotifications] = useState([
        { key: "new_executive_registration", label: t("New Executive Registration"), value: true },
        { key: "account_verification_needed", label: t("Account Verification Needed"), value: true },
        { key: "email_verification", label: t("Email Verification"), value: true },
        { key: "earnings_threshold_crossed", label: t("Earnings Threshold Crossed"), value: true },
        { key: "account_deactivation", label: t("Account Deactivation/Deletion Notification"), value: true },
        { key: "password_reset", label: t("Password Reset"), value: false }
    ]);

    const handleToggle = (key) => {
        const updated = accountNotifications.map((opt) =>
            opt.key === key ? { ...opt, value: !opt.value } : opt
        );
        setAccountNotifications(updated);
    };

    // message notifications
    const [messageNotifications, setMessageNotifications] = useState([
        { key: "use_chat_support", label: t("Use chat support"), value: true },
        { key: "sends_message", label: t("Sends message"), value: false },
        { key: "receives_message", label: t("Receives message"), value: false }
    ]);

    const handleToggleMessageNotifications = (key) => {
        const updated = messageNotifications.map((opt) =>
            opt.key === key ? { ...opt, value: !opt.value } : opt
        );
        setMessageNotifications(updated);
    };

    // payment notifications
    const [paymmentNotifications, setPaymmentNotifications] = useState([
        { key: "transaction_Requested", label: t("Transaction Requested"), value: true },
        { key: "commision_received", label: t("Commission received"), value: false }
    ]);

    const handleTogglePaymentNotifications = (key) => {
        const updated = paymmentNotifications.map((opt) =>
            opt.key === key ? { ...opt, value: !opt.value } : opt
        );
        setPaymmentNotifications(updated);
    };

    // company admins
    const [companyAccountNotifications, setCompanyAccountNotifications] = useState([
        { key: "new_executive_registration", label: t("New Company Registered"), value: true },
        { key: "account_verification_needed", label: t("Account Verification Needed"), value: true },
        { key: "email_verification", label: t("Email Verification"), value: true },
        { key: "earnings_threshold_crossed", label: t("Company Profile Incomplete Reminder"), value: false },
        { key: "account_deactivation", label: t("Company Account Suspended/Flagged"), value: true },
        { key: "password_reset", label: "Password Reset", value: false }
    ]);

    const handleToggleCompanyAccountNotifications = (key) => {
        const updated = companyAccountNotifications.map((opt) =>
            opt.key === key ? { ...opt, value: !opt.value } : opt
        );
        setCompanyAccountNotifications(updated);
    };

    // company admins message notifications
    const [companyMessageNotifications, setCompanyMessageNotifications] = useState([
        { key: "use_chat_support", label: t("Use chat support"), value: true },
        { key: "sends_message", label: t("Sends message from inbox"), value: false },
        { key: "receives_inbox_message", label: t("Receives message from inbox"), value: false },
        { key: "send_message", label: t("Send message to account executive"), value: true },
        { key: "receives_account_executive_message", label: t("Receives message from account executive"), value: true }
    ]);

    const handleToggleCompamyMessageNotifications = (key) => {
        const updated = companyMessageNotifications.map((opt) =>
            opt.key === key ? { ...opt, value: !opt.value } : opt
        );
        setCompanyMessageNotifications(updated);
    };

    // company admins payment notifications
    const [companyPaymmentNotifications, setcompanyPaymmentNotifications] = useState([
        { key: "transaction_Requested", label: t("Transaction Requested"), value: true },
        { key: "commision_received", label: t("Payment release"), value: false },
        { key: "subscription_update", label: t("Subscription updated"), value: false },
    ]);

    const handleToggleCompanyPaymentNotifications = (key) => {
        const updated = companyPaymmentNotifications.map((opt) =>
            opt.key === key ? { ...opt, value: !opt.value } : opt
        );
        setcompanyPaymmentNotifications(updated);
    };

    // workers 
    const [workersAccountNotifications, setWorkersAccountNotifications] = useState([
        { key: "new_worker_registration", label: t("New Worker Registered"), value: true },
        { key: "account_verification_needed", label: t("Account Verification Needed"), value: true },
        { key: "biometric_issue_detected", label: t("Biometric Issue Detected"), value: true },
        { key: "loan_Requested_submitted", label: t("Worker Loan Requested Submitted"), value: false },
        { key: "password_reset", label: t("Password Reset"), value: false }
    ]);

    const handleToggleWorkersAccountNotifications = (key) => {
        const updated = workersAccountNotifications.map((opt) =>
            opt.key === key ? { ...opt, value: !opt.value } : opt
        );
        setWorkersAccountNotifications(updated);
    };

    // workers message notifications
    const [workersMessageNotifications, setWorkersMessageNotifications] = useState([
        { key: "use_chat_support", label: t("Use chat support"), value: true },
        { key: "sends_message", label: t("Sends message from inbox"), value: false },
        { key: "receives_inbox_message", label: t("Receives message from inbox"), value: false },
        { key: "send_message", label: t("Send message to account executive"), value: true },
        { key: "receives_account_executive_message", label: t("Receives message from account executive"), value: true }
    ]);

    const handleToggleWorkersMessageNotifications = (key) => {
        const updated = workersMessageNotifications.map((opt) =>
            opt.key === key ? { ...opt, value: !opt.value } : opt
        );
        setWorkersMessageNotifications(updated);
    };

    // workers payment notifications
    const [workersPaymmentNotifications, setWorkersPaymmentNotifications] = useState([
        { key: "transaction_Requested", label: t("Transaction Requested"), value: true },
        { key: "commision_received", label: t("Payment release"), value: false },
        { key: "new_transaction", label: t("New transaction"), value: false },
    ]);

    const handleToggleWorkersPaymentNotifications = (key) => {
        const updated = workersPaymmentNotifications.map((opt) =>
            opt.key === key ? { ...opt, value: !opt.value } : opt
        );
        setWorkersPaymmentNotifications(updated);
    };

    // activity Alerts 
    const [activityAlerts, setActivityAlerts] = useState([
        { key: "login_attempt_from_new_location", label: t("Login Attempt from New Location"), value: true },
        { key: "role_permission_changes", label: t("Role Permission Changes"), value: true },
        { key: "face_login", label: t("Face login"), value: true },
        { key: "face_verification_fails", label: t("Face verification fails"), value: false },
        { key: "passcode_login", label: t("Passcode login"), value: false },
        { key: "login_attempt_failed", label: t("Login attempt failed"), value: false },
        { key: "fallback_method_used", label: t("Fallback method used"), value: false }
    ]);

    const handleToggleActivityAlerts = (key) => {
        const updated = activityAlerts.map((opt) =>
            opt.key === key ? { ...opt, value: !opt.value } : opt
        );
        setActivityAlerts(updated);
    };

    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
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
                                           display="flex" gap={1} px={1.5} p={1} bgcolor={'white'} borderRadius={2} py={1.5} border={'2px solid #dcdfe4'}
                                        >
                                            <Box
                                                onClick={() => navigate(-1)}
                                                component="img"
                                                src={back_arrow}
                                                sx={{ cursor: "pointer", width: '30px' }}
                                            />

                                            <Breadcrumbs separator="/" aria-label="breadcrumb" sx={{ pt: 0.5, lineHeight: 1, m: 0 }}>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 400,
                                                        fontSize: '15px',
                                                        fontFamily: 'Roboto',
                                                        lineHeight: 1.2,
                                                        m: 0,
                                                    }}
                                                    color="#626F86"
                                                >
                                                    {t("Settings")}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 400,
                                                        fontSize: '15px',
                                                        fontFamily: 'Roboto',
                                                        lineHeight: 1.2,
                                                        m: 0,
                                                    }}
                                                    color="#626F86"
                                                >
                                                    {t("Notifications")}
                                                </Typography>
                                            </Breadcrumbs>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
                                    <Box sx={{ width: { xs: "95%", md: "60%" }, m: { xs: 1, md: 0 }, textAlign: "start", backgroundColor: "white", border: "2px solid rgba(9, 30, 66, 0.14)", borderRadius: "10px" }}>
                                        <Box
                                            sx={{
                                                borderBottom: 1,
                                                mb: 2,
                                                borderColor: 'divider',
                                                display: 'flex',
                                                justifyContent: 'flex-start',
                                                overflowX: 'auto', // Allow horizontal scrolling
                                            }}
                                        >
                                            <Tabs
                                                value={tabIndex}
                                                onChange={handleTabChange}
                                                variant="scrollable"
                                                scrollButtons="auto"
                                                textColor="primary"
                                                indicatorColor="primary"
                                                sx={{
                                                    '& .MuiTab-root': {
                                                        fontWeight: 600,
                                                        fontSize: '13px',
                                                        textTransform: 'none',
                                                        minWidth: 130, // Ensures tab width fits better on small screens
                                                    },
                                                    '& .Mui-selected': {
                                                        color: '#1976d2',
                                                    },
                                                    '& .MuiTabs-indicator': {
                                                        backgroundColor: '#1976d2',
                                                    },
                                                }}
                                            >
                                                <Tab label={t("Account Executives")} />
                                                <Tab label={t("Company Admins")} />
                                                <Tab label={t("Worker")} />
                                                <Tab label={t("Activity Alerts")} />
                                            </Tabs>
                                        </Box>
                                        {tabIndex === 0 ?
                                            <Box align=" " sx={{ pl: 1, pr: 1 }} pt={0}>
                                                <Box sx={{ pl: 1, pr: 1 }} pt={0}>
                                                    <TypographyMD
                                                        variant="paragraph"
                                                        label={t("Account Notifications")}
                                                        color="#000000"
                                                        fontFamily="Roboto"
                                                        fontSize="19px"
                                                        fontWeight={650}
                                                        align="left"
                                                        sx={{ lineHeight: "35px" }}
                                                    />

                                                    {accountNotifications.map(({ key, label, value }) => (
                                                        <Box key={key} sx={{ pt: 1, display: "flex", alignItems: "center", mb: 0 }}>
                                                            <TypographyMD variant="paragraph" label={t(label)} color="#5E5C5C" fontFamily="Roboto" fontSize="14px" sx={{ flex: 1, lineHeight: "15px" }} fontWeight={450} align="left" />

                                                            <Box sx={{ position: "relative", width: 50, height: 20 }}>
                                                                <Checkbox
                                                                    checked={value}
                                                                    onChange={() => handleToggle(key)}
                                                                    disableRipple
                                                                    inputProps={{ "aria-label": "toggle switch" }}
                                                                    sx={{
                                                                        width: 45,
                                                                        height: 20,
                                                                        padding: 0,
                                                                        borderRadius: 20,
                                                                        backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                        transition: "background-color 0.3s",
                                                                        "&:hover": {
                                                                            backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                        },
                                                                        "& .MuiSvgIcon-root": {
                                                                            display: "none",
                                                                        },
                                                                    }}
                                                                />
                                                                <Box
                                                                    sx={{
                                                                        position: "absolute",
                                                                        top: 4.5,
                                                                        left: value ? 28 : 3,
                                                                        width: 16,
                                                                        height: 16,
                                                                        backgroundColor: "#fff",
                                                                        borderRadius: "50%",
                                                                        transition: "0.3s",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                                                    }}
                                                                >
                                                                    {value ? (
                                                                        <Check sx={{ fontSize: 14, color: "#2e7d32" }} />
                                                                    ) : (
                                                                        <Close sx={{ fontSize: 14, color: "#44546F" }} />
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    ))}

                                                    <TypographyMD
                                                        variant="paragraph"
                                                        label={t("Message Notifications")}
                                                        color="#000000"
                                                        fontFamily="Roboto"
                                                        fontSize="19px"
                                                        fontWeight={650}
                                                        align="left"
                                                        sx={{ lineHeight: "35px" }}
                                                    />
                                                    {messageNotifications.map(({ key, label, value }) => (
                                                        <Box key={key} sx={{ pt: 1, display: "flex", alignItems: "center", mb: 0 }}>
                                                            <TypographyMD variant="paragraph" label={t(label)} color="#5E5C5C" fontFamily="Roboto" fontSize="14px" sx={{ flex: 1, lineHeight: "15px" }} fontWeight={450} align="left" />

                                                            <Box sx={{ position: "relative", width: 50, height: 20 }}>
                                                                <Checkbox
                                                                    checked={value}
                                                                    onChange={() => handleToggleMessageNotifications(key)}
                                                                    disableRipple
                                                                    inputProps={{ "aria-label": "toggle switch" }}
                                                                    sx={{
                                                                        width: 45,
                                                                        height: 20,
                                                                        padding: 0,
                                                                        borderRadius: 20,
                                                                        backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                        transition: "background-color 0.3s",
                                                                        "&:hover": {
                                                                            backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                        },
                                                                        "& .MuiSvgIcon-root": {
                                                                            display: "none",
                                                                        },
                                                                    }}
                                                                />
                                                                <Box
                                                                    sx={{
                                                                        position: "absolute",
                                                                        top: 4.5,
                                                                        left: value ? 28 : 3,
                                                                        width: 16,
                                                                        height: 16,
                                                                        backgroundColor: "#fff",
                                                                        borderRadius: "50%",
                                                                        transition: "0.3s",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                                                    }}
                                                                >
                                                                    {value ? (
                                                                        <Check sx={{ fontSize: 14, color: "#2e7d32" }} />
                                                                    ) : (
                                                                        <Close sx={{ fontSize: 14, color: "#44546F" }} />
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    ))}

                                                    <TypographyMD
                                                        variant="paragraph"
                                                        label={t("Payment Notifications")}
                                                        color="#000000"
                                                        fontFamily="Roboto"
                                                        fontSize="19px"
                                                        fontWeight={650}
                                                        align="left"
                                                        sx={{ lineHeight: "35px" }}
                                                    />
                                                    {paymmentNotifications.map(({ key, label, value }) => (
                                                        <Box key={key} sx={{ pt: 1, display: "flex", alignItems: "center", mb: 0 }}>
                                                            <TypographyMD variant="paragraph" label={t(label)} color="#5E5C5C" fontFamily="Roboto" fontSize="14px" sx={{ flex: 1, lineHeight: "15px" }} fontWeight={450} align="left" />

                                                            <Box sx={{ position: "relative", width: 50, height: 20 }}>
                                                                <Checkbox
                                                                    checked={value}
                                                                    onChange={() => handleTogglePaymentNotifications(key)}
                                                                    disableRipple
                                                                    inputProps={{ "aria-label": "toggle switch" }}
                                                                    sx={{
                                                                        width: 45,
                                                                        height: 20,
                                                                        padding: 0,
                                                                        borderRadius: 20,
                                                                        backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                        transition: "background-color 0.3s",
                                                                        "&:hover": {
                                                                            backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                        },
                                                                        "& .MuiSvgIcon-root": {
                                                                            display: "none",
                                                                        },
                                                                    }}
                                                                />
                                                                <Box
                                                                    sx={{
                                                                        position: "absolute",
                                                                        top: 4.5,
                                                                        left: value ? 28 : 3,
                                                                        width: 16,
                                                                        height: 16,
                                                                        backgroundColor: "#fff",
                                                                        borderRadius: "50%",
                                                                        transition: "0.3s",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                                                    }}
                                                                >
                                                                    {value ? (
                                                                        <Check sx={{ fontSize: 14, color: "#2e7d32" }} />
                                                                    ) : (
                                                                        <Close sx={{ fontSize: 14, color: "#44546F" }} />
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                    ))}

                                                    <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", marginBottom: "20px" }}>
                                                        <ButtonMD
                                                            variant="contained"
                                                            title={t("Save")}
                                                            startIcon={<CheckCircleOutline />}
                                                            width="fit-content"
                                                            borderColor="orange"
                                                            backgroundColor="orange"
                                                            borderRadius="5px"
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                </Box>
                                            </Box>
                                            : tabIndex === 1 ?
                                                <Box align=" " sx={{ pl: 1, pr: 1 }} pt={0}>
                                                    <Box sx={{ pl: 1, pr: 1 }} pt={0}>
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Account Notifications")}
                                                            color="#000000"
                                                            fontFamily="Roboto"
                                                            fontSize="19px"
                                                            fontWeight={650}
                                                            align="left"
                                                            sx={{ lineHeight: "35px" }}
                                                        />

                                                        {companyAccountNotifications.map(({ key, label, value }) => (
                                                            <Box key={key} sx={{ pt: 1, display: "flex", alignItems: "center", mb: 0 }}>
                                                                <TypographyMD variant="paragraph" label={t(label)} color="#5E5C5C" fontFamily="Roboto" fontSize="14px" sx={{ flex: 1, lineHeight: "15px" }} fontWeight={450} align="left" />

                                                                <Box sx={{ position: "relative", width: 50, height: 20 }}>
                                                                    <Checkbox
                                                                        checked={value}
                                                                        onChange={() => handleToggleCompanyAccountNotifications(key)}
                                                                        disableRipple
                                                                        inputProps={{ "aria-label": "toggle switch" }}
                                                                        sx={{
                                                                            width: 45,
                                                                            height: 20,
                                                                            padding: 0,
                                                                            borderRadius: 20,
                                                                            backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                            transition: "background-color 0.3s",
                                                                            "&:hover": {
                                                                                backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                            },
                                                                            "& .MuiSvgIcon-root": {
                                                                                display: "none",
                                                                            },
                                                                        }}
                                                                    />
                                                                    <Box
                                                                        sx={{
                                                                            position: "absolute",
                                                                            top: 4.5,
                                                                            left: value ? 28 : 3,
                                                                            width: 16,
                                                                            height: 16,
                                                                            backgroundColor: "#fff",
                                                                            borderRadius: "50%",
                                                                            transition: "0.3s",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                                                        }}
                                                                    >
                                                                        {value ? (
                                                                            <Check sx={{ fontSize: 14, color: "#2e7d32" }} />
                                                                        ) : (
                                                                            <Close sx={{ fontSize: 14, color: "#44546F" }} />
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        ))}

                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Message Notifications")}
                                                            color="#000000"
                                                            fontFamily="Roboto"
                                                            fontSize="19px"
                                                            fontWeight={650}
                                                            align="left"
                                                            sx={{ lineHeight: "35px" }}
                                                        />
                                                        {companyMessageNotifications.map(({ key, label, value }) => (
                                                            <Box key={key} sx={{ pt: 1, display: "flex", alignItems: "center", mb: 0 }}>
                                                                <TypographyMD variant="paragraph" label={t(label)} color="#5E5C5C" fontFamily="Roboto" fontSize="14px" sx={{ flex: 1, lineHeight: "15px" }} fontWeight={450} align="left" />

                                                                <Box sx={{ position: "relative", width: 50, height: 20 }}>
                                                                    <Checkbox
                                                                        checked={value}
                                                                        onChange={() => handleToggleCompamyMessageNotifications(key)}
                                                                        disableRipple
                                                                        inputProps={{ "aria-label": "toggle switch" }}
                                                                        sx={{
                                                                            width: 45,
                                                                            height: 20,
                                                                            padding: 0,
                                                                            borderRadius: 20,
                                                                            backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                            transition: "background-color 0.3s",
                                                                            "&:hover": {
                                                                                backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                            },
                                                                            "& .MuiSvgIcon-root": {
                                                                                display: "none",
                                                                            },
                                                                        }}
                                                                    />
                                                                    <Box
                                                                        sx={{
                                                                            position: "absolute",
                                                                            top: 4.5,
                                                                            left: value ? 28 : 3,
                                                                            width: 16,
                                                                            height: 16,
                                                                            backgroundColor: "#fff",
                                                                            borderRadius: "50%",
                                                                            transition: "0.3s",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                                                        }}
                                                                    >
                                                                        {value ? (
                                                                            <Check sx={{ fontSize: 14, color: "#2e7d32" }} />
                                                                        ) : (
                                                                            <Close sx={{ fontSize: 14, color: "#44546F" }} />
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        ))}


                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Payment Notifications")}
                                                            color="#000000"
                                                            fontFamily="Roboto"
                                                            fontSize="19px"
                                                            fontWeight={650}
                                                            align="left"
                                                            sx={{ lineHeight: "35px" }}
                                                        />
                                                        {companyPaymmentNotifications.map(({ key, label, value }) => (
                                                            <Box key={key} sx={{ pt: 1, display: "flex", alignItems: "center", mb: 0 }}>
                                                                <TypographyMD variant="paragraph" label={t(label)} color="#5E5C5C" fontFamily="Roboto" fontSize="14px" sx={{ flex: 1, lineHeight: "15px" }} fontWeight={450} align="left" />

                                                                <Box sx={{ position: "relative", width: 50, height: 20 }}>
                                                                    <Checkbox
                                                                        checked={value}
                                                                        onChange={() => handleToggleCompanyPaymentNotifications(key)}
                                                                        disableRipple
                                                                        inputProps={{ "aria-label": "toggle switch" }}
                                                                        sx={{
                                                                            width: 45,
                                                                            height: 20,
                                                                            padding: 0,
                                                                            borderRadius: 20,
                                                                            backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                            transition: "background-color 0.3s",
                                                                            "&:hover": {
                                                                                backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                            },
                                                                            "& .MuiSvgIcon-root": {
                                                                                display: "none",
                                                                            },
                                                                        }}
                                                                    />
                                                                    <Box
                                                                        sx={{
                                                                            position: "absolute",
                                                                            top: 4.5,
                                                                            left: value ? 28 : 3,
                                                                            width: 16,
                                                                            height: 16,
                                                                            backgroundColor: "#fff",
                                                                            borderRadius: "50%",
                                                                            transition: "0.3s",
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                                                        }}
                                                                    >
                                                                        {value ? (
                                                                            <Check sx={{ fontSize: 14, color: "#2e7d32" }} />
                                                                        ) : (
                                                                            <Close sx={{ fontSize: 14, color: "#44546F" }} />
                                                                        )}
                                                                    </Box>
                                                                </Box>
                                                            </Box>
                                                        ))}

                                                        <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", marginBottom: "20px" }}>
                                                            <ButtonMD
                                                                variant="contained"
                                                                title={t("Save")}
                                                                startIcon={<CheckCircleOutline />}
                                                                width="fit-content"
                                                                borderColor="orange"
                                                                backgroundColor="orange"
                                                                borderRadius="5px"
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                    </Box>
                                                </Box>
                                                : tabIndex === 2 ?
                                                    <Box align=" " sx={{ pl: 1, pr: 1 }} pt={0}>
                                                        <Box sx={{ pl: 1, pr: 1 }} pt={0}>
                                                            <TypographyMD
                                                                variant="paragraph"
                                                                label={t("Account Notifications")}
                                                                color="#000000"
                                                                fontFamily="Roboto"
                                                                fontSize="19px"
                                                                fontWeight={650}
                                                                align="left"
                                                                sx={{ lineHeight: "35px" }}
                                                            />

                                                            {workersAccountNotifications.map(({ key, label, value }) => (
                                                                <Box key={key} sx={{ pt: 1, display: "flex", alignItems: "center", mb: 0 }}>
                                                                    <TypographyMD variant="paragraph" label={t(label)} color="#5E5C5C" fontFamily="Roboto" fontSize="14px" sx={{ flex: 1, lineHeight: "15px" }} fontWeight={450} align="left" />

                                                                    <Box sx={{ position: "relative", width: 50, height: 20 }}>
                                                                        <Checkbox
                                                                            checked={value}
                                                                            onChange={() => handleToggleWorkersAccountNotifications(key)}
                                                                            disableRipple
                                                                            inputProps={{ "aria-label": "toggle switch" }}
                                                                            sx={{
                                                                                width: 45,
                                                                                height: 20,
                                                                                padding: 0,
                                                                                borderRadius: 20,
                                                                                backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                                transition: "background-color 0.3s",
                                                                                "&:hover": {
                                                                                    backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                                },
                                                                                "& .MuiSvgIcon-root": {
                                                                                    display: "none",
                                                                                },
                                                                            }}
                                                                        />
                                                                        <Box
                                                                            sx={{
                                                                                position: "absolute",
                                                                                top: 4.5,
                                                                                left: value ? 28 : 3,
                                                                                width: 16,
                                                                                height: 16,
                                                                                backgroundColor: "#fff",
                                                                                borderRadius: "50%",
                                                                                transition: "0.3s",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                                                            }}
                                                                        >
                                                                            {value ? (
                                                                                <Check sx={{ fontSize: 14, color: "#2e7d32" }} />
                                                                            ) : (
                                                                                <Close sx={{ fontSize: 14, color: "#44546F" }} />
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            ))}

                                                            <TypographyMD
                                                                variant="paragraph"
                                                                label={t("Message Notifications")}
                                                                color="#000000"
                                                                fontFamily="Roboto"
                                                                fontSize="19px"
                                                                fontWeight={650}
                                                                align="left"
                                                                sx={{ lineHeight: "35px" }}
                                                            />
                                                            {workersMessageNotifications.map(({ key, label, value }) => (
                                                                <Box key={key} sx={{ pt: 1, display: "flex", alignItems: "center", mb: 0 }}>
                                                                    <TypographyMD variant="paragraph" label={t(label)} color="#5E5C5C" fontFamily="Roboto" fontSize="14px" sx={{ flex: 1, lineHeight: "15px" }} fontWeight={450} align="left" />

                                                                    <Box sx={{ position: "relative", width: 50, height: 20 }}>
                                                                        <Checkbox
                                                                            checked={value}
                                                                            onChange={() => handleToggleWorkersMessageNotifications(key)}
                                                                            disableRipple
                                                                            inputProps={{ "aria-label": "toggle switch" }}
                                                                            sx={{
                                                                                width: 45,
                                                                                height: 20,
                                                                                padding: 0,
                                                                                borderRadius: 20,
                                                                                backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                                transition: "background-color 0.3s",
                                                                                "&:hover": {
                                                                                    backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                                },
                                                                                "& .MuiSvgIcon-root": {
                                                                                    display: "none",
                                                                                },
                                                                            }}
                                                                        />
                                                                        <Box
                                                                            sx={{
                                                                                position: "absolute",
                                                                                top: 4.5,
                                                                                left: value ? 28 : 3,
                                                                                width: 16,
                                                                                height: 16,
                                                                                backgroundColor: "#fff",
                                                                                borderRadius: "50%",
                                                                                transition: "0.3s",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                                                            }}
                                                                        >
                                                                            {value ? (
                                                                                <Check sx={{ fontSize: 14, color: "#2e7d32" }} />
                                                                            ) : (
                                                                                <Close sx={{ fontSize: 14, color: "#44546F" }} />
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            ))}

                                                            <TypographyMD
                                                                variant="paragraph"
                                                                label={t("Payment Notifications")}
                                                                color="#000000"
                                                                fontFamily="Roboto"
                                                                fontSize="19px"
                                                                fontWeight={650}
                                                                align="left"
                                                                sx={{ lineHeight: "35px" }}
                                                            />
                                                            {workersPaymmentNotifications.map(({ key, label, value }) => (
                                                                <Box key={key} sx={{ pt: 1, display: "flex", alignItems: "center", mb: 0 }}>
                                                                    <TypographyMD variant="paragraph" label={t(label)} color="#5E5C5C" fontFamily="Roboto" fontSize="14px" sx={{ flex: 1, lineHeight: "15px" }} fontWeight={450} align="left" />

                                                                    <Box sx={{ position: "relative", width: 50, height: 20 }}>
                                                                        <Checkbox
                                                                            checked={value}
                                                                            onChange={() => handleToggleWorkersPaymentNotifications(key)}
                                                                            disableRipple
                                                                            inputProps={{ "aria-label": "toggle switch" }}
                                                                            sx={{
                                                                                width: 45,
                                                                                height: 20,
                                                                                padding: 0,
                                                                                borderRadius: 20,
                                                                                backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                                transition: "background-color 0.3s",
                                                                                "&:hover": {
                                                                                    backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                                },
                                                                                "& .MuiSvgIcon-root": {
                                                                                    display: "none",
                                                                                },
                                                                            }}
                                                                        />
                                                                        <Box
                                                                            sx={{
                                                                                position: "absolute",
                                                                                top: 4.5,
                                                                                left: value ? 28 : 3,
                                                                                width: 16,
                                                                                height: 16,
                                                                                backgroundColor: "#fff",
                                                                                borderRadius: "50%",
                                                                                transition: "0.3s",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                                                            }}
                                                                        >
                                                                            {value ? (
                                                                                <Check sx={{ fontSize: 14, color: "#2e7d32" }} />
                                                                            ) : (
                                                                                <Close sx={{ fontSize: 14, color: "#44546F" }} />
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            ))}

                                                            <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", marginBottom: "20px" }}>
                                                                <ButtonMD
                                                                    variant="contained"
                                                                    title={t("Save")}
                                                                    startIcon={<CheckCircleOutline />}
                                                                    width="fit-content"
                                                                    borderColor="orange"
                                                                    backgroundColor="orange"
                                                                    borderRadius="5px"
                                                                    disabled={loading}
                                                                />
                                                            </div>
                                                        </Box>
                                                    </Box>
                                                    :
                                                    <Box align=" " sx={{ pl: 1, pr: 1 }} pt={0}>
                                                        <Box sx={{ pl: 1, pr: 1 }} pt={0}>
                                                            <TypographyMD
                                                                variant="paragraph"
                                                                label={t("Account Notifications")}
                                                                color="#000000"
                                                                fontFamily="Roboto"
                                                                fontSize="19px"
                                                                fontWeight={650}
                                                                align="left"
                                                                sx={{ lineHeight: "35px" }}
                                                            />

                                                            {activityAlerts.map(({ key, label, value }) => (
                                                                <Box key={key} sx={{ pt: 1, display: "flex", alignItems: "center", mb: 0 }}>
                                                                    <TypographyMD variant="paragraph" label={t(label)} color="#5E5C5C" fontFamily="Roboto" fontSize="14px" sx={{ flex: 1, lineHeight: "15px" }} fontWeight={450} align="left" />

                                                                    <Box sx={{ position: "relative", width: 50, height: 20 }}>
                                                                        <Checkbox
                                                                            checked={value}
                                                                            onChange={() => handleToggleActivityAlerts(key)}
                                                                            disableRipple
                                                                            inputProps={{ "aria-label": "toggle switch" }}
                                                                            sx={{
                                                                                width: 45,
                                                                                height: 20,
                                                                                padding: 0,
                                                                                borderRadius: 20,
                                                                                backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                                transition: "background-color 0.3s",
                                                                                "&:hover": {
                                                                                    backgroundColor: value ? "#2e7d32" : "#44546F",
                                                                                },
                                                                                "& .MuiSvgIcon-root": {
                                                                                    display: "none",
                                                                                },
                                                                            }}
                                                                        />
                                                                        <Box
                                                                            sx={{
                                                                                position: "absolute",
                                                                                top: 4.5,
                                                                                left: value ? 28 : 3,
                                                                                width: 16,
                                                                                height: 16,
                                                                                backgroundColor: "#fff",
                                                                                borderRadius: "50%",
                                                                                transition: "0.3s",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                                                            }}
                                                                        >
                                                                            {value ? (
                                                                                <Check sx={{ fontSize: 14, color: "#2e7d32" }} />
                                                                            ) : (
                                                                                <Close sx={{ fontSize: 14, color: "#44546F" }} />
                                                                            )}
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            ))}

                                                            <div style={{ display: "flex", justifyContent: "center", marginTop: "10px", marginBottom: "20px" }}>
                                                                <ButtonMD
                                                                    variant="contained"
                                                                    title={t("Save")}
                                                                    startIcon={<CheckCircleOutline />}
                                                                    width="fit-content"
                                                                    borderColor="orange"
                                                                    backgroundColor="orange"
                                                                    borderRadius="5px"
                                                                    disabled={loading}
                                                                />
                                                            </div>
                                                        </Box>
                                                    </Box>
                                        }
                                    </Box>
                                </div>
                            </>
                        )
                        }

                    </Box>
                }
            />
        </>
    )
}

export default Notification;