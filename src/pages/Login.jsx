import React from "react";

import { useFormik } from "formik";
import * as yup from "yup";
import Inputfield from "../components/items/Inputfield";
import MailOutlineTwoToneIcon from "@mui/icons-material/MailOutlineTwoTone";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import TypographyMD from "../components/items/Typography";
import ButtonMD from "../components/items/ButtonMD";
import { useState } from "react";
import logo_spanish from "../Assets/logo_spanish.png";
import logo_english from "../Assets/logo_english.png";
import login_background_image from "../Assets/login_background_image.png";
import InputPasswordfield from "../components/items/InputPasswordfield";
import {Toaster} from "react-hot-toast"
import {
  Info,
  InfoOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Lock,
  LockTwoTone,
} from "@mui/icons-material";
import CardMD from "../components/items/CardMD";
import { NavLink, useNavigate } from "react-router-dom";
import url from "../url";
import {toast} from "react-hot-toast";
import { useEffect } from "react";
import { setAuth } from "../store/slices/authSlice";

import flag_eng from "../Assets/flag_eng.png";
import flag_spanish from "../Assets/flag_spanish.png";
import { useTranslation } from "react-i18next";

import { useDispatch } from "react-redux";

import CryptoJS from "crypto-js";
import { getApiMessage, showToast } from "../helper_functions/messageHandler";

const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
console.log("SECRET_KEY", SECRET_KEY);
export const encryptPassword = (password) => {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
};

export const decryptPassword = (encrypted) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("Failed to decrypt password", err);
    return "";
  }
};

function Login() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const validationSchema = yup.object({
    email: yup.string().email(t("Invalid email")).required(t("Required Email")),
    password: yup
      .string(t(t("Enter your password")))
      .required(t("Password is required")),
  });
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: (values, { resetForm }) => {

      setLoading(true);

      setTimeout(() => {
        const InsertAPIURL = `${url}super-admin/login`;
        const headers = {
          Accept: "application/json",
          "Content-Type": "application/json",
        };
        const Data = {
          email: values.email,
          password: values.password,
        };


fetch(InsertAPIURL, {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: values.email,
    password: values.password,
  }),
})
  .then(async (res) => {
    const data = await res.json();

    // STEP 2 – HTTP error (401 / 403 / 400)
    if (!res.ok) {
      toast.error(
        getApiMessage(data, t("Invalid email or password"))
      );
      setLoading(false);
      return;
    }

    // STEP 3 – API logical error
    if (data.error === true) {
      toast.error(
        getApiMessage(data, t("Invalid email or password"))
      );
      setLoading(false);
      return;
    }

    // STEP 4 – SUCCESS
    setLoading(false);

    dispatch(
      setAuth({
        token: data?.data?.token,
        tokenExpiry: Date.now() + 86400000,
        user: data?.data?.user || data?.data,
        email:
          data?.data?.user?.email ||
          data?.data?.email ||
          values.email,
      })
    );

    if (values.remember) {
      localStorage.setItem("rememberedEmail", values.email);
      localStorage.setItem(
        "rememberedPassword",
        encryptPassword(values.password)
      );
    } else {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
    }

    navigate("/dashboard");
  })
  .catch(() => {
    // STEP 5 – Network error
    setLoading(false);
    toast.error(t("Unable to connect to server"));
  });

      }, 1000);
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
    localStorage.setItem("lang", lang);

    handleClose(); // Close menu after selection
  };

  const getCurrentFlag = () => {
    if (i18n.language === "en") {
      return {
        src: flag_eng,
        label: t("English") + " ",
      };
    }
    if (i18n.language === "es") {
      return {
        src: flag_spanish,
        label: t("Español"),
      };
    }
    return {
      src: flag_eng,
      label: t("English"),
    }; // Default to English if language is not recognized
  };

  const currentFlag = getCurrentFlag();
  const currentLang = i18n.language;

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedEncryptedPassword =
      localStorage.getItem("rememberedPassword");

    if (rememberedEmail && rememberedEncryptedPassword) {
      const decryptedPassword = decryptPassword(rememberedEncryptedPassword);

      formik.setValues({
        email: rememberedEmail,
        password: decryptedPassword,
        remember: true,
      });
    }
  }, []);

  return (
    <>
      <Box
        component="div"
        sx={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          // backgroundImage: `url(${login_background_image})`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          width: "100%",
          backgroundRepeat: "no-repeat",
          display: "flex",
          flexDirection: "column",
          position: "relative",

          // Overlay using ::before
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#EFF4F8", // adjust overlay color/opacity
            zIndex: 1,
          },

          // Make sure all child content appears on top of overlay
          "& > *": {
            position: "relative",
            zIndex: 2,
          },
        }}
      >
        <Toaster/>
        <Box sx={{ backgroundColor: "white" }}>
          <Grid container spacing={0} sx={{ px: { xs: 2, sm: 6 }, py: { xs: 1, sm: 1.8 } }}>
            <Grid item xs={12} align="left">
              <Box
                display="flex"
                alignItems="center"
                flexWrap="wrap"
                sx={{ 
                  marginLeft: { xs: 1, sm: 3 },
                  gap: { xs: 1, sm: 0 }
                }}
              >
                {/* Logo on the left */}
                {currentLang === "es" ? (
                  <Box
                    component="img"
                    src={logo_spanish}
                    sx={{ 
                      width: { xs: "140px", sm: "185px" }, 
                      flexShrink: 0,
                      maxWidth: "100%"
                    }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={logo_english}
                    sx={{ 
                      width: { xs: "140px", sm: "185px" }, 
                      flexShrink: 0,
                      maxWidth: "100%"
                    }}
                  />
                )}

                <Box
  display="flex"
  alignItems="center"
  gap={1}
  ml="auto"
  sx={{
    mt: { xs: 1, sm: 0 },
    width: "auto",              // ✅ key change
    justifyContent: "flex-end",
    flexWrap: "nowrap",
    flexShrink: 0,              // ✅ prevents collapsing
  }}
>
                  <Box
  sx={{
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F4F5F7",
    borderRadius: "5px",
    px: { xs: 2, sm: 2.5 },     // slightly more padding on mobile
    py: { xs: 0.8, sm: 1 },
    cursor: "pointer",
    minWidth: "110px",          // ✅ force same look as desktop
    justifyContent: "center",
    flexShrink: 0,
  }}
  onClick={handleClick}
>
                  
                    <Typography
  sx={{
    color: "#172B4D",
    fontSize: "13px",
    mr: 0.5,
    fontFamily: "'Poppins', sans-serif",
    whiteSpace: "nowrap",   // ✅ critical
  }}
>
  {currentFlag.label}
</Typography>
                    {anchorEl ? (
                      <KeyboardArrowUp
                        sx={{ color: "#6B778C", fontSize: { xs: "18px", sm: "20px" } }}
                      />
                    ) : (
                      <KeyboardArrowDown
                        sx={{ color: "#6B778C", fontSize: { xs: "18px", sm: "20px" } }}
                      />
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
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            px: { xs: 2, sm: 0 },
            py: { xs: 1, sm: 0 }
          }}
        >
          <CardMD
            content={
              <>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Box sx={{ pt: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 1.5 } }}>
                    <Stack direction="column" spacing={0}>
                      <TypographyMD
                        variant="paragraph"
                        label={t("Welcome back!")}
                        color="#2C384C"
                        fontFamily="'Poppins', sans-serif !important"
                        fontSize={{ xs: "20px", sm: "30px" }}
                        fontWeight={500}
                        sx={{ 
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      />

                      <TypographyMD
                        variant="paragraph"
                        label={t("Login to your account")}
                        color="#8B8D97"
                        fontFamily="'Poppins', sans-serif"
                        fontSize={{ xs: "13px", sm: "16px" }}
                        fontWeight={400}
                        align="center"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      />
                    </Stack>
                  </Box>
                </Box>

                <form onSubmit={formik.handleSubmit}>
                  <Box sx={{ px: { xs: 1, sm: 1 } }}>
                    <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
                      <div>
                        <TypographyMD
                          variant="paragraph"
                          label={
                            <span>
                              {t("Email")}
                              {formik.values.email === "" && (
                                <span style={{ color: "red", marginLeft: 4 }}>
                                  *
                                </span>
                              )}
                            </span>
                          }
                          color="#626f86"
                          fontFamily="'Poppins', sans-serif"
                          fontSize={{ xs: "14px", sm: "16px" }}
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
                        error={
                          formik.touched.email && Boolean(formik.errors.email)
                        }
                        helperText={formik.touched.email && formik.errors.email}
                        type="text"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
                      <div>
                        <TypographyMD
                          variant="paragraph"
                          label={
                            <span>
                              {t("Password")}
                              {formik.values.password === "" && (
                                <span style={{ color: "red", marginLeft: 4, marginBottom: "0" }}>
                                  *
                                </span>
                              )}
                            </span>
                          }
                          color="#626F86"
                          fontFamily="'Poppins', sans-serif"
                          fontSize={{ xs: "14px", sm: "16px" }}
                          fontWeight={400}
                          marginBottom={0}
                        />
                      </div>
                      <InputPasswordfield
                        value={formik.values.password}
                        onChngeterm={(e) => {
                          formik.setFieldValue("password", e.target.value);
                          formik.setFieldTouched("password", true, false);
                        }}
                        error={
                          formik.touched.password &&
                          Boolean(formik.errors.password)
                        }
                        helperText={
                          formik.touched.password && formik.errors.password
                        }
                        type="password"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
                   
<Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: { xs: "center", sm: "space-between" },
    flexWrap: "wrap",
    width: "100%",
    textAlign: "center",
  }}
>
  {/* Remember Me */}
  <Box
    sx={{
      width: { xs: "100%", sm: "auto" },
      display: "flex",
      justifyContent: { xs: "center", sm: "flex-start" },
    }}
  >
    <FormControlLabel
      control={
        <Checkbox
          name="remember"
          color="primary"
          checked={formik.values.remember}
          onChange={formik.handleChange}
          sx={{
            padding: 0,
            '& .MuiSvgIcon-root': { fontSize: 20 },
          }}
        />
      }
      label={
        <Typography
          sx={{
            fontFamily: "'Poppins', sans-serif",
          
            fontWeight: 450,
            color: "#626F86",
            whiteSpace: "nowrap",
                     fontSize: { xs: "13px", sm: "15px" },

          }}
        >
          {t("Remember Me")}
        </Typography>
      }
      sx={{ margin: 0 }}
    />
  </Box>

  {/* Forgot password */}
  <Box
    sx={{
      width: { xs: "100%", sm: "auto" },
      display: "flex",
      justifyContent: { xs: "center", sm: "flex-end" },
      mt: { xs: 0.5, sm: 0 },
    }}
  >
    <NavLink
      to="/emailverification"
      style={{
        textDecoration: "none",
        color: "rgb(0, 110, 194)",
         fontSize: { xs: "13px", sm: "15px" },
        fontFamily: "'Poppins', sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {t("Forgot password?")}
    </NavLink>
  </Box>
</Box>


                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignContent: "center",
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: { xs: "14px", sm: "16px" },
                        lineHeight: { xs: "24px", sm: "28px" },
                        fontWeight: 400,
                        mt: { xs: 2, sm: 1 }
                      }}
                    >
                      <ButtonMD
                        variant="contained"
                        title={t("Login")}
                        width="100%"
                        type="submit"
                        borderColor="orange"
                        backgroundColor="orange"
                        borderRadius="5px"
                        disabled={loading}
                        sx={{
                          fontSize: { xs: "14px", sm: "16px" },
                          py: { xs: 1.2, sm: 1.5 },
                          minHeight: { xs: "44px", sm: "48px" }
                        }}
                      />
                    </Box>
                  </Box>{" "}
                </form>
              </>
            }
          />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ 
          mt: 1, 
          width: { xs: "280px", sm: "400px" }, 
          marginLeft: { xs: "5px", sm: "15px" },
          "& .MuiPaper-root": {
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
          }
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {["en", "es"].map((lang) => (
          <MenuItem
            key={lang}
            selected={i18n.language === lang}
            onClick={() => changeLanguage(lang)}
            sx={{
              py: { xs: 1.5, sm: 1 },
              px: { xs: 2, sm: 2 },
              "&:hover": {
                backgroundColor: "#F4F5F7"
              }
            }}
          >
            {/* <Avatar
              variant="square"
              src={lang === "en" ? flag_eng : flag_spanish}
              sx={{ 
                width: { xs: 24, sm: 26 }, 
                height: { xs: 12, sm: 14 }, 
                marginRight: { xs: 1.5, sm: 1 } 
              }}
            /> */}
            <Typography 
              sx={{ 
                fontSize: { xs: "14px", sm: "13px" },
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 450
              }}
            >
              {lang === "en" ? t("English") : t("Español")}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

    
    </>
  );
}

export default Login;
