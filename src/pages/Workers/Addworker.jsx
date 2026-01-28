import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  FormControl,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import { AttachFile, Close } from "@mui/icons-material";
import { Country, State, City } from "country-state-city";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import ModalAdd from "../../components/items/Modal";
import TypographyMD from "../../components/items/Typography";
import Inputfield from "../../components/items/Inputfield";
import SelectField from "../../components/items/Selectfield";
import ButtonMD from "../../components/items/ButtonMD";
import Countryfield from "../../components/items/Countryfield";
import LocationPicker from "../../components/LocationPicker";
import SearchableDropdown from "../../components/SearchableCountryDropdown";
import pdfIcon from "../../Assets/pdfIcon.png";
import url from "../../url";
import { showToast, getApiMessage } from "../../helper_functions/messageHandler";

const AddWorker = ({
  open,
  onClose,
  onSuccess,
  selectedRowData = null,
  mode = "add",
}) => {

  const { t } = useTranslation();
  const { token, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  // All required state declarations
  const [profileImage, setProfileImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [docFileName, setDocFileName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [manualAddress, setManualAddress] = useState(false);
  const [countriesData, setCountriesData] = useState([]);
  const [manualCountries, setManualCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCountryIso, setSelectedCountryIso] = useState("");
  const [selectedStateIso, setSelectedStateIso] = useState("");
  const [loadingManualCountries, setLoadingManualCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [updatingMap, setUpdatingMap] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [mapPosition, setMapPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);

  // Validation schema
  const validationSchema = yup.object({
    first_name: yup.string().required(t("First name is required")),
    last_name: yup.string().required(t("Last name is required")),
    middle_name: yup.string().nullable(),
    email: yup
      .string()
      .email(t("Enter a valid email"))
      .required(t("Email is required")),
    phone: yup.string().required(t("Phone number is required")),
    dob: yup
      .date()
      .required(t("Date of birth is required"))
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
    designation: yup.string().nullable(),
    company_id: yup.string().required(t("Company is required")),
    department_id: yup.string().required(t("Department is required")),
    employee_type: yup.string().nullable(),
    hire_date: yup.date().nullable(),
    status: yup.string().nullable(),
    shift_schedule: yup.string().nullable(),

    country: yup.string().required(t("Country is required")),
    province: yup.string().required(t("State is required")),
    city: yup.string().required(t("City is required")),
    street_address: yup.string().nullable(),
    postal_code: yup.string().nullable(),
    community: yup.string().nullable(),
    latitude: yup.number().nullable(),
    longitude: yup.number().nullable(),
    salary: yup.number().nullable(),
    work_hours: yup.number().nullable(),
    document_url: yup.string().nullable(),
  });

  // Image states
  const getInitialValues = () => {
    if (mode === "edit" && selectedRowData) {
      return {
        first_name: selectedRowData.first_name || "",
        last_name: selectedRowData.last_name || "",
        middle_name: selectedRowData.middle_name || "",
        email: selectedRowData.email || "",
        phone: selectedRowData.phone || selectedRowData.phone_number || "",
        dob: selectedRowData.dob ? selectedRowData.dob.split("T")[0] : "",
        designation: selectedRowData.designation || "",
        company_id: selectedRowData.company_id ? String(selectedRowData.company_id) : "",
        department_id: selectedRowData.department_id ? String(selectedRowData.department_id) : "",
        employee_type: selectedRowData.employee_type || "full-time",
        hire_date: selectedRowData.hire_date ? selectedRowData.hire_date.split("T")[0] : "",
        status: selectedRowData.status || "active",
        shift_schedule: selectedRowData.shift_schedule || "",

        country: selectedRowData.country || "",
        province: selectedRowData.province || "",
        city: selectedRowData.city || "",
        street_address: selectedRowData.street_address || selectedRowData.street || "",
        postal_code: selectedRowData.postal_code || "",
        community: selectedRowData.community || "",
        latitude: selectedRowData.latitude || null,
        longitude: selectedRowData.longitude || null,
        profile_image: selectedRowData.profile_image || selectedRowData.profile_picture || selectedRowData.profile_picture_url || null,
        salary: selectedRowData.salary || "",
        work_hours: selectedRowData.work_hours || "",
        document_url: selectedRowData.document_url || "",
      };
    }
    // Default (add)
    return {
      first_name: "",
      last_name: "",
      middle_name: "",
      email: "",
      phone: "",
      dob: "",
      designation: "",
      company_id: "",
      department_id: "",
      employee_type: "full-time",
      hire_date: "",
      status: "active",
      shift_schedule: "",

      country: "",
      province: "",
      city: "",
      street_address: "",
      postal_code: "",
      community: "",
      latitude: null,
      longitude: null,
      profile_image: null,
      salary: "",
      work_hours: "",
      document_url: "",
    };
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialValues(),
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // 1. Upload Image (profile_image)
        let profileImageUrl = values.profile_image;
        if (profileImage) {
          const imgForm = new FormData();
          imgForm.append("image", profileImage);
          const uploadResponse = await fetch(`${url}upload/image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: imgForm,
          });
          const uploadData = await uploadResponse.json();
          if (uploadData?.data?.url) {
            profileImageUrl = uploadData.data.url;
          } else {
            toast.error(t("Image upload failed"));
            setLoading(false);
            return;
          }
        }

        // 2. Prepare Payload
        const payload = {
          ...values,
          profile_image: profileImageUrl || undefined,
          salary: values.salary ? Number(values.salary) : 0,
          work_hours: values.work_hours ? Number(values.work_hours) : 0,
          department_id: values.department_id ? Number(values.department_id) : null,
          company_id: values.company_id ? Number(values.company_id) : null,
        };

        if (mode === "edit" && selectedRowData) {
          // Edit mode: update worker
          const updateUrl = `${url}super-admin/workers/${selectedRowData.id}`;
          const response = await fetch(updateUrl, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          if (response.ok && !data.error) {
            showToast(toast.success, data, t("Employee updated successfully"));
            if (onSuccess) onSuccess();
            onClose();
            setDepartments([]);
          } else {
            const message = data.message || t("Something went wrong");
            showToast(toast.error, data, message);
          }
        } else {
          // Add mode: create worker
          payload.worker_id = "EMP" + Math.floor(Math.random() * 10000);
          payload.face_data = {
            encoding: "base64",
            data: "actual_base64_string_here",
            metadata: { capturedAt: new Date().toISOString() },
          };
          const createUrl = `${url}super-admin/workers`;
          const response = await fetch(createUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          if (response.ok && !data.error) {
            showToast(toast.success, data, t("Employee added successfully"));
            if (onSuccess) onSuccess();
            onClose();
            formik.resetForm();
            setProfileImage(null);
            setPreviewUrl(null);
            setSelectedDoc(null);
            setPreviewDoc(null);
            setDocFileName("");
            setDepartments([]);
          } else {
            const message = data.message || t("Something went wrong");
            showToast(toast.error, data, message);
          }
        }
      } catch (error) {
        console.error("Error saving worker:", error);
        toast.error(t("Something went wrong! Please try again."));
      } finally {
        setLoading(false);
      }
    },
  });


  // Fetch Companies (Company Admins)
  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const apiUrl = `${url}company-admins?status=active&sort_by=created_at&sort_order=DESC&no_pagination=true`;
      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.data?.companies) {
        setCompanies(data.data.companies);
      } else if (data?.data?.company_admins) {
        setCompanies(data.data.company_admins);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error(t("Failed to load companies"));
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Fetch companies when modal opens
  useEffect(() => {
    if (open) {
      fetchCompanies();
    }
  }, [open]);

  // Reset departments when company changes
  const fetchDepartments = async (companyId) => {
    if (!companyId) {
      setDepartments([]);
      return;
    }
    setLoadingDepartments(true);
    try {
      const apiUrl = `${url}public/departmentsByCompId/${companyId}`;
      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Updated to match structure: data: { departments: [...] }
      if (data?.data?.departments) {
        setDepartments(data.data.departments);
      } else {
        // Fallback
        const deptList = data?.data || data || [];
        setDepartments(Array.isArray(deptList) ? deptList : []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      // toast.error(t("Failed to load departments"));
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {
    if (formik.values.company_id) {
      fetchDepartments(formik.values.company_id);
    } else {
      setDepartments([]);
    }
  }, [formik.values.company_id]);

  // Manual address functions
  const getManualCountries = () => {
    setLoadingManualCountries(true);

    try {
      const allCountries = Country.getAllCountries();
      const countriesList = allCountries.map((c) => ({
        name: c.name,
        isoCode: c.isoCode,
      }));

      setCountriesData(countriesList);
      setManualCountries(countriesList.map((c) => c.name).sort());
    } catch (error) {
      console.error("Error loading manual countries:", error);
    } finally {
      setLoadingManualCountries(false);
    }
  };

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
    setSelectedState("");
    setSelectedCity("");
    setCities([]);
    setStates([]);

    const match = countriesData.find((c) => c.name === value);

    if (match) {
      setSelectedCountryIso(match.isoCode);

      const states = State.getStatesOfCountry(match.isoCode).map((s) => ({
        name: s.name,
        isoCode: s.isoCode,
      }));

      setStates(states.map((s) => s.name).sort());
    }

    formik.setFieldValue("country", value);
  };

  const handleStateChange = (value) => {
    setSelectedState(value);
    setSelectedCity("");
    setCities([]);
    formik.setFieldValue("province", value);

    const match = State.getStatesOfCountry(selectedCountryIso).find(
      (s) => s.name === value
    );

    if (!match) return;

    setSelectedStateIso(match.isoCode);

    const cityList = City.getCitiesOfState(selectedCountryIso, match.isoCode)
      .map((c) => c.name)
      .sort();

    setCities(cityList);
  };

  const handleCityChange = (value) => {
    setSelectedCity(value);
    formik.setFieldValue("city", value);

    if (selectedCountry && selectedState && value) {
      geocodeManualAddress(selectedCountry, selectedState, value);
    }
  };

  const geocodeManualAddress = async (country, state, city) => {
    setUpdatingMap(true);
    try {
      const query = [city, state, country].filter(Boolean).join(", ");

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
        {
          headers: { "User-Agent": "yourapp/1.0 (contact@example.com)" },
        }
      );

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const result = data[0];
        const coords = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        };

        formik.setFieldValue("latitude", coords.lat);
        formik.setFieldValue("longitude", coords.lng);
        setMapPosition(coords);
        setMapKey((prev) => prev + 1);
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setUpdatingMap(false);
    }
  };

  // Effects
  useEffect(() => {
    if (manualAddress) {
      getManualCountries();
    }
  }, [manualAddress]);

  useEffect(() => {
    if (manualAddress && selectedCountry && selectedState && selectedCity) {
      geocodeManualAddress(selectedCountry, selectedState, selectedCity);
    }
  }, [selectedCountry, selectedState, selectedCity, manualAddress]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      formik.resetForm();
      setProfileImage(null);
      setPreviewUrl(null);
      setSelectedDoc(null);
      setPreviewDoc(null);
      setDocFileName("");
      setManualAddress(false);
    }
  }, [open]);

  // Image handlers
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      formik.setFieldValue("profile_image", null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setProfileImage(null);
    setPreviewUrl(null);
    formik.setFieldValue("profile_image", null);
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
    if (file) {
      setProfileImage(file);
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      formik.setFieldValue("profile_image", null);
    }
  };

  // Document Handlers
  const uploadDocToServer = async (file) => {
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
    if (!res.ok || data.error) throw new Error(data?.message || "Upload failed");

    return data?.data?.url || data?.url || data?.path || "";
  };

  const handleDocChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedDoc(file);
      setPreviewDoc(URL.createObjectURL(file));
      setDocFileName(file.name);

      try {
        const uploadedUrl = await uploadDocToServer(file);
        formik.setFieldValue("document_url", uploadedUrl);
      } catch (error) {
        setSelectedDoc(null);
        setPreviewDoc(null);
        setDocFileName("");
        formik.setFieldValue("document_url", "");
        toast.error(t("Failed to upload document"));
      }
    }
  };

  const handleRemoveDoc = () => {
    setSelectedDoc(null);
    setPreviewDoc(null);
    setDocFileName("");
    formik.setFieldValue("document_url", "");
  };

  const handleDragOverDoc = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingDoc(true);
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
        const uploadedUrl = await uploadDocToServer(file);
        formik.setFieldValue("document_url", uploadedUrl);
      } catch (error) {
        setSelectedDoc(null);
        setPreviewDoc(null);
        setDocFileName("");
        formik.setFieldValue("document_url", "");
        toast.error(t("Failed to upload document"));
      }
    }
  };


  return (
    <ModalAdd
      open={open}
      onClose={onClose}
      title={mode === "edit" ? t("Edit Worker") : t("Add Worker")}
      data={
        <form
          style={{
            backgroundColor: "#fff",
            margin: window.innerWidth < 600 ? 8 : 13
          }}
          onSubmit={formik.handleSubmit}
        >
          <Box
            sx={{
              height: { xs: "calc(100vh - 120px)", sm: "80vh", md: "80vh" },
              overflowY: "auto",
              px: { xs: 0.5, sm: 1 },
              pb: { xs: 2, sm: 3 },
            }}
          >
            {/* Personal Details */}
            <TypographyMD label={t("Personal Details")} variant="paragraph" fontWeight={750} marginBottom={2} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TypographyMD
                  label={
                    <span>
                      {t("First Name")}
                      <span style={{ color: "red", marginLeft: 4 }}>*</span>
                    </span>
                  }
                  variant="paragraph"
                  fontSize="14px"
                  fontWeight={450}
                  color="#626F86"
                />
                <Inputfield
                  value={formik.values.first_name}
                  onChngeterm={(e) => formik.setFieldValue("first_name", e.target.value)}
                  name="first_name"
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TypographyMD label={t("Middle Name")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                <Inputfield
                  value={formik.values.middle_name}
                  onChngeterm={(e) => formik.setFieldValue("middle_name", e.target.value)}
                  name="middle_name"
                  error={formik.touched.middle_name && Boolean(formik.errors.middle_name)}
                  helperText={formik.touched.middle_name && formik.errors.middle_name}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TypographyMD
                  label={
                    <span>
                      {t("Last Name")}
                      <span style={{ color: "red", marginLeft: 4 }}>*</span>
                    </span>
                  }
                  variant="paragraph"
                  fontSize="14px"
                  fontWeight={450}
                  color="#626F86"
                />
                <Inputfield
                  value={formik.values.last_name}
                  onChngeterm={(e) => formik.setFieldValue("last_name", e.target.value)}
                  name="last_name"
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TypographyMD
                  label={
                    <span>
                      {t("Email")}
                      <span style={{ color: "red", marginLeft: 4 }}>*</span>
                    </span>
                  }
                  variant="paragraph"
                  fontSize="14px"
                  fontWeight={450}
                  color="#626F86"
                />
                <Inputfield
                  value={formik.values.email}
                  onChngeterm={(e) => formik.setFieldValue("email", e.target.value)}
                  name="email"
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TypographyMD
                  label={
                    <span>
                      {t("Phone")}
                      <span style={{ color: "red", marginLeft: 4 }}>*</span>
                    </span>
                  }
                  variant="paragraph"
                  fontSize="14px"
                  fontWeight={450}
                  color="#626F86"
                />
                <Countryfield
                  value={formik.values.phone}
                  onChangeTerm={(phone) => formik.setFieldValue("phone", phone)}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TypographyMD
                  label={
                    <span>
                      {t("Date of Birth")}
                      <span style={{ color: "red", marginLeft: 4 }}>*</span>
                    </span>
                  }
                  variant="paragraph"
                  fontSize="14px"
                  fontWeight={450}
                  color="#626F86"
                />
                <Inputfield
                  value={formik.values.dob}
                  onChngeterm={(e) => formik.setFieldValue("dob", e.target.value)}
                  name="dob"
                  type="date"
                  error={formik.touched.dob && Boolean(formik.errors.dob)}
                  helperText={formik.touched.dob && formik.errors.dob}
                />
              </Grid>
            </Grid>

            {/* Profile Image */}
            <Box mt={2}>
              <TypographyMD
                label={t("Profile Image")}
                color="#626F86"
                marginBottom={1}
                fontFamily="Roboto"
                fontSize="14px"
                fontWeight={450}
              />
              <Box
                sx={{
                  width: "100%",
                  height: "20vh",
                  border: isDragging ? "2px dashed #3f51b5" : "2px dashed rgba(9, 30, 66, 0.14)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isDragging ? "#e3f2fd" : "#F6F8FB",
                  cursor: "pointer",
                  position: "relative"
                }}
                onClick={() => document.getElementById("add-worker-image-input").click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  id="add-worker-image-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                {!previewUrl ? (
                  <Box display="flex" gap={1}>
                    <AttachFile sx={{ color: "#626F86" }} />
                    <Typography variant="body2" color="#626F86">{t("Upload Image")}</Typography>
                  </Box>
                ) : (
                  <>
                    <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px" }} />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      sx={{ position: "absolute", top: 5, right: 5, bgcolor: "white" }}
                      size="small"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>


            {/* Document Upload */}
            <Box mt={3}>
              <TypographyMD label={t("nationalId")} variant="paragraph" fontWeight={750} marginBottom={2} />
              <Box
                sx={{
                  width: "100%",
                  height: "20vh",
                  border: isDraggingDoc
                    ? "2px dashed #3f51b5"
                    : "2px dashed rgba(9, 30, 66, 0.14)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isDraggingDoc
                    ? "#e3f2fd"
                    : "#F6F8FB",
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={() => document.getElementById("doc-upload-input").click()}
                onDragOver={handleDragOverDoc}
                onDragLeave={handleDragLeaveDoc}
                onDrop={handleDropDoc}
              >
                <input
                  id="doc-upload-input"
                  type="file"
                  accept=".pdf,image/*"
                  style={{ display: "none" }}
                  onChange={handleDocChange}
                />
                {!previewDoc ? (
                  <Box display="flex" gap={1}>
                    <AttachFile sx={{ color: "#626F86" }} />
                    <Typography variant="body2" color="#626F86">{t("Upload Document (PDF/Image)")}</Typography>
                  </Box>
                ) : (
                  <>
                    {!docFileName?.toLowerCase().endsWith(".pdf") ? (
                      <img src={previewDoc} alt="Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "8px" }} />
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <img src={pdfIcon} alt="PDF" style={{ width: 40, height: 45 }} />
                        <TypographyMD variant="paragraph" label={docFileName} color="#626F86" fontSize="12px" />
                      </div>
                    )}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDoc();
                      }}
                      sx={{ position: "absolute", top: 5, right: 5, bgcolor: "white" }}
                      size="small"
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>

            {/* Employment Details */}
            <Box mt={3}>
              <TypographyMD label={t("Employment Details")} variant="paragraph" fontWeight={750} marginBottom={2} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TypographyMD
                    label={
                      <span>
                        {t("Company")}
                        <span style={{ color: "red", marginLeft: 4 }}>*</span>
                      </span>
                    }
                    variant="paragraph"
                    fontSize="14px"
                    fontWeight={450}
                    color="#626F86"
                  />
                  <SearchableDropdown
                    value={formik.values.company_id}
                    onChange={(val) => {
                      formik.setFieldValue("company_id", val);
                      formik.setFieldValue("department_id", ""); // Reset department
                    }}
                    options={companies.map((c) => ({
                      id: c.company_id || c.id,
                      name: `${c.company_name ||
                        c.legal_name ||
                        c.trade_name ||
                        c.name ||
                        "Unknown Company"
                        } ${c.business_email || c.company_admin_email
                          ? `(${c.business_email || c.company_admin_email})`
                          : ""
                        }`,
                    }))}
                    placeholder={loadingCompanies ? t("Loading...") : t("Select Company")}
                    disabled={loadingCompanies || companies.length === 0}
                  />

                  {/* Optional error rendering (since SearchableDropdown doesn't natively support helperText) */}
                  {formik.touched.company_id && formik.errors.company_id && (
                    <Box sx={{ mt: 0.5, fontSize: 12, color: "#d32f2f" }}>
                      {formik.errors.company_id}
                    </Box>
                  )}

                </Grid>

                <Grid item xs={12} md={4}>
                  <TypographyMD
                    label={
                      <span>
                        {t("Department")}
                        <span style={{ color: "red", marginLeft: 4 }}>*</span>
                      </span>
                    }
                    variant="paragraph"
                    fontSize="14px"
                    fontWeight={450}
                    color="#626F86"
                  />
                  <SearchableDropdown
                    value={formik.values.department_id || ""}
                    onChange={(val) => {
                      formik.setFieldValue("department_id", val);
                    }}
                    options={departments.map((d) => ({
                      id: d.id,
                      name: d.dept_name || d.name || "Unknown Department",
                    }))}
                    placeholder={loadingDepartments ? t("Loading...") : t("Select Department")}
                    disabled={!formik.values.company_id || loadingDepartments}
                  />
                  {formik.touched.department_id && formik.errors.department_id && (
                    <Box sx={{ mt: 0.5, fontSize: 12, color: "#d32f2f" }}>
                      {formik.errors.department_id}
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  <TypographyMD label={t("position")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <Inputfield
                    value={formik.values.designation}
                    onChngeterm={(e) => formik.setFieldValue("designation", e.target.value)}
                    name="designation"
                    error={formik.touched.designation && Boolean(formik.errors.designation)}
                    helperText={formik.touched.designation && formik.errors.designation}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TypographyMD label={t("Employee Type")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <SelectField
                    value={formik.values.employee_type}
                    onChangeTerm={(e) => formik.setFieldValue("employee_type", e.target.value)}
                    name="employee_type"
                    options={[
                      { value: "full-time", label: t("Full Time") },
                      { value: "part-time", label: t("Part Time") },
                      { value: "contract", label: t("Contract") },
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TypographyMD label={t("Hire Date")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <Inputfield
                    value={formik.values.hire_date}
                    onChngeterm={(e) => formik.setFieldValue("hire_date", e.target.value)}
                    name="hire_date"
                    type="date"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TypographyMD label={t("Status")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <SelectField
                    value={formik.values.status}
                    onChangeTerm={(e) => formik.setFieldValue("status", e.target.value)}
                    name="status"
                    options={[
                      { value: "active", label: t("Active") },
                      { value: "inactive", label: t("Inactive") },
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={4} >
                  <TypographyMD label={t("Shift Schedule")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <SelectField
                    fullWidth
                    value={formik.values.shift_schedule}
                    onChangeTerm={(e) => formik.setFieldValue("shift_schedule", e.target.value)}
                    name="shift_schedule"
                    options={[
                      { value: "morning_shift", label: t("Morning Shift") },
                      { value: "evening_shift", label: t("Evening Shift") },
                      { value: "night_shift", label: t("Night Shift") },
                    ]}
                  />
                </Grid>

              </Grid>
            </Box>

            {/* Financial Details */}
            <Box mt={3}>
              <TypographyMD label={t("Financial Details")} variant="paragraph" fontWeight={750} marginBottom={2} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TypographyMD label={t("Salary")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <Inputfield
                    value={formik.values.salary}
                    onChngeterm={(e) => formik.setFieldValue("salary", e.target.value)}
                    name="salary"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TypographyMD label={t("Work Hours")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <Inputfield
                    value={formik.values.work_hours}
                    onChngeterm={(e) => formik.setFieldValue("work_hours", e.target.value)}
                    name="work_hours"
                    type="number"
                  />
                </Grid>
              </Grid>
            </Box>


    <Box sx={{ mt: 3, mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <input
                      type="checkbox"
                      id="manualAddress"
                      checked={manualAddress}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setManualAddress(isChecked);

                        if (isChecked) {
                          formik.setFieldValue("country", "");
                          formik.setFieldValue("province", "");
                          formik.setFieldValue("city", "");
                          formik.setFieldValue("street_address", "");
                          formik.setFieldValue("postal_code", "");
                          formik.setFieldValue("community", "");
                          formik.setFieldValue("latitude", null);
                          formik.setFieldValue("longitude", null);

                          setSelectedCountry("");
                          setSelectedState("");
                          setSelectedCity("");
                          setCities([]);
                          setStates([]);
                          setMapPosition(null);
                          setMapKey(prev => prev + 1);
                        } else {
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
                                const defaultCoords = { lat: 33.6844, lng: 73.0479 };
                                setMapPosition(defaultCoords);
                                formik.setFieldValue("latitude", defaultCoords.lat);
                                formik.setFieldValue("longitude", defaultCoords.lng);
                              }
                            );
                          } else {
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

            {/* Address Details */}
            <Box mt={3}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 8, sm: 12 },
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <TypographyMD
                      variant="paragraph"
                      label={
                        <span>
                          {t("Address Details")}
                          <span style={{ color: "red", marginLeft: 4 }}>*</span>
                        </span>
                      }
                      color="#000000"
                      fontFamily="Roboto"
                      fontSize="15px"
                      fontWeight={750}
                      align="left"
                    />
                  </div>
                </div>

                {!manualAddress && (
                  <Box sx={{ position: "relative" }}>
                    <LocationPicker
                      formik={formik}
                      height="300px"
                      width="100%"
                    />
                  </Box>
                )}

            

                {manualAddress && (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
                    <TypographyMD
                      variant="paragraph"
                      label={t("Manual Address Selection")}
                      color="#626F86"
                      fontFamily="Roboto"
                      fontSize="16px"
                      fontWeight={600}
                      align="left"
                    />

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
                      <FormControl fullWidth size="small">
                        <SearchableDropdown
                          value={selectedCountry}
                          onChange={(val) => {
                            handleCountryChange(val);
                          }}
                          options={manualCountries}
                          disabled={loadingManualCountries}
                          placeholder={
                            loadingManualCountries
                              ? "placeholders.loadingCountries"
                              : "placeholders.selectCountry"
                          }
                        />
                      </FormControl>
                      {formik.touched.country && formik.errors.country && (
                        <Box sx={{ mt: 0.5, fontSize: 12, color: "#d32f2f" }}>
                          {formik.errors.country}
                        </Box>
                      )}
                    </Box>

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
                      <FormControl fullWidth size="small">
                        <SearchableDropdown
                          value={selectedState}
                          onChange={(val) => {
                            handleStateChange(val);
                          }}
                          options={states}
                          disabled={!selectedCountry || loadingStates}
                          placeholder={
                            !selectedCountry
                              ? "placeholders.selectCountryFirst"
                              : loadingStates
                                ? "placeholders.loadingStates"
                                : "placeholders.selectState"
                          }
                        />
                      </FormControl>
                      {formik.touched.province && formik.errors.province && (
                        <Box sx={{ mt: 0.5, fontSize: 12, color: "#d32f2f" }}>
                          {formik.errors.province}
                        </Box>
                      )}
                    </Box>

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
                      <FormControl fullWidth size="small">
                        <SearchableDropdown
                          value={selectedCity}
                          onChange={(val) => {
                            handleCityChange(val);
                          }}
                          options={cities}
                          disabled={!selectedState || loadingCities}
                          placeholder={
                            !selectedState
                              ? "placeholders.selectStateFirst"
                              : loadingCities
                                ? "placeholders.loadingCities"
                                : "placeholders.selectCity"
                          }
                        />
                      </FormControl>
                      {formik.touched.city && formik.errors.city && (
                        <Box sx={{ mt: 0.5, fontSize: 12, color: "#d32f2f" }}>
                          {formik.errors.city}
                        </Box>
                      )}
                    </Box>

                  
                  </Box>
                )}
              </div>
            </Box>




          </Box>
          <Box
            sx={{
              width: "100%",
              backgroundColor: "#fff",
              boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.05)",
              p: { xs: 1.5, sm: 2 },
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
            }}
          >
            <ButtonMD
              variant="outlined"
              title={t("Cancel")}
              onClickTerm={onClose}
              borderColor="#003149"
              color="#003149"
            />
            <ButtonMD
              variant="contained"
              title={mode === "edit" ? t("Update") : t("Add")}
              onClickTerm={formik.handleSubmit}
              bgcolor="#006EC2"
              color="#fff"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            />
          </Box>
        </form>
      }
    />
  );
};

export default AddWorker;