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
import url from "../../url";
import { showToast, getApiMessage } from "../../helper_functions/messageHandler";

const EditWorker = ({
  open,
  onClose,
  onSuccess,
  selectedRowData,
}) => {
  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  // Image states
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  // Manual Address states
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

  // Company and Department States
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Fetch Companies (Company Admins)
  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const res = await fetch(
        `${url}company-admins?status=active&sort_by=created_at&sort_order=DESC&no_pagination=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      // Updated to match structure: data: { companies: [...] }
      if (data?.data?.companies) {
        setCompanies(data.data.companies);
      } else if (data?.data?.company_admins) {
        // Fallback if it still returns company_admins
        setCompanies(data.data.company_admins);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error(t("Failed to load companies"));
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Fetch Departments
  const fetchDepartments = async (companyId) => {
    if (!companyId) {
      setDepartments([]);
      return;
    }
    setLoadingDepartments(true);
    try {
      const res = await fetch(`${url}public/departmentsByCompId/${companyId}`, {
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
    if (open) {
      fetchCompanies();
    }
  }, [open]);

  // Validation schema
  const validationSchema = yup.object({
    first_name: yup.string().required(t("First name is required")),
    last_name: yup.string().required(t("Last name is required")),
    email: yup
      .string()
      .email(t("Enter a valid email"))
      .required(t("Email is required")),
    phone: yup.string().required(t("Phone number is required")),
    designation: yup.string().nullable(),
    company_id: yup.string().required(t("Company is required")),
    department_id: yup.string().required(t("Department is required")),
    dob: yup
      .date()
      .nullable()
      .test(
        "min-age",
        t("You must be at least 18 years old"),
        function(value) {
          if (!value) return true; // Allow null/empty
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
    status: yup.string().nullable(),
    shift_schedule: yup.string().nullable(),
    assign_region: yup.string().nullable(),
    assign_zone: yup.string().nullable(),
    country: yup.string().nullable(),
    province: yup.string().nullable(),
    city: yup.string().nullable(),
    street_address: yup.string().nullable(),
    postal_code: yup.string().nullable(),
    community: yup.string().nullable(),
    latitude: yup.number().nullable(),
    longitude: yup.number().nullable(),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      first_name: selectedRowData?.first_name || "",
      last_name: selectedRowData?.last_name || "",
      email: selectedRowData?.email || "",
      phone: selectedRowData?.phone || selectedRowData?.phone_number || "",
      designation: selectedRowData?.designation || "",
      company_id: selectedRowData?.company_id || "",
      department_id: selectedRowData?.department_id || "",
      dob: selectedRowData?.dob ? selectedRowData.dob.split("T")[0] : "",
      status: selectedRowData?.status || "active",
      shift_schedule: selectedRowData?.shift_schedule || "",
      assign_region: selectedRowData?.assign_region || "",
      assign_zone: selectedRowData?.assign_zone || "",
      country: selectedRowData?.country || "",
      province: selectedRowData?.province || "",
      city: selectedRowData?.city || "",
      street_address: selectedRowData?.street_address || selectedRowData?.street || "",
      postal_code: selectedRowData?.postal_code || "",
      community: selectedRowData?.community || "",
      latitude: selectedRowData?.latitude || null,
      longitude: selectedRowData?.longitude || null,
      profile_image: selectedRowData?.profile_image || selectedRowData?.profile_picture || selectedRowData?.profile_picture_url || null,
      salary: selectedRowData?.salary || "",
      work_hours: selectedRowData?.work_hours || "",
      document_url: selectedRowData?.document_url || "",
      primary_color: selectedRowData?.primary_color || "#FF5733",
      secondary_color: selectedRowData?.secondary_color || "#C70039",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        // 1. Upload Image if changed
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
            toast.error("Failed to upload image");
            setLoading(false);
            return;
          }
        }


        // 2. Prepare Payload
        const payload = {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
          designation: values.designation,
          dob: values.dob,
          status: values.status,
          shift_schedule: values.shift_schedule,
          assign_region: values.assign_region,
          assign_zone: values.assign_zone,
          country: values.country,
          province: values.province,
          city: values.city,
          street_address: values.street_address,
          postal_code: values.postal_code,
          community: values.community,
          latitude: values.latitude,
          longitude: values.longitude,
          profile_image: profileImageUrl,

          company_id: values.company_id ? Number(values.company_id) : null,
          department_id: values.department_id ? Number(values.department_id) : null,
          salary: values.salary ? Number(values.salary) : 0,
          work_hours: values.work_hours ? Number(values.work_hours) : 0,
          document_url: values.document_url,
          primary_color: values.primary_color,
          secondary_color: values.secondary_color,


        };


        const updateUrl = `${url}super-admin/workers/${selectedRowData?.id}`;

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
          showToast(toast.success, data, t("Worker updated successfully"));
          if (onSuccess) onSuccess();
          onClose();
          setDepartments([]);
        } else {
          const message = data.message || t("Something went wrong");
          showToast(toast.error, data, message);
        }

      } catch (error) {
        console.error("Error updating worker:", error);
        toast.error(t("Something went wrong! Please try again."));
      } finally {
        setLoading(false);
      }
    },
  });

  // Handle Company Change or Initial Load
  useEffect(() => {
    if (formik.values.company_id) {
      // Only fetch if it's different or departments are empty
      // But to be safe, just fetch.
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


  // Pre-fill form
  useEffect(() => {
    if (open && selectedRowData) {
      const data = selectedRowData;

      getManualCountries();

      // Find Country/State ISOs for dropdowns if needed
      let cIso = "";
      if (data.country) {
        const allCountries = Country.getAllCountries();
        const foundCountry = allCountries.find(c => c.name === data.country);
        if (foundCountry) {
          cIso = foundCountry.isoCode;
          setSelectedCountryIso(cIso);
          // Load states
          const statesList = State.getStatesOfCountry(cIso);
          const startStates = statesList.map(s => s.name).sort();
          setStates(startStates);

          if (data.province) {
            const foundState = statesList.find(s => s.name === data.province);
            if (foundState) {
              const sIso = foundState.isoCode;
              setSelectedStateIso(sIso);
              // Load cities
              const cityList = City.getCitiesOfState(cIso, sIso).map(c => c.name).sort();
              setCities(cityList);
            }
          }
        }
      }

      setSelectedCountry(data.country || "");
      setSelectedState(data.province || "");
      setSelectedCity(data.city || "");


      if (data.profile_image || data.profile_picture || data.profile_picture_url) {
        setPreviewUrl(data.profile_image || data.profile_picture || data.profile_picture_url);
      } else {
        setPreviewUrl(null);
      }

      if (data.latitude && data.longitude) {
        setMapPosition({ lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) });
        setMapKey(prev => prev + 1);
      }
    }
  }, [open, selectedRowData]);


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


  return (
    <ModalAdd
      open={open}
      onClose={onClose}
      title={t("Edit Worker")}
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
              <Grid item xs={12} md={6}>
                <TypographyMD label={t("First Name")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                <Inputfield
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  name="first_name"
                  error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                  helperText={formik.touched.first_name && formik.errors.first_name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TypographyMD label={t("Last Name")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                <Inputfield
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  name="last_name"
                  error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                  helperText={formik.touched.last_name && formik.errors.last_name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TypographyMD label={t("Email")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                <Inputfield
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  name="email"
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TypographyMD label={t("Phone")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                <Countryfield
                  value={formik.values.phone}
                  onChangeTerm={(phone) => formik.setFieldValue("phone", phone)}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TypographyMD label={t("Date of Birth")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                <Inputfield
                  value={formik.values.dob}
                  onChange={formik.handleChange}
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
                onClick={() => document.getElementById("edit-worker-image-input").click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  id="edit-worker-image-input"
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

            {/* Employment Details */}
            <Box mt={3}>
              <TypographyMD label={t("Employment Details")} variant="paragraph" fontWeight={750} marginBottom={2} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TypographyMD label={t("Company")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <SearchableDropdown
                    value={formik.values.company_id}
                    onChange={(val) => {
                      formik.setFieldValue("company_id", val);
                      formik.setFieldValue("department_id", ""); // Reset department
                    }}
                    options={companies
                      .slice()
                      .sort((a, b) => {
                        const nameA = a.company_name || a.trade_name || "";
                        const nameB = b.company_name || b.trade_name || "";
                        return nameA.localeCompare(nameB);
                      })
                      .map((c) => ({
                        id: c.company_id || c.id,
                        name: `${c.company_name || c.trade_name || "Unknown Company"} (${c.business_email || ""})`,
                      }))}
                    placeholder={loadingCompanies ? t("Loading...") : t("Select Company")}
                    disabled={loadingCompanies || companies.length === 0}
                  />
                  {formik.touched.company_id && formik.errors.company_id && (
                    <Box sx={{ mt: 0.5, fontSize: 12, color: "#d32f2f" }}>
                      {formik.errors.company_id}
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <TypographyMD label={t("Department")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <SelectField
                    value={formik.values.department_id}
                    onChangeTerm={(e) => formik.setFieldValue("department_id", e.target.value)}
                    name="department_id"
                    options={departments.map(d => ({
                      value: d.id,
                      label: d.dept_name || d.name || "Unknown Department"
                    }))}
                    disabled={!formik.values.company_id || loadingDepartments}
                    placeholder={loadingDepartments ? t("Loading...") : t("Select Department")}
                    error={formik.touched.department_id && Boolean(formik.errors.department_id)}
                    helperText={formik.touched.department_id && formik.errors.department_id}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TypographyMD label={t("Designation")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <Inputfield
                    value={formik.values.designation}
                    onChange={formik.handleChange}
                    name="designation"
                    error={formik.touched.designation && Boolean(formik.errors.designation)}
                    helperText={formik.touched.designation && formik.errors.designation}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TypographyMD label={t("Status")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <SelectField
                    value={formik.values.status}
                    onChangeTerm={(e) => formik.setFieldValue("status", e.target.value)}
                    name="status"
                    options={[
                      { value: "active", label: t("Active") },
                      { value: "inactive", label: t("Inactive") },
                      { value: "suspended", label: t("Suspended") },
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TypographyMD label={t("Shift Schedule")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <SelectField
                    value={formik.values.shift_schedule}
                    onChangeTerm={(e) => formik.setFieldValue("shift_schedule", e.target.value)}
                    name="shift_schedule"
                    options={[
                      { value: "Morning", label: t("Morning") },
                      { value: "Evening", label: t("Evening") },
                      { value: "Night", label: t("Night") },
                      { value: "Flexible", label: t("Flexible") },
                    ]}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TypographyMD label={t("Assign Region")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <Inputfield
                    value={formik.values.assign_region}
                    onChange={formik.handleChange}
                    name="assign_region"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TypographyMD label={t("Assign Zone")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                  <Inputfield
                    value={formik.values.assign_zone}
                    onChange={formik.handleChange}
                    name="assign_zone"
                  />
                </Grid>
              </Grid>
            </Box>


            {/* Location Details with Map */}
            <Box mt={3}>
              <TypographyMD label={t("Address Details")} variant="paragraph" fontWeight={750} marginBottom={2} />

              {!manualAddress && (
                <Box sx={{ position: "relative", mb: 2 }}>
                  <LocationPicker
                    formik={formik}
                    height="300px"
                    width="100%"
                  />
                </Box>
              )}

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
                        setStates([]);
                        setCities([]);
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

              {manualAddress && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TypographyMD label={t("Country")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                    <FormControl fullWidth size="small">
                      <SearchableDropdown
                        value={selectedCountry}
                        onChange={(val) => {
                          handleCountryChange(val);
                        }}
                        options={manualCountries || []}
                        disabled={loadingManualCountries}
                        placeholder={
                          loadingManualCountries
                            ? "placeholders.loadingCountries"
                            : "placeholders.selectCountry"
                        }
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TypographyMD label={t("Province/State")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                    <FormControl fullWidth size="small">
                      <SearchableDropdown
                        value={selectedState}
                        onChange={(val) => {
                          handleStateChange(val);
                        }}
                        options={states || []}
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
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TypographyMD label={t("City")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                    <FormControl fullWidth size="small">
                      <SearchableDropdown
                        value={selectedCity}
                        onChange={(val) => {
                          handleCityChange(val);
                        }}
                        options={cities || []}
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
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TypographyMD label={t("Community")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                    <Inputfield
                      value={formik.values.community}
                      onChange={formik.handleChange}
                      name="community"
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <TypographyMD label={t("Street Address")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                    <Inputfield
                      value={formik.values.street_address}
                      onChange={formik.handleChange}
                      name="street_address"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TypographyMD label={t("Postal Code")} variant="paragraph" fontSize="14px" fontWeight={450} color="#626F86" />
                    <Inputfield
                      value={formik.values.postal_code}
                      onChange={formik.handleChange}
                      name="postal_code"
                    />
                  </Grid>
                </Grid>
              )}
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
              title={loading ? <CircularProgress size={20} color="inherit" /> : t("Update")}
              onClickTerm={formik.handleSubmit}
              bgcolor="#006EC2"
              color="#fff"
              disabled={loading}
            />
          </Box>
        </form>
      }
    />
  );
};

export default EditWorker;