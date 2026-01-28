

import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  Chip,
} from "@mui/material";

import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import { AttachFile, Close, CheckCircleOutline } from "@mui/icons-material";
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
import ImageCropper from "../../components/ImageCropper";
import url from "../../url";
import pdfIcon from "../../Assets/pdfIcon.png";
import { showToast, getApiMessage } from "../../helper_functions/messageHandler";
import SearchableDropdown from "../../components/SearchableCountryDropdown";
const AddCompanyAdmin = ({
  open,
  onClose,
  onSuccess,
  //   accountExecutives,
  //   getZonesByExecutive,
}) => {
  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth);

  // Image states
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  // Logo states
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dobRef = useRef(null);

  // Admin Document states
  const [isDraggingAdminDoc, setIsDraggingAdminDoc] = useState(false);
  const [selectedAdminDoc, setSelectedAdminDoc] = useState(null);
  const [previewAdminDoc, setPreviewAdminDoc] = useState(null);
  const [adminDocFileName, setAdminDocFileName] = useState("");

  // Company Document states
  const [isDraggingCompanyDoc, setIsDraggingCompanyDoc] = useState(false);
  const [selectedCompanyDoc, setSelectedCompanyDoc] = useState(null);
  const [previewCompanyDoc, setPreviewCompanyDoc] = useState(null);
  const [companyDocFileName, setCompanyDocFileName] = useState("");

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

  // Loading state
  const [loading, setLoading] = useState(false);


  const businessActivityRef = useRef(null);

  // Validation schema
  const validationSchema = yup.object({
    first_name: yup.string().required(t("First name is required")),
    middle_name: yup.string().nullable(),
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
    administrator_type: yup.string().required(t("Administrator type is required")),
    email: yup
      .string()
      .email(t("Enter a valid email"))
      .required(t("Email is required")),
    phone_number: yup.string().required(t("Phone number is required")),
    legal_name: yup.string().required(t("Legal name is required")),
    trade_name: yup.string().nullable(),
    business_sector: yup.string().required(t("Business sector is required")),
    company_registration_number: yup.string().nullable(),
    business_email: yup
      .string()
      .email(t("Enter a valid business email"))
      .required(t("Business email is required")),
    business_phone_number: yup
      .string()
      .required(t("Business phone number is required")),
    // business_type: yup.string().nullable(),
    business_activity: yup.string().nullable(),
    business_color: yup.string().nullable(),
    primary_color: yup.string().nullable(),
    secondary_color: yup.string().nullable(),
    business_address: yup.string().nullable(),
    company_document_url: yup.string().nullable(),
    region_code: yup.string().nullable(),
    country: yup.string().nullable(),
    province: yup.string().nullable(),
    postal_code: yup.string().nullable(),
    latitude: yup.number().nullable(),
    longitude: yup.number().nullable(),
    community: yup.string().nullable(),
    city: yup.string().nullable(),
    street_address: yup.string().nullable(),
    // account_executives: yup
    //   .string()
    //   .required(t("Account executive is required")),
    // territory_zone: yup.array().nullable(),
  });

  const formik = useFormik({
    initialValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      dob: "",
      administrator_type: "",
      admin_document_url: "",
      email: "",
      phone_number: "",
      legal_name: "",
      trade_name: "",
      business_sector: "",
      company_registration_number: "",
      business_email: "",
      business_phone_number: "",
      // business_type: "",
      business_activity: "",
      business_color: "#1976d2",
      primary_color: "#006EC2",
      secondary_color: "#2C384C",
      business_address: "",
      company_document_url: "",
      country: "",
      province: "",
      postal_code: "",
      community: "",
      city: "",
      street_address: "",
      region_code: "",
      account_executives: "",
      subscription_type: "",
      // territory_zone: [],
      latitude: null,
      longitude: null,
    },
    validationSchema: validationSchema,
    validate: (values) => {
      const errors = {};
      
      // Validate manual address fields when manual address is enabled
      if (manualAddress) {
        if (!selectedCountry || selectedCountry.trim() === "") {
          errors.country = t("Country is required");
          toast.error(t("Country is required"));
        }
        if (!selectedState || selectedState.trim() === "") {
          errors.province = t("Province is required");
          toast.error(t("Province is required"));
        }
        if (!selectedCity || selectedCity.trim() === "") {
          errors.city = t("City is required");
          toast.error(t("City is required"));
        }
      }
      
      return errors;
    },
    onSubmit: async (values) => {
      console.log("Form submitted with values:", values);
      console.log("Form validation errors:", formik.errors);

      const formData = new FormData();
      const safeValue = (val) =>
        val !== null && val !== undefined && String(val).trim() !== ""
          ? String(val).trim()
          : "-";

      if (!values.first_name || !values.last_name || !values.email) {
        toast.error("companyAdmin_requiredFields");
        return;
      }

      // Check if manual address fields are filled when manual address is enabled
      if (manualAddress) {
        if (!selectedCountry || selectedCountry.trim() === "") {
          toast.error(t("Country is required"));
          formik.setFieldTouched("country", true);
          return;
        }

        if (!selectedState || selectedState.trim() === "") {
          toast.error(t("Province is required"));
          formik.setFieldTouched("province", true);
          return;
        }

        if (!selectedCity || selectedCity.trim() === "") {
          toast.error(t("City is required"));
          formik.setFieldTouched("city", true);
          return;
        }
      } else {
        // Check if address fields are filled (from LocationPicker)
        if (!values.country) {
          toast.error("companyAdmin_selectLocation");
          return;
        }

        if (!values.city && !values.province && !values.street_address) {
          toast.error("companyAdmin_incompleteAddress");
          return;
        }
      }

      console.log("✅ All validations passed, proceeding with form submission");

      await new Promise((resolve) => setTimeout(resolve, 100));

      setLoading(true);

      try {
        const uploadImage = async (file) => {
          if (!file) {
            console.log("⛔ NO FILE PROVIDED FOR UPLOAD");
            return "";
          }

          const imgForm = new FormData();
          imgForm.append("image", file);

          console.log("🚀 Uploading file to image API:", file);

          const response = await fetch(`${url}upload/image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: imgForm,
          });

          const data = await response.json();
          console.log("📥 Upload API response:", data);

          return data?.data?.url || "";
        };

        console.log("🔥 ProfileImage file:", profileImage);
        const profileImageUrl = await uploadImage(profileImage);
        console.log("🔥 Final uploaded profileImageUrl:", profileImageUrl);

        const finalLogoUrl = logoUrl || (selectedLogo ? await uploadImage(selectedLogo) : "");

        const InsertAPIURL = `${url}company-admins`;

        console.log("All form values:", values);
        console.log("Primary color:", values.primary_color);
        console.log("Secondary color:", values.secondary_color);
        console.log("Business address:", values.business_address);

        delete values.profile_picture_url;

        Object.entries(values).forEach(([key, val]) => {
          if (key === "territory_zone" && Array.isArray(val)) {
            formData.append(key, JSON.stringify(val));
          } else if (key === "latitude" || key === "longitude") {
            const numericValue = val !== null && val !== undefined && !isNaN(val) ? Number(val) : null;
            if (numericValue !== null) {
              formData.append(key, numericValue);
            }
          } else {
            const valueToAppend = safeValue(val);
            formData.append(key, valueToAppend);
          }
        });

        // const execValue = values.account_executives
        //   ? parseInt(values.account_executives, 10)
        //   : "-";

        // formData.append(
        //   "account_executive_association",
        //   isNaN(execValue) ? "-" : execValue
        // );
        if (values.account_executives) {
          formData.append(
            "account_executive_association",
            parseInt(values.account_executives, 10)
          );
        }
        if (profileImageUrl) formData.append("profile_picture_url", profileImageUrl);
        if (finalLogoUrl) formData.append("company_logo_url", finalLogoUrl);

        console.log("FormData prepared for submission", InsertAPIURL, formData);

        const response = await fetch(InsertAPIURL, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        let data = await response.json();
        console.log("response", data);

        if (data.error === true || data.error === "true") {
          setLoading(false);
          showToast(toast.error, data, t("An error occurred"));
        } else {
          setLoading(false);
          showToast(toast.success, data, t("Company Admin added successfully"));
          handleModalClose();
          if (onSuccess) onSuccess();
        }
      } catch (error) {
        setLoading(false);

        const message = error.response?.data
          ? getApiMessage(error.response.data, t("Something went wrong! Please try again."))
          : error.message || t("Something went wrong! Please try again.");

        toast.error(message);
      }
    },
  });

  // Image handlers
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      console.log("🔥 Profile image selected:", file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl("");
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
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Logo handlers
  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setCropModalOpen(true);

      if (event.target) event.target.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setSelectedLogo(null);
    setPreviewLogo("");
    setLogoUrl(null);
  };

  const handleDragOverLogo = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingLogo(true);
  };

  const handleDragLeaveLogo = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingLogo(false);
  };

  const handleDropLogo = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingLogo(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  // Admin Document handlers
  const handleAdminDocChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedAdminDoc(file);
      setPreviewAdminDoc(URL.createObjectURL(file));
      setAdminDocFileName(file.name);

      try {
        const uploadedUrl = await uploadAdminDocToServer(file);
        formik.setFieldValue("admin_document_url", uploadedUrl);
      } catch (error) {
        setSelectedAdminDoc(null);
        setPreviewAdminDoc(null);
        setAdminDocFileName("");
        formik.setFieldValue("admin_document_url", "");
      }
    }
  };

  const handleRemoveAdminDoc = () => {
    setSelectedAdminDoc(null);
    setPreviewAdminDoc(null);
    setAdminDocFileName("");
    formik.setFieldValue("admin_document_url", "");
  };

  const handleDragOverAdminDoc = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingAdminDoc(true);
  };

  const handleDragLeaveAdminDoc = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingAdminDoc(false);
  };

  const handleDropAdminDoc = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingAdminDoc(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedAdminDoc(file);
      setPreviewAdminDoc(URL.createObjectURL(file));
      setAdminDocFileName(file.name);

      try {
        const uploadedUrl = await uploadAdminDocToServer(file);
        formik.setFieldValue("admin_document_url", uploadedUrl);
      } catch (error) {
        setSelectedAdminDoc(null);
        setPreviewAdminDoc(null);
        setAdminDocFileName("");
        formik.setFieldValue("admin_document_url", "");
      }
    }
  };

  // Company Document handlers
  const handleCompanyDocChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedCompanyDoc(file);
      setPreviewCompanyDoc(URL.createObjectURL(file));
      setCompanyDocFileName(file.name);

      try {
        const uploadedUrl = await uploadCompanyDocToServer(file);
        formik.setFieldValue("company_document_url", uploadedUrl);
      } catch (error) {
        setSelectedCompanyDoc(null);
        setPreviewCompanyDoc(null);
        setCompanyDocFileName("");
        formik.setFieldValue("company_document_url", "");
      }
    }
  };

  const handleRemoveCompanyDoc = () => {
    setSelectedCompanyDoc(null);
    setPreviewCompanyDoc(null);
    setCompanyDocFileName("");
    formik.setFieldValue("company_document_url", "");
  };

  const handleDragOverCompanyDoc = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingCompanyDoc(true);
  };

  const handleDragLeaveCompanyDoc = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingCompanyDoc(false);
  };

  const handleDropCompanyDoc = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingCompanyDoc(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedCompanyDoc(file);
      setPreviewCompanyDoc(URL.createObjectURL(file));
      setCompanyDocFileName(file.name);

      try {
        const uploadedUrl = await uploadCompanyDocToServer(file);
        formik.setFieldValue("company_document_url", uploadedUrl);
      } catch (error) {
        setSelectedCompanyDoc(null);
        setPreviewCompanyDoc(null);
        setCompanyDocFileName("");
        formik.setFieldValue("company_document_url", "");
      }
    }
  };

  // Upload functions
  const uploadAdminDocToServer = async (file) => {
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

  const uploadCompanyDocToServer = async (file) => {
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

  const uploadImageToServer = async (file) => {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`${url}upload/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Upload failed");
    return data?.data?.url || data?.url || data?.path || "";
  };

  const getCroppedImg = (imageSrc, croppedAreaPixels) => {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
          resolve(file);
        }, "image/jpeg", 0.9);
      };
      image.onerror = () => reject(new Error("Failed to load image"));
      image.src = imageSrc;
    });
  };

  const handleCropComplete = async (croppedImageFile) => {
    if (!croppedImageFile) {
      toast.error("Please select a crop area");
      return;
    }

    try {
      setUploading(true);
      const uploadedUrl = await uploadImageToServer(croppedImageFile);
      setLogoUrl(uploadedUrl);
      setPreviewLogo(uploadedUrl);
      setCropModalOpen(false);
      setSelectedImage(null);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

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


  const [accountExecutives, setAccountExecutives] = useState([]);
  const getAllExecutives = async () => {
    const InsertAPIURL = `${url}super-admin/public/account-executives?no_pagination=true`;
    try {
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("fetch executives response", data)
      setAccountExecutives(data.data.account_executives);
    } catch (error) {
      //  toast.error("Something went wrong! Please try again.");
    } finally {
      // setInitialLoader(false);
    }
  };
  useEffect(() => {

    getAllExecutives();
  }, []);
  const [zones, setZones] = useState([]);
  const getZonesByExecutive = async (executiveId) => {
    if (!executiveId) return;

    const url2 = `${url}account-executive/${executiveId}/assigned-zone`;

    try {
      const response = await fetch(url2, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data?.data?.territory_zone) {
        const formatted = data.data.territory_zone.map((z) => ({
          value: z,
          label: z,
        }));
        setZones(formatted);
      }
    } catch (err) {
      console.log(err);
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
    } else {
      setSelectedCountry("");
      setSelectedState("");
      setSelectedCity("");
      setStates([]);
      setCities([]);
      setMapPosition(null);
      setMapKey((prev) => prev + 1);
    }
  }, [manualAddress]);

  useEffect(() => {
    if (manualAddress && selectedCountry && selectedState && selectedCity) {
      geocodeManualAddress(selectedCountry, selectedState, selectedCity);
    }
  }, [selectedCountry, selectedState, selectedCity, manualAddress]);

  useEffect(() => {
    if (businessActivityRef.current) {
      businessActivityRef.current.innerHTML = formik.values.business_activity || "";
    }
  }, []);

  const handleModalClose = () => {
    onClose();
    formik.resetForm();

    setSelectedImage(null);
    setPreviewUrl(null);
    setSelectedLogo(null);
    setPreviewLogo(null);
    setLogoUrl(null);

    setSelectedAdminDoc(null);
    setPreviewAdminDoc(null);
    setAdminDocFileName("");
    setSelectedCompanyDoc(null);
    setPreviewCompanyDoc(null);
    setCompanyDocFileName("");

    setManualAddress(false);
    setSelectedCountry("");
    setSelectedState("");
    setSelectedCity("");
    setStates([]);
    setCities([]);
    setMapPosition(null);
    setMapKey((prev) => prev + 1);
    setProfileImage(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
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

  return (
    <>
      <ModalAdd
        open={open}
        onClose={onClose}
        title={t("Add Company Admins")}
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
                height: { xs: "calc(100vh - 120px)", sm: "91vh", md: "91vh" },
                overflowY: "auto",
                px: { xs: 0.5, sm: 1 },
                pb: { xs: 2, sm: 3 },
              }}
            >
              <Grid container spacing={0}>
                <Grid xs={12} align="left">
                  <div>
                    <Box
                      sx={{
                        marginTop: { xs: "10px", sm: "15px" },
                        marginBottom: { xs: "20px", sm: "30px" },
                        px: { xs: 1, sm: 0 }
                      }}
                      width="100%"
                    >
                      {/* --- Admin Details --- */}
                      <TypographyMD
                        variant="paragraph"
                        label={t("Admin Details")}
                        color="#000000"
                        fontFamily="Roboto"
                        fontSize="15px"
                        fontWeight={750}
                        align="left"
                      />

                      <div style={{ marginBottom: { xs: "10px", sm: "15px" }, marginTop: { xs: "5px", sm: "10px" } }}>
                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", md: "row" }}
                          gap={{ xs: 1.5, md: 2 }}
                        >
                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("First Name")}
                                  {formik.values.first_name === "" && (
                                    <span style={{ color: "red", marginLeft: 4 }}>*</span>
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
                                formik.setFieldValue("first_name", e.target.value)
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
                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={t("Middle Name")}
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
                                formik.setFieldValue("middle_name", e.target.value)
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
                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("Last Name")}
                                  {formik.values.last_name === "" && (
                                    <span style={{ color: "red", marginLeft: 4 }}>*</span>
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
                                formik.setFieldValue("last_name", e.target.value)
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
                        </Box>

                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", md: "row" }}
                          gap={{ xs: 1.5, md: 2 }}
                        >
                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("Date of Birth")}
                                  <span style={{ color: "red", marginLeft: 4 }}>*</span>
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
                          onBlur={() => formik.setFieldTouched("dob", true)}
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
                                dobRef.current?.showPicker?.();   // opens calendar on full box click
                              }}
                              onChngeterm={(e) => {
                                const value = e.target.value;

                                // expected format: YYYY-MM-DD
                                if (value) {
                                  const year = value.split("-")[0];

                                  // block if year exceeds 4 digits
                                  if (year.length > 4) return;
                                }

                                formik.setFieldValue("dob", value);
                              }}
                              onBlur={() => formik.setFieldTouched("dob", true)}
                              error={formik.touched.dob && Boolean(formik.errors.dob)}
                              helperText={formik.touched.dob && formik.errors.dob}
                              variant="outlined"
                            />
                          </Box>
                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("legalBusiness")}
                                  {formik.values.administrator_type === "" && (
                                    <span style={{ color: "red", marginLeft: 4 }}>*</span>
                                  )}
                                </span>
                              }
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="14px"
                              fontWeight={450}
                              align="left"
                            />
                            <SelectField
                              value={formik.values.administrator_type}
                              onChangeTerm={(e) =>
                                formik.setFieldValue(
                                  "administrator_type",
                                  e.target.value
                                )
                              }
                              options={[
                                { value: "individual", label: t("fields.individual") },
                                { value: "legal_entity", label: t("fields.legalEntity") },
                              ]}
                              error={
                                formik.touched.administrator_type &&
                                Boolean(formik.errors.administrator_type)
                              }
                              helperText={
                                formik.touched.administrator_type &&
                                formik.errors.administrator_type
                              }
                            />
                          </Box>
                        </Box>

                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", md: "row" }}
                          gap={{ xs: 1.5, md: 2 }}
                        >
                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("Email")}
                                  {formik.values.email === "" && (
                                    <span style={{ color: "red", marginLeft: 4 }}>*</span>
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
                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("Phone No.")}
                                  {formik.values.phone_number === "" && (
                                    <span style={{ color: "red", marginLeft: 4 }}>*</span>
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
                              value={formik.values.phone_number}
                              onChangeTerm={(phone) =>
                                formik.setFieldValue("phone_number", phone)
                              }
                              error={
                                formik.touched.phone_number &&
                                Boolean(formik.errors.phone_number)
                              }
                              helperText={
                                formik.touched.phone_number && formik.errors.phone_number
                              }
                            />
                          </Box>
                        </Box>

                        {/* Profile Image */}
                        <TypographyMD
                          variant="paragraph"
                          label={
                            <span>
                              {t("profileImage")}{" "}
                              {/* <span style={{ color: "red", marginLeft: 4 }}>*</span> */}
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
                            height: { xs: "20vh", sm: "25vh" },
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

                          {!previewUrl ? (
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
                                src={previewUrl}
                                alt="preview"
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

                        {/* Administrator Document */}
                        <TypographyMD
                          variant="paragraph"
                          label={
                            <span>
                              {t("nationalId")}
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
                            height: { xs: "15vh", sm: "20vh" },
                            border: isDraggingAdminDoc
                              ? "2px dashed #3f51b5"
                              : "2px dashed rgba(9, 30, 66, 0.14)",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: isDraggingAdminDoc ? "#e3f2fd" : "#F6F8FB",
                            position: "relative",
                            cursor: "pointer",
                            overflow: "hidden",
                            transition: "all 0.2s ease-in-out",
                          }}
                          onClick={() =>
                            document.getElementById("admin-doc-upload-input").click()
                          }
                          onDragOver={handleDragOverAdminDoc}
                          onDragLeave={handleDragLeaveAdminDoc}
                          onDrop={handleDropAdminDoc}
                        >
                          <input
                            id="admin-doc-upload-input"
                            type="file"
                            accept=".pdf,image/*"
                            style={{ display: "none" }}
                            onChange={handleAdminDocChange}
                          />

                          {!previewAdminDoc ? (
                            <div style={{ display: "flex", gap: 5 }}>
                              <AttachFile sx={{ color: "#626F86", fontSize: 17 }} />
                              <TypographyMD
                                variant="paragraph"
                                label={
                                  <>
                                    {t("Drag file here or click to")}{" "}
                                    <span style={{ color: "#006EC2" }}>{t("browse")}</span>
                                  </>
                                }
                                color="#626F86"
                                fontFamily="Roboto"
                                fontSize="12px"
                                fontWeight={450}
                              />
                            </div>
                          ) : (
                            <>
                              {!adminDocFileName?.toLowerCase().endsWith(".pdf") ? (
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
                                    src={previewAdminDoc}
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
                                    label={adminDocFileName}
                                    color="#626F86"
                                    fontFamily="Roboto"
                                    fontSize="12px"
                                    fontWeight={450}
                                  />
                                </div>
                              )}

                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveAdminDoc();
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

                      {/* --- Company Details --- */}
                      {formik.values.administrator_type && (
                        <>
                          <TypographyMD
                            variant="paragraph"
                            label={t("Company Details")}
                            color="#000000"
                            fontFamily="Roboto"
                            fontSize="15px"
                            fontWeight={750}
                            align="left"
                          />

                          <div style={{ marginBottom: { xs: "8px", sm: "10px" }, marginTop: { xs: "10px", sm: "15px" } }}>
                            <Box
                              display="flex"
                              flexDirection={{ xs: "column", md: "row" }}
                              gap={{ xs: 1.5, md: 2 }}
                            >
                              <Box width="100%">
                                <TypographyMD
                                  variant="paragraph"
                                  label={
                                    <span>
                                      {formik.values.administrator_type === 'individual'
                                        ? t("Business Name")
                                        : t("Company Legal Name")}
                                      {formik.values.legal_name === "" && (
                                        <span style={{ color: "red", marginLeft: 4 }}>*</span>
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
                                  value={formik.values.legal_name}
                                  onChngeterm={(e) =>
                                    formik.setFieldValue(
                                      "legal_name",
                                      e.target.value
                                    )
                                  }
                                  error={
                                    formik.touched.legal_name &&
                                    Boolean(formik.errors.legal_name)
                                  }
                                  helperText={
                                    formik.touched.legal_name &&
                                    formik.errors.legal_name
                                  }
                                  type="text"
                                  variant="outlined"
                                />
                              </Box>

                              {formik.values.administrator_type === 'legal_entity' && (
                                <Box width="100%">
                                  <TypographyMD
                                    variant="paragraph"
                                    label={t("Company Business Name")}
                                    color="#626F86"
                                    fontFamily="Roboto"
                                    fontSize="14px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                  <Inputfield
                                    autoFocus={false}
                                    value={formik.values.trade_name}
                                    onChngeterm={(e) =>
                                      formik.setFieldValue(
                                        "trade_name",
                                        e.target.value
                                      )
                                    }
                                    error={
                                      formik.touched.trade_name &&
                                      Boolean(formik.errors.trade_name)
                                    }
                                    helperText={
                                      formik.touched.trade_name &&
                                      formik.errors.trade_name
                                    }
                                    type="text"
                                    variant="outlined"
                                  />
                                </Box>
                              )}
                            </Box>

                            <Box
                              display="flex"
                              flexDirection={{ xs: "column", md: "row" }}
                              gap={{ xs: 1.5, md: 2 }}
                            >
                              <Box width="100%">
                                <TypographyMD
                                  variant="paragraph"
                                  label={
                                    <span>
                                      {t("Business Sector/Industry")}
                                      {formik.values.business_sector === "" && (
                                        <span style={{ color: "red", marginLeft: 4 }}>*</span>
                                      )}
                                    </span>
                                  }
                                  color="#626F86"
                                  fontFamily="Roboto"
                                  fontSize="14px"
                                  fontWeight={450}
                                  align="left"
                                />
                                <SelectField
                                  value={formik.values.business_sector}
                                  onChangeTerm={(e) =>
                                    formik.setFieldValue(
                                      "business_sector",
                                      e.target.value
                                    )
                                  }
                                  options={[
                                    { value: "llc", label: t("businessTypeOptions.llc") },
                                    { value: "corporation", label: t("businessTypeOptions.corporation") },
                                    { value: "partnership", label: t("businessTypeOptions.partnership") },
                                    { value: "sole_proprietorship", label: t("businessTypeOptions.sole_proprietorship") },
                                    { value: "cooperative", label: t("businessTypeOptions.cooperative") },
                                    { value: "non_profit", label: t("businessTypeOptions.non_profit") },
                                    { value: "other", label: t("businessTypeOptions.other") }
                                  ]}
                                  error={
                                    formik.touched.business_sector &&
                                    Boolean(formik.errors.business_sector)
                                  }
                                  helperText={
                                    formik.touched.business_sector &&
                                    formik.errors.business_sector
                                  }
                                />
                              </Box>

                              {formik.values.administrator_type === 'legal_entity' && (
                                <Box width="100%">
                                  <TypographyMD
                                    variant="paragraph"
                                    label={t("Company Registration No.")}
                                    color="#626F86"
                                    fontFamily="Roboto"
                                    fontSize="14px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                  <Inputfield
                                    autoFocus={false}
                                    value={formik.values.company_registration_number}
                                    onChngeterm={(e) =>
                                      formik.setFieldValue(
                                        "company_registration_number",
                                        e.target.value
                                      )
                                    }
                                    error={
                                      formik.touched.company_registration_number &&
                                      Boolean(formik.errors.company_registration_number)
                                    }
                                    helperText={
                                      formik.touched.company_registration_number &&
                                      formik.errors.company_registration_number
                                    }
                                    type="text"
                                    variant="outlined"
                                  />
                                </Box>
                              )}
                            </Box>

                            <Box
                              display="flex"
                              flexDirection={{ xs: "column", md: "row" }}
                              gap={{ xs: 1.5, md: 2 }}
                            >
                              <Box width="100%">
                                <TypographyMD
                                  variant="paragraph"
                                  label={
                                    <span>
                                      {t("Business Email")}
                                      {formik.values.business_email === "" && (
                                        <span style={{ color: "red", marginLeft: 4 }}>*</span>
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
                                  value={formik.values.business_email}
                                  onChngeterm={(e) =>
                                    formik.setFieldValue(
                                      "business_email",
                                      e.target.value
                                    )
                                  }
                                  error={
                                    formik.touched.business_email &&
                                    Boolean(formik.errors.business_email)
                                  }
                                  helperText={
                                    formik.touched.business_email &&
                                    formik.errors.business_email
                                  }
                                  type="text"
                                  variant="outlined"
                                />
                              </Box>

                              <Box width="100%">
                                <TypographyMD
                                  variant="paragraph"
                                  label={
                                    <span>
                                      {t("Business Phone No.")}
                                      {formik.values.business_phone_number === "" && (
                                        <span style={{ color: "red", marginLeft: 4 }}>*</span>
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
                                  value={formik.values.business_phone_number}
                                  onChangeTerm={(business_phone_number) =>
                                    formik.setFieldValue(
                                      "business_phone_number",
                                      business_phone_number
                                    )
                                  }
                                  onBlur={() =>
                                    formik.setFieldTouched(
                                      "business_phone_number",
                                      true
                                    )
                                  }
                                  error={
                                    formik.touched.business_phone_number &&
                                    Boolean(formik.errors.business_phone_number)
                                  }
                                  helperText={
                                    formik.touched.business_phone_number &&
                                    formik.errors.business_phone_number
                                  }
                                />
                              </Box>
                            </Box>
{/* 
                            <Box
                              display="flex"
                              flexDirection={{ xs: "column", md: "row" }}
                              gap={{ xs: 1.5, md: 2 }}
                            >
                              <Box width="100%">
                                <TypographyMD
                                  variant="paragraph"
                                  label={
                                    <span>
                                      {t("Business Type")}
                                      {formik.values.business_type === "" && (
                                        <span style={{ color: "red", marginLeft: 4 }}>*</span>
                                      )}
                                    </span>
                                  }
                                  color="#626F86"
                                  fontFamily="Roboto"
                                  fontSize="14px"
                                  fontWeight={450}
                                  align="left"
                                />
                                <SelectField
                                  value={formik.values.business_type}
                                  onChangeTerm={(e) =>
                                    formik.setFieldValue(
                                      "business_type",
                                      e.target.value
                                    )
                                  }
                                  options={[
                                    { value: "llc", label: t("businessTypeOptions.llc") },
                                    { value: "corporation", label: t("businessTypeOptions.corporation") },
                                    { value: "partnership", label: t("businessTypeOptions.partnership") },
                                    { value: "sole_proprietorship", label: t("businessTypeOptions.sole_proprietorship") },
                                    { value: "cooperative", label: t("businessTypeOptions.cooperative") },
                                    { value: "non_profit", label: t("businessTypeOptions.non_profit") },
                                    { value: "other", label: t("businessTypeOptions.other") }
                                  ]}
                                  error={
                                    formik.touched.business_type &&
                                    Boolean(formik.errors.business_type)
                                  }
                                  helperText={
                                    formik.touched.business_type &&
                                    formik.errors.business_type
                                  }
                                />
                              </Box>
                            </Box> */}

                            <Box
                              display="flex"
                              flexDirection="column"
                              gap={1.5}
                            >
                              <Box width="100%">
                                <TypographyMD
                                  variant="paragraph"
                                  label={t("Business Activity")}
                                  color="#626F86"
                                  fontFamily="Roboto"
                                  fontSize="14px"
                                  fontWeight={450}
                                  align="left"
                                />

                                <Box
                                  component="div"
                                  ref={businessActivityRef}
                                  contentEditable
                                  suppressContentEditableWarning={true}
                                  onInput={(e) => {
                                    formik.setFieldValue(
                                      "business_activity",
                                      e.currentTarget.innerHTML
                                    );
                                  }}
                                  onBlur={() => {
                                    formik.setFieldTouched("business_activity", true);
                                  }}
                                  sx={{
                                    minHeight: "120px",
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    p: 2,
                                    outline: "none",
                                    fontSize: "14px",
                                    fontFamily: "Roboto, sans-serif",
                                    lineHeight: 1.5,
                                    border:
                                      formik.touched.business_activity &&
                                        formik.errors.business_activity
                                        ? "1px solid #d32f2f"
                                        : "1px solid #c4c4c4",
                                    borderRadius: "4px",
                                    backgroundColor: "#fff",

                                    "&:empty:before": {
                                      content: `"${t("enterBusinessActivity")}"`,
                                      color: "#999",
                                      fontStyle: "italic",
                                    },

                                    "& p": { margin: "0 0 8px 0" },
                                    "& ul, & ol": { margin: "0 0 8px 0", paddingLeft: "20px" },
                                    "& li": { margin: "0 0 4px 0" },
                                  }}
                                />

                                {formik.touched.business_activity &&
                                  formik.errors.business_activity && (
                                    <Typography
                                      variant="caption"
                                      color="error"
                                      sx={{ mt: 0.5, ml: 1.5, display: "block" }}
                                    >
                                      {formik.errors.business_activity}
                                    </Typography>
                                  )}
                              </Box>
                              <Box width="100%">
                                <TypographyMD
                                  variant="paragraph"
                                  label={t("Business primary color")}
                                  color="#626F86"
                                  fontFamily="Roboto"
                                  fontSize="14px"
                                  fontWeight={450}
                                  align="left"
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <input
                                    type="color"
                                    value={formik.values.primary_color || '#1976d2'}
                                    onChange={(e) =>
                                      formik.setFieldValue("primary_color", e.target.value)
                                    }
                                    style={{
                                      width: "60px",
                                      height: "40px",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer"
                                    }}
                                  />
                                  <Inputfield
                                    autoFocus={false}
                                    value={formik.values.primary_color || '#1976d2'}
                                    onChngeterm={(e) =>
                                      formik.setFieldValue("primary_color", e.target.value)
                                    }
                                    error={
                                      formik.touched.primary_color &&
                                      Boolean(formik.errors.primary_color)
                                    }
                                    helperText={
                                      formik.touched.primary_color &&
                                      formik.errors.primary_color
                                    }
                                    type="text"
                                    variant="outlined"
                                    style={{ flex: 1 }}
                                  />
                                </Box>
                              </Box>
                              <Box width="100%">
                                <TypographyMD
                                  variant="paragraph"
                                  label={t("Business Secondary color")}
                                  color="#626F86"
                                  fontFamily="Roboto"
                                  fontSize="14px"
                                  fontWeight={450}
                                  align="left"
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <input
                                    type="color"
                                    value={formik.values.secondary_color || '#ff9800'}
                                    onChange={(e) =>
                                      formik.setFieldValue("secondary_color", e.target.value)
                                    }
                                    style={{
                                      width: "60px",
                                      height: "40px",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer"
                                    }}
                                  />
                                  <Inputfield
                                    autoFocus={false}
                                    value={formik.values.secondary_color || '#ff9800'}
                                    onChngeterm={(e) =>
                                      formik.setFieldValue("secondary_color", e.target.value)
                                    }
                                    error={
                                      formik.touched.secondary_color &&
                                      Boolean(formik.errors.secondary_color)
                                    }
                                    helperText={
                                      formik.touched.secondary_color &&
                                      formik.errors.secondary_color
                                    }
                                    type="text"
                                    variant="outlined"
                                    style={{ flex: 1 }}
                                  />
                                </Box>
                              </Box>
                            </Box>

                            {/* Logo */}
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("Logo")}{" "}
                                  {/* <span style={{ color: "red", marginLeft: 4 }}>*</span> */}
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
                                height: { xs: "20vh", sm: "25vh" },
                                border: isDraggingLogo
                                  ? "2px dashed #3f51b5"
                                  : "2px dashed rgba(9, 30, 66, 0.14)",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: isDraggingLogo
                                  ? "#e3f2fd"
                                  : "#F6F8FB",
                                position: "relative",
                                cursor: uploading ? "not-allowed" : "pointer",
                                overflow: "hidden",
                                transition: "all 0.2s ease-in-out",
                              }}
                              onClick={() => !uploading && document.getElementById("logo-upload-input").click()}
                              onDragOver={handleDragOverLogo}
                              onDragLeave={handleDragLeaveLogo}
                              onDrop={handleDropLogo}
                            >
                              <input
                                id="logo-upload-input"
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleLogoChange}
                              />

                              {!previewLogo ? (
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
                                    src={previewLogo}
                                    alt="preview"
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
                                      handleRemoveLogo();
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

                              {uploading && (
                                <Box sx={{
                                  position: "absolute",
                                  inset: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                                  borderRadius: "8px"
                                }}>
                                  <CircularProgress size={28} />
                                </Box>
                              )}
                            </Box>

                            {/* Company Document (only for legal entities) */}
                            {formik.values.administrator_type === 'legal_entity' && (
                              <>
                                <TypographyMD
                                  variant="paragraph"
                                  label={
                                    <span>
                                      {t("businessId")}
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
                                    height: { xs: "15vh", sm: "20vh" },
                                    border: isDraggingCompanyDoc
                                      ? "2px dashed #3f51b5"
                                      : "2px dashed rgba(9, 30, 66, 0.14)",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: isDraggingCompanyDoc
                                      ? "#e3f2fd"
                                      : "#F6F8FB",
                                    position: "relative",
                                    cursor: "pointer",
                                    overflow: "hidden",
                                    transition: "all 0.2s ease-in-out",
                                  }}
                                  onClick={() =>
                                    document
                                      .getElementById("company-doc-upload-input")
                                      .click()
                                  }
                                  onDragOver={handleDragOverCompanyDoc}
                                  onDragLeave={handleDragLeaveCompanyDoc}
                                  onDrop={handleDropCompanyDoc}
                                >
                                  <input
                                    id="company-doc-upload-input"
                                    type="file"
                                    accept=".pdf,image/*"
                                    style={{ display: "none" }}
                                    onChange={handleCompanyDocChange}
                                  />

                                  {!previewCompanyDoc ? (
                                    <div style={{ display: "flex", gap: 5 }}>
                                      <AttachFile sx={{ color: "#626F86", fontSize: 17 }} />
                                      <TypographyMD
                                        variant="paragraph"
                                        label={
                                          <>
                                            {t("Drag file here or click to")}{" "}
                                            <span style={{ color: "#006EC2" }}>{t("browse")}</span>
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
                                      {!companyDocFileName?.toLowerCase().endsWith(".pdf") ? (
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
                                            src={previewCompanyDoc}
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
                                            label={companyDocFileName}
                                            color="#626F86"
                                            fontFamily="Roboto"
                                            fontSize="12px"
                                            fontWeight={450}
                                          />
                                        </div>
                                      )}

                                      <IconButton
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveCompanyDoc();
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
                              </>
                            )}
                          </div>
                        </>
                      )}

                      {/* --- Address Details --- */}
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

                            <Box>
                              <TypographyMD
                                variant="paragraph"
                                label={t("Business Address")}
                                color="#626F86"
                                fontFamily="Roboto"
                                fontSize="14px"
                                fontWeight={450}
                                align="left"
                              />
                              <Inputfield
                                autoFocus={false}
                                value={formik.values.business_address}
                                onChngeterm={(e) =>
                                  formik.setFieldValue("business_address", e.target.value)
                                }
                                error={
                                  formik.touched.business_address &&
                                  Boolean(formik.errors.business_address)
                                }
                                helperText={
                                  formik.touched.business_address && formik.errors.business_address
                                }
                                type="text"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        )}
                      </div>

                      <TypographyMD
                        variant="paragraph"
                        label={t("Additional Details")}
                        color="#000000"
                        fontFamily="Roboto"
                        fontSize="15px"
                        fontWeight={750}
                        align="left"
                      />

                      <div style={{ marginBottom: { xs: "3px", sm: "5px" }, marginTop: { xs: "8px", sm: "10px" } }}>

                        <TypographyMD
                          variant="paragraph"
                          label={
                            <span>
                              {t("Account Executive Association")}
                          
                            </span>
                          }
                          color="#626F86"
                          fontFamily="Roboto"
                          fontSize="14px"
                          fontWeight={450}
                          align="left"
                        />

                        <SearchableDropdown
                          value={formik.values.account_executives}
                          onChange={(val) => {
                            formik.setFieldValue("account_executives", val);
                            getZonesByExecutive(val);
                          }}
                          options={accountExecutives
                            ?.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""))
                            .map((exec) => ({
                              id: exec.id,
                              name: `${exec.full_name} (${exec.email})`,
                            })) || []}
                          placeholder="searchAccountExecutive"
                          disabled={accountExecutives.length === 0}
                        />

                        <Box>
                          {formik.values.account_executives && (
                            <Chip
                              label={
                                (() => {
                                  const exec = accountExecutives.find(
                                    (e) => e.id === formik.values.account_executives
                                  );
                                  return exec
                                    ? `${exec.full_name} (${exec.email})`
                                    : "";
                                })()
                              }

                              onDelete={() => formik.setFieldValue("account_executives", "")}
                              sx={{
                                mt: 0,
                                mb: 1,
                                backgroundColor: "#E9F3FF",
                                color: "#006EC2",
                                fontWeight: 500,
                              }}
                            />
                          )}
                        </Box>



                        {/* <TypographyMD
  variant="paragraph"
  label={
    <span>
      {t("Region Code / Zone")}
      {formik.values.territory_zone.length === 0 && (
        <span style={{ color: "red", marginLeft: 4 }}>*</span>
      )}
    </span>
  }
  color="#626F86"
  fontFamily="Roboto"
  fontSize="14px"
  fontWeight={450}
  align="left"
/> */}

                        {/* <SelectField
  multiple
  value={formik.values.territory_zone || []}
  onChangeTerm={(e) => {
    formik.setFieldValue("territory_zone", e.target.value);
  }}
  options={zones.map((zone) => ({
    value: zone.value || zone,
    label: zone.label || zone,
  }))}
  error={formik.touched.territory_zone && Boolean(formik.errors.territory_zone)}
  helperText={formik.touched.territory_zone && formik.errors.territory_zone}
/> */}

                      </div>
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
                py: { xs: 1.5, sm: 1 },
                px: { xs: 2, sm: 1 },
                zIndex: 1,
              }}
            >
              <ButtonMD
                variant="contained"
                title={t("Save & Send Invite")}
                startIcon={<CheckCircleOutline />}
                width={{ xs: "100%", sm: "fit-content" }}
                type="submit"
                borderColor="orange"
                backgroundColor="orange"
                borderRadius="5px"
                disabled={loading}
                onClickTerm={(e) => {
                  console.log("Save button clicked");
                  console.log("Form is valid:", formik.isValid);
                  console.log("Form errors:", formik.errors);
                  console.log("Form values:", formik.values);
                  console.log("Form touched:", formik.touched);

                  if (!formik.isValid) {
                    console.log("Form is invalid, showing validation errors");
                    formik.setTouched({
                      first_name: true,
                      last_name: true,
                      email: true,
                      phone_number: true,
                      legal_name: true,
                      business_sector: true,
                      business_email: true,
                      business_phone_number: true,
                      region_code: true,
                      account_executives: true,
                      subscription_type: true,
                    });
                  }
                }}
              />
            </Box>
          </form>
        }
      />

      {/* Image Cropper Modal */}
      {cropModalOpen && (
        <ImageCropper
          onCropComplete={handleCropComplete}
          selectedImage={selectedImage}
          onClose={() => {
            setCropModalOpen(false);
            setSelectedImage(null);
          }}
        />
      )}
    </>
  )
}
export default AddCompanyAdmin