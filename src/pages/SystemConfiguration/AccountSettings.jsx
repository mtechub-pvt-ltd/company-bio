import React, { useEffect, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Typography,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import {
  Check,
  Close,
  CheckCircleOutline,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import dummy from "../../Assets/dummy.png";
import * as Yup from "yup";
import { useFormik } from "formik";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { getApiMessage, showToast } from "../../helper_functions/messageHandler";
// or correct path if different

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputPasswordfield from "../../components/items/InputPasswordfield"; // adjust path
import {  useLocation } from "react-router-dom";
import back_arrow from "../../Assets/back_arrow.png";
import { useNavigate } from "react-router-dom";

import TypographyMD from "../../components/items/Typography";
import Inputfield from "../../components/items/Inputfield";
import ButtonMD from "../../components/items/ButtonMD";
import { useTranslation } from "react-i18next";
import SelectField from "../../components/items/Selectfield";
import url from "../../url";
import { useSelector, useDispatch } from "react-redux";
import { setAuth } from "../../store/slices/authSlice";
import Countryfield from "../../components/items/Countryfield";
import { toast } from "react-hot-toast";
const AccountSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
const location=useLocation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { user, token } = auth;

  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoader, setInitialLoader] = useState(true);
  const [image, setImage] = useState("");
  const [options, setOptions] = useState([
    { key: "face_login", label: t("Face Login"), value: true },
    { key: "passcode", label: t("Passcode"), value: false },
    {
      key: "two_factor_auth",
      label: t("Two-Factor Authentication"),
      value: true,
    },
  ]);

  const handleToggle = (key) =>
    setOptions((prev) =>
      prev.map((opt) => (opt.key === key ? { ...opt, value: !opt.value } : opt))
    );

  const [sessionDuration, setSessionDuration] = useState({
    number: "0",
    unit: "mins",
  });
  const handleNumberChange = (e) =>
    setSessionDuration((prev) => ({ ...prev, number: e.target.value }));
  const handleUnitChange = (e) =>
    setSessionDuration((prev) => ({ ...prev, unit: e.target.value }));

  const [fallbackMethod, setFallbackMethod] = useState("otp via email");
  const handleChangeFallbackMethod = (e) => setFallbackMethod(e.target.value);

  const [passwordExpiryPeriod, setPasswordExpiryPeriod] = useState("never");
  const handleChangPasswordExpiryPeriod = (e) =>
    setPasswordExpiryPeriod(e.target.value);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "admin@example.com",
      // phone_number: "",
      profile_image: "",
    },
    validate: (values) => {
      const errors = {};
      if (!values.name) errors.name = t("name_required");
   
    
      return errors;
    },
    onSubmit: async (values) =>{
  setLoading(true);

  try {
    const body = {
      name: values.name,
      // phone_number: values.phone_number,
      profile_image: values.profile_image,
    };

    const res = await fetch(`${url}super-admin/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("UPDATE PROFILE RESPONSE:", data);

    // ---- CORRECTION FOR UPDATE API ----
    if (!data.error && data.data?.user) {

      const user = data.data.user;   // FIXED

      // update form
      formik.setValues({
        name: user.name,
        email: user.email,
        // phone_number: user.phone_number,
        profile_image: user.profile_image,
      });
console.log("Formik phone_number set to:", user.phone_number);
      // Set new image
      setImage(user.profile_image);

      // Update Redux
      dispatch(
        setAuth({
          token: auth.token,
          tokenExpiry: auth.tokenExpiry,
          user: user,
          email: user.email,
        })
      );

      toast.success("Profile updated successfully!");
    } 
    else {
      toast.error("Failed to update profile");
    }

  } catch (err) {
    console.error(err);
    toast.error("Something went wrong! Try again.");
  } finally {
    setLoading(false);
  }
}
  });

  // State for password visibility toggle
  const validationSchema = Yup.object({
  oldpassword: Yup.string()
    .required(t("currentPasswordRequired")),

  newpassword: Yup.string()
    .required(t("newPasswordRequired"))
    .min(6, t("passwordMinLength"))
    .notOneOf(
      [Yup.ref("oldpassword")],
      t("newPasswordMustBeDifferent")
    ),

  confirmpassword: Yup.string()
    .oneOf([Yup.ref("newpassword"), null], t("passwordsMustMatch"))
    .required(t("confirmPasswordRequired")),
});

  const formikpas = useFormik({
    initialValues: {
      oldpassword: "",
      newpassword: "",
      confirmpassword: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const API_URL = `${url}super-admin/change-password`;
      const authToken = token || localStorage.getItem("token");

      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authToken ? `Bearer ${authToken}` : "",
      };

      const payload = {
        currentPassword: values.oldpassword,
        newPassword: values.newpassword,
        confirmPassword: values.confirmpassword,
      };

      try {
        setLoading(true);
        const res = await fetch(API_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        const responseText = await res.text();
        let response = {};
        try {
          response = JSON.parse(responseText);
        } catch {}
        console.log("response", response);
        console.log("HTTP Status:", res.status);
        console.log("response.error:", response.error);
        console.log("!response.error:", !response.error);

        if (res.ok && !response.error) {
          console.log("About to show success toast");
          // toast.success("Password changed successfully");
             showToast(
        toast.success,
        response,
        t("Password changed successfully")
      );
          console.log("Success toast called");
          resetForm();
          console.log("Form reset called");
        } else {
          console.log("About to show error toast");
    showToast(
        toast.error,
        response,
        t("Failed to update password")
      );        }
      } catch (err) {
    const message = err.response?.data
      ? getApiMessage(
          err.response.data,
          t("Something went wrong! Please try again.")
        )
      : (err.message || t("Something went wrong! Please try again."));

    toast.error(message);
  } finally {
        setLoading(false);
      }
    },
  });


  useEffect(() => {
if (location?.state?.fromTopbar === true) {
setTabIndex(1); // Change Password tab
}
}, [location]);

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (e) => e.preventDefault();

  // Fallback: If user data is not in Redux, fetch it
  useEffect(() => {
    const fetchUserData = async () => {
      if ((!user || !user.name || !user.email) && token) {
        try {
          const res = await fetch(`${url}super-admin/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!data.error && data.data?.user) {
            // Update Redux state with fetched user data
            dispatch(setAuth({
              token: token,
              tokenExpiry: auth.tokenExpiry,
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
  }, [user, token, dispatch, auth.tokenExpiry]);

// GET super admin profile (Corrected)
useEffect(() => {
  const fetchProfile = async () => {
    if (!auth.token) return;

    try {
      const res = await fetch(`${url}super-admin/profile`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const data = await res.json();
      console.log("GET PROFILE RESPONSE:", data);

      // ---- CORRECTION START ----
      if (!data.error && data.data?.super_admins?.length > 0) {

        const user = data.data.super_admins[0]; // correct access

        formik.setValues({
          name: user.name || "",
          email: user.email || "",
          // phone_number: user.phone_number || "",
          profile_image: user.profile_image || "",
        });

        // set permanent image
        setImage(user.profile_image || "");

        // update redux
        dispatch(setAuth({
          token: auth.token,
          tokenExpiry: auth.tokenExpiry,
          user: user,
          email: user.email,
        }));
      }
      // ---- CORRECTION END ----

    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setInitialLoader(false);
    }
  };

  fetchProfile();
}, [auth.token, dispatch]);


const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  console.log("📸 Selected File:", file);

  // Show temporary preview
  const previewURL = URL.createObjectURL(file);
  console.log("🔍 TEMP PREVIEW URL:", previewURL);
  setImage(previewURL);

  const formData = new FormData();
  formData.append("image", file);

  console.log("⬆️ Uploading image to:", `${url}/upload/image`);

  try {
    const res = await fetch(`${url}/upload/image`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("📥 UPLOAD RESPONSE:", data);

    if (!data.error && data.data?.url) {
      const uploadedURL = data.data.url;
      console.log("✅ FINAL IMAGE URL FROM SERVER:", uploadedURL);

      // Save permanent URL
      formik.setFieldValue("profile_image", uploadedURL);

      // Update immediate preview to permanent URL
      setImage(uploadedURL);

      console.log("🎉 Image saved successfully and displayed.");
    } else {
      console.log("❌ Upload failed:", data);
      alert("Image upload failed.");
      setImage("");
    }
  } catch (err) {
    console.error("🔥 Upload error:", err);
    alert("Image upload failed.");
    setImage("");
  }
};


  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    // Test toast when switching tabs
    if (newValue === 1) {
      // toast.success("Test toast - Change Password tab selected");
    }
  };

  if (initialLoader) {
    return (
      <Box
        sx={{
          height: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={20} thickness={3} color="primary" />
      </Box>
    );
  }

  return (
    <SidebarNew
      componentTitle="Admin"
      componentData={
        <Box
          sx={{
            width: "100%",
            overflowX: "hidden",
            height: "calc(100vh - 70px)",
          }}
        >
          <Grid container spacing={0} sx={{ pl: 1, pr: 1 }} pt={0}>
            <Grid xs={12} p={1}>
              <Box
                display="flex"
                gap={1}
                px={1.5}
                p={1}
                bgcolor={"white"}
                borderRadius={2}
                py={1.5}
                border={"2px solid #dcdfe4"}
              >
                <Box
                  onClick={() => navigate(-1)}
                  component="img"
                  src={back_arrow}
                  sx={{ cursor: "pointer", width: "30px" }}
                />
                <Breadcrumbs
                  separator="/"
                  aria-label="breadcrumb"
                  sx={{ pt: 0.5, lineHeight: 1, m: 0 }}
                >
                  <Typography
                    sx={{ fontWeight: 400, fontSize: "15px", lineHeight: 1.2 }}
                    color="#626F86"
                  >
                    {t("Settings")}
                  </Typography>
                  <Typography
                    sx={{ fontWeight: 400, fontSize: "15px", lineHeight: 1.2 }}
                    color="#626F86"
                  >
                    {t("Account Settings")}
                  </Typography>
                </Breadcrumbs>
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: { xs: "95%", md: "60%" },
                m: { xs: 1, md: 0 },
                textAlign: "start",
                backgroundColor: "white",
                border: "2px solid rgba(9, 30, 66, 0.14)",
                borderRadius: "10px",
              }}
            >
              <Box
                sx={{
                  borderBottom: 1,
                  mb: 2,
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "flex-start",
                }}
              >
                <Tabs
                  value={tabIndex}
                  onChange={handleTabChange}
                  centered
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{
                    "& .MuiTab-root": {
                      fontWeight: 600,
                      fontSize: "13px",
                      textTransform: "none",
                    },
                    "& .Mui-selected": { color: "#1976d2" },
                    "& .MuiTabs-indicator": { backgroundColor: "#1976d2" },
                  }}
                >
                  <Tab label={t("Edit Profile")} />
                  <Tab label={t("Change Password")} />
                </Tabs>
              </Box>

              {tabIndex === 0 ? (
                <Box align="center" sx={{ pl: 1, pr: 1 }} pt={0}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-start"
                    gap={3}
                    p={3}
                  >
                    <Box
                      position="relative"
                      width={120}
                      height={120}
                      onClick={() =>
                        document.getElementById("profile-file-input").click()
                      }
                    >
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "2px solid #dcdfe4",
                          cursor: "pointer",
                        }}
                      >
                        <img
                          src={image || dummy}
                          alt="Profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            border: "none",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.currentTarget.src = dummy;
                          }}
                        />
                      </Box>
                      {!image && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            bgcolor: "rgba(0,0,0,0.4)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "50%",
                            opacity: 0,
                            transition: "opacity 0.3s",
                            "&:hover": { opacity: 1 },
                          }}
                        >
                          <AddIcon sx={{ color: "#fff", fontSize: 30 }} />
                        </Box>
                      )}
                      {image && (
                        <IconButton
                          onClick={() => {
                            setImage("");
                            formik.setFieldValue("profile_image", "");
                          }}
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            bgcolor: "rgba(0,0,0,0.6)",
                            color: "red",
                            width: 32,
                            height: 32,
                            zIndex: 10,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      )}
                    </Box>

                    <Box display="flex" flexDirection="column" gap={1}>
                      <Button
                        variant="contained"
                        onClick={() =>
                          document.getElementById("profile-file-input").click()
                        }
                      >
                        {image ? t("Replace") : t("Upload")}
                      </Button>
                      <Typography fontSize="14px">
{t("file_size_requirement")}                      </Typography>
                    </Box>

                    <input
                      type="file"
                      accept="image/*"
                      id="profile-file-input"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                  </Box>

                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={0} p={2}>
                      <Grid xs={12} align="left">
                        <Box display="flex" flexDirection="column" gap={2}>
                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={t("Name")}
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="14px"
                              sx={{ lineHeight: "35px" }}
                              fontWeight={450}
                              align="left"
                            />
                            <Inputfield
                              value={formik.values.name}
                              onChngeterm={(e) =>
                                formik.setFieldValue("name", e.target.value)
                              }
                              error={Boolean(formik.errors.name)}
                              helperText={formik.errors.name}
                              type="text"
                              variant="outlined"
                            />
                          </Box>

                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={t("Email")}
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="14px"
                              sx={{ lineHeight: "35px" }}
                              fontWeight={450}
                              align="left"
                            />
                            <Inputfield
                              value={formik.values.email}
                              disabled
                              type="text"
                              variant="outlined"
                            />
                          </Box>

                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ marginTop: "10px", marginBottom: "20px" }}>
                      <ButtonMD
                        variant="contained"
                        title={t("Save")}
                        startIcon={<CheckCircleOutline />}
                        width="fit-content"
                        type="submit"
                        borderColor="orange"
                        backgroundColor="orange"
                        borderRadius="5px"
                        disabled={loading}
                      />
                    </Box>
                  </form>
                </Box>
              ) : (
                <form
                  style={{ pl: 3, pr: 3, backgroundColor: "#fff", margin: 13 }}
                  onSubmit={formikpas.handleSubmit}
                >
                  <Grid container spacing={0} sx={{ p: 2 }}>
                    <Grid xs={12} align="left">
                      <Box
                        sx={{ marginTop: "10px", marginBottom: "10px" }}
                        width={{ xs: "97%", md: "100%" }}
                      >
                        {/* Old Password */}
                        <div style={{ marginBottom: "15px" }}>
                          <TypographyMD
                            variant="paragraph"
                            label={
                              <span>
                                {t("Old Password")}
                                {formikpas.values.oldpassword === "" && (
                                  <span style={{ color: "red", marginLeft: 4 }}>
                                    *
                                  </span>
                                )}
                              </span>
                            }
                            color="#626F86"
                            fontSize="14px"
                            fontWeight={450}
                            align="left"
                          />

                          <InputPasswordfield
                            name="oldpassword"
                            value={formikpas.values.oldpassword}
                            onChngeterm={(e) =>
                              formikpas.setFieldValue(
                                "oldpassword",
                                e.target.value
                              )
                            }
                            error={
                              formikpas.touched.oldpassword &&
                              Boolean(formikpas.errors.oldpassword)
                            }
                            helperText={
                              formikpas.touched.oldpassword &&
                              formikpas.errors.oldpassword
                            }
                            type="password"
                            variant="outlined"
                          />
                        </div>

                        {/* New Password */}
                        <div style={{ marginBottom: "15px" }}>
                          <TypographyMD
                            variant="paragraph"
                            label={
                              <span>
                                {t("New Password")}
                                {formikpas.values.newpassword === "" && (
                                  <span style={{ color: "red", marginLeft: 4 }}>
                                    *
                                  </span>
                                )}
                              </span>
                            }
                            color="#626F86"
                            fontSize="14px"
                            fontWeight={450}
                            align="left"
                          />
                          <InputPasswordfield
                            name="newpassword"
                            value={formikpas.values.newpassword}
                            onChngeterm={(e) =>
                              formikpas.setFieldValue(
                                "newpassword",
                                e.target.value
                              )
                            }
                            error={
                              formikpas.touched.newpassword &&
                              Boolean(formikpas.errors.newpassword)
                            }
                            helperText={
                              formikpas.touched.newpassword &&
                              formikpas.errors.newpassword
                            }
                            type="password"
                          />
                        </div>

                        {/* Confirm Password */}
                        <div style={{ marginBottom: "15px" }}>
                          <TypographyMD
                            variant="paragraph"
                            label={
                              <span>
                                {t("Confirm Password")}
                                {formikpas.values.confirmpassword === "" && (
                                  <span style={{ color: "red", marginLeft: 4 }}>
                                    *
                                  </span>
                                )}
                              </span>
                            }
                            color="#626F86"
                            fontSize="14px"
                            fontWeight={450}
                            align="left"
                          />
                          <InputPasswordfield
                            name="confirmpassword"
                            value={formikpas.values.confirmpassword}
                            onChngeterm={(e) =>
                              formikpas.setFieldValue(
                                "confirmpassword",
                                e.target.value
                              )
                            }
                            error={
                              formikpas.touched.confirmpassword &&
                              Boolean(formikpas.errors.confirmpassword)
                            }
                            helperText={
                              formikpas.touched.confirmpassword &&
                              formikpas.errors.confirmpassword
                            }
                            type="password"
                          />
                        </div>

                        {/* Submit Button */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignContent: "center",
                          }}
                        >
                          <ButtonMD
                            variant="contained"
                            title={t("Update")}
                            width="40%"
                            type="submit"
                            borderColor="orange"
                            backgroundColor="orange"
                            borderRadius="10px"
                            disabled={loading}
                          />
                        </div>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Box>
          </Box>
        </Box>
      }
    />
  );
};

export default AccountSettings;
