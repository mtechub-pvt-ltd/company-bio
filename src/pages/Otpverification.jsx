import React, { useRef } from "react";
import { toast } from "react-hot-toast";
import OTPInput from "otp-input-react";
import logo_spanish from "../Assets/logo_spanish.png";
import logo_english from "../Assets/logo_english.png";
import email_verification from "../Assets/email_verification.png";
import login_background_image from "../Assets/login_background_image.png";
import { useState } from "react";
import CardMD from "../components/items/CardMD";
import TypographyMD from "../components/items/Typography";
import { Avatar, Box, Button, Card, CardContent, Grid, IconButton, Menu, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
import ButtonMD from "../components/items/ButtonMD";
import url from "../url";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { InfoOutlined, KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowUp, MailOutlineTwoTone } from "@mui/icons-material";
import "../styles/global.css";

import flag_eng from '../Assets/flag_eng.png';
import flag_spanish from '../Assets/flag_spanish.png';
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setOTPInfo } from "../store/slices/authSlice";
import { getApiMessage, showToast } from "../helper_functions/messageHandler";

function OtpVerification() {

    const dispatch = useDispatch();
   
    const [searchParams] = useSearchParams();

    const OTP = searchParams.get('otp');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
   

    const [retrieveemail, setRetrieveemail] = useState('');
    const email = useSelector(state => state.auth.email);

    useEffect(() => {
        if (email) {
            setRetrieveemail(email);
           
        }
    }, []);

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [counter, setCounter] = useState(59);
    const [isCounting, setIsCounting] = useState(true);

    useEffect(() => {
        let timer;
        if (isCounting && counter > 0) {
            timer = setTimeout(() => setCounter((prev) => prev - 1), 1000);
        } else if (counter === 0) {
            setIsCounting(false);
        }
        return () => clearTimeout(timer);
    }, [counter, isCounting]);

    const handleChange = (index, value) => {
        // Handle paste of full OTP (e.g., "1234")
        if (value.length > 1) {
            const digits = value.slice(0, 6).split("");
            const updatedOtp = [...otp];
            for (let i = 0; i < digits.length; i++) {
                if (/^\d$/.test(digits[i])) {
                    updatedOtp[i] = digits[i];
                }
            }
            setOtp(updatedOtp);
            const nextInput = document.getElementById(`otp-${digits.length - 1}`);
            if (nextInput) nextInput.focus();
            return;
        }

        if (/^\d?$/.test(value)) {
            const updatedOtp = [...otp];
            updatedOtp[index] = value;
            setOtp(updatedOtp);
            // Auto focus next input
            if (value && index < 5) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                if (nextInput) nextInput.focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").slice(0, 6);

        if (!/^\d{1,6}$/.test(paste)) return; // accept 1 to 6 digits only

        const updatedOtp = [...otp];
        for (let i = 0; i < paste.length; i++) {
            updatedOtp[i] = paste[i];
        }
        setOtp(updatedOtp);

        const nextInput = document.getElementById(`otp-${paste.length - 1}`);
        if (nextInput) nextInput.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleResendClick = () => {
        // Trigger your resend OTP API call here
       

        // setLoading(true);
        setTimeout(() => {
            var InsertAPIURL = `${url}super-admin/forgot-password`
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };
            var Data = {
                email: retrieveemail
            };
            fetch(InsertAPIURL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(Data),
            })
                .then(response => response.json())
                .then(response => {
                   console.log(response)
                    if (response.error) {
                        setLoading(false);
    showToast(
        toast.error,
        response,
        t("otp_resend_error")
    );                        // navigate(`/otpverification?otp=${response.data.debugCode}`);
                    } else {
 showToast(
        toast.success,
        response,
        t("otp_resend_success")
    );
                        // ✅ Store OTP & email in Redux
                        dispatch(setOTPInfo({
                            otp: response.data.debugCode,
                            email: retrieveemail,
                        }));

                        setOtp(["", "", "", "", "", ""]);
                        setCounter(59);
                        setIsCounting(true);

                        setLoading(false);
                    }
                }
                )
                .catch(error => {
                    setLoading(false);
                    alert(error);
                });
        }, 1000)

    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join("");
        if (otpCode.length < 6) {
            toast.error(t("Please enter a valid 6-digit OTP code"));
            return;
        }

        setLoading(true);
        setTimeout(() => {
            var InsertAPIURL = `${url}super-admin/verify-otp`
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };
            var Data = {
                email: retrieveemail,
                verificationCode: otp.join("")
            };
            fetch(InsertAPIURL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(Data),
            })
                .then(response => response.json())
                .then(response => {
                    
                    if (response.error) {
                        setLoading(false);


                         showToast(
        toast.error,
        response,
        t("otp_invalid")
    );
                    } else {
                         showToast(
        toast.success,
        response,
        t("otp_verified")
    );

                        // Delay navigation so user sees the toast
                        setTimeout(() => {

                            // ✅ Store OTP & email in Redux
                            dispatch(setOTPInfo({
                                otp: otp.join(""),
                                email: retrieveemail,
                            }));
                            navigate(`/setpassword?otp=${otp.join("")}`);
                            setLoading(false);
                        }, 3000);
                    }
                }
                )
               .catch(error => {
    setLoading(false);

    const message = error.response?.data
        ? getApiMessage(error.response.data, t("otp_error"))
        : (error.message || t("otp_error"));

    toast.error(message);
});
        }, 3000)
    };

    const { t, i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('lang', lang);
        handleClose(); // Close menu after selection
    };

    const getCurrentFlag = () => {
        if (i18n.language === 'en') {
            return {
                src: flag_eng,
                label: 'English'
            };
        }
        if (i18n.language === 'es') {
            return {
                src: flag_spanish,
                label: 'Spanish'
            };
        }
        return {
            src: flag_eng,
            label: 'English'
        }; // Default to English if language is not recognized
    };

    const currentFlag = getCurrentFlag();
    const currentLang = i18n.language;

    return (
        <>
            <Box
                component="div"
                sx={{
                    minHeight: "100dvh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    overflow: 'hidden',
                    // backgroundImage: `url(${login_background_image})`,
                    backgroundSize: 'cover',
                    // backgroundImage: `url(${login_background_image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    width: '100%',
                    backgroundRepeat: 'no-repeat',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',

                    // Overlay using ::before
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#F4F6FA',
                        zIndex: 1,
                    },

                    // Make sure all child content appears on top of overlay
                    '& > *': {
                        position: 'relative',
                        zIndex: 2,
                    },
                }}
            >
                {/* <Box pt={2} pl={2} pr={2}>
                    <KeyboardArrowLeft sx={{ cursor: "pointer", color: "#2152CD" }} onClick={() => navigate(`/`)} />
                </Box> */}
                <Box sx={{ backgroundColor: 'white' }}>
                    <Grid container spacing={0} px={6} p={1}>
                        <Grid item xs={12} align="left">
                            <Box
                                display="flex"
                                alignItems="center"
                                flexWrap="wrap"  // enable wrapping on small screens
                            >
                                {/* Logo on the left */}
                                {currentLang === "es" ?
                                    <Box component="img" src={logo_spanish} sx={{ width: '240px', flexShrink: 0 }} />
                                    :
                                    <Box component="img" src={logo_english} sx={{ width: '240px', flexShrink: 0 }} />
                                }

                                {/* Right-side section */}
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                    ml="auto"
                                    sx={{
                                        mt: { xs: 2, sm: 0 },         // add top margin on small screens
                                        width: { xs: '100%', sm: 'auto' }, // full width on small screens
                                        justifyContent: { xs: 'flex-end', sm: 'flex-end' }, // spread out on mobile
                                        flexWrap: 'wrap',            // allow inner wrap if needed
                                    }}
                                >
                                    <Button
                                        onClick={() => navigate(`/`)}
                                        sx={{
                                            boxShadow: "none",
                                            bgcolor: '#006EC2',
                                            borderRadius: "5px",
                                            height: "35px",
                                            color: '#fff',
                                            textTransform: 'none',
                                            px: 2,
                                            mr: 1,
                                            '&:hover': {
                                                bgcolor: '#006EC2',
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        {t("Login")}
                                    </Button>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            backgroundColor: '#F4F5F7',
                                            borderRadius: '5px',
                                            px: 2.5,
                                            py: 1,
                                            cursor: 'pointer',
                                            width: 'auto',
                                            marginRight: '8px',
                                            fontFamily: "'Poppins', sans-serif",
                                            fontWeight: '450',
                                        }}
                                        onClick={handleClick}
                                    >
                                        {/* <Avatar
                                            variant="square"
                                            src={currentFlag.src}
                                            sx={{ width: 24, height: 16, mr: 1 }}
                                        /> */}
                                        <Typography sx={{ color: '#172B4D', fontSize: '13px', mr: 0.5, fontFamily: "'Poppins', sans-serif" }}>
                                            {currentFlag.label}
                                        </Typography>
                                        {anchorEl ? (
                                            <KeyboardArrowUp sx={{ color: '#6B778C', fontSize: '20px' }} />
                                        ) : (
                                            <KeyboardArrowDown sx={{ color: '#6B778C', fontSize: '20px' }} />
                                        )}
                                    </Box>

                                    {/* <Button
                                        variant="contained"
                                        sx={{
                                            boxShadow: "none",
                                            bgcolor: '#006EC2',
                                            borderRadius: "5px",
                                            height: "35 px",
                                            color: '#fff',
                                            textTransform: 'none',
                                            width: 'fit-content',
                                            '&:hover': {
                                                bgcolor: '#006EC2',
                                                boxShadow: "none",
                                            },
                                        }}
                                    >
                                        {t("Create Account")}
                                    </Button> */}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <div style={{
                    flexGrow: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                }}>
                    <Card
                        sx={{
                            boxShadow: "none",
                            borderRadius: "20px",
                            width: { xs: "90%", md: "35%", lg: "35%" },
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            p: 3,
                        }}
                    >
                        <CardContent sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            width: "100%",
                        }}
                        >
                            {/* Title */}
                            <TypographyMD
                                variant="paragraph"
                                label={t("Enter OTP Code")}
                                color="#2C384C"
                                fontFamily="Roboto"
                                fontSize="16px"
                                fontWeight={650}
                                marginBottom={1}
                                align="center"
                            />

                            {/* Description */}
                            <TypographyMD
                                variant="paragraph"
                                label={t("Enter the 6-digit code sent to your email to verify and reset your password.")}
                                color="#8B8D97"
                                fontFamily="'Poppins', sans-serif"
                                fontSize="13px"
                                fontWeight={450}
                                marginBottom={3}
                                align="center"
                            />

                            {/* OTP Inputs */}
                            <Box display="flex" gap={2} mb={3}>
                                {otp.map((digit, idx) => (
                                    <TextField
                                        key={idx}
                                        id={`otp-${idx}`}
                                        value={digit}
                                        onChange={(e) => handleChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        onPaste={handlePaste}
                                        inputProps={{
                                            maxLength: 1,
                                            style: {
                                                textAlign: "center",
                                                fontSize: "18px",
                                                padding: "10px",
                                            },
                                        }}
                                        sx={{
                                            width: "50px",
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: "2px",
                                                '& fieldset': {
                                                    border: '2px solid rgba(9, 30, 66, 0.14)',
                                                },
                                                '&:hover fieldset': {
                                                    border: '2px solid rgba(9, 30, 66, 0.14)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    border: '2px solid #006EC2',
                                                },
                                            },
                                        }}
                                    />
                                ))}
                            </Box>

                            {/* Countdown or Resend */}
                            {isCounting ? (
                                <TypographyMD
                                    variant="paragraph"
                                    label={<>{t("didntReceiveCode")} <span style={{ color: "#006EC2", fontWeight: "bold", }}>00:{String(counter).padStart(2, "0")}</span></>}
                                    color="#8B8D97"
                                    fontFamily="'Poppins', sans-serif"
                                    fontSize="13px"
                                    fontWeight={450}
                                    marginBottom={3}
                                    align="left"
                                />
                            ) : (
                                <Typography
                                    variant="body2"
                                    color="#8B8D97"
                                    fontSize="13px"
                                    textAlign="left"
                                    mb={4}
                                >
                                    {t("Didn’t receive code?")} <span onClick={handleResendClick} style={{ color: "#006EC2", fontWeight: "bold", cursor: "pointer", textDecoration: "underLine" }}>{t("Resend Code")}</span>
                                </Typography>
                            )}

                            {/* Verify OTP Button */}
                            <ButtonMD
                                variant="contained"
                                title={t('Verify OTP')}
                                width="100%"
                                type="submit"
                                borderColor="orange"
                                backgroundColor="orange"
                                borderRadius="5px"
                                disabled={loading}
                                onClickTerm={handleVerifyOtp}
                            />
                        </CardContent>
                    </Card>
                </div>
            </Box>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} sx={{ mt: 1, width: 400, marginLeft: "15px" }}>
                {['en', 'es'].map(lang => (
                    <MenuItem key={lang} selected={i18n.language === lang} onClick={() => changeLanguage(lang)}>
                        {/* <Avatar
                            variant="square"
                            src={lang === 'en' ? flag_eng : flag_spanish}
                            sx={{ width: 26, height: 14, marginRight: 1 }}
                        /> */}
                        <Typography mt={0.5} sx={{ fontSize: '13px' }}>
                            {lang === 'en' ? "English" : "Español"}
                        </Typography>
                    </MenuItem>
                ))}
            </Menu>

            </>
    )
}

export default OtpVerification;