import React, { useEffect, useRef, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Autocomplete,
  TextField,
} from "@mui/material";
import TypographyMD from "../../components/items/Typography";
import exportIcon from "../../Assets/export_icon.png";
import addIcon from "../../Assets/add_icon.png";
import menu_icon from "../../Assets/menu_icon.png";
import confirmation_icon from "../../Assets/confirmation_icon.png";
import csvIcon from "../../Assets/csvIcon.png";
import pdfIcon from "../../Assets/pdfIcon.png";
import Topbar from "../../components/topbar/Topbar";
import nousers from "../../Assets/no-user.png";
import filter from "../../Assets/filter.png";
import LocationHelperModal from "../../components/Locationhelper";
import { exportTable } from "../../helper_functions/ExportData";

import {
  ArrowBackIos,
  ArrowForwardIos,
  status,
  Error,
  Filter,
  FilterAlt,
  Search,
  Star,
  StarBorder,
  StarHalf,
  Visibility,
  CheckCircleOutline,
  Block,
  Email,
  AddCircle,
  Close,
  AttachFile,
  KeyboardArrowDown,
  ContentCopy,
  Pending,
  ToggleOff,
  ArrowDownward,
  ArrowUpward,
  FilterList,
  Close as CloseIcon,
} from "@mui/icons-material";
import ModalAdd from "../../components/items/Modal";
import ButtonMD from "../../components/items/ButtonMD";
import ModalSuccess from "../../components/items/ModalSuccess";
import url from "../../url";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  REGION_TO_COUNTRY_ISO,
  getCountriesByRegion,
} from "../../helper_functions/regionHelper";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  BlobProvider,
  Image,
  pdf,
} from "@react-pdf/renderer";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import Inputfield from "../../components/items/Inputfield";
import SelectField from "../../components/items/Selectfield";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Countryfield from "../../components/items/Countryfield";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import ModalConfirmation from "../../components/items/ModalConfirmation";
import StatusFilter from "../../components/StatusFilter";
import AccountStatusDropdown from "../../components/AccountStatusDropdown";
import VerificationStatusDropdown from "../../components/VerificationStatusDropdown";
import ExportMenuButton from "../../components/ExportMenuButton";
import FormatDate from "../../components/FormatDate";
// import { MapContainer } from 'react-leaflet/MapContainer'
// import { TileLayer } from 'react-leaflet/TileLayer'
// import { useMap } from 'react-leaflet/hooks'
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "../../App.css";
import "leaflet/dist/leaflet.css";
import LocationPicker from "../../components/LocationPicker";
import MultiRegionSelector from "../../components/items/RegionSelector";
const SortIcons = ({ column, sortBy, sortOrder }) => (
  <>
    {sortBy === column && sortOrder === "ASC" ? (
      <ArrowUpward sx={{ fontSize: "17px" }} />
    ) : (
      <ArrowDownward sx={{ fontSize: "17px" }} />
    )}
  </>
);

function AccountExecutive() {
  const actionBtnBase = {
    padding: "5px",
    color: "#172B4D",
    borderRadius: "5px",
    boxShadow: "none",
    fontFamily: "Poppins, sans-serif",
    letterSpacing: ".5px",
    textTransform: "capitalize",
    "&:hover": { boxShadow: "none" },
  };

  const greenActionSx = {
    ...actionBtnBase,
    backgroundColor: "#4BCE97",
    width: { xs: "48%", sm: "80px" },
    "&:hover": { backgroundColor: "#4BCE97" },
  };

  const redActionSx = {
    ...actionBtnBase,
    backgroundColor: "#F87168",
    width: { xs: "48%", sm: "80px" },
    "&:hover": { backgroundColor: "#F87168" },
  };

  const addButtonSx = {
    width: { xs: "100%", sm: 110 },
    height: 35,
    backgroundColor: "#006EC2",
    borderRadius: 1,
    boxShadow: "none",
    color: "#fff",
    fontFamily: "Poppins, sans-serif",
    letterSpacing: ".5px",
    textTransform: "capitalize",
    "&:hover": { backgroundColor: "#006EC2", boxShadow: "none" },
  };

  const { token, tokenExpiry } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const fieldCommonSx = {
    height: "35px",
    borderRadius: "6px",
    border: "2px solid rgba(9, 30, 66, 0.14)",
    backgroundColor: "#fff",
    fontSize: { xs: "14px", md: "15px" },
    "&:hover": {
      borderColor: "#006EC2", // ✅ unified hover
    },
    "&.Mui-focused": {
      borderColor: "#006EC2", // ✅ unified focus
    },
    color: "rgba(27, 27, 27, 0.67)",
  };

  //my code for implementing empty icons
  const [noData, setNoData] = useState(false);
  //==
  const [allusers, setAllusers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(7); // default 10 records per page
  const [searchTerm, setSearchTerm] = useState("");
  const isSortingRef = useRef(false);
  const [sortingLoader, setSortingLoader] = useState(false);
  const [initialLoader, setInitialLoader] = useState(true);
  const [sortBy, setSortBy] = useState("registered");
  const [sortOrder, setSortOrder] = useState("DSC");

  const fetchAllUsersForExport = async () => {
    const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
    const sortParams = sortBy
      ? `&sort_by=${sortBy}&sort_order=${sortOrder}`
      : "";
    const searchParam = searchTerm ? `&search=${searchTerm}` : "";
    const dateFromParam = dateFrom ? `&date_from=${dateFrom}` : "";
    const dateToParam = dateTo ? `&date_to=${dateTo}` : "";

    const apiUrl = `${url}super-admin/account-executives?no_pagination=true${statusParam}${sortParams}${searchParam}${dateFromParam}${dateToParam}`;

    try {
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data?.data?.account_executives || [];
    } catch (err) {
      console.error("Export fetch failed", err);
      return [];
    }
  };

  const [exportingUsers, setExportingUsers] = useState(false);

  // localized fallback helpers
  const isEmptyValue = (value) => {
    return (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      value === "null" ||
      value === "undefined"
    );
  };

  const displayValue = (value) => (isEmptyValue(value) ? t("N/A") : value);

  const handleExportData = async (format) => {
    setExportingUsers(true); // start loader

    try {
      const allData = await fetchAllUsersForExport();

      if (!allData.length) {
        toast.error(t("No data available for export."));
        return;
      }

      // Skip image URLs and unwanted columns
      const skipColumns = ["profile_picture", "profile_picture_url", "company_logo", "company_logo_url", "id"];

      // Flatten all fields: convert objects/arrays to string, skip skipped columns
      const flattenedData = allData.map((item) => {
        const flatItem = {};
        Object.keys(item).forEach((key) => {
          if (skipColumns.includes(key)) return;
          const value = item[key];
          if (value && typeof value === "object") {
            flatItem[key] = JSON.stringify(value);
          } else if (typeof value === "string" && value.length > 100) {
            flatItem[key] = value.substring(0, 100) + "...";
          } else {
            flatItem[key] = isEmptyValue(value) ? t("N/A") : value;
          }
        });
        return flatItem;
      });

      if (format.toLowerCase() === "pdf") {
        await exportTable(flattenedData, t("Account Executives"), "pdf", { skipColumns: [] });
      } else if (format.toLowerCase() === "excel") {
        await exportTable(flattenedData, t("Account Executives"), "xlsx", { skipColumns: [] });
      } else {
        toast.error(t("Unsupported export format."));
      }
    } catch (err) {
      toast.error(t("Failed to export Account Executives. Please try again."));
    } finally {
      setExportingUsers(false); // stop loader
    }
  };


  const getallusers = async (
    page = 1,
    search = "",
    status = "all",
    sort_by = sortBy,
    sort_order = sortOrder,
    isSorting = false,
    date_from = "",
    date_to = ""
  ) => {
    if (isSorting) {
      setSortingLoader(true);
    } else {
      setInitialLoader(true);
    }

    let statusParam = status !== "all" ? `&status=${status}` : "";
    let sortParams = sort_by
      ? `&sort_by=${sort_by}&sort_order=${sort_order}`
      : "";
    let dateFromParam = date_from ? `&date_from=${date_from}` : "";
    let dateToParam = date_to ? `&date_to=${date_to}` : "";

    // const InsertAPIURL = ``;
    const InsertAPIURL = `${url}super-admin/account-executives?page=${page}&limit=${limit}&search=${search}${statusParam}${sortParams}${dateFromParam}${dateToParam}`;

    //updated try block for empty icon check
    try {
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const executives = data?.data?.account_executives;
      if (!data || data.error || !Array.isArray(executives)) {
        setAllusers([]); // reset users
        setTotalPages(1); // fallback
        setNoData(true); // you can use this to conditionally render "No Data Found" UI
        return;
      }

      setAllusers(executives);
      setTotalPages(data?.data?.pagination?.pages || 1);
      setNoData(false);
    } catch (error) {
      setAllusers([]);
      setNoData(true);
    } finally {
      if (isSorting) {
        setSortingLoader(false);
      } else {
        setInitialLoader(false);
      }
    }
  };

  //till here

  const handleSort = (column) => {
    const newSortOrder =
      sortBy === column && sortOrder === "ASC" ? "DSC" : "ASC";

    isSortingRef.current = true; // Mark sorting in progress

    setSortBy(column);
    setSortOrder(newSortOrder);

    // You no longer need to call getallusers here directly — let the useEffect handle it
  };

  const [statusFilter, setStatusFilter] = useState("all");

  // Filter modal states
  const [openModalFilter, setOpenModalFilter] = useState(false);
  const [draftStatus, setDraftStatus] = useState("all");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

  // Active filter states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // const handleStatusChange = (event) => {
  //   const status = event.target.value;
  //   setStatusFilter(status);
  //   getallusers(1, "", status); // Call with status filter
  // };

  const handleStatusChange = (event) => {
    const status = event.target.value;
    setStatusFilter(status);
    setCurrentPage(1); // ✅ reset to first page when filter changes
    getallusers(1, searchTerm, status, sortBy, sortOrder);
  };

  // Check if any filters are active
  const isFilterActive = () => {
    return (
      statusFilter !== "all" ||
      dateFrom !== "" ||
      dateTo !== ""
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setDraftStatus("all");
    setDraftStartDate("");
    setDraftEndDate("");

    // Reset to default state
    getallusers(1, searchTerm, "all", sortBy, sortOrder, false, "", "");
  };

  // Handle filter submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const statusParam = draftStatus.toLowerCase() !== "all" ? draftStatus.toLowerCase() : "all";

    // Call API immediately with selected filters
    getallusers(
      1,                 // page
      searchTerm,        // search
      statusParam,       // status
      sortBy,
      sortOrder,
      false,             // isSorting
      draftStartDate,    // date_from
      draftEndDate       // date_to
    );

    // Update active states for modal inputs
    setStatusFilter(statusParam);
    setDateFrom(draftStartDate);
    setDateTo(draftEndDate);

    setOpenModalFilter(false);
    setLoading(false);
  };

  const filteredData = allusers?.filter(
    (item) =>
      (item?.full_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (item?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const handlePageChange = (event, value) => {
  //   setCurrentPage(value);
  //   getallusers(value, searchTerm); // fetch new page from server
  // };

  const handlePageChange = (event, page) => {
    setCurrentPage(page); // update state
    getallusers(
      page,
      searchTerm,
      statusFilter, // ✅ pass current filter value
      sortBy,
      sortOrder,
      isSortingRef.current
    );
  };

  const [isDragging, setIsDragging] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Legal Document Upload States
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [docFileName, setDocFileName] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
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

  // Upload function for legal document
  const uploadLegalDocToServer = async (file) => {
    const form = new FormData();
    form.append("pdf", file);
    const res = await fetch(`${url}upload/pdf`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Upload failed");
    return data?.data?.url || data?.url || data?.path || "";
  };

  // Legal Document Handlers
  const handleDocChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedDoc(file);
      setPreviewDoc(URL.createObjectURL(file));
      setDocFileName(file.name);

      try {
        const uploadedUrl = await uploadLegalDocToServer(file);
        formik.setFieldValue("legal_document_url", uploadedUrl);
        toast.success("Legal document uploaded successfully");
      } catch (error) {
        toast.error("Failed to upload legal document");
        setSelectedDoc(null);
        setPreviewDoc(null);
        setDocFileName("");
        formik.setFieldValue("legal_document_url", "");
      }
    }
  };

  const handleRemoveDoc = () => {
    setSelectedDoc(null);
    setPreviewDoc(null);
    setDocFileName("");
    formik.setFieldValue("legal_document_url", "");
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
        const uploadedUrl = await uploadLegalDocToServer(file);
        formik.setFieldValue("legal_document_url", uploadedUrl);
        toast.success("Legal document uploaded successfully");
      } catch (error) {
        toast.error("Failed to upload legal document");
        setSelectedDoc(null);
        setPreviewDoc(null);
        setDocFileName("");
        formik.setFieldValue("legal_document_url", "");
      }
    }
  };

  const validationSchema = yup.object({
    first_name: yup.string().required(t("First name is required")),
    last_name: yup.string().required(t("Last name is required")),
    middle_name: yup.string().nullable(),
    dob: yup
      .date()
      .nullable()
      .test(
        "min-age",
        t("You must be at least 18 years old"),
        function (value) {
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
    email: yup
      .string()
      .email(t("Enter a valid email"))
      .required(t("Email is required")),
    phone: yup.string().required(t("Phone number is required")),
    companies: yup
      .array()
      .min(1, t("At least one company is required"))
      .required(t("Company is required")),
    country: yup.string().required(t("Country is required")),
    province: yup.string().required(t("Province is required")),
    postal_code: yup
      .number()
      .typeError(t("Postal code must be a number"))
      .nullable()
      .min(0, t("Postal code cannot be negative"))
      .max(99999, t("Postal code must be up to 5 digits")),
    community: yup.string().nullable(),
    city: yup.string().required(t("City is required")),
    street: yup.string().nullable(),
    latitude: yup.number().nullable(),
    longitude: yup.number().nullable(),
    legal_document_url: yup.string().required(t("Legal document is required")),
    assigned_zone: yup.string().required(t("Assigned Zone is required")),
  });
  const [open, setOpen] = useState(false);
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
      legal_document_url: "",
      assigned_zone: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {

      const safeValue = (val) =>
        val && val.toString().trim() !== "" ? val : "-";

      // Check if required fields are filled
      if (!values.first_name || !values.last_name || !values.email) {
        toast.error(t("Please fill in all required fields"));
        return;
      }

      // Check if zone is selected
      if (!selectedZone) {
        toast.error(t("Please select a zone"));
        return;
      }

      // Check if address fields are filled (from LocationPicker or Manual Address)
      if (!values.country) {
        toast.error(t("Please select a country"));
        return;
      }

      if (!values.city) {
        toast.error(t("Please select a city"));
        return;
      }

      if (!values.province) {
        toast.error(t("Please select a province/state"));
        return;
      }


      // Small delay to ensure formik values are properly set
      await new Promise(resolve => setTimeout(resolve, 100));

      setLoading(true);

      try {
        let imageUrl = "";

        // Step 1: Handle image upload
        if (selectedImage) {
          const imgFormData = new FormData();
          imgFormData.append("image", selectedImage);

          const uploadResponse = await fetch(`${url}upload/image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: imgFormData,
          });

          const uploadResult = await uploadResponse.json();

          if (!uploadResult.error) {
            imageUrl = uploadResult.data.url;
          } else {
            toast.error(t("Image upload failed"));
            setLoading(false);
            return;
          }
        }

        // Step 2: Prepare form data
        const InsertAPIURL = `${url}super-admin/account-executives`;
        const formData = new FormData();

        // Basic user information
        formData.append("first_name", safeValue(values.first_name));
        formData.append("last_name", safeValue(values.last_name));
        formData.append("middle_name", safeValue(values.middle_name));
        formData.append("dob", safeValue(values.dob));
        formData.append("email", safeValue(values.email));
        formData.append("phone", safeValue(values.phone || t("Not Provided")));

        // Companies assignment - send as JSON stringified array
        if (values.companies && values.companies.length > 0) {
          const companiesJson = JSON.stringify(values.companies);
          formData.append("companies", companiesJson);
        }

        // Zone assignment (replacing assignee_region_zone)
        if (selectedZone) {
          formData.append("assignee_region_zone", safeValue(selectedZone));
          formData.append("region", safeValue(selectedZone));
        }

        // Address information (from LocationPicker or Manual Address)
        formData.append("country", safeValue(values.country));
        formData.append("province", safeValue(values.province));
        formData.append("city", safeValue(values.city));
        formData.append("postal_code", safeValue(values.postal_code));
        formData.append("street_address", safeValue(values.street));
        formData.append("manual_address", safeValue(values.street));
        formData.append("community", safeValue(values.community));

        // Add coordinates only if they exist (optional for manual address)
        if (values.latitude !== null && values.longitude !== null) {
          formData.append("latitude", values.latitude);
          formData.append("longitude", values.longitude);
        }

        // Profile picture
        if (imageUrl) {
          formData.append("profile_picture_url", imageUrl);
        }

        // Legal document
        if (values.legal_document_url) {
          formData.append("legal_document_url", values.legal_document_url);
        }


        // Step 3: Send to API
        console.log("Sending API request to:", InsertAPIURL);
        console.log("Form data entries:", Array.from(formData.entries()));

        const response = await fetch(InsertAPIURL, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        console.log("API response status:", response.status);
        const result = await response.json();
        console.log("API response data:", result);

        setLoading(false);

        if (result.error) {
          toast.error(result.message || t("Something went wrong! Please try again."));
        } else {
          toast.success(t("Account Executive created successfully"));
          getallusers(1, "", statusFilter);
          setOpenModalAdd(false);

          // Reset form and clear image
          resetForm();
          setSelectedImage(null);
          setPreviewUrl(null);
        }
      } catch (error) {
        console.error("🔥 Exception caught during submission:", error);
        toast.error(t("Something went wrong! Please try again."));
        setLoading(false);
      }
    },
  });


  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleCheckboxChange = (event, target) => {
    const checked = event.target.checked;

    if (target === "selectAll") {
      setSelectAll(checked);
      if (checked) {
        // Select all on the current page
        const allIds = allusers.map((item) => item.id);
        setSelectedRows(allIds);
      } else {
        // Deselect all
        setSelectedRows([]);
      }
    } else {
      if (checked) {
        setSelectedRows((prev) => [...prev, target]);
      } else {
        setSelectedRows((prev) => prev.filter((id) => id !== target));
      }
    }
  };

  const [countries, setCountries] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Manual address states
  const [manualAddress, setManualAddress] = useState(false);
  const [countriesData, setCountriesData] = useState([]);
  const [manualCountries, setManualCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [loadingManualCountries, setLoadingManualCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [updatingMap, setUpdatingMap] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Force map re-render
  const [mapPosition, setMapPosition] = useState(null); // Track map position

  // Zone-based cascading states
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [zoneCountries, setZoneCountries] = useState([]);
  const [zoneStates, setZoneStates] = useState([]);
  const [zoneCities, setZoneCities] = useState([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingZoneCountries, setLoadingZoneCountries] = useState(false);
  const [loadingZoneStates, setLoadingZoneStates] = useState(false);
  const [loadingZoneCities, setLoadingZoneCities] = useState(false);

  // Current location states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Get current location (automatic, silent)
  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(coords);
          setMapPosition(coords);
          formik.setFieldValue("latitude", coords.lat);
          formik.setFieldValue("longitude", coords.lng);
          setMapKey(prev => prev + 1);
          setLocationLoading(false);
          // Silent success - no toast message
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationLoading(false);
          // Silent error - no toast message for automatic detection
        }
      );
    } else {
      setLocationLoading(false);
      // Silent error - no toast message for automatic detection
    }
  };

  const getCountries = async () => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags")
      .then((res) => res.json())
      .then((data) => {
        setCountries(data);
      })
      .catch((error) => {
        toast.error(t("Something went wrong! Please try again."));
      });
  };

  const getCompanies = async () => {
    setLoadingCompanies(true);
    try {
      // Use the correct companies endpoint
      const response = await fetch(`${url}account-executive/companies`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response companies", response)
      if (response.ok) {
        const data = await response.json();

        // Handle the specific API response structure
        if (data.data && data.data.companies) {
          setCompanies(data.data.companies);
        } else if (data.companies) {
          setCompanies(data.companies);
        } else if (data.data && Array.isArray(data.data)) {
          setCompanies(data.data);
        } else if (Array.isArray(data)) {
          setCompanies(data);
        } else {
          setCompanies([]);
        }
      } else {
        toast.error("Failed to fetch companies");
        setCompanies([]);
      }
    } catch (error) {
      toast.error("Error fetching companies");
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Zone-based cascading functions - using API
  const getZones = async () => {
    setLoadingZones(true);
    try {
      // Fetch regions from REST Countries API
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,region,subregion');
      const data = await response.json();

      if (data && Array.isArray(data)) {
        // Extract unique regions and sort alphabetically
        const uniqueRegions = [...new Set(data.map(country => country.region).filter(Boolean))].sort();
        const regionOptions = uniqueRegions.map(region => ({
          name: region,
          countries: data.filter(country => country.region === region).map(country => country.name.common).sort()
        }));

        setZones(regionOptions);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
      toast.error("Failed to load zones");
    } finally {
      setLoadingZones(false);
    }
  };

  const getZoneCountries = async (zoneName) => {
    setLoadingZoneCountries(true);
    try {
      const response = await fetch("https://countriesnow.space/api/v0.1/countries/states");
      const data = await response.json();

      if (data.error === false && data.data) {
        const selectedZone = zones.find(zone => zone.name === zoneName);
        if (selectedZone) {
          // Filter countries based on selected zone
          const filteredCountries = data.data.filter(country =>
            selectedZone.countries.includes(country.name)
          );
          setZoneCountries(filteredCountries);
        }
      }
    } catch (error) {
      console.error("Error fetching zone countries:", error);
      toast.error("Failed to load countries for selected zone");
    } finally {
      setLoadingZoneCountries(false);
    }
  };

  const getZoneStates = async (countryName) => {
    if (!countryName) {
      setZoneStates([]);
      return;
    }

    setLoadingZoneStates(true);
    try {
      const response = await fetch("https://countriesnow.space/api/v0.1/countries/states");
      const data = await response.json();

      if (data.error === false && data.data) {
        const selectedCountryData = data.data.find(country => country.name === countryName);
        if (selectedCountryData && selectedCountryData.states) {
          setZoneStates(selectedCountryData.states);
        } else {
          setZoneStates([]);
        }
      }
    } catch (error) {
      console.error("Error fetching zone states:", error);
      toast.error("Failed to load states");
    } finally {
      setLoadingZoneStates(false);
    }
  };

  const getZoneCities = async (countryName, stateName) => {
    if (!countryName || !stateName) {
      setZoneCities([]);
      return;
    }

    setLoadingZoneCities(true);
    try {
      const response = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: countryName,
          state: stateName
        })
      });
      const data = await response.json();

      if (data.error === false && data.data && data.data.length > 0) {
        setZoneCities(data.data);
      } else {
        // If no cities found, use the state name as city option
        setZoneCities([stateName]);
      }
    } catch (error) {
      console.error("Error fetching zone cities:", error);
      // Fallback: use state name as city
      setZoneCities([stateName]);
    } finally {
      setLoadingZoneCities(false);
    }
  };

  // Manual address functions
  const getManualCountries = async () => {
    setLoadingManualCountries(true);
    try {
      const response = await fetch("https://countriesnow.space/api/v0.1/countries/states");
      const data = await response.json();
      const countriesList = Array.isArray(data?.data) ? data.data : [];
      setCountriesData(countriesList);
      setManualCountries(countriesList.map((c) => c.name).sort());
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to load countries");
    } finally {
      setLoadingManualCountries(false);
    }
  };

  // Zone-based handlers
  const handleZoneChange = (value) => {
    setSelectedZone(value);
    if (formik) {
      formik.setFieldValue("assigned_zone", value);
    }
    setSelectedCountry("");
    setSelectedState("");
    setSelectedCity("");
    setZoneCountries([]);
    setZoneStates([]);
    setZoneCities([]);
    formik.setFieldValue("country", "");
    formik.setFieldValue("province", "");
    formik.setFieldValue("city", "");

    if (value) {
      getZoneCountries(value);
    }
  };

  const handleZoneCountryChange = (value) => {
    setSelectedCountry(value);
    setSelectedState("");
    setSelectedCity("");
    setZoneStates([]);
    setZoneCities([]);
    formik.setFieldValue("country", value);
    formik.setFieldValue("province", "");
    formik.setFieldValue("city", "");

    if (value) {
      getZoneStates(value);
    }
  };

  const handleZoneStateChange = (value) => {
    setSelectedState(value);
    setSelectedCity("");
    setZoneCities([]);
    formik.setFieldValue("province", value);
    formik.setFieldValue("city", "");

    if (value && selectedCountry) {
      getZoneCities(selectedCountry, value);
    }
  };

  const handleZoneCityChange = (value) => {
    setSelectedCity(value);
    formik.setFieldValue("city", value);

    // Update map position when city is selected
    if (selectedCountry && selectedState && value) {
      geocodeManualAddress(selectedCountry, selectedState, value);
    }
  };

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
    setSelectedState("");
    setSelectedCity("");
    setCities([]);
    const match = countriesData.find((c) => c.name === value);
    const nextStates = (match?.states || []).map((s) => s.name).sort();
    setStates(nextStates);
    formik.setFieldValue("country", value);
  };

  const handleStateChange = async (value) => {
    setSelectedState(value);
    setSelectedCity("");
    setCities([]);
    formik.setFieldValue("province", value);
    if (!selectedCountry) return;
    try {
      setLoadingCities(true);
      const response = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: selectedCountry, state: value }),
      });
      const data = await response.json();
      const citiesList = Array.isArray(data?.data) ? data.data : [];
      setCities(citiesList.sort());
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Failed to load cities");
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCityChange = (value) => {
    setSelectedCity(value);
    formik.setFieldValue("city", value);

    // Update map position when city is selected (but don't auto-fill address)
    if (selectedCountry && selectedState && value) {
      geocodeManualAddress(selectedCountry, selectedState, value);
    }
  };

  // Geocode manual address selection to update map (coordinates only, no auto-fill address)
  const geocodeManualAddress = async (country, state, city) => {
    setUpdatingMap(true);
    try {
      const query = [city, state, country].filter(Boolean).join(", ");

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
        {
          headers: { "User-Agent": "yourapp/1.0 (contact@example.com)" }
        }
      );

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const result = data[0];
        const coords = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };

        // Update formik values with coordinates only
        formik.setFieldValue("latitude", coords.lat);
        formik.setFieldValue("longitude", coords.lng);

        // Set map position for direct control
        setMapPosition(coords);

        // Force map re-render by updating the key
        setMapKey(prev => prev + 1);

        // Note: We don't auto-fill address fields - user will write their own address
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setUpdatingMap(false);
    }
  };

  // account Status
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusToChange, setStatusToChange] = useState(null);
  const [dropdownAnchorEl, setDropdownAnchorEl] = useState(null);
  const handleOpenStatusMenu = (event, item) => {
    setSelectedItem(item.id); // Store the whole item
    setDropdownAnchorEl(event.currentTarget); // Anchor element
  };

  const handleCloseStatusMenu = () => {
    setDropdownAnchorEl(null);
  };

  const [openModalStatusChange, setOpenModalStatusChange] = useState(false);
  const handleOpenModalStatusChange = (status) => {
    setOpenModalStatusChange(true);
    handleCloseStatusMenu();
    setStatusToChange(status);
  };


  // Verification Status
  const [selectedVerificationItem, setSelectedVerificationItem] =
    useState(null);
  const [verificationStatusToChange, setVerificationStatusToChange] =
    useState(null);
  const [anchorElVerificationStatus, setAnchorElVerificationStatus] =
    useState(null);
  const [
    openModalVerificationStatusChange,
    setOpenModalVerificationStatusChange,
  ] = useState(false);

  const handleOpenVerificationStatusMenu = (event, item) => {
    setSelectedVerificationItem(item.id);
    setAnchorElVerificationStatus(event.currentTarget);
  };

  const handleCloseVerificationStatusMenu = () => {
    setAnchorElVerificationStatus(null);
  };

  const handleOpenVerificationStatusModal = (status) => {
    setVerificationStatusToChange(status);
    setOpenModalVerificationStatusChange(true);
    handleCloseVerificationStatusMenu();
  };











  const [bulkLoading, setBulkLoading] = useState(null);



  // ------------------- Single Status Change -------------------
  const confirmStatusChange = () => {
    if (!selectedItem || !statusToChange) return;

    const InsertAPIURL = `${url}super-admin/account-executives/bulk/status`;
    const validStatusOptions = ["active", "inactive", "blocked"];
    const apiStatus = statusToChange.toLowerCase();

    if (!validStatusOptions.includes(apiStatus)) {
      toast.error(`Invalid status. Must be: ${validStatusOptions.join(", ")}`);
      return;
    }

    const Data = {
      account_executive_ids: [selectedItem],
      status: apiStatus,
    };

    setLoading(true);

    fetch(InsertAPIURL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(Data),
    })
      .then((res) => res.json())
      .then((res) => {
        setLoading(false);

        if (res.error) {
          toast.error(res.message || t("Something went wrong! Please try again."));
        } else if (res.updated_count > 0) {
          toast.success(t("Status changed successfully"));
        }

        setStatusToChange(null);
        setOpenModalStatusChange(false);
        handleCloseStatusMenu();
        getallusers(1, "", statusFilter);
      })
      .catch((err) => {
        setLoading(false);
        toast.error(t("Something went wrong! Please try again."));
        console.error(err);
      });
  };

  // ------------------- Single Verification Status -------------------
  const confirmVerificationStatusChange = () => {
    if (!selectedVerificationItem || !verificationStatusToChange) return;

    setLoading(true);
    const InsertAPIURL = `${url}super-admin/account-executives/bulk/status`;

    const statusOptions = ["active", "inactive", "invited", "requested"];
    const verificationOptions = ["verified", "pending", "rejected"];

    const Data = { account_executive_ids: [selectedVerificationItem] };
    const statusLower = verificationStatusToChange.toLowerCase();

    if (statusOptions.includes(statusLower)) Data.status = statusLower;
    else if (verificationOptions.includes(statusLower)) Data.verification_status = statusLower;
    else {
      toast.error(t("Invalid status value selected"));
      setLoading(false);
      return;
    }

    fetch(InsertAPIURL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(Data),
    })
      .then((res) => res.json())
      .then((res) => {
        setLoading(false);

        if (res.error) toast.error(res.message || t("Something went wrong! Please try again."));
        else if (res.updated_count > 0) toast.success(t("Status changed successfully"));

        setVerificationStatusToChange(null);
        setOpenModalVerificationStatusChange(false);
        getallusers(1, "", statusFilter);
      })
      .catch((err) => {
        setLoading(false);
        toast.error(t("Something went wrong! Please try again."));
        console.error(err);
      });
  };

  // ------------------- Bulk Status Change -------------------
  const handleBulkStatusChange = (status) => {
    if (!selectedRows.length) return;

    setBulkLoading(status);
    const InsertAPIURL = `${url}super-admin/account-executives/bulk/status`;

    const Data = { account_executive_ids: selectedRows, status };

    fetch(InsertAPIURL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(Data),
    })
      .then((res) => res.json())
      .then((res) => {
        setBulkLoading(null);

        if (res.error) toast.error(res.message || t("Something went wrong! Please try again."));
        else if (res.updated_count > 0) toast.success(t("Status changed successfully"));

        setStatusToChange(null);
        setOpenModalStatusChange(false);
        handleCloseStatusMenu();
        getallusers(1, "", statusFilter);
      })
      .catch((err) => {
        setBulkLoading(null);
        toast.error(t("Something went wrong! Please try again."));
        console.error(err);
      });
  };

  // ------------------- Bulk Verification Status Change -------------------
  const handleBulkVerificationStatusChange = () => {
    if (!selectedRows.length) return;

    setBulkLoading("verified");
    const InsertAPIURL = `${url}super-admin/account-executives/bulk/verify`;
    const Data = { account_executive_ids: selectedRows };

    fetch(InsertAPIURL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(Data),
    })
      .then((res) => res.json())
      .then((res) => {
        setBulkLoading(null);

        if (res.error) toast.error(res.message || t("Something went wrong! Please try again."));
        else if (res.updated_count > 0) toast.success(t("Status changed successfully"));

        setVerificationStatusToChange(null);
        setOpenModalVerificationStatusChange(false);
        getallusers(1, "", statusFilter);
      })
      .catch((err) => {
        setBulkLoading(null);
        toast.error(t("Something went wrong! Please try again."));
        console.error(err);
      });
  };


  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getallusers(
        1,
        searchTerm,
        statusFilter,
        sortBy,
        sortOrder,
        isSortingRef.current,
        dateFrom,
        dateTo
      );

      isSortingRef.current = false; // Reset the flag after fetch
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [sortBy, sortOrder, searchTerm, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    if (selectedRows.length !== allusers.length) {
      setSelectAll(false);
    }
  }, [selectedRows]);

  useEffect(() => {
    console.log("useefffECXFTFGHvshgdvhsgdd")
    getCountries();
    getCompanies();
    getallusers();
    getZones(); // Load zones on component mount
  }, []);

  // Load zones and manual countries when manual address is enabled
  useEffect(() => {
    if (manualAddress) {
      getZones();
      getManualCountries();
      // Automatically get current location when manual address is enabled
      getCurrentLocation();
    } else {
      // Reset manual address when unchecked
      setSelectedCountry("");
      setSelectedState("");
      setSelectedCity("");
      setStates([]);
      setCities([]);
      setZoneCountries([]);
      setZoneStates([]);
      setZoneCities([]);
      setMapPosition(null);
      setMapKey(prev => prev + 1);
    }
  }, [manualAddress]);

  // Automatically get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Trigger geocoding when all manual address fields are selected
  useEffect(() => {
    if (manualAddress && selectedCountry && selectedState && selectedCity) {
      geocodeManualAddress(selectedCountry, selectedState, selectedCity);
    }
  }, [selectedCountry, selectedState, selectedCity, manualAddress]);


  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleRefresh = () => {
    window.location.reload(); // reload page after enabling location
  };

  const handleManual = () => {
    alert("Manual location input flow here!");
    setOpen(false);
  };

  // Function to reset form and clear image when modal is closed
  const handleModalClose = () => {
    setOpenModalAdd(false);

    // Reset formik form
    formik.resetForm();

    // Clear image states
    setSelectedImage(null);
    setPreviewUrl(null);

    // Clear legal document states
    setSelectedDoc(null);
    setPreviewDoc(null);
    setDocFileName("");

    // Reset manual address fields
    setManualAddress(false);
    setSelectedCountry("");
    setSelectedState("");
    setSelectedCity("");
    setSelectedZone("");
    setStates([]);
    setCities([]);
    setZoneCountries([]);
    setZoneStates([]);
    setZoneCities([]);
    setMapPosition(null);
    setMapKey(prev => prev + 1);

    // Reset to current location (get user's current location)
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
          const defaultCoords = { lat: 33.6844, lng: 73.0479 }; // Default to Pakistan
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
  };
  return (
    <>
      {/* {noData ? (
  <NoDataFound message="No Account Executives Found" />
) :
(   */}

      <SidebarNew
        componentTitle="Admin"
        componentData={
          <Box
            sx={{
              width: "100%",
              overflowX: "hidden", // ✅ Prevent page-level horizontal overflow
              height: {
                xs: "calc(100vh - 70px)", // extra-small screens (mobile)
                sm: "calc(100vh - 80px)", // small screens (tablets)
                md: "calc(100vh - 85px)", // medium screens (laptops)
                lg: "calc(100vh - 85px)", // large screens (desktops)
                xl: "calc(100vh - 110px)", // extra-large screens (big monitors)
              },
            }}
          >
            {noData ? (
              <div className="empty-container">
                <img
                  src="/emptyIcons/acc_exe.png"
                  alt={t("No data found")}
                  className="empty-image"
                />
                <h1 className="empty-heading">Empty!</h1>
                <p className="empty-paragraph">No User Yet!</p>
              </div>
            ) : (
              <>
                <Box sx={{
                  mt: 1, mb: 2, pr: 2, pl: 2,

                }}>

                </Box>
                <Grid container spacing={0} sx={{ pl: 2, pr: 2 }} pt={0}   >
                  <Grid xs={12} align="">
                    <Box
                      sx={{
                        backgroundColor: "white",
                        border: "2px solid rgba(9, 30, 66, 0.14)",
                        borderRadius: "12px",
                        overflowX: "hidden", // ✅ Prevent horizontal overflow
                      }}
                    >
                      <Grid
                        container
                        spacing={0}
                        p={2}
                        pb={1}
                        alignItems="center"
                      >
                        {/* Title */}
                        <Grid item xs={12} sm={12} lg={4}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              height: { xs: "30px", sm: "35px" },
                              mb: { xs: 1, sm: 0 },
                            }}
                          >
                            <TypographyMD
                              variant="paragraph"
                              label={t("Manage Account Executives")}
                              color="#003149"
                              marginLeft={1}
                              fontFamily="Roboto"
                              fontSize={{ xs: "16px", sm: "18px" }}
                              fontWeight={600}
                            />
                            {sortingLoader && (
                              <CircularProgress size={14} sx={{ ml: 1 }} />
                            )}
                          </Box>
                        </Grid>

                        {/* Search */}
                        <Grid item xs={12} md={6} lg={4}>
                          {selectedRows.length > 0 ? null : (
                            <OutlinedInput
                              placeholder={t("Search executives...")}
                              id="input-with-icon-adornment"
                              sx={{
                                ...fieldCommonSx,
                                width: "100%",
                                "& fieldset": { border: "none" },
                              }}
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton edge="end">
                                    <Search
                                      sx={{ fontSize: "16px", color: "#222" }}
                                    />
                                  </IconButton>
                                </InputAdornment>
                              }
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          )}
                        </Grid>

                        {/* Actions */}
                        <Grid item xs={12} md={6} lg={4}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: { xs: "column", md: "row" },
                              justifyContent: {
                                xs: "flex-start",
                                md: "flex-end",
                              },
                              alignItems: { xs: "stretch", md: "center" },
                              gap: { xs: 1, md: 1 },
                              mt: { xs: 1, md: 0 },
                              width: "100%",
                            }}
                          >
                            {selectedRows.length > 0 ? (
                              <>
                                <Button
                                  onClick={() => handleBulkStatusChange("active")}
                                  variant="contained"
                                  sx={{
                                    ...greenActionSx,
                                    height: "35px",
                                    width: { xs: "100%", md: "auto" },
                                  }}
                                >
                                  {t("Active")}
                                </Button>

                                <Button
                                  onClick={() =>
                                    handleBulkStatusChange("inactive")
                                  }
                                  variant="contained"
                                  sx={{
                                    ...redActionSx,
                                    height: "35px",
                                    width: { xs: "100%", md: "auto" },
                                  }}
                                >
                                  {t("Inactive")}
                                </Button>

                                <Button
                                  onClick={() =>
                                    handleBulkVerificationStatusChange("verified")
                                  }
                                  variant="contained"
                                  sx={{
                                    ...greenActionSx,
                                    height: "35px",
                                    width: { xs: "100%", md: "auto" },
                                  }}
                                >
                                  {t("Verified")}
                                </Button>
                              </>
                            ) : (
                              <>
                                {/* Filter button */}
                                <Box sx={{ position: "relative", display: "inline-flex" }}>
                                  <IconButton
                                    onClick={() => {
                                      // Set draft values to current active values when opening modal
                                      setDraftStatus(statusFilter);
                                      setDraftStartDate(dateFrom);
                                      setDraftEndDate(dateTo);
                                      setOpenModalFilter(true);
                                    }}
                                    sx={{
                                      border: "1px solid #E0E0E0",
                                      borderRadius: "8px",
                                      bgcolor: isFilterActive() ? "#1976d2" : "#fff",
                                      color: isFilterActive() ? "#fff" : "#44546F",
                                    }}
                                  >
                                    <FilterList />
                                  </IconButton>

                                  {isFilterActive() && (
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        clearFilters();
                                      }}
                                      sx={{
                                        position: "absolute",
                                        top: -6,
                                        right: -6,
                                        bgcolor: "#fff",
                                        border: "1px solid #ccc",
                                        p: 0.3,
                                      }}
                                    >
                                      <CloseIcon sx={{ fontSize: 14, color: "#444" }} />
                                    </IconButton>
                                  )}
                                </Box>


                                {/* Export */}

                                <ExportMenuButton
                                  onExport={handleExportData}
                                  icon={
                                    exportingUsers ? (
                                      <CircularProgress size={15} />
                                    ) : (
                                      <img
                                        src={exportIcon}
                                        alt={t("Export")}
                                        style={{ width: 30 }}
                                      />
                                    )
                                  }
                                  options={[
                                    { label: t("PDF"), icon: pdfIcon },
                                    { label: t("Excel"), icon: csvIcon },
                                  ]}
                                  disabled={exportingUsers}
                                  sx={{
                                    ...fieldCommonSx,
                                    px: 2,
                                    textTransform: "capitalize",
                                    width: { xs: "100%", md: "auto" },
                                    borderStyle: "solid",
                                    "&:hover": {
                                      borderColor: "#006EC2",
                                      backgroundColor: "#fff",
                                      borderWidth: "2px",
                                    },
                                    fontFamily: "Poppins, sans-serif",
                                    fontSize: "15px",
                                    fontWeight: 500,
                                  }}
                                />

                                {/* Add */}

                              </>
                            )}
                          </Box>
                        </Grid>
                      </Grid>

                      {initialLoader ? (
                        <div
                          style={{
                            height: "30vh",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <CircularProgress
                            size={20}
                            thickness={3}
                            color="primary"
                          />
                        </div>
                      ) : (
                        <>
                          {/* from here we need to add not found Icons if data is empty */}
                          {allusers?.length == 0 || undefined || null ? (
                            <Box
                              display={"flex"}
                              flexDirection={"column"}
                              alignItems={"center"}
                              justifyContent="center"
                              py={10}
                            >
                              <img src={nousers} alt="" height={200} />
                              <TypographyMD
                                variant="h2"
                                label={t("No Users Found!")}
                                color="#A5ADB0"
                                fontFamily="Roboto"
                                fontSize="15px"
                                fontWeight={450}
                                align="center"
                              />
                            </Box>
                          ) : (
                            <TableContainer
                              sx={{
                                boxShadow: "none",
                                pt: 1,
                                overflowX: "auto", // ✅ horizontal scroll when needed
                                overflowY: "hidden", // ✅ no vertical scroll
                                width: "100%",
                                maxWidth: "100%",
                                // ✅ Custom scrollbar styles
                                "&::-webkit-scrollbar": {
                                  height: "8px",
                                },
                                "&::-webkit-scrollbar-track": {
                                  backgroundColor: "#F1F5F9",
                                  borderRadius: "4px",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                  backgroundColor: "#CBD5E1",
                                  borderRadius: "4px",
                                  "&:hover": {
                                    backgroundColor: "#94A3B8",
                                  },
                                },
                              }}
                            >
                              <Table
                                sx={{
                                  whiteSpace: "nowrap !important",
                                  minWidth: "600px", // ✅ Reduced minimum width for better responsiveness
                                  "& .MuiTableCell-root": {
                                    padding: { xs: "3px", sm: "5px" }, // ✅ Responsive padding
                                    whiteSpace: "nowrap", // ✅ Prevent text wrapping
                                  },
                                  "& .MuiTableRow-root": {
                                    height: "25px",
                                  },
                                }}
                                aria-label="simple table"
                              >
                                <TableHead
                                  style={{
                                    fontSize: "13px",
                                    // backgroundColor: "#F4F6FA",
                                  }}
                                >
                                  <TableRow>
                                    <TableCell padding="checkbox">
                                      <Checkbox
                                        sx={{
                                          color: "rgba(9, 30, 66, 0.14)",
                                        }}
                                        checked={selectAll}
                                        indeterminate={false} // We no longer show partial state
                                        onChange={(e) =>
                                          handleCheckboxChange(e, "selectAll")
                                        }
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("id")}
                                      align="center"
                                      sx={{
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {t("Id")}
                                      <SortIcons
                                        column="id"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("full_name")}
                                      align="center"
                                      sx={{
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {t("Full Name")}
                                      <SortIcons
                                        column="full_name"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("email")}
                                      align="center"
                                      sx={{
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {t("Email")}
                                      <SortIcons
                                        column="email"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("phone")}
                                      align="center"
                                      sx={{
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {t("Phone No.")}
                                      <SortIcons
                                        column="phone"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    {/* <TableCell onClick={() => handleSort('clients')} align="center" sx={{ cursor: "pointer", fontWeight: "bold", color: "#44546F", fontFamily: "Poppins, sans-serif" fontSize: "14px" ,whiteSpace: "nowrap"}}>
                                                                    {t("Clients")} {sortBy === 'clients' ? (sortOrder === 'ASC' ? <ArrowUpward fontSize="17px"/> : <ArrowDownward fontSize="17px"/>) : ''}
                                                                </TableCell> */}

                                    <TableCell
                                      onClick={() => handleSort("referral_code")}
                                      align="center"
                                      sx={{
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {t("Referal Code")}
                                      <SortIcons
                                        column="referral_code"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    {/* <TableCell onClick={() => handleSort('earning')} align="center" sx={{ cursor: "pointer", fontWeight: "bold", color: "#44546F", fontFamily: "Poppins, sans-serif" fontSize: "14px" ,whiteSpace: "nowrap"}}>
                                                                    {t("Profit")} 
                                                                    <SortIcons column="earning" sortBy={sortBy} sortOrder={sortOrder} />
                                                                </TableCell> */}

                                    <TableCell
                                      onClick={() => handleSort("status")}
                                      align="center"
                                      sx={{
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {t("Account Status")}
                                      <SortIcons
                                        column="status"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() =>
                                        handleSort("verification_status")
                                      }
                                      align="center"
                                      sx={{
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {t("Verified Status")}
                                      <SortIcons
                                        column="verification_status"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("registered")}
                                      align="center"
                                      sx={{
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {t("Registered")}
                                      <SortIcons
                                        column="registered"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      sx={{
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {" "}
                                      {t("Action")}{" "}
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {allusers.map((item) => (
                                    <TableRow
                                      hover
                                    >
                                      <TableCell
                                        padding="checkbox"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                        }}
                                      >
                                        <Checkbox
                                          sx={{
                                            color: "rgba(9, 30, 66, 0.14)",
                                          }}
                                          checked={selectedRows.includes(item.id)}
                                          onChange={(e) =>
                                            handleCheckboxChange(e, item.id)
                                          }
                                        />
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: 400,
                                          color: "#172B4D",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "14px",
                                          maxWidth: { xs: "60px", sm: "80px", md: "100px" },
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", // ✅ Prevent wrapping
                                        }}
                                      >
                                        {displayValue(item.id)}
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: 400,
                                          color: "#172B4D",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "14px",
                                          maxWidth: { xs: "100px", sm: "120px", md: "140px" },
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", // ✅ Prevent wrapping
                                        }}
                                      >
                                        {displayValue(item.full_name)}
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: 400,
                                          color: "#172B4D",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "14px",
                                          maxWidth: { xs: "120px", sm: "150px", md: "180px" },
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", // ✅ Prevent wrapping
                                        }}
                                      >
                                        {displayValue(item.email)}
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: 400,
                                          color: "#172B4D",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "14px",
                                          maxWidth: { xs: "100px", sm: "120px", md: "140px" },
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", // ✅ Prevent wrapping
                                        }}
                                      >
                                        {displayValue(item.phone)}
                                      </TableCell>

                                      {/* <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif" fontSize: "14px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }} >
                                                                        {item.clients}
                                                                    </TableCell> */}

                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: 400,
                                          color: "#172B4D",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "14px",
                                          maxWidth: { xs: "80px", sm: "100px", md: "120px" },
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", // ✅ Prevent wrapping
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            gap: "5px",
                                          }}
                                        >
                                          {displayValue(item.referral_code)}
                                          <ContentCopy
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!isEmptyValue(item.referral_code)) {
                                                navigator.clipboard
                                                  .writeText(item.referral_code)
                                                  .then(() => {
                                                    toast.success(
                                                      t("Content copied to clipboard")
                                                    );
                                                  })
                                                  .catch((err) => {
                                                    toast.error(
                                                      t("Failed to copy!")
                                                    );
                                                  });
                                              } else {
                                                toast.error(
                                                  t("There is no content to copy")
                                                );
                                              }
                                            }}
                                            sx={{
                                              ml: 0.5,
                                              cursor: "pointer",
                                              width: "15px",
                                            }}
                                          />
                                        </div>
                                      </TableCell>

                                      {/* <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif" fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                                                                        $ {item.earning}
                                                                    </TableCell> */}

                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: 400,
                                          color: "#172B4D",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "14px",
                                          maxWidth: { xs: "120px", sm: "140px", md: "150px" },
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", // ✅ Prevent wrapping
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            gap: "10px",
                                            boxShadow: "none !important",
                                          }}
                                        >
                                          <AccountStatusDropdown
                                            item={item}
                                            anchorEl={dropdownAnchorEl}
                                            onOpen={handleOpenStatusMenu}
                                            onClose={handleCloseStatusMenu}
                                            onStatusSelect={
                                              handleOpenModalStatusChange
                                            }
                                          />
                                        </div>
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: 400,
                                          color: "#172B4D",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "14px",
                                          maxWidth: { xs: "120px", sm: "140px", md: "150px" },
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", // ✅ Prevent wrapping
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            gap: "10px",
                                          }}
                                        >
                                          <VerificationStatusDropdown
                                            item={item}
                                            anchorEl={anchorElVerificationStatus}
                                            onOpen={
                                              handleOpenVerificationStatusMenu
                                            }
                                            onClose={
                                              handleCloseVerificationStatusMenu
                                            }
                                            onStatusSelect={
                                              handleOpenVerificationStatusModal
                                            }
                                          />
                                        </div>
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: 400,
                                          color: "#172B4D",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "14px",
                                          maxWidth: { xs: "120px", sm: "160px", md: "200px" },
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", // ✅ Prevent wrapping
                                        }}
                                      >
                                        {isEmptyValue(item?.registered) ? (
                                          t("N/A")
                                        ) : (
                                          <FormatDate inputDate={item?.registered} />
                                        )}
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: 400,
                                          color: "#172B4D",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "14px",
                                          maxWidth: { xs: "80px", sm: "120px", md: "150px" },
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", // ✅ Prevent wrapping
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignContent: "cenetr",
                                            gap: "10px",
                                          }}
                                        >
                                          {/* <img src={menu_icon} style={{ width: "15px" }} /> */}
                                          <Tooltip title="View">
                                            <Visibility
                                              sx={{
                                                cursor: "pointer",
                                                color: "#579DFF",
                                              }}
                                              onClick={() =>
                                                navigate(
                                                  `/account-executive-details?id=${item?.id}`,
                                                  { state: { newUser: item } }
                                                )
                                              }
                                            />
                                          </Tooltip>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>

                              <div
                                style={{
                                  marginTop: "10px",
                                  marginBottom: "10px",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignContent: "center",
                                }}
                              >
                                <Pagination
                                  count={totalPages}
                                  page={currentPage}
                                  onChange={(_, p) => handlePageChange(_, p)}
                                  shape="rounded"
                                  color="primary"
                                  size="small"
                                  sx={{
                                    "& .MuiPaginationItem-root": {
                                      fontFamily: "Poppins, sans-serif",
                                      fontSize: 13,
                                      fontWeight: 500,
                                    },
                                    "& .Mui-selected": {
                                      backgroundColor: "#E9F3FF",
                                      color: "#006EC2",
                                    },
                                  }}
                                />
                              </div>
                            </TableContainer>
                          )}
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        }
      />

      {/* Add modal */}
      <ModalAdd
        open={openModalAdd}
        onClose={handleModalClose}
        title={t("Add Account Executive")}
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
                          label={
                            <span>
                              {t("Companies")}
                              {formik.values.companies.length === 0 && (
                                <span style={{ color: "red", marginLeft: 4 }}>
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
                                return <em>Select companies</em>;
                              }
                              return `${selected.length} compan${selected.length > 1 ? "ies" : "y"} selected`;
                            }}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: 300,
                                  width: 250,
                                },
                              },
                            }}
                          >
                            {companies.map((company) => (
                              <MenuItem key={company.id} value={company.id}>
                                <Checkbox
                                  checked={formik.values.companies.indexOf(company.id) > -1}
                                />
                                <ListItemText primary={company.name} secondary={company.email} />
                              </MenuItem>
                            ))}
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
                              Selected Companies:
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {formik.values.companies.map((companyId) => {
                                const company = companies.find(c => c.id === companyId);
                                return company ? (
                                  <Chip
                                    key={companyId}
                                    label={company.name}
                                    onDelete={() => {
                                      const updatedCompanies = formik.values.companies.filter(
                                        id => id !== companyId
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
                                ) : null;
                              })}
                            </Box>
                          </Box>
                        )}
                      </div>

                      <div style={{ marginBottom: "15px", marginTop: "15px" }}>
                        <TypographyMD
                          variant="paragraph"
                          label={
                            <span>
                              <span>
                                {t("Image")}
                                {selectedImage === null && (
                                  <span style={{ color: "red", marginLeft: 4 }}>
                                    *
                                  </span>
                                )}
                              </span>
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

                      {/* --- Legal Document Upload --- */}
                      <div style={{ marginBottom: "5px", marginTop: "10px" }}>
                        <TypographyMD
                          variant="paragraph"
                          label={
                            <span>
                              <span>
                                {t("Legal Document")}
                                {selectedDoc === null && (
                                  <span style={{ color: "red", marginLeft: 4 }}>
                                    *
                                  </span>
                                )}
                              </span>
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
                            backgroundColor: isDraggingDoc
                              ? "#e3f2fd"
                              : "#F6F8FB",
                            position: "relative",
                            cursor: "pointer",
                            overflow: "hidden",
                            transition: "all 0.2s ease-in-out",
                          }}
                          onClick={() =>
                            document
                              .getElementById("legal-doc-upload-input")
                              .click()
                          }
                          onDragOver={handleDragOverDoc}
                          onDragLeave={handleDragLeaveDoc}
                          onDrop={handleDropDoc}
                        >
                          <input
                            id="legal-doc-upload-input"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            style={{ display: "none" }}
                            onChange={handleDocChange}
                          />

                          {!previewDoc ? (
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
                              <TypographyMD
                                variant="paragraph"
                                label={docFileName || t("Document uploaded")}
                                color="#626F86"
                                fontFamily="Roboto"
                                fontSize="12px"
                                fontWeight={450}
                                align="left"
                              />
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

                      {/* --- Address Details --- */}
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
                            label={t("Address Details")}
                            color="#000000"
                            fontFamily="Roboto"
                            fontSize="15px"
                            fontWeight={750}
                            align="left"
                          />
                        </div>
                      </div>

                      {/* <div style={{ marginBottom: "5px", marginTop: "10px" }}>
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
                                  {t("Country")}
                                  {formik.values.country === "" && (
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
                            <SelectField
                              country // 👈 enables the search bar
                              value={formik.values.country}
                              onChangeTerm={(e) =>
                                formik.setFieldValue("country", e.target.value)
                              }
                              options={countries.map((country) => ({
                                value: country.cca2,
                                label: country.name.common,
                                flag: country.flags?.png,
                              }))}
                              error={
                                formik.touched.country &&
                                Boolean(formik.errors.country)
                              }
                              helperText={
                                formik.touched.country && formik.errors.country
                              }
                            />
                          </Box>

                          <Box width={{ xs: "100%", md: "50%" }}>
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("Province")}
                                  {formik.values.province === "" && (
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
                              value={formik.values.province}
                              onChngeterm={(e) =>
                                formik.setFieldValue("province", e.target.value)
                              }
                              error={
                                formik.touched.province &&
                                Boolean(formik.errors.province)
                              }
                              helperText={
                                formik.touched.province &&
                                formik.errors.province
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
                                  {t("Postal Code")}
                                  {formik.values.postal_code === "" && (
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
                              value={formik.values.postal_code}
                              onChngeterm={(e) =>
                                formik.setFieldValue(
                                  "postal_code",
                                  e.target.value
                                )
                              }
                              error={
                                formik.touched.postal_code &&
                                Boolean(formik.errors.postal_code)
                              }
                              helperText={
                                formik.touched.postal_code &&
                                formik.errors.postal_code
                              }
                              type="text"
                              variant="outlined"
                            />
                          </Box>

                          <Box width={{ xs: "100%", md: "50%" }}>
                            <TypographyMD
                              variant="paragraph"
                              label={t("Community")}
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="14px"
                              fontWeight={450}
                              align="left"
                            />
                            <Inputfield
                              autoFocus={false}
                              value={formik.values.community}
                              onChngeterm={(e) =>
                                formik.setFieldValue(
                                  "community",
                                  e.target.value
                                )
                              }
                              error={
                                formik.touched.community &&
                                Boolean(formik.errors.community)
                              }
                              helperText={
                                formik.touched.community &&
                                formik.errors.community
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
                                  {t("City")}
                                  {formik.values.city === "" && (
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
                              value={formik.values.city}
                              onChngeterm={(e) =>
                                formik.setFieldValue("city", e.target.value)
                              }
                              error={
                                formik.touched.city &&
                                Boolean(formik.errors.city)
                              }
                              helperText={
                                formik.touched.city && formik.errors.city
                              }
                              type="text"
                              variant="outlined"
                            />
                          </Box>

                          <Box width={{ xs: "100%", md: "50%" }}>
                            <TypographyMD
                              variant="paragraph"
                              label={t("Street Address")}
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
                      </div> */}
                      {/* Zone Selection - Always visible above map */}
                      <Box sx={{ mb: 2 }}>
                        <TypographyMD
                          variant="paragraph"
                          label={
                            <span>
                              {t("Assigned Zone")}
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

                        <Autocomplete
                          options={zones}
                          getOptionLabel={(option) => option.name}
                          value={zones.find(zone => zone.name === selectedZone) || null}
                          onChange={(event, newValue) => {
                            const zoneName = newValue?.name || "";
                            handleZoneChange(zoneName);
                            formik.setFieldValue("assigned_zone", zoneName);
                            formik.setFieldTouched("assigned_zone", true);
                          }}
                          onBlur={() => formik.setFieldTouched("assigned_zone", true)}
                          disabled={loadingZones}
                          loading={loadingZones}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder={loadingZones ? "Loading zones..." : "Select Zone"}
                              variant="outlined"
                              fullWidth
                              size="small"
                              error={
                                formik.touched.assigned_zone &&
                                Boolean(formik.errors.assigned_zone)
                              }
                              helperText={
                                formik.touched.assigned_zone && formik.errors.assigned_zone
                              }
                            />
                          )}
                          renderOption={(props, option) => (
                            <Box component="li" {...props}>
                              {option.name}
                            </Box>
                          )}
                        />


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
                            <Autocomplete
                              options={zoneCountries}
                              getOptionLabel={(option) => option.name}
                              value={zoneCountries.find(country => country.name === selectedCountry) || null}
                              onChange={(event, newValue) => {
                                handleZoneCountryChange(newValue?.name || "");
                              }}
                              disabled={!selectedZone || loadingZoneCountries}
                              loading={loadingZoneCountries}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder={!selectedZone ? "Select Zone First" :
                                    loadingZoneCountries ? "Loading countries..." : "Select Country"}
                                  variant="outlined"
                                  fullWidth
                                  size="small"
                                />
                              )}
                              renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                  {option.name}
                                </Box>
                              )}
                            />
                          </Box>

                          {/* State/Province Dropdown */}
                          <Box>
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("Province/State")}
                                  <span style={{ color: "red", marginLeft: 4 }}>*</span>
                                </span>
                              }
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="14px"
                              fontWeight={450}
                              align="left"
                            />
                            <Autocomplete
                              options={zoneStates}
                              getOptionLabel={(option) => option.name}
                              value={zoneStates.find(state => state.name === selectedState) || null}
                              onChange={(event, newValue) => {
                                handleZoneStateChange(newValue?.name || "");
                              }}
                              disabled={!selectedCountry || loadingZoneStates}
                              loading={loadingZoneStates}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder={!selectedCountry ? "Select Country First" :
                                    loadingZoneStates ? "Loading states..." : "Select Province/State"}
                                  variant="outlined"
                                  fullWidth
                                  size="small"
                                />
                              )}
                              renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                  {option.name}
                                </Box>
                              )}
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
                            <Autocomplete
                              options={zoneCities}
                              getOptionLabel={(option) => option}
                              value={zoneCities.find(city => city === selectedCity) || null}
                              onChange={(event, newValue) => {
                                handleZoneCityChange(newValue || "");
                              }}
                              disabled={!selectedState || loadingZoneCities}
                              loading={loadingZoneCities}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder={!selectedState ? "Select Province/State First" :
                                    loadingZoneCities ? "Loading cities..." : "Select City"}
                                  variant="outlined"
                                  fullWidth
                                  size="small"
                                />
                              )}
                              renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                  {option}
                                </Box>
                              )}
                            />
                          </Box>

                          {/* Address Fields */}
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                            {/* Street Address */}
                            <Box>
                              <TypographyMD
                                variant="paragraph"
                                label={t("Address")}
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
                title={t("Save & Send Invite")}
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

      {/* modal confirmation */}
      <ModalConfirmation
        open={openModalStatusChange}
        onClose={() => setOpenModalStatusChange(false)}
        title={t("update_status")}
        data={
          <>
            <div style={{ backgroundColor: "#fff", margin: 13 }}>
              <Grid container spacing={0} p={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid xs={12} align="center">
                  <Stack align="center" direction="column" spacing={2} pb={3}>
                    <img
                      src={confirmation_icon}
                      alt="..."
                      style={{ alignSelf: "center", width: "100px" }}
                    />
                    <TypographyMD
                      variant="paragraph"
                      // label={
                      //   statusToChange === "active"
                      //     ? "Are you sure you want to active this user?"
                      //     : statusToChange === "inactive"
                      //     ? "Are you sure you want to inactive this user?"
                      //     : statusToChange === "blocked"
                      //     ? "Are you sure you want to block this user?"
                      //     : "Are you sure you want to perform this action?"
                      // }

                      label={t(`confirm.${statusToChange || "default"}`)}
                      color="#181818"
                      marginLeft={0}
                      fontSize="13px"
                      fontWeight={650}
                      align="center"
                    />
                  </Stack>
                </Grid>

                <Grid xs={12} align="center">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignContent: "center",
                      gap: 10,
                    }}
                  >
                    <ButtonMD
                      variant="outlined"
                      title="Cancel"
                      width="fit-content"
                      type="submit"
                      borderColor="borderColor"
                      backgroundColor="orange"
                      borderRadius="5px"
                      onClickTerm={() => setOpenModalStatusChange(false)}
                    />

                    <ButtonMD
                      variant="contained"
                      title={
                        statusToChange === "active"
                          ? "Active"
                          : statusToChange === "inactive"
                            ? "Inactive"
                            : "Blocked"
                      }
                      width="fit-content"
                      type="submit"
                      borderColor="orange"
                      backgroundColor="orange"
                      borderRadius="5px"
                      disabled={loading}
                      onClickTerm={() => confirmStatusChange()}
                    />
                  </div>
                </Grid>
              </Grid>
            </div>
          </>
        }
      />

      {/* verification modal confirmation */}
      <ModalConfirmation
        open={openModalVerificationStatusChange}
        onClose={() => setOpenModalVerificationStatusChange(false)}
        title="Update Verification Status"
        data={
          <div style={{ backgroundColor: "#fff", margin: 13 }}>
            <Grid container spacing={0} p={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
              <Grid xs={12} align="center">
                <Stack align="center" direction="column" spacing={2} pb={3}>
                  <img
                    src={confirmation_icon}
                    alt="..."
                    style={{ alignSelf: "center", width: "100px" }}
                  />
                  <TypographyMD
                    variant="paragraph"
                    label={`Are you sure you want to mark this user as ${verificationStatusToChange}?`}
                    color="#181818"
                    marginLeft={0}
                    fontSize="13px"
                    fontWeight={650}
                    align="center"
                  />
                </Stack>
              </Grid>

              <Grid xs={12} align="center">
                <div
                  style={{ display: "flex", justifyContent: "center", gap: 10 }}
                >
                  <ButtonMD
                    variant="outlined"
                    title="Cancel"
                    width="fit-content"
                    type="submit"
                    borderColor="borderColor"
                    backgroundColor="orange"
                    borderRadius="5px"
                    onClickTerm={() =>
                      setOpenModalVerificationStatusChange(false)
                    }
                  />
                  <ButtonMD
                    variant="contained"
                    title={verificationStatusToChange}
                    width="fit-content"
                    type="submit"
                    borderColor="orange"
                    backgroundColor="orange"
                    borderRadius="5px"
                    disabled={loading}
                    onClickTerm={confirmVerificationStatusChange}
                  />
                </div>
              </Grid>
            </Grid>
          </div>
        }
      />

      <LocationHelperModal
        open={open}
        onClose={() => setOpen(false)}
        onRefresh={() => {
          window.location.reload();
        }}
        onManual={() => {
          // your manual flow here
          setOpen(false);
        }}
      />

      {/* Filter Modal */}
      <ModalAdd
        open={openModalFilter}
        onClose={() => setOpenModalFilter(false)}
        title={t("Filter")}
        data={
          <form
            style={{ backgroundColor: "#fff", margin: 13 }}
            onSubmit={handleFilterSubmit}
          >
            <Box
              sx={{
                maxHeight: { xs: "100dvh", md: "91vh" },
                overflowY: "auto",
                px: 1,
                pb: 3,
              }}
            >
              <Grid container spacing={0}>
                <Grid xs={12} align="left">
                  <div>
                    <Box
                      sx={{ marginTop: "15px", marginBottom: "30px" }}
                      width={{ xs: "97%", md: "100%" }}
                    >
                      {/* --- Status --- */}
                      <TypographyMD
                        variant="paragraph"
                        label={t("Status")}
                        color="#000000"
                        fontFamily="Roboto"
                        fontSize="15px"
                        fontWeight={750}
                        align="left"
                      />

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: { xs: 1, sm: 1.5, md: 1 },
                          marginBottom: "15px",
                          marginTop: "10px",
                        }}
                      >
                        {["All", "Active", "Inactive", "Invited", "Requested"].map((status) => (
                          <Box
                            key={status}
                            onClick={() => setDraftStatus(status.toLowerCase())}
                            sx={{
                              display: "flex",
                              padding: { xs: "6px 10px", sm: "5px 11px", md: "4px 12px" },
                              borderRadius: "5px",
                              border: `2px solid ${draftStatus === status.toLowerCase() ? "#006EC2" : "#ccc"
                                }`,
                              backgroundColor: "transparent",
                              cursor: "pointer",
                              width: "fit-content",
                              transition: "all 0.3s ease",
                              minWidth: { xs: "auto", sm: "auto" },
                              flex: { xs: "0 0 auto", sm: "0 0 auto" },
                              "&:hover": {
                                borderColor: "#006EC2",
                                backgroundColor: "rgba(0, 110, 194, 0.05)",
                              },
                            }}
                          >
                            <TypographyMD
                              variant="paragraph"
                              label={t(status)}
                              color={
                                draftStatus === status.toLowerCase() ? "#006EC2" : "#363333"
                              }
                              fontFamily="Roboto"
                              fontSize={{ xs: "11px", sm: "12px", md: "12px" }}
                              fontWeight={500}
                              align="center"
                            />
                          </Box>
                        ))}
                      </Box>


                      {/* --- Date Range --- */}
                      <TypographyMD
                        variant="paragraph"
                        label={t("Date Range")}
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
                          <Box
                            width={{ xs: "100%", md: "50%" }}
                            display={"flex"}
                            flexDirection={"column"}
                          >
                            <TypographyMD
                              variant="paragraph"
                              label={t("Start Date")}
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="13px"
                              fontWeight={450}
                              align="left"
                            />
                            <input
                              autoFocus={false}
                              type="date"
                              value={draftStartDate}
                              onChange={(e) => setDraftStartDate(e.target.value)}
                              style={{
                                height: "35px",
                                borderRadius: "6px",
                                border: "2px solid rgba(9, 30, 66, 0.14)",
                                backgroundColor: "#fff",
                                fontSize: "14px",
                                color: "rgba(27, 27, 27, 0.67)",
                                padding: "0 8px",
                                boxSizing: "border-box",
                              }}
                              onFocus={(e) => (e.target.style.borderColor = "#006EC2")}
                              onBlur={(e) => (e.target.style.borderColor = "rgba(9, 30, 66, 0.14)")}
                              onMouseOver={(e) => (e.target.style.borderColor = "#006EC2")}
                              onMouseOut={(e) => (e.target.style.borderColor = "rgba(9, 30, 66, 0.14)")}
                            />
                          </Box>

                          <Box
                            width={{ xs: "100%", md: "50%" }}
                            display={"flex"}
                            flexDirection={"column"}
                          >
                            <TypographyMD
                              variant="paragraph"
                              label={t("End Date")}
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="13px"
                              fontWeight={450}
                              align="left"
                            />
                            <input
                              autoFocus={false}
                              type="date"
                              value={draftEndDate}
                              onChange={(e) => setDraftEndDate(e.target.value)}
                              style={{
                                height: "35px",
                                borderRadius: "6px",
                                border: "2px solid rgba(9, 30, 66, 0.14)",
                                backgroundColor: "#fff",
                                fontSize: "14px",
                                color: "rgba(27, 27, 27, 0.67)",
                                padding: "0 8px",
                                boxSizing: "border-box",
                              }}
                              onFocus={(e) => (e.target.style.borderColor = "#006EC2")}
                              onBlur={(e) => (e.target.style.borderColor = "rgba(9, 30, 66, 0.14)")}
                              onMouseOver={(e) => (e.target.style.borderColor = "#006EC2")}
                              onMouseOut={(e) => (e.target.style.borderColor = "rgba(9, 30, 66, 0.14)")}
                            />
                          </Box>
                        </Box>
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
                py: 2,
                px: 1,
                mt: { xs: 0, md: -5 },
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ButtonMD
                variant="contained"
                title={t("Apply Filter")}
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
    </>
  );
}

export default AccountExecutive;
