






import React from "react"

import { useFormik } from 'formik';
import * as yup from 'yup'
import { useState } from "react";
import CardMD from "../components/items/CardMD";
import { Avatar, Box, Button, Grid, IconButton, Menu, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import logo_spanish from "../Assets/logo_spanish.png";
import logo_english from "../Assets/logo_english.png";
import login_background_image from "../Assets/login_background_image.png";
import TypographyMD from "../components/items/Typography";
import Inputfield from "../components/items/Inputfield";
import ButtonMD from "../components/items/ButtonMD";
import { InfoOutlined, KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowUp, MailOutlineTwoTone } from "@mui/icons-material";
import url from "../url";
import { useNavigate } from "react-router-dom";
import {toast} from 'react-hot-toast';
import flag_eng from '../Assets/flag_eng.png';
import flag_spanish from '../Assets/flag_spanish.png';
import { useTranslation } from "react-i18next";
import { getApiMessage, showToast } from "../helper_functions/messageHandler";

import { setOTPInfo } from "../store/slices/authSlice";
import { useDispatch } from "react-redux";

function Emailverification() {

    const { t, i18n } = useTranslation();
    const dispatch = useDispatch()
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
   

   

    const validationSchema = yup.object({
        email: yup
            .string()
            .email(t("Invalid email"))
            .required(t("Required Email")),
    });
    const formik = useFormik({
        initialValues: {
            email: ''
        },
        validationSchema: validationSchema,
        validateOnChange: true,
        validateOnBlur: true,

        onSubmit: (values, { resetForm }) => {
           

            setLoading(true);
            setTimeout(() => {
                var InsertAPIURL = `${url}super-admin/forgot-password`
                var headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                };
                var Data = {
                    "email": values.email
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
        t("forgotPassword_errorOccurred")
    );                            // navigate(`/otpverification?otp=${response.data.debugCode}`);
                        } else {
                                    showToast(
        toast.success,
        response,
        t("forgotPassword_success")
    );
                            // ✅ Store OTP & email in Redux
                            dispatch(setOTPInfo({
                                otp: response.data.debugCode,

                                

                                email: values.email,
                            }));
                            navigate(`/otpverification`);
                            // navigate(`/setpassword?otp=${response.data.debugCode}`);
                            setLoading(false);
                        }
                    }
                    )
                 .catch(error => {
    setLoading(false);

    const message = error.response?.data
        ? getApiMessage(error.response.data, t("forgotPassword_errorOccurred"))
        : (error.message || t("forgotPassword_errorOccurred"));

    toast.error(message);
});
            }, 1000)

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
                label: 'Español'
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
  sx={{
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start", // ✅ FIX
    overflow: "hidden",
    position: "relative",
      backgroundColor: '#F4F6FA',
         
   
  }}
>
           <Box sx={{
    backgroundColor: 'white',
    p: 1,
    width: '100%',

}}>
    <Grid container spacing={0} px={2}>
                        <Grid item xs={12} align="left">
                            <Box
                                display="flex"
                alignItems="center"
                flexWrap="wrap" // enable wrapping on small screens
                marginLeft={3}
              >
                {/* Logo on the left */}
                {currentLang === "es" ? (
                  <Box
                    component="img"
                    src={logo_spanish}
                    sx={{ width: "185px", flexShrink: 0 }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={logo_english}
                    sx={{ width: "185px", flexShrink: 0 }}
                  />
                )}

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
                                             display: "flex",
                      alignItems: "center",
                      backgroundColor: "#F4F5F7",
                      borderRadius: "5px",
                      px: 2.5,
                      py: 1,
                      cursor: "pointer",
                      width: "auto",
                      marginRight:"8px",
                      fontFamily:"'Poppins', sans-serif"
                                        }}
                                        onClick={handleClick}
                                    >
                                       
                                        <Typography sx={{ color: '#172B4D', fontSize: '13px', mr: 0.5 }}>
                                            {currentFlag.label}
                                        </Typography>
                                        {anchorEl ? (
                                            <KeyboardArrowUp sx={{ color: '#6B778C', fontSize: '20px' }} />
                                        ) : (
                                            <KeyboardArrowDown sx={{ color: '#6B778C', fontSize: '20px' }} />
                                        )}
                                    </Box>

                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

             
                <Box
  sx={{
    flexGrow: 1,
    display: "flex",
    justifyContent: { xs: "center", sm: "center" }, // ✅ key
    alignItems: "center",                            // ✅ key
    pt: { xs: 2, sm: 0 },
        
  }}
>
  <Box
  sx={{
    width: "100%",
  
    // maxWidth: 420,
    "& > div": {
      minHeight: "auto !important",
      paddingBottom: "16px !important",

    },
  }}
>
                    <CardMD
  contentSx={{
    minHeight: "auto",
    paddingBottom: 2,
    
  }}
                        content={
                            <>
                                <div style={{ display: "flex",
                                     
                                       alignContent: "center", alignItems: "center",
                                        justifyContent: "center", flexDirection: "column" }}>
                                    {/* <Box component="img" src={logo_spanish} sx={{ width: "80px" }} /> */}

                                    <div style={{ paddingTop: 20, paddingBottom:5 }}>
                                        <Stack direction="column" spacing={0}>
                                            <TypographyMD
                                                variant="paragraph"
                                                label={t("Forget Password")}
                                                color="rgb(44, 56, 76)"
                                                fontFamily="'Poppins', sans-serif"
                                                fontSize="30px"
                                                fontWeight={500}
                                                align="center"
                                            />

                                            <TypographyMD
                                                variant="paragraph"
                                                label={t('Verify email to reset your password')}
                                                color="#8B8D97"
                                                fontFamily="'Poppins', sans-serif"
                                                fontSize="16px"
                                                
                                                fontWeight={400}
                                                align="center"
                                            />
                                        </Stack>
                                    </div>
                                </div>

                                <form onSubmit={formik.handleSubmit} >
                                    <div>
                                        <div style={{ marginBottom: '5px' }}>
                                            <div style={{ marginBottom: '5px' }}>
                                                <TypographyMD
                                                    variant="paragraph"
                                                    label={
                                                        <span>
                                                            {t('Email')}
                                                            {formik.values.email === '' && (
                                                                <span style={{ color: 'red', marginLeft: 4 }}>*</span>
                                                            )}
                                                        </span>
                                                    }
                                                    color="#626F86"
                                                    fontFamily="'Poppins', sans-serif"
                                                      
                                                    fontSize="16px"
                                                    fontWeight={400}
                                                    align="left"
                                                />
                                            </div>
                                            <Inputfield
                                                autoFocus={false}
                                                value={formik.values.email}
                                                onChngeterm={(e) => {
                                                    formik.setFieldValue("email", e.target.value);
                                                    formik.setFieldTouched("email", true, false);
                                                }}
                                                error={formik.touched.email && Boolean(formik.errors.email)}
                                                helperText={formik.touched.email && formik.errors.email}
                                                // icon={<MailOutlineTwoTone sx={{ fontSize: "20px", color: "#666666" }} />}
                                                type="text"
                                                variant="outlined"
                                                label=""
                                            // placeholder="Email Address"
                                            />
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
                                            <ButtonMD
                                                variant="contained"
                                                title={t('Submit')}
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
                        </Box>
                        </Box>
               
            </Box>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} sx={{ mt: 1 }}>
                {['en', 'es'].map(lang => (
                    <MenuItem key={lang} selected={i18n.language === lang} onClick={() => changeLanguage(lang)}>
                        {/* <Avatar
                            variant="square"
                            src={lang === 'en' ? flag_eng : flag_spanish}
                            sx={{ width: 26, height: 16, marginRight: 1 }}
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

export default Emailverification;