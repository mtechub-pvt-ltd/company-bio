import React, { useEffect, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Radio,
  RadioGroup,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import back_arrow from "../../Assets/back_arrow.png";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import TypographyMD from "../../components/items/Typography";
import Inputfield from "../../components/items/Inputfield";
import ButtonMD from "../../components/items/ButtonMD";
import { CheckCircleOutline } from "@mui/icons-material";
import SelectField from "../../components/items/Selectfield";
import toast from "react-hot-toast";
import { getApiMessage, showToast } from "../../helper_functions/messageHandler";

function GeneralSettings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState("");

  const validationSchema = yup.object({
    default_language: yup.string().required("Default language is required"),
    // default_currency: yup.string().nullable(),
    // time_zone: yup.string().nullable(),
    // retention_number: yup.string().nullable(),
    // retentation_unit: yup.string().nullable(),
    // backup_schedule: yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      default_language: i18n.language || "en",
      // default_currency: "",
      // time_zone: "auto_detected",
      // retention_number: "0",
      // retentation_unit: "months",
      // backup_schedule: "daily",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      // Show confirmation modal instead of changing language immediately
      setPendingLanguage(values.default_language);
      setConfirmModalOpen(true);
    },
  });

  

  const [initialLoader, setInitialLoader] = useState(true);

  // Language change function
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    formik.setFieldValue("default_language", lang);
toast.success(t("Language changed successfully"));
  };

  // Handle confirmation modal actions
  const handleConfirmLanguageChange = async () => {
    setLoading(true);
    try {
      changeLanguage(pendingLanguage);
      console.log('Default language saved successfully');
      setConfirmModalOpen(false);
    } catch (error) {
      console.error('Error saving default language:', error);
      toast.error(t("Error saving language settings"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLanguageChange = () => {
    setConfirmModalOpen(false);
    setPendingLanguage("");
    // Reset form to current language
    formik.setFieldValue("default_language", i18n.language);
  };

  useEffect(() => {
    // Simulate a 2-second loading time
    const timer = setTimeout(() => {
      setInitialLoader(false);
    }, 3000);

    // Cleanup timeout on unmount
    return () => clearTimeout(timer);
  }, []);

  // Sync formik value when language changes from other components
  useEffect(() => {
    formik.setFieldValue("default_language", i18n.language);
  }, [i18n.language]);

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
                xs: "calc(100vh - 70px)", // extra-small screens (mobile)
                sm: "calc(100vh - 80px)", // small screens (tablets)
                md: "calc(100vh - 85px)", // medium screens (laptops)
                lg: "calc(100vh - 85px)", // large screens (desktops)
                xl: "calc(100vh - 110px)", // extra-large screens (big monitors)
              },
            }}
          >
            {initialLoader ? (
              <div
                style={{
                  height: "50vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress size={20} thickness={3} color="primary" />
              </div>
            ) : (
              <Grid container spacing={0} sx={{ pl: 1, pr: 1 }} pt={0}>
                <Grid xs={12} p={1}>
                  <Box display="flex" gap={1} px={1.5} p={1} bgcolor={'white'} borderRadius={2} py={1.5} border={'2px solid #dcdfe4'}>
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
                        sx={{
                          fontWeight: 400,
                          fontSize: "15px",
                          fontFamily: "Roboto",
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
                          fontSize: "15px",
                          fontFamily: "Roboto",
                          lineHeight: 1.2,
                          m: 0,
                        }}
                        color="#626F86"
                      >
                        {t("General Settings")}
                      </Typography>
                    </Breadcrumbs>
                  </Box>
                </Grid>

                <Grid container spacing={0}>
                  <Grid xs={12} md={12} align="center">
                    <form style={{}} onSubmit={formik.handleSubmit}>
                      <Box
                        sx={{
                          width: { xs: "95%", md: "60%" },
                          p: 1,
                          textAlign: "start",
                          backgroundColor: "white",
                          border: "2px solid rgba(9, 30, 66, 0.14)",
                          borderRadius: "10px",
                        }}
                      >
                        <Grid container spacing={0} p={1}>
                          <Grid xs={12} align="left">
                            <div>
                              <Box
                                sx={{ marginTop: "-20px", marginBottom: "0px" }}
                              >
                                <div
                                  style={{
                                    marginBottom: "5px",
                                    marginTop: "10px",
                                  }}
                                >
                                  <Box
                                    display="flex"
                                    flexDirection="column"
                                    gap={0}
                                  >
                                    <Box width="100%">
                                      <TypographyMD
                                        variant="paragraph"
                                        label={t("Default Language")}
                                        color="#626F86"
                                        fontFamily="Roboto"
                                        fontSize="14px"
                                        sx={{ lineHeight: "35px" }}
                                        fontWeight={450}
                                        align="left"
                                      />
                                      <SelectField
                                        value={formik.values.default_language}
                                        onChangeTerm={(e) => {
                                          const selectedLang = e.target.value;
                                          formik.setFieldValue("default_language", selectedLang);
                                          // Don't change language immediately - wait for save button
                                        }}
                                        options={[
                                          {
                                            value: "en",
                                            label: "English",
                                          },
                                          {
                                            value: "es",
                                            label: "Español",
                                          },
                                        ]}
                                        error={
                                          formik.touched.default_language &&
                                          Boolean(
                                            formik.errors.default_language
                                          )
                                        }
                                        helperText={
                                          formik.touched.default_language &&
                                          formik.errors.default_language
                                        }
                                      />
                                    </Box>

                         

                                  </Box>
                                </div>
                              </Box>
                            </div>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Save button */}
                      <div style={{ marginTop: "20px", marginBottom: "10px" }}>
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
                      </div>
                    </form>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Box>
        }
      />

      {/* Confirmation Modal */}
      <Dialog
        open={confirmModalOpen}
        onClose={handleCancelLanguageChange}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {t("Confirm Language Change")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {t("Are you sure you want to change the language to")} {pendingLanguage === "en" ? "English" : "Español"}? 
            
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <ButtonMD
            onClickTerm={handleCancelLanguageChange}
            title={t("Cancel")}
            variant="outlined"
            borderColor="#dcdfe4"
            backgroundColor="transparent"
            color="#626F86"
            disabled={loading}
          />
          <ButtonMD
            onClickTerm={handleConfirmLanguageChange}
            title={t("Confirm")}
            variant="contained"
            borderColor="orange"
            backgroundColor="orange"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <CheckCircleOutline />}
          />
        </DialogActions>
      </Dialog>
    </>
  );
}

export default GeneralSettings;
