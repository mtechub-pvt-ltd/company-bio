import React from "react";
import { useFormik } from 'formik';
import * as yup from 'yup';
import logo_spanish from "../Assets/logo_spanish.png";
import logo_english from "../Assets/logo_english.png";
import login_background_image from "../Assets/login_background_image.png";
import { useState } from "react";
import InputPasswordfield from "../components/items/InputPasswordfield";
import { Avatar, Box, Button, Grid, IconButton, Menu, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import TypographyMD from "../components/items/Typography";
import { Info, InfoOutlined, KeyboardArrowDown, KeyboardArrowUp, Lock, LockTwoTone } from "@mui/icons-material";
import ButtonMD from "../components/items/ButtonMD";
import CardMD from "../components/items/CardMD";
import { useNavigate, useSearchParams } from "react-router-dom";
import {toast} from "react-hot-toast";
import url from "../url";
import { useEffect } from "react";
import flag_eng from '../Assets/flag_eng.png';
import flag_spanish from '../Assets/flag_spanish.png';
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../store/slices/authSlice";
import { getApiMessage, showToast } from "../helper_functions/messageHandler";


function SetPassword() {

    const { t, i18n } = useTranslation();
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
            console.log('Email from Redux:', email);
        }
    }, []);

    const validationSchema = yup.object({
        password: yup.string()
            .required(t("New password is required"))
            .min(6, t("Password must be at least 6 characters long")),
        confirmpassword: yup.string()
            .oneOf([yup.ref('password'), null], t("Passwords must match"))
            .required(t("Confirm password is required")),
    });
    const formik = useFormik({
        initialValues: {
            password: '',
            confirmpassword: '',
        },
        validationSchema: validationSchema,

        onSubmit: (values, { resetForm }) => {
            console.log(values);

            setLoading(true);
            setTimeout(() => {
                const InsertAPIURL = `${url}super-admin/reset-password`;
                const headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                };
                const Data = {
                    email: retrieveemail,
                    verificationCode: OTP,
                    newPassword: values.password,
                    confirmPassword: values.confirmpassword,
                };

                fetch(InsertAPIURL, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(Data),
                })
                    .then(response => response.json())
                    .then(response => {
                        console.log(response);
                        if (response.error) {
                            setLoading(false);
                             showToast(
        toast.error,
        response,
        t("resetPassword_errorOccurred")
    );
                        } else {
                         showToast(
        toast.success,
        response,
        t("resetPassword_success")
    );

                            // Delay navigation so user sees the toast
                            setTimeout(() => {

                                dispatch(setAuth({
                                    token: null,
                                    tokenExpiry: null,
                                    user: null,
                                    password: values.confirmpassword,
                                }));

                                navigate(`/`);
                                setLoading(false);
                            }, 3000); // Wait 2 seconds before navigating
                        }
                    })
               .catch(error => {
    setLoading(false);

    const msg = error.response?.data
        ? getApiMessage(error.response.data, t("resetPassword_errorOccurred"))
        : (error.message || t("resetPassword_errorOccurred"));

    toast.error(msg);
});
            }, 3000);

        },
    });

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
                          backgroundColor: '#F4F6FA', // adjust overlay color/opacity
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
                    <KeyboardArrowLeft sx={{ cursor: "pointer", color: "#2152CD" }} onClick={() => navigate(`/otpverification`)} />
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
                                        {t('Login')}
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
                                        {t('Create Account')}
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
                    <CardMD
                        content={
                            <>
                                <div style={{ display: "flex", alignContent: "center", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                                    {/* <Box component="img" src={logo_spanish} sx={{ width: "80px" }} /> */}

                                    <div style={{ paddingTop: 20, paddingBottom: 20 }}>
                                        <Stack direction="column" spacing={0}>
                                            <TypographyMD
                                                variant="paragraph"
                                                label={t('Reset Password')}
                                                color="#2C384C"
                                                fontFamily="Roboto"
                                                fontSize="25px"
                                                fontWeight={550}
                                            />

                                            <TypographyMD
                                                variant="paragraph"
                                                label={t("Create new strong password")}
                                                color="#8B8D97"
                                                fontFamily="'Poppins', sans-serif"
                                                fontSize="13px"
                                                marginTop="-8px"
                                                fontWeight={450}
                                                align="center"
                                            />
                                        </Stack>
                                    </div>
                                </div>

                                <form onSubmit={formik.handleSubmit} >
                                    <div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <div style={{ marginBottom: '5px' }}>
                                                <TypographyMD
                                                    variant="paragraph"
                                                    label={
                                                        <span>
                                                            {t("Password")}
                                                            {formik.values.password === '' && (
                                                                <span style={{ color: 'red', marginLeft: 4 }}>*</span>
                                                            )}
                                                        </span>
                                                    }
                                                    color="#626F86"
                                                    fontFamily="'Poppins', sans-serif"
                                                    fontSize="14px"
                                                    fontWeight={450}
                                                    align="left"
                                                />
                                            </div>
                                            <InputPasswordfield
                                                value={formik.values.password}
                                                onChngeterm={(e) => formik.setFieldValue("password", e.target.value)}
                                                error={formik.touched.password && Boolean(formik.errors.password)}
                                                helperText={formik.touched.password && formik.errors.password}
                                                // icon={<Lock />}
                                                type="password"
                                                variant="outlined"
                                            // label="New Password"
                                            // placeholder="New Password"
                                            />
                                        </div>

                                        <div style={{ marginBottom: '15px' }}>
                                            <div style={{ marginBottom: '5px' }}>
                                                <TypographyMD
                                                    variant="paragraph"
                                                    label={
                                                        <span>
                                                            {t("Confirm Password")}
                                                            {formik.values.confirmpassword === '' && (
                                                                <span style={{ color: 'red', marginLeft: 4 }}>*</span>
                                                            )}
                                                        </span>
                                                    }
                                                    color="#626F86"
                                                    fontFamily="'Poppins', sans-serif"
                                                    fontSize="14px"
                                                    fontWeight={450}
                                                    align="left"
                                                />
                                            </div>
                                            <InputPasswordfield
                                                value={formik.values.confirmpassword}
                                                onChngeterm={(e) => formik.setFieldValue("confirmpassword", e.target.value)}
                                                error={formik.touched.confirmpassword && Boolean(formik.errors.confirmpassword)}
                                                helperText={formik.touched.confirmpassword && formik.errors.confirmpassword}
                                                // icon={<Lock />}
                                                type="password"
                                                variant="outlined"
                                            // label="Confirm Password"
                                            // placeholder="Confirm Password"
                                            />
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
                                            <ButtonMD
                                                variant="contained"
                                                title={t("Reset Password")}
                                                width="100%"
                                                type="submit"
                                                borderColor="orange"
                                                backgroundColor="orange"
                                                borderRadius="5px"
                                                disabled={loading}
                                            />
                                        </div>

                                    </div>
                                </form>
                            </>
                        } />
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

export default SetPassword;