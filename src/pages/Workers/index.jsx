import React, { useEffect, useRef, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import {
  Box,
  Button,
  Checkbox,
  Chip,

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
  CircularProgress,
} from "@mui/material";
import WorkerPins from "./WorkersPins";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation } from "react-router-dom";
import StatusDropdown from "../../components/StatusDropdown";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";

// import AccountExecutivePins from "./AccountExecutivePins";
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

  Delete,
  Edit,
} from "@mui/icons-material";
import EditWorker from "./EditWorker";
import AddWorker from "./Addworker"; // Import AddWorker
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
import { Country, State, City } from "country-state-city";
import SearchableDropdown from "../../components/SearchableCountryDropdown";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { getApiMessage, showToast } from "../../helper_functions/messageHandler";
import DeleteAccountExecutiveModal from "../../components/DeleteModal";

import ExportMenuButton from "../../components/ExportMenuButton";
import FormatDate from "../../components/FormatDate";
// import { MapContainer } from 'react-leaflet/MapContainer'
// import { TileLayer } from 'react-leaflet/TileLayer'
// import { useMap } from 'react-leaflet/hooks'
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "../../App.css";
import "leaflet/dist/leaflet.css";
import LocationPicker from "../../components/LocationPicker";
import VerificationStatusDisplayChip from "../../components/VerificationChip";
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

function Workers() {
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

  const statusColors = {
    active: "#4BCE97",
    inactive: "#F87168",
    invited: "#579DFF",
    requested: "#ebc634",
    pending: "#FF9800",
    suspended: "#F87168",
  };

  const countryOptions = Country.getAllCountries(); // Keep as full objects

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

  const location = useLocation();

  const isFromDashboard = location.state?.fromDashboard === true;
  //my code for implementing empty icons
  const [noData, setNoData] = useState(false);
  //==

  // Delete modal states
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  const [selectedWorkerName, setSelectedWorkerName] = useState("");

  // Add Worker Modal State
  const [openAddModal, setOpenAddModal] = useState(false);

  const [allusers, setAllusers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(7); // default 10 records per page
  const [searchTerm, setSearchTerm] = useState("");
  const isSortingRef = useRef(false);
  const [sortingLoader, setSortingLoader] = useState(false);
  const [initialLoader, setInitialLoader] = useState(true);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DSC");

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const formatLabel = (key) =>
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  const fetchAllUsersForExport = async () => {
    const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
    const sortParams = sortBy
      ? `&sort_by=${sortBy}&sort_order=${sortOrder}`
      : "";
    const searchParam = searchTerm ? `&search=${searchTerm}` : "";
    const dateFromParam = dateFrom ? `&date_from=${dateFrom}` : "";
    const dateToParam = dateTo ? `&date_to=${dateTo}` : "";
    const companiesParam = selectedCompanyId ? `&company_id=${selectedCompanyId}` : "";
    const countryParam = filterCountry ? `&country=${filterCountry}` : "";
    const stateParam = filterState ? `&state=${filterState}` : "";
    const cityParam = filterCity ? `&city=${filterCity}` : "";
    const verificationStatusParam = verificationStatusFilter !== "all" ? `&verification_status=${verificationStatusFilter}` : "";
    
    const apiUrl = `${url}public/workers?no_pagination=true${statusParam}${sortParams}${searchParam}${dateFromParam}${dateToParam}${companiesParam}${countryParam}${stateParam}${cityParam}${verificationStatusParam}`;
    // const apiUrl = `${url}public/workers?no_pagination=true${statusParam}${sortParams}${searchParam}${dateFromParam}${dateToParam}${companiesParam}${countryParam}${stateParam}${cityParam}`;

    try {
      const response = await fetch(apiUrl, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      return data?.data?.records || [];
    } catch (err) {
      console.error("Export fetch failed", err);
      return [];
    }
  };
  const [exportingUsers, setExportingUsers] = useState(false);
  const [exportingUserFormat, setExportingUserFormat] = useState(null);

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
  const formatDateForExport = (value) => {
    if (!value) return t("N/A");

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };
  const isDateKey = (key) => {
    const k = key.toLowerCase();

    return (
      k.includes("date") ||
      k.includes("dob") ||
      k.includes("created_at") ||
      k.includes("updated_at") ||
      k.includes("verified_at")
    );
  };
  const handleExportData = async (format) => {
    setExportingUsers(true);
    setExportingUserFormat(format);

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

          // ✅ ALL DATE FIELDS (dob, created_at, updated_at, email_verified_at, etc.)
          if (isDateKey(key)) {
            flatItem[label] = formatDateForExport(value);
            return;
          }

          // ✅ OBJECTS / ARRAYS
          if (value && typeof value === "object") {
            flatItem[label] = JSON.stringify(value);
            return;
          }

          // ✅ EMPTY VALUES
          if (
            value === null ||
            value === undefined ||
            (typeof value === "string" && value.trim() === "")
          ) {
            flatItem[label] = t("N/A");
            return;
          }

          // ✅ DEFAULT
          flatItem[label] = value;
        });

        return flatItem;
      });

      if (format.toLowerCase() === "pdf") {
        await exportTable(flattenedData, "Employees", "pdf", { skipColumns: [] });
      } else if (format.toLowerCase() === "excel") {
        await exportTable(flattenedData, "Employees", "xlsx", { skipColumns: [] });
      } else {
        toast.error(t("Unsupported export format."));
      }
    } catch (err) {
      toast.error(t("Failed to export workers. Please try again."));
    } finally {
      setExportingUsers(false);
      setExportingUserFormat(null);
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
    company_id = selectedCompanyId,
    country = "",
    state = "",
    city = "",
        verification_status = "all"

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
    let companiesParam = company_id ? `&company_id=${company_id}` : "";
    let countryParam = country ? `&country=${country}` : "";
    let stateParam = state ? `&state=${state}` : "";
    let cityParam = city ? `&city=${city}` : "";
    let verificationStatusParam = verification_status !== "all" ? `&verification_status=${verification_status}` : "";

    // const InsertAPIURL = ``;
    const InsertAPIURL = `${url}public/workers?page=${page}&limit=${limit}&search=${search}${statusParam}${sortParams}${dateFromParam}${dateToParam}${companiesParam}${countryParam}${stateParam}${cityParam}${verificationStatusParam}`;
    //updated try block for empty icon check
    try {
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Fetched workers data:", data);
      const workers = data?.data?.records;
      if (!data || data.error || !Array.isArray(workers)) {
        setAllusers([]); // reset users
        setTotalPages(1); // fallback
        setNoData(true); // you can use this to conditionally render "No Data Found" UI
        return;
      }

      setAllusers(workers);
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

  // Delete worker function
  const handleDeleteWorker = async (deletionReason) => {
    console.log("handleDeleteWorker called with reason:", deletionReason);
    console.log("selectedWorkerId:", selectedWorkerId);
    if (!selectedWorkerId) {
      console.log("No worker ID selected, returning");
      return;
    }

    setDeleteLoading(true);
    try {
      const deleteApiUrl = `${url}super-admin/workers/${selectedWorkerId}`;
      const response = await fetch(deleteApiUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deletion_reason: deletionReason,
        }),
      });

      const data = await response.json();

      if (response.ok && !data.error) {
        showToast(toast.success, data, t("Worker deleted successfully"));
        setOpenDeleteModal(false);
        setSelectedWorkerId(null);
        setSelectedWorkerName("");
        // Refresh the list
        getallusers(
          currentPage,
          searchTerm || "",
          statusFilter || "all",
          sortBy,
          sortOrder,
          false,
          dateFrom,
          dateTo,
          selectedCompanyId
        );
      } else {
        showToast(toast.error, data, t("Failed to delete worker"));
      }
    } catch (error) {
      const message = error.response?.data
        ? getApiMessage(error.response.data, t("Something went wrong! Please try again."))
        : (error.message || t("Something went wrong! Please try again."));
      toast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open delete modal
  const handleOpenDeleteModal = (workerId, workerName) => {
    console.log("handleOpenDeleteModal called with:", { workerId, workerName });

    // Check worker ID exists before opening modal
    if (!workerId) {
      console.error("Worker ID is missing!");
      toast.error(t("Worker ID does not exist, cannot delete"));
      return;
    }

    setSelectedWorkerId(workerId);
    setSelectedWorkerName(workerName);
    setOpenDeleteModal(true);
    console.log("Modal should be open now");
  };

  // Close delete modal
  const handleCloseDeleteModal = () => {
    if (!deleteLoading) {
      setOpenDeleteModal(false);
      setSelectedWorkerId(null);
      setSelectedWorkerName("");
    }
  };

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
  const [draftCountry, setDraftCountry] = useState(null);
  const [draftState, setDraftState] = useState(null);
  const [draftCity, setDraftCity] = useState(null);

  // Function to enforce date input length restrictions
  const handleDateInput = (e) => {
    const { name, value } = e.target;
    const dateParts = value.split('-');
    if (dateParts.length === 3) {
      const [year, month, day] = dateParts;
      if (year.length > 4 || month.length > 2 || day.length > 2) {
        return;
      }
    }
    if (name === 'startDate') {
      setDraftStartDate(value);
    } else if (name === 'endDate') {
      setDraftEndDate(value);
    } else if (name === 'dob') {
      formik.setFieldValue('dob', value);
    }
  };

  // Active filter states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterCountry, setFilterCountry] = useState(null);
  const [filterState, setFilterState] = useState(null);
  const [filterCity, setFilterCity] = useState(null);
  // Verification status filter states
  const [verificationStatusFilter, setVerificationStatusFilter] = useState("all");
  const [draftVerificationStatus, setDraftVerificationStatus] = useState("all");
  const [isCleared, setIsCleared] = useState(false);
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
      dateTo !== "" ||
      (selectedCompanyId && selectedCompanyId !== "") ||
      filterCountry !== null ||
      filterState !== null ||
      filterCity !== null||
            verificationStatusFilter !== "all"

    );
  };

  // Clear all filters
   const clearFilters = () => {
    console.log("❌ CLEAR FILTER CLICKED");
    setIsCleared(true);

    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setDraftStatus("all");
    setDraftStartDate("");
    setDraftEndDate("");
    setSelectedCompanyId("");
    setDraftCompanyId("");
    setFilterCountry(null);
    setFilterState(null);
    setFilterCity(null);
    setDraftCountry(null);
    setDraftState(null);
    setDraftCity(null);
    setVerificationStatusFilter("all");
    setDraftVerificationStatus("all");
    setCurrentPage(1);

    // Reset to default state
    getallusers(1, searchTerm, "all", sortBy, sortOrder, false, "", "", "", null, null, null, "all");
  };

  // Handle filter submit
  // const handleFilterSubmit = (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   const statusParam = draftStatus.toLowerCase() !== "all" ? draftStatus.toLowerCase() : "all";

  //   // Call API immediately with selected filters
  //   getallusers(
  //     1,                 // page
  //     searchTerm,        // search
  //     statusParam,       // status
  //     sortBy,
  //     sortOrder,
  //     false,             // isSorting
  //     draftStartDate,    // date_from
  //     draftEndDate,      // date_to
  //     draftCompanyId     // company_id
  //   );

  //   // Update active states for modal inputs
  //   setStatusFilter(statusParam);
  //   setDateFrom(draftStartDate);
  //   setDateTo(draftEndDate);
  //   setSelectedCompanyId(draftCompanyId);

  //   setOpenModalFilter(false);
  //   setLoading(false);
  // };
  // const handleFilterSubmit = (e) => {
  //   e.preventDefault();

  //   const statusParam =
  //     draftStatus.toLowerCase() !== "all"
  //       ? draftStatus.toLowerCase()
  //       : "all";

  //   // Extract country, state, city names for API
  //   const countryName = draftCountry?.name || draftCountry;
  //   const stateName = draftState?.name || draftState;
  //   const cityName = draftCity?.name || draftCity;

  //   setStatusFilter(statusParam);
  //   setDateFrom(draftStartDate);
  //   setDateTo(draftEndDate);
  //   setSelectedCompanyId(draftCompanyId);
  //   setFilterCountry(countryName);
  //   setFilterState(stateName);
  //   setFilterCity(cityName);
  //   setCurrentPage(1);

  //   setOpenModalFilter(false);
  // };

  const handleFilterSubmit = (e) => {
    e.preventDefault();

    const statusParam =
      draftStatus.toLowerCase() !== "all"
        ? draftStatus.toLowerCase()
        : "all";
    const verificationStatusParam = draftVerificationStatus.toLowerCase() !== "all" ? draftVerificationStatus.toLowerCase() : "all";

    console.log("🔍 FILTER SUBMIT - Verification Status Draft:", draftVerificationStatus);
    console.log("📋 Filter Data:", {
      status: statusParam,
      verification_status: verificationStatusParam,
      date_from: draftStartDate,
      date_to: draftEndDate,
      company_id: draftCompanyId,
      country: draftCountry?.name || draftCountry || "",
      state: draftState?.name || draftState || "",
      city: draftCity?.name || draftCity || ""
    });

    // Extract country, state, city names for API
    const countryName = draftCountry?.name || draftCountry;
    const stateName = draftState?.name || draftState;
    const cityName = draftCity?.name || draftCity;

    setStatusFilter(statusParam);
    setDateFrom(draftStartDate);
    setDateTo(draftEndDate);
    setSelectedCompanyId(draftCompanyId);
    setFilterCountry(countryName);
    setFilterState(stateName);
    setFilterCity(cityName);
    setVerificationStatusFilter(verificationStatusParam);
    setCurrentPage(1);

    setOpenModalFilter(false);
    setIsCleared(false);
  };
  const filteredData = allusers?.filter(
    (item) => {
      const fullName = [item?.first_name, item?.middle_name, item?.last_name]
        .filter(Boolean)
        .join(" ");
      return (
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

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
  //     dateFrom,
  //     dateTo,
  //     selectedCompanyId,
  //     filterCountry,
  //     filterState,
  //     filterCity
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
      selectedCompanyId,
      filterCountry,
      filterState,
      filterCity,
      verificationStatusFilter
    );
  };
  const [isDragging, setIsDragging] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Edit Worker States
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const handleEditWorker = (worker) => {
    setSelectedWorker(worker);
    setOpenEditModal(true);
  };

  // Legal Document Upload States
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [docFileName, setDocFileName] = useState("");






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
        const InsertAPIURL = `${url}super-admin/workers`;
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
          toast.success(t("Worker created successfully"));
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



  const [countries, setCountries] = useState([]);

  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companiesOptions, setCompaniesOptions] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [draftCompanyId, setDraftCompanyId] = useState("");

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












  const [bulkLoading, setBulkLoading] = useState(null);




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
        selectedCompanyId,
        filterCountry,
        filterState,
        filterCity,
                verificationStatusFilter

      );

      isSortingRef.current = false; // Reset the flag after fetch
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [sortBy, sortOrder, searchTerm, statusFilter, dateFrom, dateTo, selectedCompanyId, filterCountry, filterState, filterCity,verificationStatusFilter]);

  useEffect(() => {
    if (selectedRows.length !== allusers.length) {
      setSelectAll(false);
    }
  }, [selectedRows]);

  useEffect(() => {
    getCountries();

    getallusers();
    getZones(); // Load zones on component mount
    // Load companies for filter
    (async () => {
      try {
        setLoadingCompanies(true);
        const res = await fetch(`${url}public/companies`);
        const data = await res.json();
        console.log(data, "companies data");
        const list = Array.isArray(data?.data?.companies) ? data.data.companies : [];
        console.log(list, "list");
        console.log("Companies loaded:", list.length);
        setCompaniesOptions(list);
      } catch (err) {
        // silent
      } finally {
        setLoadingCompanies(false);
      }
    })();
  }, []);



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

// Map filter states
const [selectedMapWorkerId, setSelectedMapWorkerId] = useState(null);


const handleMessageClick = (item) => {
const status = item?.status?.toLowerCase();


if (status !== "active") {
toast.error(t("chat.accountNotActive"));
return;
}


// ✅ existing functionality
navigate(`/messages?userId=${item?.id}&role=worker`, {
state: { worker: item },
});
};
  return (
    <>
      {/* {noData ? (
  <NoDataFound message="No Account Executives Found" />
) :
(   */}

      <SidebarNew
        componentTitle="Employees"
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
                  src={nousers}
                  alt={t("No data found")}
                  className="empty-image"
                />
                <h1 className="empty-heading">Empty!</h1>
                <p className="empty-paragraph">{t("No Employees Yet!")}</p>
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
                  <WorkerPins statusFilter={statusFilter}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    selectedCompanyId={selectedCompanyId}
                    filterCountry={filterCountry}
                    filterState={filterState}
                    filterCity={filterCity}
                    search={searchTerm}
                   verificationStatusFilter={verificationStatusFilter}
                     selectedMapWorkerId={selectedMapWorkerId}

                     onClearSelection={() => setSelectedMapWorkerId(null)}

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
                              label={t("Manage Workers")}
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
                              placeholder={t("Search workers...")}
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

                            <>
                              {/* Filter button */}
                              <Box sx={{ position: "relative", display: "inline-flex" }}>
                                <IconButton
                                  onClick={() => {
                                    // Set draft values to current active values when opening modal
                                    setDraftStatus(statusFilter);
                                    setDraftStartDate(dateFrom);
                                    setDraftEndDate(dateTo);
                                    setDraftCompanyId(selectedCompanyId);
                                    setDraftCountry(filterCountry);
                                    setDraftState(filterState);
                                    setDraftCity(filterCity);
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



                              {/* Add Worker Button */}
                              <ButtonMD
                                variant="contained"
                                title={t("Add")}
                                onClickTerm={() => setOpenAddModal(true)}
                                bgcolor="#006EC2"
                                color="#fff"
                                startIcon={<AddCircle />}
                              />

                              {/* Export */}

                              <ExportMenuButton
                                onExport={handleExportData}
                                exporting={exportingUsers}
                                exportingFormat={exportingUserFormat}
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


                            </>

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
                                  <TableRow
                                  
  >


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
                                      onClick={() => handleSort("company_name")}
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
                                      {t("Company Name")}
                                      <SortIcons
                                        column="company_name"
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
                                      onClick={() => handleSort("account_executive_name")}
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
                                      {t("Account Executive")}
                                      <SortIcons
                                        column="account_executive_name"
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
                                      {t("accountStatus")}
                                      <SortIcons
                                        column="status"
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
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {t("emailVerified")}
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("created_at")}
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
                                        column="created_at"
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
  onClick={() => setSelectedMapWorkerId(item.id)}
  sx={{ 
    cursor: 'pointer',
    backgroundColor: selectedMapWorkerId === item.id ? '#e3f2fd' : 'inherit',
    '&:hover': {
      backgroundColor: selectedMapWorkerId === item.id ? '#e3f2fd' : '#f5f5f5'
    }
  }}
                                    >


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
                                        {displayValue(
                                          [item.first_name, item.middle_name, item.last_name]
                                            .filter(Boolean)
                                            .join(" ") || `${item.first_name || ""} ${item.last_name || ""}`.trim()
                                        )}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: 400,
                                          color: "#172B4D",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "14px",
                                          maxWidth: { xs: "120px", sm: "140px", md: "160px" },
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", // ✅ Prevent wrapping
                                        }}
                                      >
                                        {displayValue(item.company_name)}
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
                                        {displayValue(item.account_executive_name)}
                                      </TableCell>

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
                                        {displayValue(item.country)}
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
                                          // maxWidth: { xs: "80px", sm: "100px", md: "120px" },
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap", // ✅ Prevent wrapping
                                        }}
                                      >
                                      
                                         <Box
                                            sx={{
                                          pointerEvents: "none",
                                             }}
                                               >
                                                <StatusDropdown
                                                  currentStatus={item?.status}
                                                    />
                                                                                          </Box>
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
                                      
                       
                    <VerificationStatusDisplayChip status={item.email_verification_status} />
                
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
                                        {isEmptyValue(item?.created_at) ? (
                                          t("N/A")
                                        ) : (
                                          <FormatDate inputDate={item?.created_at} />
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
                                          <Tooltip title={t("actions.view")}>
                                            <Visibility
                                              sx={{
                                                cursor: "pointer",
                                                color: "#579DFF",
                                              }}
                                              onClick={() =>
                                                navigate(
                                                  `/worker-details?id=${item?.id}`,
                                                  { state: { worker: item } }
                                                )
                                              }
                                            />
                                          </Tooltip>
                                          <Tooltip title={t("Message")}>
  {/* <MessageOutlinedIcon
    sx={{
      color: "#579DFF",
      fontSize: "22px",
      cursor: "pointer",
      ml: 1,
    }}
    onClick={() =>
      navigate(`/messages?userId=${item?.id}&role=worker`, {
        state: { worker: item },
      })
    }
  /> */}
  <MessageOutlinedIcon
sx={{
color: "#579DFF",
fontSize: "22px",
cursor: "pointer",
ml: 1,
}}
onClick={(e) => {
e.stopPropagation(); // ✅ prevent row click
handleMessageClick(item);
}}
/>
</Tooltip>
                                          <Tooltip title={t("actions.edit") || "Edit"}>
                                            <Edit
                                              sx={{
                                                cursor: "pointer",
                                                color: "#006EC2",
                                              }}
                                              onClick={() => handleEditWorker(item)}
                                            />
                                          </Tooltip>
                                          <Tooltip title={t("actions.delete") || "Delete"}>
                                            <Delete
                                              sx={{
                                                cursor: "pointer",
                                                color: "#F44336",
                                              }}
                                              onClick={() => {
                                                console.log("Delete icon clicked, item:", item);
                                                console.log("worker id:", item?.id);

                                                // Check if worker id exists
                                                if (!item?.id) {
                                                  console.error("No worker ID found in item!");
                                                  toast.error(t("Employee ID does not exist, cannot delete"));
                                                  return;
                                                }

                                                handleOpenDeleteModal(item?.id, item?.full_name || `${item?.first_name} ${item?.last_name}`);
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
            {/* Add/Edit Worker Modal */}
            <AddWorker
              open={openAddModal || openEditModal}
              onClose={() => {
                setOpenAddModal(false);
                setOpenEditModal(false);
              }}
              onSuccess={() => {
                getallusers(currentPage, searchTerm, statusFilter, sortBy, sortOrder);
              }}
              selectedRowData={openEditModal ? selectedWorker : null}
              mode={openEditModal ? "edit" : "add"}
            />
          </Box>
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

      {/* EditWorker removed, handled by AddWorker now */}

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

                      <Box sx={{ mt: 1, mb: 3 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>{t("Select Status")}</InputLabel>
                          <Select
                            value={draftStatus}
                            onChange={(e) => setDraftStatus(e.target.value)}
                            input={<OutlinedInput label={t("Select Status")} />}
                          >
                            <MenuItem value="all">
                              <em>{t("All Statuses")}</em>
                            </MenuItem>
                            <MenuItem value="active">{t("Active")}</MenuItem>
                            <MenuItem value="inactive">{t("Inactive")}</MenuItem>
                            <MenuItem value="pending">{t("Pending")}</MenuItem>
                            <MenuItem value="invited">{t("Invited")}</MenuItem>

                          </Select>
                        </FormControl>
                      </Box>



                      {/* --- Verification Status --- */}
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
                          gap: { xs: 1, sm: 1.5, md: 1 },
                          marginBottom: "15px",
                          marginTop: "10px",
                        }}
                      >
                        {["All", "Pending", "Verified",].sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b)).map((status) => (
                          <Box
                            key={status}
                            onClick={() => setDraftVerificationStatus(status.toLowerCase())}
                            sx={{
                              display: "flex",
                              padding: { xs: "6px 10px", sm: "5px 11px", md: "4px 12px" },
                              borderRadius: "5px",
                              border: `2px solid ${draftVerificationStatus === status.toLowerCase() ? "#006EC2" : "#ccc"
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
                                draftVerificationStatus === status.toLowerCase() ? "#006EC2" : "#363333"
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
                        label={t("Companies")}
                        color="#000000"
                        fontFamily="Roboto"
                        fontSize="15px"
                        fontWeight={750}
                        align="left"
                      />
                      <Box sx={{ mt: 1, mb: 3 }}>
                        <FormControl fullWidth size="small">

                          <SearchableDropdown
                            value={draftCompanyId}
                            onChange={(val) => setDraftCompanyId(val)}
                            options={[
                              { id: "", name: t("All Companies") },
                              ...(loadingCompanies
                                ? [] // no extra options while loading
                                : companiesOptions
                                  ?.sort((a, b) => (a?.name || "").localeCompare(b?.name || ""))
                                  .map((c) => ({ id: c?.id, name: c?.name })) || []),
                            ]}
                            placeholder={loadingCompanies ? t("Loading...") : t("Select Company")}
                            disabled={loadingCompanies || companiesOptions.length === 0}
                          />

                        </FormControl>
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

                                  // block if year exceeds 4 digits
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
                            />

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
                      <Box mt={1} mb={2}>
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

      {/* Delete Worker Modal */}
      <DeleteAccountExecutiveModal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteWorker}
        loading={deleteLoading}
        name={selectedWorkerName}
        message={t("confirmDeleteWorker")}
      />
    </>
  );
}

export default Workers;
