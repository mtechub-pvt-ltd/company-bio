import React, { useEffect, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import { Box, Breadcrumbs, Card, CardContent, Checkbox, CircularProgress, FormControl, FormControlLabel, FormHelperText, Grid, Radio, RadioGroup, Tab, Tabs, Typography } from "@mui/material";
import back_arrow from "../../Assets/back_arrow.png";
import { useNavigate } from "react-router-dom";
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useTranslation } from "react-i18next";
import TypographyMD from "../../components/items/Typography";
import Inputfield from "../../components/items/Inputfield";
import ButtonMD from "../../components/items/ButtonMD";
import { Check, CheckCircleOutline, Close } from "@mui/icons-material";

function SystemSettings() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [options, setOptions] = useState([
        { key: "payout_approval_required", label: t("Manual Payout Approval Required"), value: true },
        { key: "allow_new_registrations", label: t("Allow New Registrations"), value: true }
    ]);

    const handleToggle = (key) => {
        const updated = options.map((opt) =>
            opt.key === key ? { ...opt, value: !opt.value } : opt
        );
        setOptions(updated);
    };

    const [commisionRate, setCommisionRate] = useState("0");

    const handleCommisionRate = (e) => {
        const value = e.target.value;
        setCommisionRate(value);
    };

    const [commisionRateReferals, setCommisionRateReferals] = useState("0");
    const [paymentThresholdAmount, setPaymentThresholdAmount] = useState("0");

    const [checkedAutoDeletionChecked, setCheckedAutoDeletionChecked] = useState(true);
    const [autoPayment, setAutoPayment] = useState("weekly");

    const handleChangeAutoPayment = (event) => {
        setAutoPayment(event.target.value);
       
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
                                                    {t("System Settings")}
                                                </Typography>
                                            </Breadcrumbs>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
                                    <Box sx={{ width: { xs: "95%", md: "60%" }, m: { xs: 1, md: 0 }, textAlign: "start", backgroundColor: "white", border: "2px solid rgba(9, 30, 66, 0.14)", borderRadius: "10px" }}>

                                        <Box align="center" sx={{ py: 1, pl: 2, pr: 2 }} pt={0}>
                                            <Box display="flex" flexDirection="column" gap={1} mt={0}>
                                                <Grid container alignItems="center" mt={0} spacing={2}>
                                                    {/* Text section - takes majority width */}
                                                    <Grid item xs={12} md={6} align="left">
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Commission Rate for Executives")}
                                                            color="#5E5C5C"
                                                            fontFamily="Roboto"
                                                            fontSize="14px"
                                                            fontWeight={450}
                                                        />
                                                    </Grid>

                                                    {/* Number input */}
                                                    <Grid item xs={6} md={6}>
                                                        <Inputfield
                                                            autoFocus={false}
                                                            value={commisionRate}
                                                            onChngeterm={handleCommisionRate}
                                                            type="number"
                                                            variant="outlined"
                                                            sx={{ width: "100%" }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>

                                            <Box display="flex" flexDirection="column" gap={1} mt={-2}>
                                                <Grid container alignItems="center" mt={0} spacing={2}>
                                                    {/* Text section - takes majority width */}
                                                    <Grid item xs={12} md={6} align="left">
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Commission Rate for Referrals")}
                                                            color="#5E5C5C"
                                                            fontFamily="Roboto"
                                                            fontSize="14px"
                                                            fontWeight={450}
                                                        />
                                                    </Grid>

                                                    {/* Number input */}
                                                    <Grid item xs={6} md={6}>
                                                        <Inputfield
                                                            autoFocus={false}
                                                            value={commisionRateReferals}
                                                            onChngeterm={(e) => { setCommisionRateReferals(e.target.value) }}
                                                            type="number"
                                                            variant="outlined"
                                                            sx={{ width: "100%" }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>

                                            <Box display="flex" flexDirection="column" gap={1} mt={-2}>
                                                <Grid container alignItems="center" mt={0} spacing={2}>
                                                    {/* Text section - takes majority width */}
                                                    <Grid item xs={12} md={6} align="left">
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Payout Threshold Amount")}
                                                            color="#5E5C5C"
                                                            fontFamily="Roboto"
                                                            fontSize="14px"
                                                            fontWeight={450}
                                                        />
                                                    </Grid>

                                                    {/* Number input */}
                                                    <Grid item xs={6} md={6} >
                                                        <Inputfield
                                                            autoFocus={false}
                                                            value={paymentThresholdAmount}
                                                            onChngeterm={(e) => { setPaymentThresholdAmount(e.target.value) }}
                                                            type="number"
                                                            variant="outlined"
                                                            sx={{ width: "100%" }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Box>

                                            <Box mt={1} display="flex" flexDirection="column">

                                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <TypographyMD variant="paragraph" label={t("Auto-Payout Schedule")} color="#5E5C5C" fontFamily="Roboto" fontSize="14px" sx={{ lineHeight: "20px" }} fontWeight={450} align="left" />
                                                    <Checkbox
                                                        checked={checkedAutoDeletionChecked}
                                                        onChange={(e) => setCheckedAutoDeletionChecked(e.target.checked)}
                                                        sx={{
                                                            width: "10px",
                                                            color: 'rgba(9, 30, 66, 0.14)'
                                                        }}
                                                    />
                                                </div>

                                                <FormControl component="fieldset" sx={{ mt: -2 }}>
                                                    <RadioGroup
                                                        row
                                                        name="auto_payout_schedule"
                                                        value={autoPayment}
                                                        onChange={handleChangeAutoPayment}
                                                    >
                                                        {[t("Weekly"), t("Monthly"), t("Yearly")].map((option) => (
                                                            <FormControlLabel
                                                                key={option}
                                                                value={option.toLowerCase()}
                                                                control={<Radio size="small" />}
                                                                label={
                                                                    <Typography sx={{ fontSize: "14px", fontWeight: 450, color: "#172B4D" }}>
                                                                        {t(option)}
                                                                    </Typography>
                                                                }
                                                            />
                                                        ))}
                                                    </RadioGroup>
                                                </FormControl>
                                            </Box>

                                            {options.map(({ key, label, value }) => (
                                                <Box key={key} sx={{ display: "flex", alignItems: "center", mb: 0 }}>
                                                    <TypographyMD variant="paragraph" label={t(label)} color="#5E5C5C" fontFamily="Roboto" fontSize="14px" sx={{ flex: 1, lineHeight: "35px" }} fontWeight={450} align="left" />
                                                    {/* <Typography sx={{ flex: 1 }}>{label}</Typography> */}
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
                                                                left: value ? 30 : 5,
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

                                            <div style={{ marginTop: "10px", marginBottom: "20px" }}>
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

export default SystemSettings;