
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import { getApiMessage, showToast } from "../../helper_functions/messageHandler";
import profile_update from "../../Assets/profile_update.png";
import * as yup from "yup";
import {
  Box,
  Grid,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  Search,
  Notifications,
  KeyboardArrowDown,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import TypographyMD from "../items/Typography";
import ButtonMD from "../items/ButtonMD";
import ModalAdd from "../items/Modal";
import ModalConfirmation from "../items/ModalConfirmation";
import { clearAuth, setAuth } from "../../store/slices/authSlice";
import dummy from "../../Assets/dummy.png";
import logout_icon from "../../Assets/logout_icon.png";
import img from "../../Assets/logout.png";
import change_password_icon from "../../Assets/change_password_icon.png";
import toast from "react-hot-toast";
import url from "../../url";

function Topbar({ array }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const imgurl = user?.profile_image || dummy;
  const isActive = location.pathname === "/notifications";

const goToNotifications = () => {
  navigate("/notifications", {
    state: { fromTopbar: true }
  });
};
  // Fallback: If user data is not in Redux, fetch it
  useEffect(() => {
    const fetchUserData = async () => {
      if ((!user || !user.name || !user.email) && token) {
        setUserLoading(true);
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
        } finally {
          setUserLoading(false);
        }
      }
    };
    fetchUserData();
  }, [user, token, dispatch]);

  // State
  const [anchorEltop, setAnchorEltop] = useState(null);
  const [openmodallogout, setOpenmodallogout] = useState(false);
  const [openmodalpassword, setOpenmodalpassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oldpassword, setOldpassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const openmenu = Boolean(anchorEltop);

  // Formik validation
  // const validationSchema = yup.object({
  //   newpassword: yup
  //     .string()
  //     .required(t("New password is required"))
  //     .min(6, t("Password must be at least 6 characters long")),
  //   confirmpassword: yup
  //     .string()
  //     .oneOf([yup.ref("newpassword"), null], t("Passwords must match"))
  //     .required(t("Confirm password is required")),
  // });
const validationSchema = yup.object({
  newpassword: yup
    .string()
    .required(t("newPasswordRequired"))
    .min(6, t("passwordMinLength"))
    .test(
      "not-same-as-old",
      t("newPasswordMustBeDifferent"),
      function (value) {
        if (!value || !oldpassword) return true;
        return value !== oldpassword;
      }
    ),
  confirmpassword: yup
    .string()
    .oneOf([yup.ref("newpassword"), null], t("passwordsMustMatch"))
    .required(t("confirmPasswordRequired")),
});

  const formik = useFormik({
    initialValues: {
      oldpassword: "",
      newpassword: "",
      confirmpassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!oldpassword) {
        toast.error(t("Current password is required"));
        return;
      }
      const API_URL = `${url}/super-admin/change-password`;
      const authToken = token || localStorage.getItem("token");
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authToken ? `Bearer ${authToken}` : "",
      };
      const payload = {
        currentPassword: oldpassword,
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
        const response = await res.json();
        if (res.ok && !response.error) {
          setTimeout(() => {
            setLoading(false);
            resetForm();
            setOldpassword("");
            setOpenmodalpassword(false);
            toast.success(t("Password changed successfully"));
          }, 1000);
        } else {
          setLoading(false);
          toast.error(response.message || t("Failed to update password"));
        }
      } catch (err) {
        setLoading(false);
  
  const message = err.response?.data
    ? getApiMessage(err.response.data, t("Something went wrong! Please try again."))
    : (err.message || t("Something went wrong! Please try again."));

  toast.error(message);
      }
    },
  });

  // Handlers
  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      dispatch(clearAuth());
      navigate("/");
      setOpenmodallogout(false);
      setLoading(false);
    }, 1000);
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const handleClosePasswordModal = () => {
    formik.resetForm();
    setOldpassword("");
    setShowPassword(false);
    setOpenmodalpassword(false);
  };


  const [showOldPassword, setShowOldPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const toggleShowOldPassword = () => setShowOldPassword(prev => !prev);
const toggleShowNewPassword = () => setShowNewPassword(prev => !prev);
const toggleShowConfirmPassword = () => setShowConfirmPassword(prev => !prev);

  // Highlight search matches
  const highlightMatch = (text, term) => {
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const startIndex = lowerText.indexOf(lowerTerm);
    if (startIndex === -1) return text;
    return (
      <>
        {text.substring(0, startIndex)}
        <span style={{ backgroundColor: "#FF144D29" }}>
          {text.substring(startIndex, startIndex + term.length)}
        </span>
        {text.substring(startIndex + term.length)}
      </>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <Grid container alignItems="center" sx={{ backgroundColor: "#fff" }}>
        <Grid item xs={12} md={12}>
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={{ xs: 0.5, sm: 1, md: 1 }}
            px={{ xs: 1.5, sm: 2, md: 3 }}
            py={{ xs: 1.5, sm: 1, md: 1 }}
          >
            {/* Search Icon */}
            {/* <IconButton 
              onClick={() => {}}
              sx={{ 
                padding: { xs: 0.75, sm: 1 },
                minWidth: { xs: 40, sm: 44 }
              }}
            >
              <Search sx={{ fontSize: { xs: 20, sm: 22, md: 25 } }} />
            </IconButton> */}

            {/* Notifications */}
            <IconButton 
              onClick={goToNotifications}
              sx={{ 
                padding: { xs: 0.75, sm: 1 },
                minWidth: { xs: 40, sm: 44 }
              }}
            >
              <Notifications
                sx={{
                  fontSize: { xs: 20, sm: 22, md: 25 },
                  color: isActive ? "#006EC2" : "#626F86",
                }}
              />
            </IconButton>

            {/* Profile dropdown */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 0.5, sm: 1 }}
              onClick={(e) => setAnchorEltop(e.currentTarget)}
              sx={{ 
                cursor: "pointer",
                padding: { xs: 0.5, sm: 1 },
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)"
                }
              }}
            >
              {/* Avatar */}
              <Box sx={{ position: "relative" }}>
                <img
                  src={imgurl}
                  alt="Profile"
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "none",
                    borderRadius: "50%",
                    objectFit: "cover",
                    opacity: userLoading ? 0.6 : 1,
                  }}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.src = dummy;
                  }}
                />
                {userLoading && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "50%",
                    }}
                  >
                    <Box
                      sx={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid #f3f3f3",
                        borderTop: "2px solid #006EC2",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Name and Email - hide on mobile */}
              <Box
                sx={{
                  display: { xs: "none", sm: "none", md: "flex" },
                  flexDirection: "column",
                }}
              >
                <TypographyMD
                  variant="paragraph"
                  label={userLoading ? "Loading..." : (user?.name || user?.full_name || "User")}
                  color="#363333"
                  fontSize="15px"
                  fontWeight={500}
                />
                <TypographyMD
                  variant="paragraph"
                  label={userLoading ? "Loading..." : (user?.email || "user@example.com")}
                  color="#939393"
                  fontSize="12px"
                  fontWeight={400}
                />
              </Box>

              {/* Arrow */}
              <KeyboardArrowDown
                sx={{ 
                  color: openmenu ? "#2152CD" : "gray", 
                  fontSize: { xs: 16, sm: 18 }
                }}
              />
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      {/* Dropdown menu */}
      <Menu
        anchorEl={anchorEltop}
        open={openmenu}
        onClose={() => setAnchorEltop(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 0.5,
            minWidth: { xs: 160, sm: 180, md: 200 },
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <MenuItem 
  //          onClick={() => {
  //   setAnchorEltop(null);      // ✅ CLOSE MENU
  //   setOpenmodalpassword(true);
  // }}
  onClick={() =>
navigate("/account_settings", {
state: { fromTopbar: true },
})
}
          sx={{ 
            padding: { xs: 1.5, sm: 1.5 },
            gap: 1.5
          }}
        >
          <img src={change_password_icon} alt="Change" width={20} />
          <TypographyMD label={t("Change Password")} />
        </MenuItem>
          <MenuItem 
           onClick={() => navigate("/account_settings")}
          sx={{ 
            padding: { xs: 1.5, sm: 1.5 },
            gap: 1.5
          }}
        >
          <img src={profile_update} alt="Change" width={20} />
          <TypographyMD label={t("profileUpdate")} />
        </MenuItem>
        <MenuItem 
          onClick={() => setOpenmodallogout(true)}
          sx={{ 
            padding: { xs: 1.5, sm: 1.5 },
            gap: 1.5
          }}
        >
          <img src={logout_icon} alt="Logout" width={20} />
          <TypographyMD label={t("Logout")} />
        </MenuItem>
      </Menu>

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

      {/* Password Modal */}
      <ModalAdd
        open={openmodalpassword}
        onClose={handleClosePasswordModal}
        title={t("Update Password")}
        data={
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2} p={2}>
              <TextField
                label={t("Old Password")}
                type={showPassword ? "text" : "password"}
                value={oldpassword}
                onChange={(e) => setOldpassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={toggleShowPassword}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
           
              <TextField
  label={t("New Password")}
  type={showNewPassword ? "text" : "password"}
  value={formik.values.newpassword}
  onChange={(e) => formik.setFieldValue("newpassword", e.target.value)}
  error={formik.touched.newpassword && Boolean(formik.errors.newpassword)}
  helperText={formik.touched.newpassword && formik.errors.newpassword}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton onClick={toggleShowNewPassword} size="small">
          {showNewPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
  fullWidth
/>
<TextField
  label={t("Confirm Password")}
  type={showConfirmPassword ? "text" : "password"}
  value={formik.values.confirmpassword}
  onChange={(e) => formik.setFieldValue("confirmpassword", e.target.value)}
  error={formik.touched.confirmpassword && Boolean(formik.errors.confirmpassword)}
  helperText={formik.touched.confirmpassword && formik.errors.confirmpassword}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton onClick={toggleShowConfirmPassword} size="small">
          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
  fullWidth
/>

              <ButtonMD
                variant="contained"
                title={t("Update")}
                type="submit"
                disabled={loading}
              />
            </Stack>
          </form>
        }
      />
    </>
  );
}

export default Topbar;
