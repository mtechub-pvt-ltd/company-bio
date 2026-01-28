import React, { useEffect, useState } from "react";
import SidebarNew from "../components/sidebar/SidebarNew";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TypographyMD from "../components/items/Typography";
import Inputfield from "../components/items/Inputfield";
import ButtonMD from "../components/items/ButtonMD";
import { CheckCircleOutline, ContentCopy } from "@mui/icons-material";
import Countryfield from "../components/items/Countryfield";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Editor } from "@tinymce/tinymce-react";
import i18n from "../multiLingual";
// import "../styles/reactQuill.css"

function ContentManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("contact_us"); // default tab

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const tabs = [
    { id: "contact_us", label: t("Contact Us Page") },
    { id: "terms_and_conditions", label: t("Terms & Conditions") },
    { id: "privacy_policy", label: t("Privacy Policy") },
  ];

  const validationSchema = yup.object({
    name: yup.string().nullable(),
    email: yup.string().nullable(),
    phone: yup.string().nullable(),
    button_text: yup.string().nullable(),
    button_color: yup.string().nullable(),
    message: yup.string().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      name: null,
      email: null,
      phone: null,
      button_text: null,
      button_color: null,
      message: null,
    },
    validationSchema: validationSchema,
    onSubmit: (values, { resetForm }) => {
   
      resetForm();
    },
  });

  // terms and conditions

  const [termsCondition, setTermsCondition] = useState("");

  const [privacyPolicy, setPrivacyPolicy] = useState("");

  //   const [termsCondition, setTermsCondition] = useState(`
  //   <h2><strong>User Agreement</strong></h2>
  //   <p>By using BiometricPRO, you agree to abide by our terms, including responsible usage of the system and respecting company policies.</p><br/>

  //   <h2><strong>Platform Usage</strong></h2><br/>
  //   <p>You are authorized to access the platform for work-related tracking and reporting only.</p>
  //   <ul>
  //     <li>Do not impersonate other users or misuse biometric login</li>
  //     <li>Do not attempt to interfere with system operations</li>
  //     <li>Ensure data entered is accurate and up to date</li>
  //   </ul><br/>

  //   <h2><strong>Account Responsibility</strong></h2>
  //   <p>Users are responsible for keeping their login credentials secure.</p><br/>
  //   <ul>
  //     <li>Keep your password confidential</li>
  //     <li>Report any unauthorized activity immediately</li>
  //     <li>Use the platform only for its intended business purposes</li>
  //   </ul><br/>

  //   <h2><strong>Service Availability</strong></h2>
  //   <p>We aim to provide uninterrupted service but do not guarantee uptime. Scheduled maintenance or unexpected outages may occur.</p><br/>

  //   <h2><strong>Termination</strong></h2>
  //   <p>Accounts can be suspended or terminated for violating terms or misuse of services.</p><br/>

  //   <h2><strong>Contact</strong></h2>
  //   <p>For support, please contact us at: <a href="mailto:support@biometricpro.com">support@biometricpro.com</a></p>
  // `);

  const englishTermsHTML = `

 <h2><strong>User Agreement</strong></h2>
  <p>By using BiometricPRO, you agree to abide by our terms, including responsible usage of the system and respecting company policies.</p><br/>

  <h2><strong>Platform Usage</strong></h2><br/>
  <p>You are authorized to access the platform for work-related tracking and reporting only.</p> 
  <ul>
    <li>Do not impersonate other users or misuse biometric login</li>
    <li>Do not attempt to interfere with system operations</li>
    <li>Ensure data entered is accurate and up to date</li>
  </ul><br/>

  <h2><strong>Account Responsibility</strong></h2>
  <p>Users are responsible for keeping their login credentials secure.</p><br/>
  <ul>
    <li>Keep your password confidential</li>
    <li>Report any unauthorized activity immediately</li>
    <li>Use the platform only for its intended business purposes</li>
  </ul><br/>

  <h2><strong>Service Availability</strong></h2>
  <p>We aim to provide uninterrupted service but do not guarantee uptime. Scheduled maintenance or unexpected outages may occur.</p><br/>

  <h2><strong>Termination</strong></h2>
  <p>Accounts can be suspended or terminated for violating terms or misuse of services.</p><br/>

  <h2><strong>Contact</strong></h2>
  <p>For support, please contact us at: <a href="mailto:support@biometricpro.com">support@biometricpro.com</a></p>
  
`;

  const spanishTermsHTML = `
  <h2><strong>Acuerdo del Usuario</strong></h2>
  <p>Al utilizar BiométricoPRO, aceptas cumplir con nuestros términos, incluido el uso responsable del sistema y el respeto a las políticas de la empresa.</p><br/>

  <h2><strong>Uso de la Plataforma</strong></h2><br/>
  <p>Estás autorizado a acceder a la plataforma solo para el seguimiento y la generación de informes relacionados con el trabajo.</p>
  <ul>
    <li>No suplantes a otros usuarios ni abuses del inicio de sesión biométrico</li>
    <li>No intentes interferir con las operaciones del sistema</li>
    <li>Asegúrate de que los datos ingresados sean precisos y estén actualizados</li>
  </ul><br/>

  <h2><strong>Responsabilidad de la Cuenta</strong></h2>
  <p>Los usuarios son responsables de mantener seguras sus credenciales de inicio de sesión.</p><br/>
  <ul>
    <li>Mantén tu contraseña confidencial</li>
    <li>Informa inmediatamente cualquier actividad no autorizada</li>
    <li>Utiliza la plataforma solo para fines comerciales previstos</li>
  </ul><br/>

  <h2><strong>Disponibilidad del Servicio</strong></h2>
  <p>Nos esforzamos por proporcionar un servicio ininterrumpido, pero no garantizamos el tiempo de actividad. Pueden ocurrir mantenimientos programados o interrupciones inesperadas.</p><br/>

  <h2><strong>Terminación</strong></h2>
  <p>Las cuentas pueden suspenderse o eliminarse por violar los términos o mal uso de los servicios.</p><br/>

  <h2><strong>Contacto</strong></h2>
  <p>Para obtener soporte, contáctanos en: <a href="mailto:support@biometricpro.com">support@biometricpro.com</a></p>
`;

  const englishPrivacyHTML = `
<h2><strong>Your Privacy Matters</strong></h2>
  <p>At BiometricPRO, we prioritize your privacy and are committed to protecting your personal and biometric data. When you use our platform, we collect only the information necessary to provide secure and efficient services.</p><br/>

  <h2><strong>Data We Collect</strong></h2><br/>
  <p>We collect data to verify identity, improve performance, and support core functionality.</p> 
  <ul>
    <li>Full name, email, and contact details</li>
    <li>Biometric data (e.g., facial recognition scans)</li>
    <li>Device and location information (e.g., GPS data)</li>
    <li>Usage statistics and log files</li>
  </ul><br/>

  <h2><strong>How We Use Your Data</strong></h2>
  <p>Your data helps us deliver personalized and secure time tracking and team management.</p><br/>
  <ul>
    <li>To verify your identity for attendance and access</li>
    <li>To comply with legal or regulatory requirements</li>
    <li>To generate reports and improve system performance</li>
    <li>To provide customer support and service updates</li>
  </ul><br/>

  <h2><strong>Data Security</strong></h2>
  <p>We use modern encryption standards and limit access to authorized personnel only. Your biometric data is never shared without consent.</p><br/>

  <h2><strong>Your Rights</strong></h2>
  <p>You can Requested access, correction, or deletion of your data by contacting us at. <a href="mailto:privacy@biometricpro.com">privacy@biometricpro.com</a></p><br/>

  `;

  const spanishPrivacyHTML = `
  <h2><strong>Tu Privacidad Importa</strong></h2>
  <p>En BiométricoPRO, priorizamos tu privacidad y estamos comprometidos con la protección de tus datos personales y biométricos. Al utilizar nuestra plataforma, solo recopilamos la información necesaria para brindar servicios seguros y eficientes.</p><br/>

  <h2><strong>Datos que Recopilamos</strong></h2><br/>
  <p>Recopilamos datos para verificar la identidad, mejorar el rendimiento y respaldar la funcionalidad principal.</p>
  <ul>
    <li>Nombre completo, correo electrónico y detalles de contacto</li>
    <li>Datos biométricos (por ejemplo, escaneos de reconocimiento facial)</li>
    <li>Información del dispositivo y ubicación (por ejemplo, datos GPS)</li>
    <li>Estadísticas de uso y archivos de registro</li>
  </ul><br/>

  <h2><strong>Cómo Usamos Tus Datos</strong></h2>
  <p>Tus datos nos ayudan a brindar un seguimiento de tiempo personalizado y seguro y gestión de equipos.</p><br/>
  <ul>
    <li>Verificar tu identidad para asistencia y acceso</li>
    <li>Cumplir con requisitos legales o regulatorios</li>
    <li>Generar informes y mejorar el rendimiento del sistema</li>
    <li>Brindar soporte al cliente y actualizaciones de servicios</li>
  </ul><br/>

  <h2><strong>Seguridad de los Datos</strong></h2>
  <p>Utilizamos estándares modernos de cifrado y limitamos el acceso solo al personal autorizado. Tus datos biométricos nunca se comparten sin consentimiento.</p><br/>

  <h2><strong>Tus Derechos</strong></h2>
  <p>Puedes solicitar acceso, corrección o eliminación de tus datos contactándonos a: <a href="mailto:privacy@biometricpro.com">privacy@biometricpro.com</a></p><br/>
`;

  useEffect(() => {
    setTermsCondition(
      i18n.language === "es" ? spanishTermsHTML : englishTermsHTML
    );
    setPrivacyPolicy(
      i18n.language === "es" ? spanishPrivacyHTML : englishPrivacyHTML
    );
  }, [i18n.language]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6] }, { font: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["bold", "italic", "underline"],
      [{ color: [] }], // Color picker added here
      [{ align: [] }],
      ["link"],
      [{ indent: "-1" }, { indent: "+1" }],
      ["clean"],
    ],
  };

  // privacy policy

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
                <Grid xs={12} pb={1}>
                  <Card
                    sx={{
                      width: "100%",
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid rgba(9, 30, 66, 0.14)",
                      boxShadow: "none",
                      p: 1,
                    }}
                  >
                    <CardContent
                      sx={{ p: 0, "&:last-child": { paddingBottom: 0 } }}
                    >
                      <Box
                        display="flex"
                        flexWrap={isSmallScreen ? "wrap" : "nowrap"}
                        alignItems="center"
                        gap={isSmallScreen ? 1 : 2}
                        mb={0}
                      >
                        {tabs.map(({ id, label }) => (
                          <Box
                            key={id}
                            onClick={() => setActiveTab(id)}
                            sx={{
                              padding: isSmallScreen ? "6px 8px" : "5px 5px",
                              cursor: "pointer",
                              color: activeTab === id ? "#006EC2" : "#44546F",
                              borderBottom:
                                activeTab === id
                                  ? "3px solid #006EC2"
                                  : "3px solid transparent",
                              borderRadius: 0,
                              transition: "border-bottom 0.3s ease",
                              whiteSpace: "nowrap",
                              userSelect: "none",
                            }}
                          >
                            <Typography
                              variant="body2"
                              component="span"
                              fontWeight={550}
                              fontSize="12px"
                            >
                              {label}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} md={12} align="center">
                  {activeTab === "contact_us" ? (
                    <>
                      <form style={{}} onSubmit={formik.handleSubmit}>
                        <Box
                          sx={{
                            width: { xs: "100%", md: "60%" },
                            p: 1,
                            textAlign: "start",
                            backgroundColor: "white",
                            border: "2px solid rgba(9, 30, 66, 0.14)",
                            borderRadius: "10px",
                          }}
                        >
                          <TypographyMD
                            variant="paragraph"
                            label={t("Contact Us Form")}
                            color="#424242"
                            marginLeft={1}
                            fontFamily="Roboto"
                            fontSize="17px"

                            align="left"
                          />

                          <Grid container spacing={0} p={1}>
                            <Grid xs={12} align="left">
                              <div>
                                <Box
                                  sx={{
                                    marginTop: "-20px",
                                    marginBottom: "0px",
                                  }}
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
                                          label={t("Name")}
                                          color="#626F86"
                                          fontFamily="Roboto"
                                          fontSize="14px"
                                          sx={{ lineHeight: "35px" }}
                                          fontWeight={450}
                                          align="left"
                                        />
                                        <Inputfield
                                          autoFocus={false}
                                          value={formik.values.name}
                                          onChngeterm={(e) =>
                                            formik.setFieldValue(
                                              "name",
                                              e.target.value
                                            )
                                          }
                                          error={
                                            formik.touched.name &&
                                            Boolean(formik.errors.name)
                                          }
                                          helperText={
                                            formik.touched.name &&
                                            formik.errors.name
                                          }
                                          type="text"
                                          variant="outlined"
                                          placeholder={t(
                                            "Enter your good name"
                                          )}
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
                                          autoFocus={false}
                                          value={formik.values.email}
                                          onChngeterm={(e) =>
                                            formik.setFieldValue(
                                              "email",
                                              e.target.value
                                            )
                                          }
                                          error={
                                            formik.touched.email &&
                                            Boolean(formik.errors.email)
                                          }
                                          helperText={
                                            formik.touched.email &&
                                            formik.errors.email
                                          }
                                          type="text"
                                          variant="outlined"
                                          placeholder={t("Enter your email")}
                                        />
                                      </Box>

                                      <Box width="100%">
                                        <TypographyMD
                                          variant="paragraph"
                                          label={t("Phone No.")}
                                          color="#626F86"
                                          fontFamily="Roboto"
                                          fontSize="14px"
                                          sx={{ lineHeight: "35px" }}
                                          fontWeight={450}
                                          align="left"
                                        />
                                        <Countryfield
                                          value={formik.values.phone}
                                          onChangeTerm={(phone) =>
                                            formik.setFieldValue("phone", phone)
                                          }
                                          // onBlur={() => formik.setFieldTouched("phone", true)}
                                          error={
                                            formik.touched.phone &&
                                            Boolean(formik.errors.phone)
                                          }
                                          helperText={
                                            formik.touched.phone &&
                                            formik.errors.phone
                                          }
                                        />
                                      </Box>

                                      <Box mt={1} width="100%">
                                        <TypographyMD
                                          variant="paragraph"
                                          label={t("Button Text")}
                                          color="#626F86"
                                          fontFamily="Roboto"
                                          fontSize="14px"
                                          sx={{ lineHeight: "35px" }}
                                          fontWeight={450}
                                          align="left"
                                        />
                                        <Box display="flex" alignItems="center">
                                          <TextField
                                            variant="outlined"
                                            value={formik.values.button_text}
                                            onChange={(e) =>
                                              formik.setFieldValue(
                                                "button_text",
                                                e.target.value
                                              )
                                            }
                                            placeholder={t("Send")}
                                            error={
                                              formik.touched.button_text &&
                                              Boolean(formik.errors.button_text)
                                            }
                                            helperText={
                                              formik.touched.button_text &&
                                              formik.errors.button_text
                                            }
                                            size="small"
                                            sx={{
                                              width: "100%",
                                              "& .MuiOutlinedInput-root": {
                                                borderRadius: "2px",
                                                "& fieldset": {
                                                  border:
                                                    "2px solid rgba(9, 30, 66, 0.14)",
                                                },
                                                "&:hover fieldset": {
                                                  border:
                                                    "2px solid rgba(9, 30, 66, 0.14)",
                                                },
                                                "&.Mui-focused fieldset": {
                                                  border: "2px solid #006EC2", // <- blue border when focused
                                                },
                                                "& input::placeholder": {
                                                  color: "#172B4D",
                                                  fontWeight: 450,
                                                  opacity: 1,
                                                },
                                              },
                                            }}
                                            InputProps={{
                                              style: {
                                                color: "#000000",
                                                fontSize: {
                                                  xs: "16px",
                                                  sm: "15px",
                                                  md: "13px",
                                                },
                                                borderRadius: "2px",
                                                backgroundColor: "#fff",
                                              },
                                              endAdornment: (
                                                <InputAdornment position="end">
                                                  <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    gap={1}
                                                  >
                                                    {formik.values
                                                      .button_color ? (
                                                      <div
                                                        style={{
                                                          borderRadius: "5px",
                                                          backgroundColor:
                                                            "rgba(9, 30, 66, 0.06)",
                                                        }}
                                                      >
                                                        <Typography
                                                          variant="body2"
                                                          sx={{
                                                            px: 2,
                                                            py: 0.5,
                                                            color: "#172B4D",
                                                            fontWeight: 500,
                                                            fontSize: "13px",
                                                            fontFamily:
                                                              "Roboto",
                                                            minWidth: "60px",
                                                          }}
                                                        >
                                                          {
                                                            formik.values
                                                              .button_color
                                                          }
                                                          <ContentCopy
                                                            sx={{
                                                              cursor: "pointer",
                                                              ml: 1,
                                                              width: "15px",
                                                            }}
                                                          />
                                                        </Typography>
                                                      </div>
                                                    ) : null}
                                                    <input
                                                      type="color"
                                                      value={
                                                        formik.values
                                                          .button_color
                                                      }
                                                      onChange={(e) =>
                                                        formik.setFieldValue(
                                                          "button_color",
                                                          e.target.value
                                                        )
                                                      }
                                                      style={{
                                                        width: 28,
                                                        height: 28,
                                                        border: "none",
                                                        background: "none",
                                                        padding: 0,
                                                        cursor: "pointer",
                                                      }}
                                                    />
                                                  </Box>
                                                </InputAdornment>
                                              ),
                                            }}
                                          />
                                        </Box>
                                      </Box>

                                      <Box mt={1} width="100%">
                                        <TypographyMD
                                          variant="paragraph"
                                          label={t("Message")}
                                          color="#626F86"
                                          fontFamily="Roboto"
                                          fontSize="14px"
                                          sx={{ lineHeight: "35px" }}
                                          fontWeight={450}
                                          align="left"
                                        />
                                        <Inputfield
                                          autoFocus={false}
                                          value={formik.values.message}
                                          onChngeterm={(e) =>
                                            formik.setFieldValue(
                                              "message",
                                              e.target.value
                                            )
                                          }
                                          error={
                                            formik.touched.message &&
                                            Boolean(formik.errors.message)
                                          }
                                          helperText={
                                            formik.touched.message &&
                                            formik.errors.message
                                          }
                                          type="text"
                                          variant="outlined"
                                          placeholder={t(
                                            "Add your thoughts in details"
                                          )}
                                        />
                                      </Box>
                                    </Box>
                                  </div>
                                </Box>
                              </div>
                            </Grid>
                          </Grid>
                        </Box>

                        <div
                          style={{ marginTop: "10px", marginBottom: "10px" }}
                        >
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
                    </>
                  ) : activeTab === "privacy_policy" ? (
                    <>
                      <Box
                        sx={{
                          p: 1,
                          textAlign: "start",
                          backgroundColor: "white",
                          border: "2px solid rgba(9, 30, 66, 0.14)",
                          borderRadius: "10px",
                        }}
                      >
                        <TypographyMD
                          variant="paragraph"
                          label={t("Privacy Policy")}
                          color="#424242"
                          sx={{ lineHeight: "50px" }}
                          fontFamily="Roboto"
                          fontSize="20px"

                          align="left"
                        />

                        <ReactQuill
                          value={privacyPolicy}
                          onChange={setPrivacyPolicy}
                          modules={modules}
                          style={{
                            overflowY: "auto",
                            backgroundColor: "#fff",
                            fontFamily: "Roboto",
                          }}
                        />
                      </Box>

                      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                        <ButtonMD
                          variant="contained"
                          title={t("Save")}
                          startIcon={<CheckCircleOutline />}
                          width="fit-content"
                          // type="submit"
                          borderColor="orange"
                          backgroundColor="orange"
                          borderRadius="5px"
                          disabled={loading}
                        />
                      </div>
                    </>
                  ) : activeTab === "terms_and_conditions" ? (
                    <>
                      <Box
                        sx={{
                          p: 1,
                          textAlign: "start",
                          backgroundColor: "white",
                          border: "2px solid rgba(9, 30, 66, 0.14)",
                          borderRadius: "10px",
                        }}
                      >
                        <TypographyMD
                          variant="paragraph"
                          label={t("Terms & Conditions")}
                          color="#424242"
                          sx={{ lineHeight: "50px" }}
                          fontFamily="Roboto"
                          fontSize="20px"

                          align="left"
                        />
                        <ReactQuill
                          value={termsCondition}
                          onChange={setTermsCondition}
                          modules={modules}
                          style={{
                            overflowY: "auto",
                            backgroundColor: "#fff",
                            fontFamily: "Roboto",
                          }}
                        />
                      </Box>

                      <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                        <ButtonMD
                          variant="contained"
                          title={t("Save")}
                          startIcon={<CheckCircleOutline />}
                          width="fit-content"
                          // type="submit"
                          borderColor="orange"
                          backgroundColor="orange"
                          borderRadius="5px"
                          disabled={loading}
                        />
                      </div>
                    </>
                  ) : null}
                </Grid>
              </Grid>
            )}
          </Box>
        }
      />
    </>
  );
}

export default ContentManagement;
