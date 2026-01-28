import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  OutlinedInput,
  InputAdornment,
  IconButton,
  CircularProgress,
  Autocomplete,
  TextField,
  Typography
} from "@mui/material";
import { AttachFile, Close, Search, CheckCircleOutline } from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { Country, State, City } from "country-state-city";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import pdfIcon from "../../Assets/pdfIcon.png";
import ModalAdd from "../../components/items/Modal";
import TypographyMD from "../../components/items/Typography";
import Inputfield from "../../components/items/Inputfield";
import Countryfield from "../../components/items/Countryfield";
import ButtonMD from "../../components/items/ButtonMD";
import LocationPicker from "../../components/LocationPicker";
import SearchableDropdown from "../../components/SearchableCountryDropdown";
import { getApiMessage, showToast } from "../../helper_functions/messageHandler"
import url from "../../url";
import { useRef } from "react";
import { useSelector } from "react-redux";



/* ---------------- COMPONENT ---------------- */
const EditAccountExecutiveModal = ({
  open,
  onClose,

  onSuccess,
  user,
}) => {
  const { t } = useTranslation();
  const { token, tokenExpiry } = useSelector((state) => state.auth);

  /* ---------------- VALIDATION ---------------- */
  const validationSchema = yup.object({


    first_name: yup.string().required(t("First name is required")),
    last_name: yup.string().required(t("Last name is required")),
    dob: yup
      .date()
      .required(t("Date of Birth is required"))
      .test(
        "min-age",
        t("You must be at least 18 years old"),
        function (value) {
          if (!value) return false;
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age >= 18;
        }
      ),
    email: yup.string().email(t("Invalid email")).required(t("Email is required")),
    phone: yup.string().required("Phone is required"),
    country: yup.string().required(t("Country is required")),
    province: yup.string().required(t("Province is required")),
    city: yup.string().required(t("City is required")),

  });

  /* ---------------- STATES ---------------- */
  const [loading, setLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const dobRef = useRef(null);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [docFileName, setDocFileName] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [manualAddress, setManualAddress] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingZoneCountries, setLoadingZoneCountries] = useState(false);
  const [loadingZoneStates, setLoadingZoneStates] = useState(false);
  const [loadingZoneCities, setLoadingZoneCities] = useState(false);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState([]);

  const [zoneCountries, setZoneCountries] = useState([]);
  const [zoneStates, setZoneStates] = useState([]);
  const [zoneCities, setZoneCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [selectedCountryIso, setSelectedCountryIso] = useState("");
  const [selectedStateIso, setSelectedStateIso] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const [mapPosition, setMapPosition] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const countryOptions = Country.getAllCountries().map((c) => c.name);
  const stateOptions = zoneStates.map(s => s.name);

  const [profilePreview, setProfilePreview] = useState("");
  const getAccountExecutiveDetails = async (aeId) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${url}super-admin/account-executives/${aeId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      console.log("details of account-executive are", data)
      if (!res.ok || data.error) {
        throw new Error(data?.message || "Failed to fetch details");
      }

      return data?.data;
    } catch (err) {
      toast.error(err.message || "Failed to load account executive");
      return null;
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (!open || !user?.id) return;


    getCompanies();

    (async () => {
      const details = await getAccountExecutiveDetails(user.id);
      if (!details) return;

      populateEditForm(details);

      if (details.profile_picture) {
        setProfilePreview(details.profile_picture);
        setPreviewUrl(details.profile_picture);
      }
    })();
  }, [open, user?.id]);
  console.log("PROFILE IMAGE URL:", profilePreview);
  const populateEditForm = (ae) => {
    if (!ae) return;

    // 🔹 Formik fields
    formik.setValues({
      first_name: ae.first_name || "",
      last_name: ae.last_name || "",
      middle_name: ae.middle_name || "",
      dob: ae.dob || "",
      email: ae.email || "",
      phone: ae.phone || "",
      companies: ae.companies?.map(c => c.id) || [],
      country: ae.country || "",
      province: ae.province || "",
      city: ae.city || "",
      street: ae.street_address || "",
      postal_code: ae.postal_code || "",
      community: ae.community || "",
      latitude: ae.latitude || null,
      longitude: ae.longitude || null,

    });



    // 🔹 Address dropdown states
    setSelectedCountry(ae.country || "");
    setSelectedState(ae.province || "");
    setSelectedCity(ae.city || "");

    // 🔹 Map
    if (ae.latitude && ae.longitude) {
      setMapPosition({
        lat: ae.latitude,
        lng: ae.longitude,
      });
      setMapKey(prev => prev + 1);
    }

    // 🔹 Existing images
    // if (ae.profile_picture_url) {
    //   setPreviewUrl(ae.profile_picture_url);
    // }
    if (ae.profile_picture) {
      setProfilePreview(ae.profile_picture);
      setPreviewUrl(ae.profile_picture);
    }
    if (ae.legal_document_url) {
      const fileName = ae.legal_document_url.split("/").pop();

      setPreviewDoc(ae.legal_document_url);
      setDocFileName(fileName);
      formik.setFieldValue("legal_document_url", ae.legal_document_url);
      // setPreviewDoc(ae.legal_document_url);
      // setDocFileName("Uploaded Document");
      // formik.setFieldValue("legal_document_url", ae.legal_document_url);
    }
  };

  const uploadLegalDocToServer = async (file) => {
    const form = new FormData();

    const isPDF = file.type === "application/pdf";
    const endpoint = isPDF ? "upload/pdf" : "upload/image";

    form.append(isPDF ? "pdf" : "image", file);

    const res = await fetch(`${url}${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data?.message || "Upload failed");
    }

    // Return the final uploaded URL
    return data?.data?.url || data?.url || data?.path || "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setSelectedImage(file);
    setProfilePreview(localUrl);
    setPreviewUrl(localUrl);
  };

  const handleRemoveDoc = () => {
    setSelectedDoc(null);
    setPreviewDoc(null);
    setDocFileName("");
    formik.setFieldValue("legal_document_url", "");
  };

  /* ---------------- FORMIK ---------------- */
  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      middle_name: "",
      dob: "",
      email: "",
      phone: "",
      companies: [],
      country: "",
      province: "",
      postal_code: "",
      community: null,
      city: "",
      street: null,
      latitude: null,
      longitude: null,
      // legal_document_url: "",

    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      console.log("🟠 SUBMIT CLICKED");
      console.log("🟠 selectedImage:", selectedImage);
      console.log("🟠 profilePreview:", profilePreview);
      console.log("🟠 SUBMIT legal_document_url:", values.legal_document_url);

      try {
        let imageUrl = null;

        // 1️⃣ Upload image if changed
        if (selectedImage) {
          const imgFormData = new FormData();
          imgFormData.append("image", selectedImage);

          const uploadResponse = await fetch(`${url}upload/image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: imgFormData,
          });

          const uploadResult = await uploadResponse.json();

          if (uploadResult.error) {
            throw new Error("Image upload failed");
          }

          imageUrl = uploadResult.data.url;
        }

        // 2️⃣ Build payload AFTER image upload
        const payload = {
          first_name: values.first_name,
          last_name: values.last_name,
          middle_name: values.middle_name || null,
          email: values.email,
          phone: values.phone,
          dob: values.dob,
          country: values.country,
          province: values.province,
          city: values.city,
          postal_code: values.postal_code || null,
          street_address: values.street || null,
          community: values.community || null,
          latitude: values.latitude,
          longitude: values.longitude,


          companies: values.companies,

          // ...(imageUrl && { profile_picture: imageUrl }),
          ...(imageUrl && { profile_picture_url: imageUrl }),
          ...(values.legal_document_url && {
            legal_document_url: values.legal_document_url
          }),
        };

        // 3️⃣ Update API
        const response = await fetch(
          `${url}super-admin/account-executives/${user.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();

        if (result.error) {
          throw new Error(result.message || "Update failed");
        }

        // 4️⃣ Success handling
        toast.success(t("Updated successfully"));
        resetForm();
        setSelectedImage(null);
        setPreviewUrl(null);
        setProfilePreview("");

        onClose();
        onSuccess();
      } catch (err) {
        toast.error(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    
  });


  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("🟡 SELECTED IMAGE FILE:", file);
    console.log("🟡 FILE NAME:", file.name);
    console.log("🟡 FILE TYPE:", file.type);
    console.log("🟡 FILE SIZE:", file.size);

    const localUrl = URL.createObjectURL(file);
    console.log("🟡 LOCAL PREVIEW URL:", localUrl);

    setSelectedImage(file);
    setProfilePreview(localUrl);
    setPreviewUrl(localUrl);
  };

 
  const handleDragOverDoc = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingDoc(true);
  };
  // const handleRemoveImage = () => {
  //   setSelectedImage(null);
  //   setPreviewUrl("");
  // };
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setProfilePreview("");
  };
  const getCompanies = async () => {
    setLoadingCompanies(true);
    const res = await fetch(`${url}company-admins`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setCompanies(data?.data?.company_admins || []);
    setLoadingCompanies(false);
  };
  const cityOptions = zoneCities.map(c => c.name);


  const handleZoneCountryChange = (name) => {
    const c = Country.getAllCountries().find(c => c.name === name);
    setSelectedCountry(name);
    setSelectedCountryIso(c?.isoCode || "");
    setZoneStates(State.getStatesOfCountry(c?.isoCode));
    formik.setFieldValue("country", name);
  };

  const handleZoneStateChange = (name) => {
    const s = zoneStates.find(s => s.name === name);
    setSelectedState(name);
    setSelectedStateIso(s?.isoCode || "");
    setZoneCities(City.getCitiesOfState(selectedCountryIso, s?.isoCode));
    formik.setFieldValue("province", name);
  };
  const handleDocChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedDoc(file);
      setPreviewDoc(URL.createObjectURL(file));
      setDocFileName(file.name);

      try {
        const uploadedUrl = await uploadLegalDocToServer(file);
        formik.setFieldValue("legal_document_url", uploadedUrl);
        console.log("🟢 NEW LEGAL DOC URL FROM UPLOAD:", uploadedUrl);

        // toast.success("Legal document uploaded successfully");
      } catch (error) {
        // toast.error("Failed to upload legal document");
        setSelectedDoc(null);
        setPreviewDoc(null);
        setDocFileName("");
        formik.setFieldValue("legal_document_url", "");
      }
    }
  };
  const handleDragLeaveDoc = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingDoc(false);
  };

  const handleDropDoc = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingDoc(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedDoc(file);
      setPreviewDoc(URL.createObjectURL(file));
      setDocFileName(file.name);

      try {
        const uploadedUrl = await uploadLegalDocToServer(file);
        formik.setFieldValue("legal_document_url", uploadedUrl);
        // toast.success("Legal document uploaded successfully");
      } catch (error) {
        // toast.error("Failed to upload legal document");
        setSelectedDoc(null);
        setPreviewDoc(null);
        setDocFileName("");
        formik.setFieldValue("legal_document_url", "");
      }
    }
  };
  const handleZoneCityChange = (name) => {
    setSelectedCity(name);
    formik.setFieldValue("city", name);
  };



  /* ---------------- RENDER ---------------- */
  return (


    <ModalAdd
      open={open}
      onClose={onClose}
      title={t("editAccountExecutive")}
      data={
        <form
          style={{ backgroundColor: "#fff", margin: 13 }}
          onSubmit={formik.handleSubmit}
        >
          <Box
            sx={{
              height: { xs: "calc(100dvh - 50px)", sm: "91vh", md: "91vh" }, // control how tall the modal body can grow
              overflowY: "auto", // enable vertical scroll if content overflows
              px: 1,
              pb: 3, // padding left & right
            }}
          >
            <Grid container spacing={0}>
              <Grid xs={12} align="left">
                <div>
                  <Box
                    sx={{ marginTop: "15px", marginBottom: "30px" }}
                    width={{ xs: "97%", md: "100%" }}
                  >
                    {/* --- Personal Details --- */}
                    <TypographyMD
                      variant="paragraph"
                      label={t("Personal Details")}
                      color="#000000"
                      fontFamily="Roboto"
                      fontSize="15px"
                      fontWeight={750}
                      align="left"
                    />

                    <div style={{ marginBottom: "5px", marginTop: "10px" }}>
                      <Box
                        display="flex"
                        flexDirection={{ xs: "column", md: "row" }}
                        gap={2}
                      >
                        <Box width={{ xs: "100%", md: "50%" }}>
                          <TypographyMD
                            variant="paragraph"
                            label={
                              <span>
                                {t("First Name")}
                                {formik.values.first_name === "" && (
                                  <span
                                    style={{ color: "red", marginLeft: 4 }}
                                  >
                                    *
                                  </span>
                                )}
                              </span>
                            }
                            color="#626F86"
                            fontFamily="Roboto"
                            fontSize="14px"
                            fontWeight={450}
                            align="left"
                          />
                          <Inputfield
                            autoFocus={false}
                            value={formik.values.first_name}
                            onChngeterm={(e) =>
                              formik.setFieldValue(
                                "first_name",
                                e.target.value
                              )
                            }
                            error={
                              formik.touched.first_name &&
                              Boolean(formik.errors.first_name)
                            }
                            helperText={
                              formik.touched.first_name &&
                              formik.errors.first_name
                            }
                            type="text"
                            variant="outlined"
                          />
                        </Box>
                        <Box width={{ xs: "100%", md: "50%" }}>
                          <TypographyMD
                            variant="paragraph"
                            label={
                              <span>
                                {t("Middle Name")}
                              </span>
                            }
                            color="#626F86"
                            fontFamily="Roboto"
                            fontSize="14px"
                            fontWeight={450}
                            align="left"
                          />
                          <Inputfield
                            autoFocus={false}
                            value={formik.values.middle_name}
                            onChngeterm={(e) =>
                              formik.setFieldValue(
                                "middle_name",
                                e.target.value
                              )
                            }
                            error={
                              formik.touched.middle_name &&
                              Boolean(formik.errors.middle_name)
                            }
                            helperText={
                              formik.touched.middle_name &&
                              formik.errors.middle_name
                            }
                            type="text"
                            variant="outlined"
                          />
                        </Box>
                      </Box>

                      <Box
                        display="flex"
                        flexDirection={{ xs: "column", md: "row" }}
                        gap={2}
                      >
                        <Box width={{ xs: "100%", md: "50%" }}>
                          <TypographyMD
                            variant="paragraph"
                            label={
                              <span>
                                {t("Last Name")}
                                {formik.values.last_name === "" && (
                                  <span
                                    style={{ color: "red", marginLeft: 4 }}
                                  >
                                    *
                                  </span>
                                )}
                              </span>
                            }
                            color="#626F86"
                            fontFamily="Roboto"
                            fontSize="14px"
                            fontWeight={450}
                            align="left"
                          />
                          <Inputfield
                            autoFocus={false}
                            value={formik.values.last_name}
                            onChngeterm={(e) =>
                              formik.setFieldValue(
                                "last_name",
                                e.target.value
                              )
                            }
                            error={
                              formik.touched.last_name &&
                              Boolean(formik.errors.last_name)
                            }
                            helperText={
                              formik.touched.last_name &&
                              formik.errors.last_name
                            }
                            type="text"
                            variant="outlined"
                          />
                        </Box>
                        <Box width={{ xs: "100%", md: "50%" }}>
                          <TypographyMD
                            variant="paragraph"
                            label={
                              <span>
                                {t("Date of Birth")}
                                <span style={{ color: "red", marginLeft: 4 }}>
                                  *
                                </span>
                              </span>
                            }
                            color="#626F86"
                            fontFamily="Roboto"
                            fontSize="14px"
                            fontWeight={450}
                            align="left"
                          />
                          {/* <Inputfield
                                  autoFocus={false}
                                  value={formik.values.dob}
                                  onChngeterm={(e) =>
                                    formik.setFieldValue("dob", e.target.value)
                                  }
                                  error={
                                    formik.touched.dob &&
                                    Boolean(formik.errors.dob)
                                  }
                                  helperText={
                                    formik.touched.dob && formik.errors.dob
                                  }
                                  type="date"
                                  variant="outlined"
                                /> */}
                          <Inputfield
                            ref={dobRef}
                            autoFocus={false}
                            value={formik.values.dob}
                            type="date"
                            onClick={() => {
                              dobRef.current?.showPicker?.();
                            }}
                            onChngeterm={(e) => {
                              const value = e.target.value;

                              // expected format: YYYY-MM-DD
                              if (value) {
                                const year = value.split("-")[0];

                                // block typing if year exceeds 4 digits
                                if (year.length > 4) return;
                              }

                              formik.setFieldValue("dob", value);
                            }}
                            error={formik.touched.dob && Boolean(formik.errors.dob)}
                            helperText={formik.touched.dob && formik.errors.dob}
                            variant="outlined"
                          />

                        </Box>
                      </Box>

                      <Box
                        display="flex"
                        flexDirection={{ xs: "column", md: "row" }}
                        gap={2}
                      >
                        <Box width={{ xs: "100%", md: "50%" }}>
                          <TypographyMD
                            variant="paragraph"
                            label={
                              <span>
                                {t("Email")}
                                {formik.values.email === "" && (
                                  <span
                                    style={{ color: "red", marginLeft: 4 }}
                                  >
                                    *
                                  </span>
                                )}
                              </span>
                            }
                            color="#626F86"
                            fontFamily="Roboto"
                            fontSize="14px"
                            fontWeight={450}
                            align="left"
                          />
                          <Inputfield
                            autoFocus={false}
                            value={formik.values.email}
                            onChngeterm={(e) =>
                              formik.setFieldValue("email", e.target.value)
                            }
                            error={
                              formik.touched.email &&
                              Boolean(formik.errors.email)
                            }
                            helperText={
                              formik.touched.email && formik.errors.email
                            }
                            type="text"
                            variant="outlined"
                          />
                        </Box>
                        <Box width={{ xs: "100%", md: "50%" }}>
                          <TypographyMD
                            variant="paragraph"
                            label={
                              <span>
                                {t("Phone No.")}
                                {formik.values.phone === "" && (
                                  <span
                                    style={{ color: "red", marginLeft: 4 }}
                                  >
                                    *
                                  </span>
                                )}
                              </span>
                            }
                            color="#626F86"
                            fontFamily="Roboto"
                            fontSize="14px"
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
                              formik.touched.phone && formik.errors.phone
                            }
                          />
                        </Box>
                      </Box>
                    </div>

                    <div style={{ marginBottom: "15px", marginTop: "15px" }}>
                      <TypographyMD
                        variant="paragraph"
                        label={t("Companies")}
                        color="#626F86"
                        fontFamily="Roboto"
                        fontSize="14px"
                        fontWeight={450}
                        align="left"
                      />

                      <FormControl fullWidth>
                        <Select
                          multiple
                          value={formik.values.companies}
                          onChange={(e) => {
                            formik.setFieldValue("companies", e.target.value);
                          }}
                          error={
                            formik.touched.companies &&
                            Boolean(formik.errors.companies)
                          }
                          disabled={loadingCompanies}
                          displayEmpty
                          input={<OutlinedInput />}
                          renderValue={(selected) => {
                            if (selected.length === 0) {
                              return <em>{t("placeholders.selectCompanies")}</em>;
                            }
                            return t("companiesSelected", { count: selected.length });
                          }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                                width: 250,
                              },
                            },
                            disableAutoFocusItem: true,
                          }}
                        >
                          {/* Search Input */}
                          <Box
                            sx={{ p: 1, borderBottom: '1px solid #e0e0e0' }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <OutlinedInput
                              autoFocus
                              placeholder={t("searchCompaniesPlaceholder")}
                              value={companySearchTerm}
                              onChange={(e) => {
                                e.stopPropagation();
                                setCompanySearchTerm(e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                // Prevent Enter key from closing the menu
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                }
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              size="small"
                              startAdornment={
                                <InputAdornment position="start">
                                  <Search sx={{ fontSize: 16, color: "#666" }} />
                                </InputAdornment>
                              }
                              sx={{
                                width: "100%",
                                px: 1,
                                "& fieldset": { border: "none" },
                                "& input": {
                                  cursor: "text"
                                }
                              }}
                            />
                          </Box>

                          {/* Filtered Companies */}
                          {companies
                            .filter(company => {
                              const displayName = (company.company_name || company.full_name || "").toLowerCase();
                              const displayEmail = (company.business_email || company.email || "").toLowerCase();
                              const searchTerm = companySearchTerm.toLowerCase();
                              return displayName.includes(searchTerm) || displayEmail.includes(searchTerm);
                            })
                            .sort((a, b) => {
                              const nameA = (a.company_name || a.full_name || "").toLowerCase();
                              const nameB = (b.company_name || b.full_name || "").toLowerCase();
                              return nameA.localeCompare(nameB);
                            })
                            .map((company) => {
                              const displayName = company.company_name || company.full_name || "";
                              const displayEmail = company.business_email || company.email || "";
                              return (
                                <MenuItem key={company.id} value={company.id}>
                                  <Checkbox
                                    checked={formik.values.companies.indexOf(company.id) > -1}
                                  />
                                  <ListItemText primary={displayName} secondary={displayEmail} />
                                </MenuItem>
                              );
                            })}

                          {/* No Results Message */}
                          {companies
                            .filter(company => {
                              const displayName = (company.company_name || company.full_name || "").toLowerCase();
                              const displayEmail = (company.business_email || company.email || "").toLowerCase();
                              const searchTerm = companySearchTerm.toLowerCase();
                              return displayName.includes(searchTerm) || displayEmail.includes(searchTerm);
                            }).length === 0 && companySearchTerm && (
                              <MenuItem disabled>
                                <ListItemText primary="No companies found" />
                              </MenuItem>
                            )}
                        </Select>
                        {formik.touched.companies && formik.errors.companies && (
                          <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1.5 }}>
                            {formik.errors.companies}
                          </Typography>
                        )}
                      </FormControl>

                      {/* Display Selected Companies as Chips */}
                      {formik.values.companies.length > 0 && (
                        <Box sx={{ mt: 1, mb: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              mb: 1,
                              color: "#626F86",
                              fontSize: "14px",
                              fontFamily: "Roboto",
                              fontWeight: 500,
                            }}
                          >
                            {/* {t("selectedCompanies")} */}
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {formik.values.companies
                              .map((companyId) => {
                                const company = companies.find(c => c.id === companyId);
                                if (!company) return null;
                                const displayName = company.company_name || company.full_name || "";
                                return { id: companyId, name: displayName };
                              })
                              .filter(Boolean)
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((company) => (
                                <Chip
                                  key={company.id}
                                  label={company.name}
                                  onDelete={() => {
                                    const updatedCompanies = formik.values.companies.filter(
                                      id => id !== company.id
                                    );
                                    formik.setFieldValue("companies", updatedCompanies);
                                  }}
                                  deleteIcon={<Close aria-label={`Remove ${company.name}`} />}
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 1,
                                    backgroundColor: "#579DFF",
                                    borderColor: "#579DFF",
                                    color: "#0D1A26",
                                    fontSize: "12px",
                                    fontFamily: "Poppins",
                                    "& .MuiChip-deleteIcon": {
                                      color: "#0D1A26",
                                      fontSize: "16px",
                                      "&:hover": { color: "#0D1A26" },
                                    },
                                  }}
                                />
                              ))}
                          </Box>
                        </Box>
                      )}
                    </div>

                    <div style={{ marginBottom: "15px", marginTop: "15px" }}>
                      <TypographyMD
                        variant="paragraph"
                        label={
                          <span>
                            {t("fields.profilePicture")}
                          </span>
                        }
                        color="#626F86"
                        marginBottom={1}
                        fontFamily="Roboto"
                        fontSize="14px"
                        fontWeight={450}
                        align="left"
                      />

                      <Box
                        sx={{
                          width: "100%",
                          height: "25vh",
                          border: isDragging
                            ? "2px dashed #3f51b5"
                            : "2px dashed rgba(9, 30, 66, 0.14)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isDragging ? "#e3f2fd" : "#F6F8FB",
                          position: "relative",
                          cursor: "pointer",
                          overflow: "hidden",
                          transition: "all 0.2s ease-in-out",
                        }}
                        onClick={() =>
                          document
                            .getElementById("image-upload-input")
                            .click()
                        }
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          id="image-upload-input"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleImageChange}
                        />

                        {!profilePreview ? (
                          <div style={{ display: "flex", gap: 5 }}>
                            <AttachFile
                              sx={{ color: "#626F86", fontSize: 17 }}
                            />
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <>
                                  {t("Drag file here or click to")}{" "}
                                  <span style={{ color: "#006EC2" }}>
                                    {t("browse")}
                                  </span>
                                </>
                              }
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="12px"
                              fontWeight={450}
                              align="left"
                            />
                          </div>
                        ) : (
                          <>
                            <img
                              crossOrigin="anonymous"
                              src={profilePreview}
                              alt={t("preview")}
                              style={{
                                maxWidth: "100%",
                                maxHeight: "100%",
                                objectFit: "contain",
                                borderRadius: "8px",
                              }}
                            />
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage();
                              }}
                              sx={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                                padding: "2px",
                                zIndex: 10,
                              }}
                              size="small"
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </div>


                    <div style={{ marginBottom: "5px", marginTop: "10px" }}>
                      <TypographyMD
                        variant="paragraph"
                        label={
                          <span>
                            {t("fields.nationalId")}

                          </span>
                        }
                        color="#626F86"
                        marginBottom={1}
                        fontFamily="Roboto"
                        fontSize="12px"
                        fontWeight={450}
                        align="left"
                      />

                      <Box
                        sx={{
                          width: "100%",
                          height: { xs: "15vh", sm: "20vh" },
                          border: isDraggingDoc
                            ? "2px dashed #3f51b5"
                            : "2px dashed rgba(9, 30, 66, 0.14)",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: isDraggingDoc ? "#e3f2fd" : "#F6F8FB",
                          position: "relative",
                          cursor: "pointer",
                          overflow: "hidden",
                          transition: "all 0.2s ease-in-out",
                        }}
                        onClick={() =>
                          document.getElementById("legal-doc-upload-input").click()
                        }
                        onDragOver={handleDragOverDoc}
                        onDragLeave={handleDragLeaveDoc}
                        onDrop={handleDropDoc}
                      >
                        <input
                          id="legal-doc-upload-input"
                          type="file"
                          accept=".pdf,image/*"
                          style={{ display: "none" }}
                          onChange={handleDocChange}
                        />

                        {/* ===================== EMPTY STATE ===================== */}
                        {!previewDoc ? (
                          <div style={{ display: "flex", gap: 5 }}>
                            <AttachFile sx={{ color: "#626F86", fontSize: 17 }} />
                            <TypographyMD
                              variant="paragraph"
                              label={t("fields.uploadPdfOrImage")}
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="12px"
                              fontWeight={450}
                            />
                          </div>
                        ) : (
                          <>
                            {/* ===================== IMAGE PREVIEW ===================== */}
                            {!docFileName?.toLowerCase().endsWith(".pdf") ? (
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <img
                                  crossOrigin="anonymous"
                                  src={previewDoc}
                                  alt="uploaded preview"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                    borderRadius: 6,
                                  }}
                                />
                              </div>
                            ) : (
                              /* ===================== PDF PREVIEW ===================== */
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <img
                                  src={pdfIcon}
                                  alt="pdf icon"
                                  style={{ width: 40, height: 45 }}
                                />
                                <TypographyMD
                                  variant="paragraph"
                                  label={docFileName}
                                  color="#626F86"
                                  fontSize="12px"
                                  fontWeight={450}
                                />
                              </div>
                            )}

                            {/* ===================== DELETE BUTTON ===================== */}
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveDoc();
                              }}
                              sx={{
                                position: "absolute",
                                top: 2,
                                right: 2,
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                                padding: "2px",
                                zIndex: 10,
                              }}
                              size="small"
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {/* LEFT: stacked text */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "4px",
                        }}
                      >
                        <TypographyMD
                          variant="paragraph"
                                                 label={
    <>
      {t("Address Details")}
      <span style={{ color: "red", marginLeft: 4 }}>*</span>
    </>
  }
                          color="#000000"
                          fontFamily="Roboto"
                          fontSize="15px"
                          fontWeight={750}
                          align="left"
                        />
                      </div>
                    </div>




  <Box sx={{ mt: 3, mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <input
                          type="checkbox"
                          id="manualAddress"
                          checked={manualAddress}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setManualAddress(isChecked);

                            // Clear form fields when manual address is enabled
                            if (isChecked) {
                              formik.setFieldValue("country", "");
                              formik.setFieldValue("province", "");
                              formik.setFieldValue("city", "");
                              formik.setFieldValue("street", "");
                              formik.setFieldValue("postal_code", "");
                              formik.setFieldValue("community", "");
                              formik.setFieldValue("latitude", null);
                              formik.setFieldValue("longitude", null);

                              // Reset manual address dropdowns
                              setSelectedCountry("");
                              setSelectedState("");
                              setSelectedCity("");
                              setStates([]);
                              setCities([]);
                              setMapPosition(null);
                              setMapKey(prev => prev + 1);
                            } else {
                              // Reset to current location when unchecked
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                  (position) => {
                                    const coords = {
                                      lat: position.coords.latitude,
                                      lng: position.coords.longitude
                                    };
                                    setMapPosition(coords);
                                    formik.setFieldValue("latitude", coords.lat);
                                    formik.setFieldValue("longitude", coords.lng);
                                  },
                                  (error) => {
                                    // If geolocation fails, set default location
                                    const defaultCoords = { lat: 33.6844, lng: 73.0479 };
                                    setMapPosition(defaultCoords);
                                    formik.setFieldValue("latitude", defaultCoords.lat);
                                    formik.setFieldValue("longitude", defaultCoords.lng);
                                  }
                                );
                              } else {
                                // Fallback to default location
                                const defaultCoords = { lat: 33.6844, lng: 73.0479 };
                                setMapPosition(defaultCoords);
                                formik.setFieldValue("latitude", defaultCoords.lat);
                                formik.setFieldValue("longitude", defaultCoords.lng);
                              }
                            }
                          }}
                          style={{ width: 18, height: 18 }}
                        />
                        <TypographyMD
                          variant="paragraph"
                          label={t("Manual Address")}
                          color="#626F86"
                          fontFamily="Roboto"
                          fontSize="14px"
                          fontWeight={450}
                          align="left"
                        />
                      </Box>
                    </Box>

                    {/* Only show map when manual address is false */}
                    {!manualAddress && (
                      <Box sx={{ position: "relative" }}>
                        <LocationPicker
                          formik={formik}
                          height="300px"
                          width="100%"
                        />
                      </Box>
                    )}

                    {/* Manual Address Checkbox */}
                  

                    {/* Zone-based Manual Address Dropdowns */}
                    {manualAddress && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>



                        {/* Country Dropdown */}
                        <Box>
                          <TypographyMD
                            variant="paragraph"
                            label={
                              <span>
                                {t("Country")}
                                <span style={{ color: "red", marginLeft: 4 }}>*</span>
                              </span>
                            }
                            color="#626F86"
                            fontFamily="Roboto"
                            fontSize="14px"
                            fontWeight={450}
                            align="left"
                          />

                          <SearchableDropdown
                            value={selectedCountry}
                            onChange={(val) => {
                              handleZoneCountryChange(val);
                            }}
                            options={countryOptions}
                            disabled={!selectedZone || loadingZoneCountries}
                            placeholder={
                              !selectedZone
                                ? "placeholders.selectZoneFirst"
                                : loadingZoneCountries
                                  ? "placeholders.loadingCountries"
                                  : "placeholders.selectCountry"
                            }
                          />
                        </Box>

                        {/* State/Province Dropdown */}
                        <Box>
                          <TypographyMD
                            variant="paragraph"
                            label={
                              <span>
                                {t("placeholders.provinceState")}
                                <span style={{ color: "red", marginLeft: 4 }}>*</span>
                              </span>
                            }
                            color="#626F86"
                            fontFamily="Roboto"
                            fontSize="14px"
                            fontWeight={450}
                            align="left"
                          />

                          <SearchableDropdown
                            value={selectedState}
                            onChange={(val) => {
                              handleZoneStateChange(val);
                            }}
                            options={stateOptions}
                            disabled={!selectedCountry || loadingZoneStates}
                            placeholder={
                              !selectedCountry
                                ? "placeholders.selectCountryFirst"
                                : loadingZoneStates
                                  ? "placeholders.loadingStates"
                                  : "placeholders.selectState"
                            }
                          />
                        </Box>

                        {/* City Dropdown */}
                        <Box>
                          <TypographyMD
                            variant="paragraph"
                            label={
                              <span>
                                {t("City")}
                                <span style={{ color: "red", marginLeft: 4 }}>*</span>
                              </span>
                            }
                            color="#626F86"
                            fontFamily="Roboto"
                            fontSize="14px"
                            fontWeight={450}
                            align="left"
                          />

                          <SearchableDropdown
                            value={selectedCity}
                            onChange={(val) => handleZoneCityChange(val)}
                            options={cityOptions}
                            disabled={!selectedState || loadingZoneCities}
                            placeholder="placeholders.selectCity"
                          />

                        </Box>

                        {/* Address Fields */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                          {/* Street Address */}
                          <Box>
                            <TypographyMD
                              variant="paragraph"
                              label={t("placeholders.address")}
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="14px"
                              fontWeight={450}
                              align="left"
                            />
                            <Inputfield
                              autoFocus={false}
                              value={formik.values.street}
                              onChngeterm={(e) =>
                                formik.setFieldValue("street", e.target.value)
                              }
                              error={
                                formik.touched.street &&
                                Boolean(formik.errors.street)
                              }
                              helperText={
                                formik.touched.street && formik.errors.street
                              }
                              type="text"
                              variant="outlined"
                            />
                          </Box>
                        </Box>


                      </Box>
                    )}
                  </Box>
                </div>
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              position: "sticky",
              bottom: 0,
              backgroundColor: "#fff",
              py: 1,
              px: 1,
              zIndex: 1,
            }}
          >
            <ButtonMD
              variant="contained"
              title={t("update")}
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
      }
    />
  );
};

export default EditAccountExecutiveModal;
