import React, { useEffect, useRef, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import warn from "../../Assets/warn.png"
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
import AccountExecutivePins from "./AccountExecutivePins";
import { getApiMessage, showToast } from "../../helper_functions/messageHandler";
import DeleteAccountExecutiveModal from "../../components/DeleteModal";
import { Country, State, City } from "country-state-city";
import SearchableDropdown from "../../components/SearchableCountryDropdown";
import AddAccountExecutiveModal from "./AddAccountExecutive";
import EditAccountExecutiveModal from "./EditAccountExecutive";
import EditOutlined from "@mui/icons-material/EditOutlined";
import { useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";


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
  DeleteOutline,
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
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import Inputfield from "../../components/items/Inputfield";
import SelectField from "../../components/items/Selectfield";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Countryfield from "../../components/items/Countryfield";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import i18n from "../../multiLingual";
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
  const [countryFilter, setCountryFilter] = useState(null);
  const [stateFilter, setStateFilter] = useState(null);
  const [cityFilter, setCityFilter] = useState(null);

  const [draftCountry, setDraftCountry] = useState(null);
  const [draftState, setDraftState] = useState(null);
  const [draftCity, setDraftCity] = useState(null);

  const [pinsResetKey, setPinsResetKey] = useState(0);

  // We need full objects to get ISO codes for States/Cities
  const allCountries = Country.getAllCountries();
  const countryOptions = allCountries; // We will pass full objects to SearchableDropdown if it supports it, or handle mapping.
  // Actually, looking at SearchableDropdown later, if it expects strings, we might need to adjust.
  // For now, let's assume we can manage the selection.
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
  const isImage = (file) => file && file.type && file.type.startsWith("image/");
  const isPDF = (file) => file && file.type === "application/pdf";


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
  const [exportFormat, setExportFormat] = useState(null);
  const [verificationStatusFilter, setVerificationStatusFilter] = useState("all");
const [draftVerificationStatus, setDraftVerificationStatus] = useState("all");
  const [isCleared, setIsCleared] = useState(false);
  //==
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
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
 const verificationParam =
  verificationStatusFilter !== "all"
    ? `&verification_status=${verificationStatusFilter}`
    : "";

    const countryParam = draftCountry
      ? `&country=${encodeURIComponent(draftCountry.name || draftCountry)}`
      : "";
    const stateParam = draftState
      ? `&province=${encodeURIComponent(draftState.name || draftState)}`
      : "";
    const cityParam = draftCity
      ? `&city=${encodeURIComponent(draftCity.name || draftCity)}`
      : "";
    const apiUrl = `${url}super-admin/account-executives?no_pagination=true${statusParam}${sortParams}${searchParam}${dateFromParam}${dateToParam}${countryParam}${stateParam}${cityParam}${verificationParam}`;

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
  const formatLabel = (key) =>
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const handleExportData = async (format) => {
    setExportingUsers(true);
    setExportFormat(format);

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

        Object.entries(item).forEach(([key, value]) => {
          if (skipColumns.includes(key)) return;

          const label = formatLabel(key);

          if (value && typeof value === "object") {
            flatItem[label] = JSON.stringify(value);
          } else if (value === null || value === undefined || value === "") {
            flatItem[label] = t("N/A");
          } else {
            flatItem[label] = value;
          }
        });

        return flatItem;
      });
      // const flattenedData = allData.map((item) => {
      //   const flatItem = {};
      //   Object.keys(item).forEach((key) => {
      //     if (skipColumns.includes(key)) return;
      //     const value = item[key];
      //     if (value && typeof value === "object") {
      //       flatItem[key] = JSON.stringify(value);
      //     } else if (typeof value === "string" && value.length > 100) {
      //       flatItem[key] = value.substring(0, 100) + "...";
      //     } else {
      //       flatItem[key] = isEmptyValue(value) ? t("N/A") : value;
      //     }
      //   });
      //   return flatItem;
      // });

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
      setExportingUsers(false);
      setExportFormat(null);
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
    date_to = "",
    country = "" ,
    state = "",
   
    city = "",
       verification_status = "all"
,
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
    const countryParam = countryFilter
      ? `&country=${encodeURIComponent(countryFilter.name || countryFilter)}`
      : "";
    const stateParam = stateFilter
      ? `&province=${encodeURIComponent(stateFilter.name || stateFilter)}`
      : ""; // API usually expects 'province' or 'state'. Let's check the format. Existing code used 'province' in formik.
    // However, the prompt asked for "state". Let's check lines 231-234. I added 'state' there.
    // Line 667 sends 'province'.
    // Let's use 'province' for the API query param if that's what the backend expects, but standard is often 'state'.
    // If I look at AccountExecutivePins.jsx, I see `country`, but no state/province.
    // I will use `state` in the URL params as per my previous edit, but wait, Formik uses `province`.
    // Let's use `state` in the URL for filtering, and if it fails I'll swap to `province`. But usually standard is `state`.
    // Actually, line 529 validation says "Province is required".
    // Let's use `state` for now as the user asked for "state".
    const cityParam = cityFilter
      ? `&city=${encodeURIComponent(cityFilter.name || cityFilter)}`
      : "";
     const verificationParam =
  verification_status !== "all"
    ? `&verification_status=${verification_status}`
    : "";

    console.log("🔗 GETALLUSERS CALLED WITH:", {
      page,
      search,
      status,
      verification_status,
      date_from,
      date_to,
      verificationParam
    });

    // const InsertAPIURL = ``;
    const InsertAPIURL = `${url}super-admin/account-executives?page=${page}&limit=${limit}&search=${search}${statusParam}${sortParams}${dateFromParam}${verificationParam}${dateToParam}${countryParam}${stateParam}${cityParam}`;

    console.log("📝 API URL BEING CALLED:", InsertAPIURL);

    //updated try block for empty icon check
    try {
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("✅ API RESPONSE:", data);
      console.log("📊 Total Executives Returned:", data?.data?.account_executives?.length || 0);
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
  // Check if any filters are active
  const isFilterActive = () => {
    return (
      statusFilter !== "all" ||
      dateFrom !== "" ||
      dateTo !== "" ||
      countryFilter !== null ||
      stateFilter !== null ||
      cityFilter !== null ||
      verificationStatusFilter !== "all"
    );
  };


  // const clearFilters = () => {
  //   setStatusFilter("all");
  //   setDateFrom("");
  //   setDateTo("");
  //   setDraftStatus("all");
  //   setDraftStartDate("");
  //   setDraftEndDate("");
  //   setDraftCountry(null);
  //   setDraftState(null);
  //   setDraftCity(null);
  //   setCountryFilter(null);
  //   setStateFilter(null);
  //   setCityFilter(null);
  //   setVerificationStatusFilter("all");
  //   setDraftVerificationStatus("all");

  //   setPinsResetKey(prev => prev + 1); // 🔑 force pins refresh

  //   getallusers(1, searchTerm, "all", sortBy, sortOrder, false, "", "", "", "", "all");
  // };

  const clearFilters = () => {
    console.log("❌ CLEAR FILTER CLICKED");
    setIsCleared(true);

    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setDraftStatus("all");
    setDraftStartDate("");
    setDraftEndDate("");
    setDraftCountry(null);
    setDraftState(null);
    setDraftCity(null);
    setCountryFilter(null);
    setStateFilter(null);
    setCityFilter(null);
    setVerificationStatusFilter("all");
    setDraftVerificationStatus("all");

    setCurrentPage(1);
    setPinsResetKey(prev => prev + 1); // 🔑 force pins refresh

    getallusers(
      1,
      "",
      "all",
      sortBy,
      sortOrder,
      false,
      "",
      "",
      "",
      "",
      "",
      "all"
    );

    console.log("After clear triggered (state updates scheduled)");
  };
  // Handle filter submit
//   const handleFilterSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const statusParam = draftStatus.toLowerCase() !== "all" ? draftStatus.toLowerCase() : "all";

//     console.log("🔍 FILTER SUBMIT - Verification Status Draft:", draftVerificationStatus);
//     console.log("📋 Filter Data:", {
//       status: statusParam,
//       verification_status: draftVerificationStatus,
//       date_from: draftStartDate,
//       date_to: draftEndDate,
//       country: draftCountry?.name || draftCountry || "",
//       state: draftState?.name || draftState || "",
//       city: draftCity?.name || draftCity || ""
//     });

//     // Call API immediately with selected filters
//     getallusers(
//       1,                 // page
//       searchTerm,        // search
//       statusParam,       // status
//       sortBy,
//       sortOrder,
//       false,             // isSorting
//       draftStartDate,    // date_from
//       draftEndDate,      // date_to
//       draftCountry?.name || draftCountry || "",
//       draftState?.name || draftState || "",
//       draftCity?.name || draftCity || "",
//        draftVerificationStatus
//     );

//     // Update active states for modal inputs
//     setStatusFilter(statusParam);
//     setDateFrom(draftStartDate);
//     setDateTo(draftEndDate);
// setVerificationStatusFilter(draftVerificationStatus);
//     setOpenModalFilter(false);
//     setLoading(false);
//     setCountryFilter(draftCountry);
//     setStateFilter(draftState);
//     setCityFilter(draftCity);
//   };

  // Handle filter submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const statusParam = draftStatus.toLowerCase() !== "all" ? draftStatus.toLowerCase() : "all";
    const verificationStatusParam = draftVerificationStatus.toLowerCase() !== "all" ? draftVerificationStatus.toLowerCase() : "all";

    console.log("🔍 FILTER SUBMIT - Verification Status Draft:", draftVerificationStatus);
    console.log("📋 Filter Data:", {
      status: statusParam,
      verification_status: verificationStatusParam,
      date_from: draftStartDate,
      date_to: draftEndDate,
      country: draftCountry?.name || draftCountry || "",
      state: draftState?.name || draftState || "",
      city: draftCity?.name || draftCity || ""
    });

    // Call API immediately with selected filters
    getallusers(
      1,                 // page
      searchTerm,        // search
      statusParam,       // status
      sortBy,
      sortOrder,
      false,             // isSorting
      draftStartDate,    // date_from
      draftEndDate,      // date_to
      draftCountry?.name || draftCountry || "",
      draftState?.name || draftState || "",
      draftCity?.name || draftCity || "",
      verificationStatusParam
    );

    // Update active states for modal inputs
    setStatusFilter(statusParam);
    setDateFrom(draftStartDate);
    setDateTo(draftEndDate);
    setVerificationStatusFilter(verificationStatusParam);
    setCountryFilter(draftCountry);
    setStateFilter(draftState);
    setCityFilter(draftCity);
    setOpenModalFilter(false);
    setLoading(false);
    setIsCleared(false);  // ← Reset the cleared flag
  };

  // const handlePageChange = (event, value) => {
  //   setCurrentPage(value);
  //   getallusers(value, searchTerm); // fetch new page from server
  // };

  // const handlePageChange = (event, page) => {
  //   setCurrentPage(page); // update state
  //   getallusers(
  //     page,
  //     searchTerm,
  //     statusFilter, // ✅ pass current filter value
  //     sortBy,
  //     sortOrder,
  //     isSortingRef.current,
  //      countryFilter?.name || "",
  // stateFilter?.name || "",
  // cityFilter?.name || "",
  // verificationStatusFilter
  //   );
  // };
  const handlePageChange = (event, page) => {
    setCurrentPage(page); // update state
    getallusers(
      page,
      searchTerm,
      statusFilter,
      sortBy,
      sortOrder,
      isSortingRef.current,
      dateFrom,
      dateTo,
      countryFilter?.name || "",
      stateFilter?.name || "",
      cityFilter?.name || "",
      verificationStatusFilter
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






  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEditUser, setSelectedEditUser] = useState(null);

  const validationSchema = yup.object({
    first_name: yup.string().required(t("First name is required")),
    last_name: yup.string().required(t("Last name is required")),
    middle_name: yup.string().nullable(),
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
    email: yup
      .string()
      .email(t("Enter a valid email"))
      .required(t("Email is required")),
    phone: yup.string().required(t("Phone number is required")),
    companies: yup
      .array()
      .nullable(),
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
    // legal_document_url: yup.string().required(t("Legal document is required")),
    assigned_zone: yup
      .array()
      .min(1, t("Assigned Zone is required"))
      .required(t("Assigned Zone is required")),
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
      // legal_document_url: "",
      assigned_zone: [],
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {

      const safeValue = (val) =>
        val && val.toString().trim() !== "" ? val : "-";
      console.log("values", values)
      // Check if required fields are filled
      if (!values.first_name || !values.last_name || !values.email) {
        toast.error(t("Please fill in all required fields"));
        return;
      }

      // Check if zone is selected
      if (!selectedZone) {
        // toast.error(t("Please select a zone"));
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
            // toast.error(t("Image upload failed"));
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
          // formData.append("assignee_region_zone", safeValue(selectedZone));
          formData.append(
            "assignee_region_zone",
            JSON.stringify(selectedZone.map(z => z.name))
          );
          // formData.append("region", safeValue(selectedZone));
          formData.append(
            "region",
            JSON.stringify(selectedZone.map(z => z.name))
          );
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
          showToast(toast.error, result, t("Something went wrong! Please try again."));
        } else {
          showToast(toast.success, result, t("Account Executive created successfully"));
          getallusers(1, "", statusFilter);
          setOpenModalAdd(false);

          // Reset form and clear image
          resetForm();
          setSelectedImage(null);
          setPreviewUrl(null);
        }
      } catch (error) {
        console.error("🔥 Exception caught during submission:", error);
        // toast.error(t("Something went wrong! Please try again."));
        const msg = error.response?.data
          ? getApiMessage(error.response.data, t("Something went wrong! Please try again."))
          : (error.message || t("Something went wrong! Please try again."));

        toast.error(msg);
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
  const [companySearchTerm, setCompanySearchTerm] = useState("");

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
  const [selectedZone, setSelectedZone] = useState([]);
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
      const response = await fetch(`${url}/company-admins?sort_by=created_at&sort_order=DESC&assignment_type=unassigned`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("data companies", data)

      if (data.error === false || data.error === "false") {

        // Handle the specific API response structure
        if (data.data && data.data.company_admins) {
          console.log("data.data.company_admins", data.data.company_admins)
          setCompanies(data.data.company_admins);
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
  const [selectedCountryIso, setSelectedCountryIso] = useState("");
  const [selectedStateIso, setSelectedStateIso] = useState("");
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
    const validStatusOptions = ["active", "inactive"];
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(Data),
    })
      .then((res) => res.json())
      .then((res) => {
        setLoading(false);

        const lang = i18n.language; // "en", "es", etc.

        // Pick the correct message
        const apiMessage =
          res[`message_${lang}`] || res.message || t("Status changed successfully");

        if (res.error) {
          toast.error(apiMessage);
        } else if (res.data?.updated_users > 0) {
          toast.success(apiMessage);
        } else {
          toast.success(apiMessage);
        }

        // Close modal AFTER toast
        setTimeout(() => {
          setStatusToChange(null);
          setOpenModalStatusChange(false);
          handleCloseStatusMenu();
          getallusers(1, "", statusFilter);
        }, 300);
      })
      .catch((err) => {
        setLoading(false);
        toast.error(t("Something went wrong! Please try again."));
        console.error(err);
      });
  };

  const confirmVerificationStatusChange = () => {
    if (!selectedVerificationItem || !verificationStatusToChange) return;

    setLoading(true);
    const InsertAPIURL = `${url}super-admin/account-executives/bulk/status`;

    const statusOptions = ["active", "inactive", "invited", "requested"];
    const verificationOptions = ["verified", "pending", "rejected"];

    const Data = { account_executive_ids: [selectedVerificationItem] };
    const selectedValue = verificationStatusToChange.toLowerCase();

    if (statusOptions.includes(selectedValue)) {
      Data.status = selectedValue;
    } else if (verificationOptions.includes(selectedValue)) {
      Data.verification_status = selectedValue;
    } else {
      toast.error(t("Invalid status value selected"));
      setLoading(false);
      return;
    }

    fetch(InsertAPIURL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(Data),
    })
      .then((res) => res.json())
      .then((res) => {
        setLoading(false);

        const lang = i18n.language; // "en" | "es" | "fr" etc.

        // ✔ Pick correct message (EN / ES / fallback)
        const apiMessage =
          res[`message_${lang}`] || res.message || t("Status changed successfully");

        if (res.error) {
          toast.error(apiMessage);
        } else if (res.data?.updated_users > 0) {
          toast.success(apiMessage);
        } else {
          toast.success(apiMessage);
        }

        // Delay closing modal so toast can show
        setTimeout(() => {
          setVerificationStatusToChange(null);
          setOpenModalVerificationStatusChange(false);
          getallusers(1, "", statusFilter);
        }, 300);
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


  // useEffect(() => {
  //   const delayDebounce = setTimeout(() => {
  //     getallusers(
  //       1,
  //       searchTerm,
  //       statusFilter,
  //       sortBy,
  //       sortOrder,
  //       isSortingRef.current,
  //       dateFrom,
  //       dateTo,
  //       countryFilter?.name || "",
  //         verificationStatusFilter
  //     );

  //     isSortingRef.current = false; // Reset the flag after fetch
  //   }, 200);

  //   return () => clearTimeout(delayDebounce);
  // }, [sortBy, sortOrder, searchTerm, statusFilter, dateFrom, dateTo, countryFilter, stateFilter, cityFilter,verificationStatusFilter]);
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
        dateTo,
        countryFilter?.name || "",
        stateFilter?.name || "",
        cityFilter?.name || "",
        verificationStatusFilter
      );

      isSortingRef.current = false; // Reset the flag after fetch
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [sortBy, sortOrder, searchTerm, statusFilter, dateFrom, dateTo, countryFilter, stateFilter, cityFilter, verificationStatusFilter]);
  useEffect(() => {
    if (selectedRows.length !== allusers.length) {
      setSelectAll(false);
    }
  }, [selectedRows]);

  useEffect(() => {
    getCountries();
    getCompanies();
    getallusers();
    getZones(); // Load zones on component mount
  }, []);

  // Load zones and manual countries when manual address is enabled
  useEffect(() => {
    if (manualAddress) {
      getZones();
      // getManualCountries();
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




  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeleteUser, setSelectedDeleteUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const deleteAccountExecutive = async (reason) => {
    if (!selectedDeleteUser) return;

    setDeleteLoading(true);

    try {
      const res = await fetch(
        `${url}account-executives/${selectedDeleteUser.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ deletion_reason: reason }),
        }
      );

      const json = await res.json();

      if (res.ok && !json.error) {
        showToast(
          toast.success,
          json,
          t("deleteExecutiveModal.successFallback")
        );
      } else {
        showToast(
          toast.error,
          json,
          t("deleteExecutiveModal.error")
        );
      }

      setDeleteModalOpen(false);
      setDeleteLoading(false);
      // fetchAccountExecutives();
      getallusers();
    } catch (err) {
      console.error("Delete failed", err);

      // 🔥 fallback toast for unexpected failures
      toast.error(t("deleteExecutiveModal.error"));
      setDeleteLoading(false);
    }
  };

  const location = useLocation();

  const isFromDashboard = location.state?.fromDashboard === true;
const [selectedMapExecutiveId, setSelectedMapExecutiveId] = useState(null);
  return (
    <>

      <Toaster />
      <SidebarNew
        componentTitle="superAdmin"
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

                <h1 className="empty-heading">{t("Empty!")}</h1>
                <p className="empty-paragraph">{t("No User Yet!")}</p>
              </div>
            ) : (
              <>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, }}>
                  {isFromDashboard && (
                    <IconButton
                      onClick={() => navigate(-1)}
                      sx={{ color: "#003149" }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                  )}

                </Box>

                <Box sx={{
                  mt: 1, mb: 2, pr: 2, pl: 2,

                }}>
                  <AccountExecutivePins
                    statusFilter={statusFilter}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    country={countryFilter?.name || countryFilter}
                    state={stateFilter?.name || stateFilter}
                    city={cityFilter?.name || cityFilter}
                    search={searchTerm}
                    
                    resetKey={pinsResetKey}
                                        verificationStatusFilter={verificationStatusFilter}
                         selectedMapExecutiveId={selectedMapExecutiveId}
  onClearSelection={() => setSelectedMapExecutiveId(null)}
/>
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
                                      setDraftCountry(countryFilter);
                                      setDraftState(stateFilter);
                                      setDraftCity(cityFilter);
                                      setDraftVerificationStatus(verificationStatusFilter);
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

                                {/* <ExportMenuButton
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
                              /> */}
                                <ExportMenuButton
                                  onExport={handleExportData}
                                  exporting={exportingUsers}
                                  exportingFormat={exportFormat}
                                  options={[
                                    { label: "PDF", icon: pdfIcon },
                                    { label: "Excel", icon: csvIcon },
                                  ]}
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
                                <Button
                                  onClick={() => setOpenModalAdd(true)}
                                  variant="contained"
                                  startIcon={
                                    <img
                                      src={addIcon}
                                      alt=""
                                      style={{ width: 13 }}
                                    />
                                  }
                                  sx={{
                                    ...addButtonSx,
                                    height: "35px",
                                    width: { xs: "100%", md: "auto" },
                                    borderRadius: "6px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {t("Add")}
                                </Button>
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

                                    {/* <TableCell
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
                                    </TableCell> */}

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
                                    <TableCell
                                      onClick={() => handleSort("country")}
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
                                      {t("Country")}
                                      <SortIcons
                                        column="country"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>



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



                                    <TableCell
                                      onClick={() => handleSort("companies_count")}
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
                                      {t("QTY Active Companies")}
                                      <SortIcons
                                        column="companies_count"
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
                                      {t("Registered On")}
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
  onClick={() => setSelectedMapExecutiveId(item.id)}
  sx={{ 
    cursor: 'pointer',
    backgroundColor: selectedMapExecutiveId === item.id ? '#e3f2fd' : 'inherit',
    '&:hover': {
      backgroundColor: selectedMapExecutiveId === item.id ? '#e3f2fd' : '#f5f5f5'
    }
  }}
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

                                      {/* <TableCell
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
                                      </TableCell> */}

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
                                        {displayValue(item.country)}
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
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: "6px",
                                            cursor: item.referral_code ? "pointer" : "default",
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isEmptyValue(item.referral_code)) {
                                              navigator.clipboard
                                                .writeText(item.referral_code)
                                                .then(() => {
                                                  toast.success(t("copy.success"));
                                                })
                                                .catch(() => {
                                                  toast.error(t("copy.failed"));
                                                });
                                            } else {
                                              toast.error(t("copy.noContent"));
                                            }
                                          }}
                                        >
                                          {/* TEXT (Tappable) */}
                                          <span
                                            title={item.referral_code}
                                            style={{
                                              maxWidth: "100px",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                            }}
                                          >
                                            {displayValue(item.referral_code)}
                                          </span>

                                          {/* COPY ICON */}
                                          <ContentCopy
                                            sx={{
                                              cursor: "pointer",
                                              width: "16px",
                                              height: "16px"
                                            }}
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
                                          maxWidth: { xs: "100px", sm: "120px", md: "140px" },
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", // ✅ Prevent wrapping
                                        }}
                                      >
                                        {displayValue(item.companies_count)}
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
                                            boxShadow: "none !important",
                                          }}
                                        >
                                          <AccountStatusDropdown
                                            item={item}
                                            // anchorEl={dropdownAnchorEl}
                                              anchorEl={selectedItem === item.id ? dropdownAnchorEl : null}

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
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: "10px",
                                          }}
                                        >
                                          {/* VIEW */}
                                          <Tooltip title={t("actions.view")}>
                                            <Visibility
                                              sx={{ cursor: "pointer", color: "#579DFF" }}
                                              onClick={() =>
                                                navigate(`/account-executive-details?id=${item?.id}`, {
                                                  state: { newUser: item },
                                                })
                                              }
                                            />
                                          </Tooltip>
                                          <Tooltip title={t("Message")}>
  <MessageOutlinedIcon
    sx={{
      color: "#579DFF",
      fontSize: "22px",
      cursor: "pointer",
      ml: 1,
    }}
    onClick={() =>
      navigate(`/messages?userId=${item?.id}&role=account_executive`, {
        state: { accountExecutive: item },
      })
    }
  />
</Tooltip>
                                          <Tooltip title={t("edit")}>
                                            <EditOutlined
                                              sx={{ cursor: "pointer", color: "#1976D2" }}
                                              onClick={() => {
                                                setSelectedEditUser(item);   // full row
                                                setEditModalOpen(true);
                                              }}
                                            />
                                          </Tooltip>
                                          {/* DELETE */}
                                          <Tooltip title={t("actions.delete")}>
                                            <DeleteOutline
                                              sx={{ cursor: "pointer", color: "#F44336" }}
                                              onClick={() => {
                                                setDeleteModalOpen(true);
                                                setSelectedDeleteUser(item);
                                              }}
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
                      src={warn}
                      alt="..."
                      style={{ alignSelf: "center", width: "100px" }}
                    />
                    <TypographyMD
                      variant="paragraph"

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
                          : "Inactive"
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
        title={t("verificationModal.title")}
        data={
          <div style={{ backgroundColor: "#fff", margin: 13 }}>
            <Grid container spacing={0} p={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
              <Grid xs={12} align="center">
                <Stack align="center" direction="column" spacing={2} pb={3}>
                  <img
                    src={warn}
                    alt="..."
                    style={{ alignSelf: "center", width: "100px" }}
                  />
                  <TypographyMD
                    variant="paragraph"
                    label={t("verificationModal.confirmMessage", { status: verificationStatusToChange })}

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
                    title={t("verificationModal.cancel")}
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
                        {["All", "Invited",  "Requested", "Active", "Inactive"].map((status) => (
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


<TypographyMD
  variant="paragraph"
  label={t("Verification Status")}
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
    gap: 1,
    marginBottom: "15px",
    marginTop: "10px",
  }}
>
  {["All", "Pending", "Verified", "Rejected"].map((vStatus) => (
    <Box
      key={vStatus}
      onClick={() => setDraftVerificationStatus(vStatus.toLowerCase())}
      sx={{
        padding: "6px 12px",
        borderRadius: "5px",
        border: `2px solid ${
          draftVerificationStatus === vStatus.toLowerCase()
            ? "#006EC2"
            : "#ccc"
        }`,
        cursor: "pointer",
        "&:hover": {
          borderColor: "#006EC2",
        },
      }}
    >
      <TypographyMD
        label={t(vStatus)}
        fontSize="12px"
        color={
          draftVerificationStatus === vStatus.toLowerCase()
            ? "#006EC2"
            : "#363333"
        }
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
                            {/* <input
                              autoFocus={false}
                              type="date"
                              value={draftStartDate}
                              onChange={(e) => {
    let value = e.target.value;
    // value format from type="date" is "YYYY-MM-DD"
    const [year, month, day] = value.split("-");
    if (year && year.length > 4) {
      // Trim year to 4 digits
      const trimmedYear = year.slice(0, 4);
      value = [trimmedYear, month, day].filter(Boolean).join("-");
    }
    setDraftStartDate(value);
  }}
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
                            /> */}
                            <input
                              ref={startDateRef}
                              autoFocus={false}
                              type="date"
                              value={draftStartDate}
                              onClick={() => {
                                startDateRef.current?.showPicker?.();
                              }}
                              onChange={(e) => {
                                const value = e.target.value;

                                // expected format: YYYY-MM-DD
                                if (value) {
                                  const year = value.split("-")[0];
                                  if (year.length > 4) return;
                                }

                                setDraftStartDate(value);
                              }}
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
                              ref={endDateRef}
                              autoFocus={false}
                              type="date"
                              value={draftEndDate}
                              onClick={() => {
                                endDateRef.current?.showPicker?.();
                              }}
                              onChange={(e) => {
                                const value = e.target.value;

                                // expected format: YYYY-MM-DD
                                if (value) {
                                  const year = value.split("-")[0];
                                  if (year.length > 4) return;
                                }

                                setDraftEndDate(value);
                              }}
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
                            />
                            {/* <input
  autoFocus={false}
  type="date"
  value={draftEndDate}
  onChange={(e) => {
    const value = e.target.value;

    // expected format: YYYY-MM-DD
    if (value) {
      const year = value.split("-")[0];

      // block if year exceeds 4 digits
      if (year.length > 4) return;
    }

    setDraftEndDate(value);
  }}
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
/> */}

                          </Box>
                        </Box>
                      </div>
                      <TypographyMD
                        variant="paragraph"
                        label={t("Country")}
                        color="#000000"
                        fontFamily="Roboto"
                        fontSize="15px"
                        fontWeight={750}
                        align="left"
                      />

                      <Box mt={1} mb={2}>
                        {/* Country */}
                        <SearchableDropdown
                          value={draftCountry?.name || draftCountry || ""}
                          options={countryOptions.map(c => c.name)} // Pass names for display
                          onChange={(name) => {
                            const countryObj = countryOptions.find(c => c.name === name);
                            setDraftCountry(countryObj || name);
                            setDraftState(null);
                            setDraftCity(null);
                          }}
                          placeholder={t("Select Country")}
                        />
                      </Box>

                      {/* State */}
                      <TypographyMD
                        variant="paragraph"
                        label={t("State / Province")}
                        color="#000000"
                        fontFamily="Roboto"
                        fontSize="15px"
                        fontWeight={750}
                        align="left"
                      />
                      <Box mt={1} mb={2}>
                        <SearchableDropdown
                          value={draftState?.name || draftState}
                          options={draftCountry?.isoCode
                            ? State.getStatesOfCountry(draftCountry.isoCode).map(s => s.name)
                            : []}
                          onChange={(name) => {
                            if (draftCountry?.isoCode) {
                              const states = State.getStatesOfCountry(draftCountry.isoCode);
                              const stateObj = states.find(s => s.name === name);
                              setDraftState(stateObj || name);
                              setDraftCity(null);
                            }
                          }}
                          placeholder={t("Select State")}
                          disabled={!draftCountry}
                        />
                      </Box>

                      {/* City */}
                      <TypographyMD
                        variant="paragraph"
                        label={t("City")}
                        color="#000000"
                        fontFamily="Roboto"
                        fontSize="15px"
                        fontWeight={750}
                        align="left"
                      />
                      <Box mt={1} mb={6} width="100%" >
                        <SearchableDropdown
                          value={draftCity?.name || draftCity}
                          options={draftCountry?.isoCode && draftState?.isoCode
                            ? City.getCitiesOfState(draftCountry.isoCode, draftState.isoCode).map(c => c.name)
                            : []}
                          onChange={(name) => {
                            if (draftCountry?.isoCode && draftState?.isoCode) {
                              const cities = City.getCitiesOfState(draftCountry.isoCode, draftState.isoCode);
                              const cityObj = cities.find(c => c.name === name);
                              setDraftCity(cityObj || name);
                            }
                          }}
                          placeholder={t("Select City")}
                          disabled={!draftState}
                          style={{ width: "100%", minWidth: "220px", maxWidth: "100%", boxSizing: "border-box" }}
                        />
                      </Box>
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
      <AddAccountExecutiveModal
        open={openModalAdd}
        onClose={() => setOpenModalAdd(false)}
        token={token}
        onSuccess={() => getallusers(1, "", statusFilter)}
      />
      {editModalOpen && selectedEditUser && (
        <EditAccountExecutiveModal
          open={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedEditUser(null);
          }}
          user={selectedEditUser}   // 🔥 pass full object
          onSuccess={() => getallusers(1, "", statusFilter)}
        />
      )}
      <DeleteAccountExecutiveModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteAccountExecutive}
        loading={deleteLoading}
        name={selectedDeleteUser?.name}
      />
    </>
  );
}

export default AccountExecutive;












