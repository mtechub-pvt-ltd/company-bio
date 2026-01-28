import React, { useEffect, useMemo, useRef, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";

import {

  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  OutlinedInput,
  Pagination,
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
  FormControl,
  Select,
} from "@mui/material";
import { getApiMessage, showToast } from "../../helper_functions/messageHandler";
import warn from "../../Assets/warn.png";
import i18n from "../../multiLingual";
import { useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {

  ArrowBackIos,
  ArrowForwardIos,
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
  Save,
  KeyboardArrowDown,
  ArrowDownward,
  ArrowUpward,
  CloudSync,
  FilterList,
  Close as CloseIcon,
  Delete,
  Edit,
} from "@mui/icons-material";
import UpdateCompanyAdmin from "./EditCompanyAdmin";
import { exportTable } from "../../helper_functions/ExportData";
import TypographyMD from "../../components/items/Typography";
import nousers from "../../Assets/no-user.png";
import exportIcon from "../../Assets/export_icon.png";
import addIcon from "../../Assets/add_icon.png";
import menu_icon from "../../Assets/menu_icon.png";
import confirmation_icon from "../../Assets/confirmation_icon.png";
import csvIcon from "../../Assets/csvIcon.png";
import pdfIcon from "../../Assets/pdfIcon.png";
import Topbar from "../../components/topbar/Topbar";
import LocationHelperModal from "../../components/Locationhelper";
import debounce from "lodash.debounce";
import AddCompanyAdmin from "./AddCompanyAdmin";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";

import ModalAdd from "../../components/items/Modal";
import ButtonMD from "../../components/items/ButtonMD";
import ModalSuccess from "../../components/items/ModalSuccess";
import url from "../../url";
import { AttachFile } from "@mui/icons-material";
import { Country } from "country-state-city";

import SearchableDropdown from "../../components/SearchableCountryDropdown";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CompanyAdminPins from "./companyAdminPins";
import AssignmentModal from "./AssignmentModel";
// import { useFormik } from "formik";
import * as yup from "yup";
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
import LocationPicker from "../../components/LocationPicker";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "../../App.css";
import "leaflet/dist/leaflet.css";
import Inputfield from "../../components/items/Inputfield";
import SelectField from "../../components/items/Selectfield";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Countryfield from "../../components/items/Countryfield";

import { useTranslation } from "react-i18next";
import StatusFilter from "../../components/StatusFilter";
import ExportMenuButton from "../../components/ExportMenuButton";
import ImageCropper from "../../components/ImageCropper";
import DummyStatusMenuButton from "../../components/DummyStatusMenuButton";
import { useSelector } from "react-redux";
import AccountStatusDropdown from "../../components/AccountStatusDropdown";
import VerificationStatusDropdown from "../../components/VerificationStatusDropdown";
import ModalConfirmation from "../../components/items/ModalConfirmation";
import DeleteAccountExecutiveModal from "../../components/DeleteModal";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

import FormatDate from "../../components/FormatDate";

const date = new Date();

const SortIcons = ({ column, sortBy, sortOrder }) => (
  <>
    {sortBy === column && sortOrder === "ASC" ? (
      <ArrowUpward sx={{ fontSize: "17px" }} />
    ) : (
      <ArrowDownward sx={{ fontSize: "17px" }} />
    )}
  </>
);

function CompanyAdmin() {
  const { token, tokenExpiry } = useSelector((state) => state.auth);
  console.log("Token is", token)
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [initialLoader, setInitialLoader] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [allusers, setAllusers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(7); // default 10 records per page
  const isSortingRef = useRef(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [sortingLoader, setSortingLoader] = useState(false);
  const [sortBy, setSortBy] = useState("registered"); // Default sort by registration date
  const [sortOrder, setSortOrder] = useState("DSC"); // Default show newest first
  const [selectedCountryIso, setSelectedCountryIso] = useState("");
  const [selectedStateIso, setSelectedStateIso] = useState("");
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [draftCountry, setDraftCountry] = useState(null);
  const [countryFilter, setCountryFilter] = useState(null);

  const countryOptions = Country.getAllCountries().map((c) => c.name);

  const location = useLocation();

  const isFromDashboard = location.state?.fromDashboard === true;

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

  //my code for implementing empty icons
  const [noData, setNoData] = useState(false);
  //==
  const [draftAssignmentType, setDraftAssignmentType] = useState("all");
  const [assignmentType, setAssignmentType] = useState("all");

  // Account Executive filter states
  const [draftAccountExecutiveId, setDraftAccountExecutiveId] = useState("all");
  const [accountExecutiveFilter, setAccountExecutiveFilter] = useState("all");

  // Verification status filter states
  const [draftVerificationStatus, setDraftVerificationStatus] = useState("all");
  const [verificationStatusFilter, setVerificationStatusFilter] = useState("all");



  // Subscription status
const [draftSubscriptionStatus, setDraftSubscriptionStatus] = useState("all");
const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState("all");

// Trial period
const [draftTrialStartDate, setDraftTrialStartDate] = useState("");
const [draftTrialEndDate, setDraftTrialEndDate] = useState("");

// Subscription period
const [draftSubscriptionStartDate, setDraftSubscriptionStartDate] = useState("");
const [draftSubscriptionEndDate, setDraftSubscriptionEndDate] = useState("");

// Active applied values
const [trialStartDate, setTrialStartDate] = useState("");
const [trialEndDate, setTrialEndDate] = useState("");
const [subscriptionStartDate, setSubscriptionStartDate] = useState("");
const [subscriptionEndDate, setSubscriptionEndDate] = useState("");


  // State and City filter states
  const [draftState, setDraftState] = useState("");
  const [draftCity, setDraftCity] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statesData, setStatesData] = useState([]);
  const [citiesData, setCitiesData] = useState([]);

  // Delete modal states
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedCompanyAdminName, setSelectedCompanyAdminName] = useState("");


  const formatDateRange = (start, end) => {
  if (!start || !end) return t("N/A");

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate) || isNaN(endDate)) return t("N/A");

  const options = { day: "2-digit", month: "short", year: "numeric" };

  return `${startDate.toLocaleDateString("en-GB", options)} - ${endDate.toLocaleDateString("en-GB", options)}`;
};

  const getallusers = async (
    page = 1,
    search = "",
    status = "all",
    sort_by = sortBy,
    sort_order = sortOrder,
    statusFilter,
    isSorting = false,
    date_from = "",
    date_to = "",

    assignment_type = "all", // Add this parameter
    country = "",
    account_executive_id = "all",
    verification_status = "all",
    state = "",
    city = "",
     subscription_status = "all",
  trial_start = "",
  trial_end = "",
  subscription_start = "",
  subscription_end = ""

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
    let dateFromParam = date_from ? `&start_date=${date_from}` : "";
    let dateToParam = date_to ? `&end_date=${date_to}` : "";
    let assignmentTypeParam =
      assignment_type !== "all" ? `&assignment_type=${assignment_type}` : "";
    const countryParam = draftCountry
      ? `&country=${encodeURIComponent(draftCountry)}`
      : "";
    const accountExecutiveParam = account_executive_id !== "all" ? `&account_executive_id=${account_executive_id}` : "";
    const verificationStatusParam = verification_status !== "all" ? `&verification_status=${verification_status}` : "";
    const stateParam = state ? `&state=${encodeURIComponent(state)}` : "";
    const cityParam = city ? `&city=${encodeURIComponent(city)}` : "";
const subscriptionStatusParam =
  subscription_status !== "all"
    ? `&subscription_status=${subscription_status}`
    : "";

const trialStartParam = trial_start
  ? `&trial_start_date_from=${trial_start}`
  : "";

const trialEndParam = trial_end
  ? `&trial_end_date_to=${trial_end}`
  : "";

const subscriptionStartParam = subscription_start
  ? `&subscription_start_date_from=${subscription_start}`
  : "";

const subscriptionEndParam = subscription_end
  ? `&subscription_start_date_to=${subscription_end}`
  : "";
    // const InsertAPIURL =
    //   `${url}company-admins?page=${page}&limit=${limit}&search=${search}` +
    //   `${statusParam}${sortParams}${dateFromParam}${dateToParam}` +
    //   `${assignmentTypeParam}${countryParam}${accountExecutiveParam}${verificationStatusParam}${stateParam}${cityParam}
    //   ${subscriptionStatusParam}${trialStartParam}${trialEndParam}${subscriptionStartParam}${subscriptionEndParam}`;
    const InsertAPIURL =
  `${url}company-admins?page=${page}&limit=${limit}&search=${search}` +
  `${statusParam}${sortParams}${dateFromParam}${dateToParam}` +
  `${assignmentTypeParam}${countryParam}${accountExecutiveParam}` +
  `${verificationStatusParam}${stateParam}${cityParam}` +
  `${subscriptionStatusParam}${trialStartParam}${trialEndParam}` +
  `${subscriptionStartParam}${subscriptionEndParam}`;

    // const InsertAPIURL = ``;

    try {
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setAllusers(data?.data?.company_admins);

      const companyData = data?.data?.company_admins;
      setTotalPages(data?.data?.pagination?.pages || 1);

      if (!data || data.error || !Array.isArray(companyData)) {
        setAllusers([]); // reset users
        setTotalPages(1); // fallback
        setNoData(true); // you can use this to conditionally render "No Data Found" UI
        return;
      }

      setAllusers(companyData);
      setTotalPages(data?.data?.pagination?.pages || 1);
      setNoData(false);
    } catch (error) {
      toast.error(t("Something went wrong! Please try again."));
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

  const handleSort = (column) => {
    const newSortOrder =
      sortBy === column && sortOrder === "ASC" ? "DSC" : "ASC";

    isSortingRef.current = true; // Mark sorting in progress

    setSortBy(column);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to page 1 when sorting

    // You no longer need to call getallusers here directly — let the useEffect handle it
  };

  // Delete company admin function
  const handleDeleteCompanyAdmin = async (deletionReason) => {
    console.log("handleDeleteCompanyAdmin called with reason:", deletionReason);
    console.log("selectedCompanyId:", selectedCompanyId);
    if (!selectedCompanyId) {
      console.log("No company ID selected, returning");
      return;
    }

    setDeleteLoading(true);
    console.log("eeyhehe", selectedCompanyId);
    try {
      const deleteApiUrl = `${url}super-admin/companies/${selectedCompanyId}`;
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
        showToast(toast.success, data, t("Company admin deleted successfully"));
        setOpenDeleteModal(false);
        setSelectedCompanyId(null);
        setSelectedCompanyAdminName("");
        // Refresh the list
        getallusers(
          currentPage,
          searchTerm || "",
          statusFilter || "all",
          sortBy,
          sortOrder,
          statusFilter,
          false,
          dateFrom,
          dateTo,
          assignmentType

        );
      } else {
        showToast(toast.error, data, t("Failed to delete company admin"));
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
  const handleOpenDeleteModal = (companyId, companyAdminName) => {
    console.log("handleOpenDeleteModal called with:", { companyId, companyAdminName });

    // Double check company ID exists before opening modal
    if (!companyId) {
      console.error("Company ID is missing!");
      toast.error(t("Company ID does not exist, cannot delete"));
      return;
    }

    setSelectedCompanyId(companyId);
    setSelectedCompanyAdminName(companyAdminName);
    setOpenDeleteModal(true);
    console.log("Modal should be open now");
  };

  // Close delete modal
  const handleCloseDeleteModal = () => {
    if (!deleteLoading) {
      setOpenDeleteModal(false);
      setSelectedCompanyId(null);
      setSelectedCompanyAdminName("");
    }
  };

  const [statusFilter, setStatusFilter] = useState("all");

  // Filter modal states
  const [openModalFilter, setOpenModalFilter] = useState(false);
  const [draftStatus, setDraftStatus] = useState("all");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

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
    } else {
      setDraftEndDate(value);
    }
  };

  // Active filter states
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");



  // Check if any filters are active
  const isFilterActive = () => {
    return (
      statusFilter !== "all" ||
      dateFrom !== "" ||
      dateTo !== "" ||
      assignmentType !== "all" ||
      countryFilter !== null ||
      accountExecutiveFilter !== "all" ||
      verificationStatusFilter !== "all" ||
      stateFilter !== "" ||
      cityFilter !== ""||
        subscriptionStatusFilter !== "all" ||
    trialStartDate !== "" ||
    trialEndDate !== "" ||
    subscriptionStartDate !== "" ||
    subscriptionEndDate !== ""
    );
  };

  // Filter button style logic
  const filterButtonColor = isFilterActive() ? "#006EC2" : "#E0E0E0";
  const filterButtonIcon = isFilterActive() ? <FilterAlt sx={{ color: "#fff" }} /> : <FilterAlt sx={{ color: "#44546F" }} />;

  //   // Clear all filters
  //   const clearFilters = () => {
  //     setStatusFilter("all");
  //     setDateFrom("");
  //     setDateTo("");
  //     setDraftStatus("all");
  //     setDraftStartDate("");
  //     setDraftEndDate("");
  //         setDraftAssignmentType("all");
  //         setDraftCountry(null);
  // setCountryFilter(null);


  //     // Reset to default state
  // getallusers(1, searchTerm, "all", sortBy, sortOrder, "all", false, "", "", "all", "");
  //   };
  const [pinsResetKey, setPinsResetKey] = useState(0);
  const [isCleared, setIsCleared] = useState(false);
  // const clearFilters = () => {
  //   console.log("❌ CLEAR FILTER CLICKED");
  //   setIsCleared(true);


  //   console.log("Before clear:", {
  //     statusFilter,
  //     dateFrom,
  //     dateTo,
  //     assignmentType,
  //     countryFilter,
  //     searchTerm,
  //     pinsResetKey,
  //   });

    
  //   setStatusFilter("all");
  //   setDateFrom("");
  //   setDateTo("");
  //   setAssignmentType("all");
  //   setCountryFilter("");
  //   setSearchTerm("");
  //   setAccountExecutiveFilter("all");
  //   setVerificationStatusFilter("all");
  //   setStateFilter("");
  //   setCityFilter("");

  //   setDraftStatus("all");
  //   setDraftStartDate("");
  //   setDraftEndDate("");
  //   setDraftAssignmentType("all");
  //   setDraftCountry(null);
  //   setDraftAccountExecutiveId("all");
  //   setDraftVerificationStatus("all");
  //   setDraftState("");
  //   setDraftCity("");
  //   setSubscriptionStatusFilter("all");
  // setTrialStartDate("");
  // setTrialEndDate("");
  // setSubscriptionStartDate("");
  // setSubscriptionEndDate("");

  //   setCurrentPage(1);

  //   // 🔑 force pins refresh
  //   setPinsResetKey(prev => prev + 1);

  //   getallusers(
  //     1,
  //     "",
  //     "all",
  //     sortBy,
  //     sortOrder,
  //     "all",
  //     false,
  //     "",
  //     "",
  //     "all",
  //     "",
  //       "all",      // 🔹 subscription_status
  //   "",         // 🔹 trial_start_date
  //   "",         // 🔹 trial_end_date
  //   "",         // 🔹 subscription_start_date
  //   ""   
  //   );

  //   setPinsResetKey(prev => {
  //     const next = prev + 1;
  //     console.log("🔁 pinsResetKey incremented:", next);
  //     return next;
  //   });

  //   console.log("After clear triggered (state updates scheduled)");
  // };

const clearFilters = () => {
  setIsCleared(true);

  // applied filters
  setStatusFilter("all");
  setDateFrom("");
  setDateTo("");
  setAssignmentType("all");
  setCountryFilter(null);
  setSearchTerm("");
  setAccountExecutiveFilter("all");
  setVerificationStatusFilter("all");
  setStateFilter("");
  setCityFilter("");

  setSubscriptionStatusFilter("all");
  setTrialStartDate("");
  setTrialEndDate("");
  setSubscriptionStartDate("");
  setSubscriptionEndDate("");

  // modal drafts (must reset too)
  setDraftStatus("all");
  setDraftStartDate("");
  setDraftEndDate("");
  setDraftAssignmentType("all");
  setDraftCountry(null);
  setDraftAccountExecutiveId("all");
  setDraftVerificationStatus("all");
  setDraftState("");
  setDraftCity("");

  setDraftSubscriptionStatus("all");
  setDraftTrialStartDate("");
  setDraftTrialEndDate("");
  setDraftSubscriptionStartDate("");
  setDraftSubscriptionEndDate("");

  setCurrentPage(1);
  setPinsResetKey((prev) => prev + 1);

  getallusers(
    1,
    "",
    "all",
    sortBy,
    sortOrder,
    "all",
    false,
    "",
    "",
    "all",
    "",
    "all",
    "all",
    "",
    "",
    "all",
    "",
    "",
    "",
    ""
  );
};



  // Handle filter submit
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const statusParam = draftStatus.toLowerCase() !== "all" ? draftStatus.toLowerCase() : "all";
    const assignmentTypeParam = draftAssignmentType.toLowerCase() !== "all" ? draftAssignmentType.toLowerCase() : "all";
    const accountExecutiveParam = draftAccountExecutiveId !== "all" ? draftAccountExecutiveId : "all";
    const verificationStatusParam = draftVerificationStatus.toLowerCase() !== "all" ? draftVerificationStatus.toLowerCase() : "all";

    // Call API immediately with selected filters
    getallusers(
      1,                 // page
      searchTerm,        // search
      statusParam,       // status
      sortBy,
      sortOrder,
      statusParam,       // statusFilter
      false,             // isSorting
      draftStartDate,    // date_from
      draftEndDate,      // date_to
      assignmentTypeParam,
      draftCountry || "",
      accountExecutiveParam,
      verificationStatusParam,
      draftState,
      draftCity,
        draftSubscriptionStatus,
  draftTrialStartDate,
  draftTrialEndDate,
  draftSubscriptionStartDate,
  draftSubscriptionEndDate
    );

    setSubscriptionStatusFilter(draftSubscriptionStatus);
setTrialStartDate(draftTrialStartDate);
setTrialEndDate(draftTrialEndDate);
setSubscriptionStartDate(draftSubscriptionStartDate);
setSubscriptionEndDate(draftSubscriptionEndDate);
    // Update active states for modal inputs
    setStatusFilter(statusParam);
    setDateFrom(draftStartDate);
    setDateTo(draftEndDate);
    setAssignmentType(assignmentTypeParam);
    setCountryFilter(draftCountry || "");
    setAccountExecutiveFilter(accountExecutiveParam);
    setVerificationStatusFilter(verificationStatusParam);
    setStateFilter(draftState);
    setCityFilter(draftCity);
    setOpenModalFilter(false);
    setLoading(false);
      
  
    setIsCleared(false);  // ← ADD THIS LINE to reset the cleared flag
  
  };



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





  // Effect for handling search and pagination changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getallusers(
        currentPage,
        searchTerm,
        statusFilter,
        sortBy,
        sortOrder,
        statusFilter,
        false, // Not sorting when triggered by search/pagination
        dateFrom,
        dateTo,
        assignmentType,
        countryFilter?.name || "",
        accountExecutiveFilter,
        verificationStatusFilter,
        stateFilter,
        cityFilter,
         subscriptionStatusFilter,
    trialStartDate,
    trialEndDate,
    subscriptionStartDate,
    subscriptionEndDate
      );
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, currentPage, statusFilter, dateFrom, dateTo, assignmentType, countryFilter, accountExecutiveFilter, verificationStatusFilter, stateFilter, cityFilter,
     subscriptionStatusFilter,
  trialStartDate,
  trialEndDate,
  subscriptionStartDate,
  subscriptionEndDate,
  ]); // Add assignmentType to dependencies


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
      setInitialLoader(false);
    }
  };
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

  // const [countries, setCountries] = useState([]);
  const countries = Country.getAllCountries();

  const [selectedItem, setSelectedItem] = useState(null);
  const [statusToChange, setStatusToChange] = useState(null);

  const [openModalStatusChange, setOpenModalStatusChange] = useState(false);
  const handleOpenModalStatusChange = (item, newStatus) => {
    setOpenModalStatusChange(true);
    setSelectedItem(item.id);
    setStatusToChange(newStatus);
  };

  const confirmStatusChange = () => {
    if (!selectedItem || !statusToChange) return;

    setLoading(true);

    const InsertAPIURL = `${url}company-admins/status`;

    const Data = {
      company_admin_ids: [selectedItem],
      status: statusToChange.toLowerCase(),
    };

    setTimeout(() => {
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

          if (res.error) {
            // ❌ ERROR message based on selected language
            showToast(toast.error, res, t("statusChange_error"));
          } else {
            // ✅ SUCCESS message based on selected language
            showToast(toast.success, res, t("statusChange_success"));

            // Close modal + refresh list
            setStatusToChange(null);
            setOpenModalStatusChange(false);
            getallusers();
          }
        })
        .catch((error) => {
          setLoading(false);

          const msg = error.response?.data
            ? getApiMessage(error.response.data, t("statusChange_error"))
            : (error.message || t("statusChange_error"));

          toast.error(msg);
        });
    }, 1000);
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



  const confirmVerificationStatusChange = () => {
    if (selectedVerificationItem && verificationStatusToChange) {
      setLoading(true);

      setTimeout(() => {
        var InsertAPIURL = `${url}company-admins/status`;

        var Data = {
          company_admin_ids: [selectedVerificationItem],
          verification_status: verificationStatusToChange.trim().toLowerCase(), // important!
        };

        fetch(InsertAPIURL, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(Data),
        })
          .then((res) => res.json())
          .then((response) => {
            setLoading(false);
            if (response.error) {
              showToast(
                toast.error,
                response,
                t("verificationStatus_error")
              );
            } else {
              showToast(
                toast.success,
                response,
                t("verificationStatus_success")
              );
              setOpenModalVerificationStatusChange(false);
              setVerificationStatusToChange(null);
              getallusers();
            }
          })
          .catch((error) => {
            setLoading(false);

            const msg = error.response?.data
              ? getApiMessage(error.response.data, t("verificationStatus_error"))
              : (error.message || t("verificationStatus_error"));

            toast.error(msg);
          });
      }, 1000);
    }
  };

  ////////////
  const [bulkLoading, setBulkLoading] = useState(null); // can be: "active", "inactive", "blocked", "verified", or null

  const handleBulkStatusChange = (status) => {
    // toast.success("Status updated successfully");

    setBulkLoading(status); // mark which button is clicked
    setTimeout(() => {
      var InsertAPIURL = `${url}company-admins/status`;

      var Data = {
        company_admin_ids: selectedRows,
        status: status,
      };

      fetch(InsertAPIURL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // ✅ Required
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(Data),
      })
        .then((response) => response.json())
        .then((response) => {
          setBulkLoading(null);
          if (response.error) {
            showToast(
              toast.error,
              response,
              t("bulkStatus_error")
            );
          } else {
            showToast(
              toast.success,
              response,
              t("bulkStatus_success")
            ); setStatusToChange(null);
            setOpenModalStatusChange(false);

            getallusers();
          }
        })
        .catch((error) => {
          setBulkLoading(null);

          const msg = error.response?.data
            ? getApiMessage(error.response.data, t("bulkStatus_error"))
            : (error.message || t("bulkStatus_error"));

          toast.error(msg);
        });
    }, 1000);
  };

  const handleBulkVerificationStatusChange = (verification_status) => {
    // toast.success("Verification status updated successfully");

    setBulkLoading("verified");
    setTimeout(() => {
      var InsertAPIURL = `${url}company-admins/status`;

      var Data = {
        company_admin_ids: selectedRows,
        verification_status: "verified",
      };

      fetch(InsertAPIURL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // ✅ Required
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(Data),
      })
        .then((response) => response.json())
        .then((response) => {
          setBulkLoading(null);
          if (response.error) {
            showToast(
              toast.error,
              response,
              t("bulkVerificationStatus_error")
            );
          } else {
            showToast(
              toast.success,
              response,
              t("bulkVerificationStatus_success")
            );
            setOpenModalVerificationStatusChange(false);
            setVerificationStatusToChange(null);
            getallusers();
          }
        })
        .catch((error) => {
          setBulkLoading(null);

          const msg = error.response?.data
            ? getApiMessage(error.response.data, t("bulkVerificationStatus_error"))
            : (error.message || t("bulkVerificationStatus_error"));

          toast.error(msg);
        });
    }, 1000);
  };

  // Effect for handling sort changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getallusers(
        1, // Reset to page 1 when sorting
        searchTerm,
        statusFilter,
        sortBy,
        sortOrder,
        statusFilter,
        isSortingRef.current,
        dateFrom,
        dateTo,
        assignmentType
      );

      isSortingRef.current = false; // Reset the flag after fetch
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [sortBy, sortOrder]);

  useEffect(() => {
    if (selectedRows.length !== allusers.length) {
      setSelectAll(false);
    }
  }, [selectedRows]);

  useEffect(() => {
    // getCountries();
    getallusers();
    getAllExecutives();
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


  const fetchAllCompanyAdminsForExport = async () => {
    const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
    const sortParams = sortBy ? `&sort_by=${sortBy}&sort_order=${sortOrder}` : "";
    const searchParam = searchTerm ? `&search=${searchTerm}` : "";
    const dateFromParam = dateFrom ? `&start_date=${dateFrom}` : "";
    const dateToParam = dateTo ? `&end_date=${dateTo}` : "";
    const assignmentTypeParam = assignmentType !== "all" ? `&assignment_type=${assignmentType}` : "";


    const apiUrl = `${url}company-admins?no_pagination=true${statusParam}${sortParams}${searchParam}${dateFromParam}${dateToParam}`;

    try {
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data?.data?.company_admins || [];
    } catch (err) {
      console.error("Export fetch failed", err);
      return [];
    }
  };






  const formatLabel = (key) =>
    key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  const [exportingAdmins, setExportingAdmins] = useState(false);
  const [exportingAdminFormat, setExportingAdminFormat] = useState(null);
  const formatDate = (value) => {
    if (!value) return t("N/A");

    const date = new Date(value);
    if (isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };
  const formatPlanName = (value) => {
    if (!value || typeof value !== "string") return t("N/A");

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const handleExportData = async (format) => {
    setExportingAdmins(true);
    setExportingAdminFormat(format);
    console.log("Export started for format:", format);

    try {
      const allData = await fetchAllCompanyAdminsForExport();
      console.log("Raw fetched data:", allData);

      if (!allData.length) {
        toast.error("No data available for export.");
        console.warn("No data returned from fetchAllCompanyAdminsForExport");
        return;
      }

      // Skip images, long fields, and internal IDs
      const skipColumns = [
        "profile_picture",
        "profile_picture_url",
        "company_logo",
        "company_logo_url",
        "id"
      ];
      console.log("Columns to skip:", skipColumns);

      // Flatten all fields: convert objects to string, skip unwanted columns
      const flattenedData = allData.map((item) => {
        const flatItem = {};

        Object.entries(item).forEach(([key, value]) => {
          if (skipColumns.includes(key)) return;

          const label = formatLabel(key);

          // ✅ DATE FIELDS
          if (
            key.toLowerCase().includes("date") ||
            key.toLowerCase().includes("created_at") ||
            key.toLowerCase().includes("registered") ||
            key.toLowerCase() === "dob"
          ) {
            flatItem[label] = formatDate(value);
            return;
          }

          // ✅ SUBSCRIPTION / PLAN NAMES
          if (
            key.toLowerCase().includes("plan") ||
            key.toLowerCase().includes("subscription")
          ) {
            flatItem[label] = formatPlanName(value);
            return;
          }

          // ✅ OBJECTS
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

      console.log("Flattened data ready for export:", flattenedData);

      if (format.toLowerCase() === "pdf") {
        await exportTable(flattenedData, "Company Admins", "pdf", { skipColumns: [] });
        console.log("PDF export successful");
      } else if (format.toLowerCase() === "excel") {
        await exportTable(flattenedData, "Company Admins", "xlsx", { skipColumns: [] });
        console.log("Excel export successful");
      } else {
        console.error("Unsupported export format:", format);
      }
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export. Please try again.");
    } finally {
      setExportingAdmins(false);
      setExportingAdminFormat(null);
    }
  };


  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
const [selectedMapAdminId, setSelectedMapAdminId] = useState(null);
const formatStatusLabel = (value) => {
  if (!value) return "";

  return value
    .toString()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
const [openAssignmentModal, setOpenAssignmentModal] = useState(false);


  return (
    <>
      <SidebarNew
        componentTitle="superAdmin"
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
              <CompanyAdminPins
                statusFilter={statusFilter}
                dateFrom={dateFrom}
                dateTo={dateTo}
                assignmentType={assignmentType}
                country={countryFilter}
                search={searchTerm}
                resetKey={pinsResetKey}
                accountExecutiveFilter={accountExecutiveFilter}
                verificationStatusFilter={verificationStatusFilter}
                stateFilter={stateFilter}
                cityFilter={cityFilter}
                 subscriptionStatusFilter={subscriptionStatusFilter}
  trialStartDate={trialStartDate}
  trialEndDate={trialEndDate}
  subscriptionStartDate={subscriptionStartDate}
  subscriptionEndDate={subscriptionEndDate}
              selectedMapAdminId={selectedMapAdminId}
  onClearSelection={() => setSelectedMapAdminId(null)}
/>

            </Box>
            <Grid container spacing={0} sx={{ pl: 2, pr: 2 }} pt={0}>
              <Grid xs={12} md={12} align="">
                <Box
                  sx={{
                    backgroundColor: "white",
                    border: "2px solid rgba(9, 30, 66, 0.14)",
                    borderRadius: "12px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", lg: "row" },
                      gap: { xs: 2, lg: 0 },
                      p: 2,
                      pb: 1,
                      alignItems: { xs: "stretch", lg: "center" },
                    }}
                  >
                    {/* Title */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        height: "35px",
                        width: { xs: "100%", lg: "auto" },
                        flex: { lg: "0 0 25%" },
                        minWidth: { lg: "200px" },
                      }}
                    >
                      <TypographyMD
                        variant="paragraph"
                        label={t("Manage Company Admins")}
                        color="#003149"
                        fontFamily="Poppins, sans-serif"
                        fontSize={{ xs: "16px", lg: "18px" }}
                        fontWeight={600}
                      />
                      {sortingLoader && (
                        <CircularProgress
                          size={14}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>

                    {/* Search */}
                    <Box
                      sx={{
                        width: { xs: "100%", lg: "auto" },
                        flex: { lg: "0 0 30%" },
                        minWidth: { lg: "250px" },
                      }}
                    >
                      <OutlinedInput
                        autoComplete="off"
                        placeholder={t("Search companies...")}
                        sx={{
                          ...fieldCommonSx,
                          width: "100%",
                          "& fieldset": { border: "none" },
                        }}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton edge="end" size="small">
                              <Search
                                sx={{ fontSize: "16px", color: "#222" }}
                              />
                            </IconButton>
                          </InputAdornment>
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </Box>

                    {/* Actions */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", lg: "row" },
                        justifyContent: {
                          xs: "flex-start",
                          lg: "flex-end",
                        },
                        alignItems: { xs: "stretch", lg: "center" },
                        gap: { xs: 1.2, lg: 1 },
                        width: { xs: "100%", lg: "auto" },
                        flex: { lg: "0 0 45%" },
                        minWidth: { lg: "600px" },
                      }}
                    >
                      {selectedRows.length > 0 ? (
                        <>
                          {/* Bulk Action Buttons */}
                          <Button
                            onClick={() => handleBulkStatusChange("active")}
                            disabled={bulkLoading === "active"}
                            startIcon={bulkLoading === "active" ? <CircularProgress size={16} /> : <CheckCircleOutline />}
                            sx={{
                              height: "35px",
                              px: 2,
                              width: { xs: "100%", lg: "auto" },
                              backgroundColor: "#4BCE97",
                              color: "#fff",
                              borderRadius: "6px",
                              boxShadow: "none",
                              fontFamily: "Poppins, sans-serif",
                              fontSize: "13px",
                              textTransform: "capitalize",
                              "&:hover": { backgroundColor: "#3db87f" },
                            }}
                          >
                            {t("Active")}
                          </Button>

                          <Button
                            onClick={() => handleBulkStatusChange("inactive")}
                            disabled={bulkLoading === "inactive"}
                            startIcon={bulkLoading === "inactive" ? <CircularProgress size={16} /> : <Block />}
                            sx={{
                              height: "35px",
                              px: 2,
                              width: { xs: "100%", lg: "auto" },
                              backgroundColor: "#F87168",
                              color: "#fff",
                              borderRadius: "6px",
                              boxShadow: "none",
                              fontFamily: "Poppins, sans-serif",
                              fontSize: "13px",
                              textTransform: "capitalize",
                              "&:hover": { backgroundColor: "#e65850" },
                            }}
                          >
                            {t("Inactive")}
                          </Button>

                          <Button
                            onClick={() => handleBulkVerificationStatusChange("verified")}
                            disabled={bulkLoading === "verified"}
                            startIcon={bulkLoading === "verified" ? <CircularProgress size={16} /> : <CheckCircleOutline />}
                            sx={{
                              height: "35px",
                              px: 2,
                              width: { xs: "100%", lg: "auto" },
                              backgroundColor: "#579DFF",
                              color: "#fff",
                              borderRadius: "6px",
                              boxShadow: "none",
                              fontFamily: "Poppins, sans-serif",
                              fontSize: "13px",
                              textTransform: "capitalize",
                              "&:hover": { backgroundColor: "#4589e8" },
                            }}
                          >
                            {t("Verify")}
                          </Button>
                        </>
                      ) : (
                        <>
                          {/* Filter button */}
                          <Box sx={{ position: "relative", display: "inline-flex" }}>
                            <IconButton
                              onClick={() => {
                                setDraftStatus(statusFilter);
                                setDraftStartDate(dateFrom);
                                setDraftEndDate(dateTo);
                                setOpenModalFilter(true);
                              }}
                              sx={{
                                border: "1px solid #E0E0E0",
                                borderRadius: "8px",
                                bgcolor: isFilterActive() && !isCleared ? "#1976d2" : "#fff",
                                color: isFilterActive() && !isCleared ? "#fff" : "#44546F",
                                transition: "background-color 0.2s, color 0.2s",
                              }}
                            >
                              <FilterList />
                            </IconButton>

                            {isFilterActive() && !isCleared && (
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
                          <ExportMenuButton
                            onExport={handleExportData}
                            exporting={exportingAdmins}
                            exportingFormat={exportingAdminFormat}
                            options={[
                              { label: "PDF", icon: pdfIcon },
                              { label: "Excel", icon: csvIcon },
                            ]}
                            sx={{
                              ...fieldCommonSx,
                              px: 2,
                              textTransform: "capitalize",
                              width: { xs: "100%", lg: "auto" },
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
                          {/* 
                          <ExportMenuButton
                            onExport={handleExportData}
                            icon={
                              exportingAdmins ? (
                                <CircularProgress size={15} />
                              ) : (
                                <img src={exportIcon} alt="Export" style={{ width: 20 }} />
                              )
                            }
                            options={[
                              { label: "PDF", icon: pdfIcon },
                              { label: "Excel", icon: csvIcon },
                            ]}
                            disabled={exportingAdmins}
                            sx={{
                              ...fieldCommonSx,
                              px: 2,
                              textTransform: "capitalize",
                              width: { xs: "100%", lg: "auto" },
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
                          <Button
                            onClick={() => setOpenModalAdd(true)}
                            variant="contained"
                            startIcon={
                              <img src={addIcon} alt="" style={{ width: 14 }} />
                            }
                            sx={{
                              height: "35px",
                              px: 2.5,
                              width: { xs: "100%", lg: "auto" },
                              backgroundColor: "#006EC2",
                              borderRadius: "6px",
                              boxShadow: "none",
                              fontFamily: "Poppins, sans-serif",
                              fontSize: "14px",
                              textTransform: "capitalize",
                              whiteSpace: "nowrap",
                              "&:hover": { backgroundColor: "#0059a8" },
                            }}
                          >
                            {t("Add")}
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>

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
                    <Box
                      sx={{
                        width: {
                          xs: "100%",
                          md: "78vw",
                        },
                      }}
                    >
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
                            label={t("No Company Admins Found!")}
                            color="#A5ADB0"
                            fontFamily="Roboto"
                            fontSize="15px"
                            fontWeight={450}
                            align="center"
                          />
                        </Box>
                      ) : (
                        <>
                          <TableContainer
                            sx={{
                              // borderRadius: { xs: "5px", md: "50px" },
                              boxShadow: "none",
                              overflowX: "auto",

                              pt: 1,
                            }}
                          >
                            <Table
                              sx={{
                                minWidth: { xs: "100px", md: "250px" },
                                "& .MuiTableCell-root": {
                                  // padding: "5px",
                                  whiteSpace: "nowrap", // Prevent wrapping
                                },
                                "& .MuiTableRow-root": {
                                  height: "25px",
                                },
                                whiteSpace: "nowrap !important",
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
                                      sx={{ color: "rgba(9, 30, 66, 0.14)" }}
                                      checked={selectAll}
                                      indeterminate={false}
                                      onChange={(e) =>
                                        handleCheckboxChange(e, "selectAll")
                                      }
                                    />
                                  </TableCell>
                                  {/* Company Name */}
                                  <TableCell
                                    onClick={() => handleSort("company_name")}
                                    align="center"
                                    sx={{
                                      cursor: "pointer",
                                      fontWeight: "bold",
                                      color: "#44546F",
                                      fontFamily: "Poppins, sans-serif",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {t("Company Name")}
                                    <SortIcons
                                      column="company_name"
                                      sortBy={sortBy}
                                      sortOrder={sortOrder}
                                    />
                                  </TableCell>

                                  {/* Admin Name */}
                                  <TableCell
                                    onClick={() => handleSort("full_name")}
                                    align="center"
                                    sx={{
                                      cursor: "pointer",
                                      fontWeight: "bold",
                                      color: "#44546F",
                                      fontFamily: "Poppins, sans-serif",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {t("Admin Name")}
                                    <SortIcons
                                      column="full_name"
                                      sortBy={sortBy}
                                      sortOrder={sortOrder}
                                    />
                                  </TableCell>


                                  {/* Admin Email */}
                                  <TableCell
                                    onClick={() => handleSort("email")}
                                    align="center"
                                    sx={{
                                      cursor: "pointer",
                                      fontWeight: "bold",
                                      color: "#44546F",
                                      fontFamily: "Poppins, sans-serif",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {t("Admin Email")}
                                    <SortIcons
                                      column="email"
                                      sortBy={sortBy}
                                      sortOrder={sortOrder}
                                    />
                                  </TableCell>





                                  <TableCell
                                    onClick={() => handleSort("account_executive_name")}
                                    align="center"
                                    sx={{
                                      cursor: "pointer",
                                      fontWeight: "bold",
                                      color: "#44546F",
                                      fontFamily: "Poppins, sans-serif",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {t("Account Executive Name")}
                                    <SortIcons
                                      column="account_executive_name"
                                      sortBy={sortBy}
                                      sortOrder={sortOrder}
                                    />
                                  </TableCell>

                                  <TableCell
                                    onClick={() => handleSort("account_executive_email")}
                                    align="center"
                                    sx={{
                                      cursor: "pointer",
                                      fontWeight: "bold",
                                      color: "#44546F",
                                      fontFamily: "Poppins, sans-serif",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {t("Account Executive Email")}
                                    <SortIcons
                                      column="account_executive_email"
                                      sortBy={sortBy}
                                      sortOrder={sortOrder}
                                    />
                                  </TableCell>



                                  {/* Country */}
                                  <TableCell
                                    onClick={() => handleSort("country")}
                                    align="center"
                                    sx={{
                                      cursor: "pointer",
                                      fontWeight: "bold",
                                      color: "#44546F",
                                      fontFamily: "Poppins, sans-serif",
                                      fontSize: "14px",
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
  onClick={() => handleSort("max_users")}
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
  {t("Max Users")}
                                  <SortIcons
                                      column="max_users"
                                      sortBy={sortBy}
                                      sortOrder={sortOrder}
                                    />
</TableCell>

<TableCell
  onClick={() => handleSort("active_users")}
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
  {t("Active Users")}
    <SortIcons
            column="active_users"
           sortBy={sortBy}
              sortOrder={sortOrder}
           />
</TableCell>
<TableCell
  align="center"
  onClick={() => handleSort("subscription_status")}
  sx={{
    cursor: "pointer",
    fontWeight: "bold",
    color: "#44546F",
    fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
    whiteSpace: "nowrap",
  }}
>
  {t("Subscription Status")}
  <SortIcons
    column="subscription_status"
    sortBy={sortBy}
    sortOrder={sortOrder}
  />
</TableCell>


                                  {/* Account Status */}
                                  <TableCell
                                    onClick={() => handleSort("status")}
                                    align="center"
                                    sx={{
                                      cursor: "pointer",
                                      fontWeight: "bold",
                                      color: "#44546F",
                                      fontFamily: "Poppins, sans-serif",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {t("Account Status")}
                                    <SortIcons
                                      column="status"
                                      sortBy={sortBy}
                                      sortOrder={sortOrder}
                                    />
                                  </TableCell>

                                  {/* Verification Status */}
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
                                    }}
                                  >
                                    {t("Verification Status")}
                                    <SortIcons
                                      column="verification_status"
                                      sortBy={sortBy}
                                      sortOrder={sortOrder}
                                    />
                                  </TableCell>

                                  {/* Registered */}
                                  <TableCell
                                    onClick={() => handleSort("registered")}
                                    align="center"
                                    sx={{
                                      cursor: "pointer",
                                      fontWeight: "bold",
                                      color: "#44546F",
                                      fontFamily: "Poppins, sans-serif",
                                      fontSize: "14px",
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
  onClick={() => handleSort("subscription_start_date")}
  align="center"
  sx={{
       cursor: "pointer",
    fontWeight: "bold",
    color: "#44546F",
    fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
  }}
>
  {t("Subscription Period")}
   <SortIcons
                                      column="subscription_start_date"
                                      sortBy={sortBy}
                                      sortOrder={sortOrder}
                                    />
</TableCell>

<TableCell
  onClick={() => handleSort("trial_start_date")}
  align="center"
  sx={{
       cursor: "pointer",
    fontWeight: "bold",
    color: "#44546F",
    fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
  }}
>
  {t("Trial Period")}
   <SortIcons
                                      column="trial_start_date"
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
                                    {t("Action")}
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {allusers.map((item) => (
                               <TableRow
  hover
  onClick={() => setSelectedMapAdminId(item.id)}
  sx={{ 
    cursor: 'pointer',
    // backgroundColor: selectedMapAdminId === item.id ? '#e3f2fd' : 'inherit',
    '&:hover': {
      // backgroundColor: selectedMapAdminId === item.id ? '#e3f2fd' : '#f5f5f5'
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
                                        checked={selectedRows.includes(
                                          item.id
                                        )}
                                        onChange={(e) =>
                                          handleCheckboxChange(e, item.id)
                                        }
                                      />
                                    </TableCell>

                                    {/* <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                                                                        {item.id}
                                                                    </TableCell> */}
                                    <TableCell
                                      align="center"
                                      sx={{
                                        fontWeight: 400,
                                        color: "#172B4D",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                        maxWidth: "200px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
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
                                        maxWidth: "150px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
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
                                        maxWidth: "150px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
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
                                        maxWidth: "150px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
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
                                        maxWidth: "150px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {displayValue(item.account_executive_email)}
                                    </TableCell>



                                    <TableCell
                                      align="center"
                                      sx={{
                                        fontWeight: 400,
                                        color: "#172B4D",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                        maxWidth: "150px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {displayValue(item.country)}
                                    </TableCell>
                                     <TableCell
  align="center"
  sx={{
    fontWeight: 400,
    color: "#172B4D",
    fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
    whiteSpace: "nowrap",
  }}
>
  {item.max_employees ?? t("N/A")}
</TableCell>

<TableCell
  align="center"
  sx={{
    fontWeight: 400,
    color: "#172B4D",
    fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
    whiteSpace: "nowrap",
  }}
>
  {Number(item.current_employees || 0)}
</TableCell>
<TableCell
  align="center"
  sx={{
    fontWeight: 400,
    color: "#172B4D",
    fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  }}
>
   {item.subscription_status
    ? formatStatusLabel(item.subscription_status)
    : t("N/A")}
</TableCell>


                                    <TableCell
                                      align="center"
                                      sx={{
                                        fontWeight: 400,
                                        color: "#172B4D",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                        maxWidth: "150px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
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
                                        

                                      <DummyStatusMenuButton
  status={item.status}
  statusOptions={[
    {
      value: "active",
      label: t("Active"),
      color: "#4BCE97",
      icon: <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} />,
    },
    {
      value: "inactive",
      label: t("Inactive"),
      color: "#DFE1E6",
      icon: <Block fontSize="17px" sx={{ mr: 1 }} />,
    },
    {
      value: "invited",
      label: t("Invited"),
      color: "#579DFF",
      icon: <Email fontSize="17px" sx={{ mr: 1 }} />,
    },
    {
      value: "requested",
      label: t("Requested"),
      color: "#7E57C2",
      icon: <CloudSync fontSize="17px" sx={{ mr: 1 }} />,
    },
  ]}
  onChange={(newStatus) =>
    handleOpenModalStatusChange(item, newStatus)
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
                                        maxWidth: "150px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
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
                                          anchorEl={
                                            anchorElVerificationStatus
                                          }
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
                                        maxWidth: "200px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
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
    whiteSpace: "nowrap",
  }}
>
  {formatDateRange(
    item.subscription_start_date,
    item.subscription_end_date
  )}
</TableCell>

<TableCell
  align="center"
  sx={{
    fontWeight: 400,
    color: "#172B4D",
    fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
    whiteSpace: "nowrap",
  }}
>
  {formatDateRange(
    item.trial_start_date,
    item.trial_end_date
  )}
</TableCell>
                                    <TableCell
                                      align="center"
                                      sx={{
                                        fontWeight: 400,
                                        color: "#172B4D",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                        // maxWidth: "150px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
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
                                        <Tooltip title={t("actions.view")}>
                                          <Visibility
                                            sx={{
                                              cursor: "pointer",
                                              color: "#579DFF",
                                            }}
                                            onClick={() => {
                                              navigate(
                                                `/company-admin-details?id=${item?.id}&name=${item?.full_name}`,
                                                {
                                                  state: {
                                                    from: "/company-admin",
                                                  },
                                                }
                                              );
                                            }}
                                          />
                                        </Tooltip>
                                        <Tooltip title={t("assign")}>
  <PersonOutlineIcon
    sx={{
      cursor: "pointer",
      color: "#579DFF",
      ml: 1,
      fontSize: "22px",
    }}
    onClick={() => {
      setSelectedItem(item);
      setOpenAssignmentModal(true);
    }}
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
      navigate(`/messages?userId=${item?.id}&role=company_admin`, {
        state: { companyAdmin: item },
      })
    }
  />
</Tooltip>
                                        <Tooltip title={t("edit") || "Edit"}>
                                          <Edit
                                            sx={{
                                              cursor: "pointer",
                                              color: "#2196F3",
                                            }}
                                            onClick={() => {
                                              setSelectedRowData(item);
                                              setOpenModalEdit(true);
                                            }}
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
                                              console.log("All item keys:", Object.keys(item || {}));
                                              console.log("company_id:", item?.id);
                                              console.log("id:", item?.id);



                                              handleOpenDeleteModal(item?.id, item?.full_name);
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
                            ></div>
                          </TableContainer>
                          <Box mt={2} display="flex" justifyContent="center">
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
                          </Box>
                        </>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

          </Box>
        }
      />

      <AddCompanyAdmin
        open={openModalAdd}
        onClose={() => setOpenModalAdd(false)}
        onSuccess={() => {
          getallusers(
            1,
            searchTerm || "",
            statusFilter || "all",
            "created_at",
            "DSC"
          );
          setOpenModalAdd(false);
        }}
        accountExecutives={accountExecutives}
        getZonesByExecutive={getZonesByExecutive}
      />

      <ModalConfirmation
        open={openModalStatusChange}
        onClose={() => setOpenModalStatusChange(false)}
        title={t("statusChangeModal.title")}
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
                      label={
                        t(
                          statusToChange === "active"
                            ? "statusChangeModal.confirmActive"
                            : statusToChange === "inactive"
                              ? "statusChangeModal.confirmInactive"
                              : statusToChange === "invited"
                                ? "statusChangeModal.confirmInvited"
                                : statusToChange === "requested"
                                  ? "statusChangeModal.confirmRequested"
                                  : "statusChangeModal.confirmDefault"
                        )
                      }
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
                      title={t("statusChangeModal.cancel")}
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
                        t(
                          statusToChange === "active"
                            ? "statusChangeModal.buttonActive"
                            : statusToChange === "inactive"
                              ? "statusChangeModal.buttonInactive"
                              : statusToChange === "invited"
                                ? "statusChangeModal.buttonInvited"
                                : "statusChangeModal.buttonRequested"
                        )
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
            // style={{ backgroundColor: "#fff", margin: 13 }}
            style={{
              backgroundColor: "#fff",
              margin: 0,
              height: "100vh",
              display: "flex",
              flexDirection: "column",

            }}
            onSubmit={handleFilterSubmit}
          >
            <Box

              sx={{
                flex: 1,
                overflowY: "auto",
                px: 2,
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
                        {["All", "Active", "Inactive", "Invited",  "Requested"].sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b)).map((status) => (
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
                        label={t("Assignment Type")}
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
                        {["All", "Unassigned"].map((type) => (
                          <Box
                            key={type}
                            onClick={() => setDraftAssignmentType(type.toLowerCase())}
                            sx={{
                              display: "flex",
                              padding: { xs: "6px 10px", sm: "5px 11px", md: "4px 12px" },
                              borderRadius: "5px",
                              border: `2px solid ${draftAssignmentType === type.toLowerCase() ? "#006EC2" : "#ccc"
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
                              label={t(type)}
                              color={
                                draftAssignmentType === type.toLowerCase() ? "#006EC2" : "#363333"
                              }
                              fontFamily="Roboto"
                              fontSize={{ xs: "11px", sm: "12px", md: "12px" }}
                              fontWeight={500}
                              align="center"
                            />
                          </Box>
                        ))}
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
                        {/* {["All", "Verified", "Unverified"].sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b)).map((status) => ( */}
                       {["All", "Pending", "Verified", "Rejected"].sort((a, b) => a === "All" ? -1 : b === "All" ? 1 : a.localeCompare(b)).map((status) => (  
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
  label={t("Subscription Status")}
  fontSize="15px"
  fontWeight={750}
/>

<Box mt={1} mb={2}>
  <Select
    value={draftSubscriptionStatus}
    onChange={(e) => setDraftSubscriptionStatus(e.target.value)}
    sx={fieldCommonSx}
    fullWidth
  >
    <MenuItem value="all">{t("Select Subscription Status")}</MenuItem>
    {[
      "trial",
      "active_paid",
      "active",
      "free",
      "expired",
      "payment_overdue",
      "inactive",
    ].map((s) => (
      <MenuItem key={s} value={s}>
        {formatStatusLabel(s)}
      </MenuItem>
    ))}
  </Select>
</Box>


                      {/* --- Account Executive --- */}
                      <TypographyMD
                        variant="paragraph"
                        label={t("Account Executive")}
                        color="#000000"
                        fontFamily="Roboto"
                        fontSize="15px"
                        fontWeight={750}
                        align="left"
                      />

                      {/* <Box mt={1} mb={2}>
                        <Select
                          value={draftAccountExecutiveId}
                          onChange={(e) => setDraftAccountExecutiveId(e.target.value)}
                          sx={fieldCommonSx}
                          fullWidth
                        >
                          <MenuItem value="all">{t("All")}</MenuItem>
                          <MenuItem value="na">{t("N/A")} (No Account Executive)</MenuItem>
                          {accountExecutives
                            ?.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""))
                            .map((exec) => (
                              <MenuItem key={exec.id} value={exec.id}>
                                {exec.full_name}
                              </MenuItem>
                            ))}
                        </Select>
                      </Box> */}


                      <Box mt={1} mb={2}>
                        <SearchableDropdown
                          value={draftAccountExecutiveId}
                          onChange={(val) => setDraftAccountExecutiveId(val)}
                          options={[
                            { id: "all", name: t("All") },
                            { id: "na", name: `${t("N/A")} (No Account Executive)` },
                            ...(accountExecutives
                              ?.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""))
                              .map((exec) => ({ id: exec.id, name: `${exec.full_name} (${exec.email})` })) || []),
                          ]}
                          placeholder={t("Select Account Executive")}
                        />

                      </Box>


                      {/* --- Date Range --- */}
                      <TypographyMD
                        variant="paragraph"
                        label={t("Registered On")}
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

                                  // allow only 4 digits in year
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

                                  // allow only 4 digits in year
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
                        label={t("Trial Period")}
                        color="#000000"
                        fontFamily="Roboto"
                        fontSize="15px"
                        fontWeight={750}
                        align="left"
                      />

<Box display="flex" justifyContent={"space-between"} gap={2} mt={1} mb={2} sx={{width:"100%"}}>
  <input
    type="date"
    value={draftTrialStartDate}
    onChange={(e) => setDraftTrialStartDate(e.target.value)}
  
    style={{ ...fieldCommonSx, flex: 1,
        padding: "0 8px",
     }} 
  />
  <input
    type="date"
    value={draftTrialEndDate}
    onChange={(e) => setDraftTrialEndDate(e.target.value)}
    style={{ ...fieldCommonSx ,flex: 1,
        padding: "0 8px",
    }}
  />
</Box>



  <TypographyMD
                        variant="paragraph"
                        label={t("Subscription Period")}
                        color="#000000"
                        fontFamily="Roboto"
                        fontSize="15px"
                        fontWeight={750}
                        align="left"
                      />

<Box display="flex" justifyContent={"space-between"} gap={2} mt={1} mb={2} sx={{width:"100%"}}>
  <input
    type="date"
    value={draftSubscriptionStartDate}
    onChange={(e) => setDraftSubscriptionStartDate(e.target.value)}
    style={{ ...fieldCommonSx ,flex:1,  padding: "0 8px",}}
  />
  <input
    type="date"
    value={draftSubscriptionEndDate}
    onChange={(e) => setDraftSubscriptionEndDate(e.target.value)}
    style={{ ...fieldCommonSx,flex:1, padding: "0 8px", }}
  />
</Box>

                      {/* <TypographyMD
  variant="paragraph"
  label={t("Country")}
  color="#000000"
  fontFamily="Roboto"
  fontSize="15px"
  fontWeight={750}
  align="left"
/>

<Box
  mt={1}
  mb={2}
  sx={{
    position: "relative",
    zIndex: 3000,   // higher than modal content
  }}
>
  <CountrySelect
    value={draftCountry}
    onChange={(val) => setDraftCountry(val)}
    placeHolder={t("Select Country")}
  />
</Box> */}
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
                        <SearchableDropdown
                          value={draftCountry}
                          options={countryOptions}
                          onChange={(val) => setDraftCountry(val)}
                          placeholder={t("Select Country")}
                        />
                      </Box>


                      {/* --- State --- */}
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
                          options={draftCountry && Country.getAllCountries().find(c => c.name === draftCountry)?.isoCode
                            ? require('country-state-city').State.getStatesOfCountry(Country.getAllCountries().find(c => c.name === draftCountry).isoCode).map(s => s.name)
                            : []}
                          onChange={(name) => {
                            const countryObj = Country.getAllCountries().find(c => c.name === draftCountry);
                            if (countryObj?.isoCode) {
                              const states = require('country-state-city').State.getStatesOfCountry(countryObj.isoCode);
                              const stateObj = states.find(s => s.name === name);
                              setDraftState(stateObj || name);
                              setDraftCity("");
                            }
                          }}
                          placeholder={t("Select State")}
                          disabled={!draftCountry}
                        />
                      </Box>

                      {/* --- City --- */}
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
                          options={(() => {
                            const countryObj = Country.getAllCountries().find(c => c.name === draftCountry);
                            const stateObj = countryObj && draftState && require('country-state-city').State.getStatesOfCountry(countryObj.isoCode).find(s => s.name === (draftState?.name || draftState));
                            return countryObj && stateObj
                              ? require('country-state-city').City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode).map(c => c.name)
                              : [];
                          })()}
                          onChange={(name) => {
                            const countryObj = Country.getAllCountries().find(c => c.name === draftCountry);
                            const stateObj = countryObj && draftState && require('country-state-city').State.getStatesOfCountry(countryObj.isoCode).find(s => s.name === (draftState?.name || draftState));
                            if (countryObj && stateObj) {
                              const cities = require('country-state-city').City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode);
                              const cityObj = cities.find(c => c.name === name);
                              setDraftCity(cityObj || name);
                            }
                          }}
                          placeholder={t("Select City")}
                          disabled={!draftState}
                        />
                      </Box>

                      <Box
                        sx={{
                          // position: "sticky",
                          // bottom: 0,
                          backgroundColor: "#fff",
                          py: 2,
                          px: 1,
                          // mt: { xs: 0, md: -5 },
                          mt: 2,
                          // zIndex: 1,
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
                    </Box>
                  </div>
                </Grid>
              </Grid>
            </Box>


          </form>
        }
      />



      {/* Delete Company Admin Modal */}
      <DeleteAccountExecutiveModal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteCompanyAdmin}
        loading={deleteLoading}
        name={selectedCompanyAdminName}
        message={t("confirmDeleteCompany")}
      />
 <AssignmentModal
  open={openAssignmentModal}
  data={selectedItem}
  onClose={() => {
    setOpenAssignmentModal(false);

    // ✅ CLEAR SELECTIONS
    setSelectedItem(null);
    setSelectedMapAdminId(null);
  }}
  onSuccess={() => {
    // ✅ refresh list
    getallusers();

    // ✅ CLEAR SELECTIONS (IMPORTANT)
    setSelectedItem(null);
    setSelectedMapAdminId(null);

    // ✅ close modal
    setOpenAssignmentModal(false);
  }}
/>

      <UpdateCompanyAdmin
        open={openModalEdit}
        onClose={() => {
          setOpenModalEdit(false);
          setSelectedRowData(null);
        }}
        onSuccess={() => {
          getallusers(
            currentPage,
            searchTerm || "",
            statusFilter || "all",
            sortBy,
            sortOrder
          );
          setOpenModalEdit(false);
          setSelectedRowData(null);
        }}
        selectedRowData={selectedRowData}
        accountExecutives={accountExecutives}
        getZonesByExecutive={getZonesByExecutive}
      />

    </>
  );
}

export default CompanyAdmin;
