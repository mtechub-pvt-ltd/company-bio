import React, { useEffect, useMemo, useRef, useState } from "react";
import SidebarNew from "../components/sidebar/SidebarNew";
import SearchableDropdown from "../components/SearchableCountryDropdown";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
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
} from "@mui/material";
import { exportTable } from "../helper_functions/ExportData";
import nodata from "../Assets/nodata.png";
import TypographyMD from "../components/items/Typography";
import exportIcon from "../Assets/export_icon.png";
import menu_icon from "../Assets/menu_icon.png";
import filter from "../Assets/filter.png";
import addIcon from "../Assets/add_icon.png";
import confirmation_icon from "../Assets/confirmation_icon.png";
import csvIcon from "../Assets/csvIcon.png";
import pdfIcon from "../Assets/pdfIcon.png";
import Topbar from "../components/topbar/Topbar";
import CommissionTresholdTable from "./CommissionThresholdTable";
import { Tabs, Tab } from "@mui/material";
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
  PendingOutlined,
  KeyboardArrowDown,
  ArrowUpward,
  ArrowDownward,
  Check,
  FilterList,
  Close as CloseIcon,
} from "@mui/icons-material";
import { FormControl } from "@mui/material";
import ModalAdd from "../components/items/Modal";
import ButtonMD from "../components/items/ButtonMD";
import ModalSuccess from "../components/items/ModalSuccess";
import url from "../url";
import { useFormik } from "formik";
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
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import Inputfield from "../components/items/Inputfield";
import SelectField from "../components/items/Selectfield";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Countryfield from "../components/items/Countryfield";
import { useTranslation } from "react-i18next";
import ExportMenuButton from "../components/ExportMenuButton";
import DummyStatusMenuButton from "../components/DummyStatusMenuButton";
import { useSelector } from "react-redux";
import FormatDate from "../components/FormatDate";
import StatusFilter from "../components/StatusFilter";
import ModalConfirmation from "../components/items/ModalConfirmation";
import CommissionAnalytics from "./CommissionAnalytics"
import {
  getCurrencySymbol,
  formatAmount,
} from "../helper_functions/CurrencyFormate";
import { format } from "date-fns";
import CommissionThresholdTable from "./CommissionThresholdTable";

const SortIcons = ({ column, sortBy, sortOrder }) => (
  <>
    {sortBy === column && sortOrder === "ASC" ? (
      <ArrowUpward sx={{ fontSize: "17px" }} />
    ) : (
      <ArrowDownward sx={{ fontSize: "17px" }} />
    )}
  </>
);

function CommissionManagement() {
  const fieldCommonSx = {
    height: "35px",
    borderRadius: "6px",
    border: "2px solid rgba(9, 30, 66, 0.14)",
    backgroundColor: "#fff",
    fontSize: { xs: "14px", md: "15px" },
    "&:hover": { borderColor: "#006EC2" },
    "&.Mui-focused": { borderColor: "#006EC2" },
    color: "rgba(27, 27, 27, 0.67)",
  };
  const { token } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  //my code for implementing empty icons
  const [noData, setNoData] = useState(false);
  //==

  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [commisionDetails, setCommisionDetails] = useState("");
  const [initialLoader, setInitialLoader] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [allCommisions, setAllCommisions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(7); // default 10 records per page
  const isSortingRef = useRef(false);
  const [sortingLoader, setSortingLoader] = useState(false);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
const startDateRef = useRef(null);
const endDateRef = useRef(null);
  // const statuses = [t("All"), t("Paid"), t("Unpaid")];
  const statuses = [
  { value: "all", label: t("All") },
  { value: "paid", label: t("Paid") },
  { value: "unpaid", label: t("Unpaid") },
];
const [activeTab, setActiveTab] = useState(0);
const formatLabel = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
const handleTabChange = (event, newValue) => {
  setActiveTab(newValue);
};
  const [activeStatus, setActiveStatus] = useState("all");
  const [draftStatus, setDraftStatus] = useState("all");

  const [draftExecId, setDraftExecId] = useState("all");

  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");

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

  // Check if any filters are active
  const isFilterActive = () => {
    return (
      activeStatus !== "all" ||
      selectedExecId !== "all" ||
      dateFrom !== "" ||
      dateTo !== ""
    );
  };

  // Clear all active filters
  const clearFilters = () => {
    setActiveStatus("all");
    setSelectedExecId("all");
    setDateFrom("");
    setDateTo("");
    setDraftStatus("all");
    setDraftExecId("all");
    setDraftStartDate("");
    setDraftEndDate("");

    // Reset to default state
    getAllCommisions(1, searchTerm, "all", sortBy, sortOrder, false, "all", "", "");
  };

 // --- Get all commissions ---
const getAllCommisions = async (
  page = 1,
  search = "",
  status = "all",
  sort_by = sortBy,
  sort_order = sortOrder,
  isSorting = false,
  exec_id = "all",
  date_from = "",
  date_to = ""
) => {
  if (isSorting) {
    setSortingLoader(true);
  } else {
    setInitialLoader(true);
  }

  try {
    const execIdParam = exec_id !== "all" ? `&exec_id=${exec_id}` : "";
    const statusParam = status !== "all" ? `&status=${status}` : "";
    const sortParams = sort_by ? `&sort_by=${sort_by}&sort_order=${sort_order}` : "";
    const dateFromParam = date_from ? `&date_from=${date_from}` : "";
    const dateToParam = date_to ? `&date_to=${date_to}` : "";

    const InsertAPIURL = `${url}payments/super-admin/commissions?page=${page}&limit=${limit}&search=${search}${sortParams}${statusParam}${execIdParam}${dateFromParam}${dateToParam}`;

   

    const response = await fetch(InsertAPIURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    const commissions = data?.data?.commissions || [];

    // Optional frontend filter if backend ignores date filtering
    let filteredData = commissions;
    if (date_from) {
      filteredData = filteredData.filter(
        (item) => new Date(item.date) >= new Date(date_from)
      );
    }
    if (date_to) {
      filteredData = filteredData.filter(
        (item) => new Date(item.date) <= new Date(date_to)
      );
    }

    setAllCommisions(filteredData);
    setTotalPages(data?.data?.pagination?.pages || 1);
    setNoData(filteredData.length === 0);

  } catch (error) {
    toast.error("Something went wrong! Please try again.");
    setAllCommisions([]);
    setTotalPages(1);
    setNoData(true);
  } finally {
    if (isSorting) setSortingLoader(false);
    else setInitialLoader(false);
  }
};

// --- Handle filter submit ---
const handleFilterSubmit = (e) => {
  e.preventDefault();
  setLoading(true);

  const statusParam = draftStatus.toLowerCase() !== "all" ? draftStatus.toLowerCase() : "all";
  const execParam = draftExecId || "all";

  // Call API immediately with selected filters
  getAllCommisions(
    1,                 // page
    searchTerm,        // search
    statusParam,       // status
    sortBy,
    sortOrder,
    false,             // isSorting
    execParam,         // exec_id
    draftStartDate,    // date_from
    draftEndDate       // date_to
  );

  // Update active states for modal inputs
  setActiveStatus(statusParam);
  setSelectedExecId(execParam);
  setDateFrom(draftStartDate);
  setDateTo(draftEndDate);

  setOpenModalFilter(false);
  setLoading(false);
};


  const [selectedExecId, setSelectedExecId] = useState("all");
  const [accountExecutives, setAccountExecutives] = useState([
    { value: "all", label: "All" },
  ]);
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
      let execs = data?.data?.account_executives || [];
      // Sort alphabetically by full_name
      execs = execs.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
      // Map to dropdown format
      execs = execs.map((exec) => ({
        value: exec.id,
        label: exec.full_name,
        email: exec.email,
      }));
      setAccountExecutives([
        { value: "all", label: "All", email: "" },
        { value: "na", label: "N/A", email: "" },
        ...execs,
      ]);
    } catch (error) {
      toast.error("Something went wrong! Please try again.");
    } finally {
      setInitialLoader(false);
    }
  };

  const handleSort = (column) => {
    const newSortOrder =
      sortBy === column && sortOrder === "ASC" ? "DESC" : "ASC";

    isSortingRef.current = true; // Mark sorting in progress

    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    getAllCommisions(value, searchTerm);
  };

  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleCheckboxChange = (event, target) => {
    const checked = event.target.checked;

    if (target === "selectAll") {
      setSelectAll(checked);
      if (checked) {
        // Select all on the current page
        const allIds = allCommisions.map((item) => item.commission_id);
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

  // filter
  const [openModalFilter, setOpenModalFilter] = useState(false);

  // delete
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const payCommision = async () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const response = await fetch(
          `${url}payments/super-admin/mark-commission-paid`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              exec_id: commisionDetails?.exec_id,
              commission_id: commisionDetails?.commission_id,
            }),
          }
        );

        const result = await response.json();

        setLoading(false);
        if (result.error) {
          toast.error(result.message || t("Failed to pay commission"));
          setLoading(false);
          setOpenConfirmModal(false);
        } else {
          toast.success(result.message || t("Commission marked as paid"));
          setLoading(false);
          getAllCommisions(); // refresh list
          setOpenConfirmModal(false);
        }
      } catch (error) {
        toast.error(t("Something went wrong! Please try again."));
        toast.error(t("An error occurred"));
      }
    }, 1000);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getAllCommisions(
        1,
        searchTerm,
        activeStatus,
        sortBy,
        sortOrder,
        isSortingRef.current,
        selectedExecId,
        dateFrom,
        dateTo
      );
      isSortingRef.current = false;
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [
    activeStatus,
    sortBy,
    sortOrder,
    searchTerm,
    selectedExecId,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    if (selectedRows.length !== allCommisions.length) {
      setSelectAll(false);
    }
  }, [selectedRows]);

  useEffect(() => {
    // getAllCommisions();
    getAllExecutives();
  }, []);

// Export handler for commissions
const [exporting, setExporting] = useState(false);
const [exportingFormat, setExportingFormat] = useState(null);
const formatDateForExport = (value) => {
  if (!value) return "N/A";

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
  return k.includes("date") || k.endsWith("_at");
};

const formatEnumValue = (value) => {
  if (typeof value !== "string") return value;

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
const handleExportData = async (format) => {
  setExporting(true);
  setExportingFormat(format);

  try {
    const allData = await fetchAllCommissionsForExport();

    if (!allData.length) {
      toast.error(t("No commissions available for export."));
      return;
    }

    const skipColumns = ["id"];

    const formattedData = allData.map((row) => {
      const out = {};

 Object.entries(row).forEach(([key, value]) => {
  if (skipColumns.includes(key)) return;

  const label = formatLabel(key);

  // ✅ ALL DATE FIELDS
  if (isDateKey(key)) {
    out[label] = formatDateForExport(value);
    return;
  }

  // ✅ ENUM / SLUG VALUES (monthly_free → Monthly Free)
  if (typeof value === "string" && value.includes("_")) {
    out[label] = formatEnumValue(value);
    return;
  }

  // ✅ EMPTY VALUES
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    value === "null" ||
    value === "undefined"
  ) {
    out[label] = t("N/A");
    return;
  }

  // ✅ DEFAULT
  out[label] = value;
});

      return out;
    });

    if (format === "pdf") {
      await exportTable(formattedData, t("Commissions Report"), "pdf");
    }

    if (format === "excel") {
      await exportTable(formattedData, t("Commissions Report"), "xlsx");
    }
  } catch (err) {
    toast.error(t("Failed to export commissions."));
  } finally {
    setExporting(false);
    setExportingFormat(null);
  }
};


// Fetch all commissions without pagination (for export)
const fetchAllCommissionsForExport = async () => {
  const execIdParam = selectedExecId !== "all" ? `&exec_id=${selectedExecId}` : "";
  const statusParam = activeStatus !== "all" ? `&status=${activeStatus}` : "";
  const sortParams = sortBy ? `&sort_by=${sortBy}&sort_order=${sortOrder}` : "";
  const searchParam = searchTerm ? `&search=${searchTerm}` : "";
  const dateFromParam = dateFrom ? `&date_from=${dateFrom}` : "";
  const dateToParam = dateTo ? `&date_to=${dateTo}` : "";

  const apiUrl = `${url}payments/super-admin/commissions?no_pagination=true${sortParams}${statusParam}${execIdParam}${searchParam}${dateFromParam}${dateToParam}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    const commissions = data?.data?.commissions || [];

    // Optional frontend filter if backend ignores date filtering
    let filteredData = commissions;
    if (dateFrom) {
      filteredData = filteredData.filter(
        (item) => new Date(item.date) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filteredData = filteredData.filter(
        (item) => new Date(item.date) <= new Date(dateTo)
      );
    }

    // 🔑 Flatten nested fields for export
    return filteredData.map((item) => ({
      // Top-level fields
      commission_id: item.commission_id,
      exec_id: item.exec_id,
      name: item.name,
      email: item.email,
      company_id: item.company_id,
      company_name: item.company_name,
      company_status: item.company_status,
      status: item.status,
      raw_status: item.raw_status,
      billing_cycle: item.billing_cycle,
      commission_amount: item.commission_amount,
      commission_percentage: item.commission_percentage,
      commission_rate: item.commission_rate,
      payment_amount: item.payment_amount,
      payment_date: item.payment_date,
      payment_txn_id: item.payment_txn_id,
      txn_reference: item.txn_reference,
      date: item.date,
      duration_days: item.duration_days,
      plan_id: item.plan_id,
      plan_name: item.plan_name,
      plan_amount: item.plan_amount,
      plan_currency: item.plan_currency,

      // Flatten commission_details
      commission_details_amount: item.commission_details?.amount || "-",
      commission_details_percentage: item.commission_details?.percentage || "-",
      commission_details_rate: item.commission_details?.rate || "-",

      // Flatten subscription_details
      subscription_plan_id: item.subscription_details?.plan_id || "-",
      subscription_plan_name: item.subscription_details?.plan_name || "-",
      subscription_plan_amount: item.subscription_details?.plan_amount || "-",
      subscription_plan_currency: item.subscription_details?.plan_currency || "-",
      subscription_billing_cycle: item.subscription_details?.billing_cycle || "-",
      subscription_payment_amount: item.subscription_details?.payment_amount || "-",
      subscription_payment_date: item.subscription_details?.payment_date || "-",
      subscription_payment_txn_id: item.subscription_details?.payment_txn_id || "-",
      subscription_duration_days: item.subscription_details?.duration_days || "-",
    }));
  } catch (err) {
    console.error("Export fetch failed", err);
    return [];
  }
};






  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
                 <CommissionAnalytics/>

                         
                       
 
    {/* All your existing commission table code here */}

              <Box width={{ xs: "100%", md: "81.4vw" }}>
                <Grid container spacing={0} sx={{ pl: 2, pr: 2 }} pt={0}>
                  <Grid xs={12} md={12} align="">
                     <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2,
                            backgroundColor: "white",
                        border: "2px solid rgba(9, 30, 66, 0.14)",
                        borderRadius: "9px",
                        py:1,
                      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontFamily: "Poppins, sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              color: "#44546F",
            },
            "& .Mui-selected": {
              color: "#006EC2",
            },
          }}
        >
          <Tab label={t("tabs.commission")} />
          <Tab label={t("tabs.thresholdCommission")} />
        </Tabs>
      </Box>
       {activeTab === 0 ? (
        <>
                    <Box
                      sx={{
                        backgroundColor: "white",
                        border: "2px solid rgba(9, 30, 66, 0.14)",
                        borderRadius: "12px",
                      }}
                    >
                      <Grid
                        container
                        spacing={0}
                        p={2}
                        pb={1}
                        alignItems="center"
                      >

                               <Grid item xs={12} md={4}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              height: "35px",
                            }}
                          >
                            <TypographyMD
                              variant="paragraph"
                              label={t("Manage Commissions")}
                              color="#003149"
                              fontFamily="Poppins, sans-serif"
                              fontSize="18px"
                              fontWeight={600}
                            />
                            {sortingLoader && (
                              <CircularProgress size={12} sx={{ ml: 0.5 }} />
                            )}
                          </Box>
                        </Grid>
   


                        <Grid item xs={12} md={4}>
                          <OutlinedInput
                            autoComplete="off"
                            placeholder={t("Search companies...")}
                            sx={{
                              ...fieldCommonSx,
                              width: {
                                xs: "100%",
                                sm: "100%",
                                md: "100%",
                                lg: "260px",
                              },
                              "& fieldset": { border: "none" }, // remove inner border
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
                        </Grid>

                        {/* Actions (right column) */}
                        <Grid item xs={12} md={4}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: { xs: "column", md: "row" },
                              justifyContent: {
                                xs: "flex-start",
                                md: "flex-end",
                              },
                              alignItems: { xs: "stretch", md: "center" },
                              gap: { xs: 1.2, md: 1 },
                              mt: { xs: 1, md: 0 },
                              width: "100%",
                            }}
                          >
                            {/* Filter button */}

                            <Tooltip title={t("Filter")}>
                              <Box sx={{ position: "relative", display: "inline-flex" }}>
                                <IconButton
                                  onClick={() => {
                                    // Sync draft values to current active values when opening modal
                                    setDraftStatus(activeStatus);
                                    setDraftExecId(selectedExecId);
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

                              <Button
                                sx={{
                                  ...fieldCommonSx,
                                  display: { xs: "block", md: "none" },
                                }}
                                fullWidth
                                onClick={() => {
                                  setDraftStatus(activeStatus);
                                  setDraftExecId(selectedExecId);
                                  setDraftStartDate(dateFrom);
                                  setDraftEndDate(dateTo);
                                  setOpenModalFilter(true);
                                }}
                              >
                                {t("Filter")}
                              </Button>
                            </Tooltip>

                            {/* Export */}
<ExportMenuButton
  onExport={handleExportData}
  exporting={exporting}
  exportingFormat={exportingFormat}
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
                          {allCommisions?.length == 0 || undefined || null ? (
                            <Box
                              display={"flex"}
                              alignItems={"center"}
                              justifyContent={"center"}
                              flexDirection={"column"}
                            >
                              <img
                                src={nodata}
                                alt=""
                                height={200}
                                width={200}
                              />
                              <TypographyMD
                                variant="h2"
                                label={t("Data Not Found")}
                                color="#A5ADB0"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="center"
                              />
                            </Box>
                          ) : (

                            
                            <TableContainer
                              sx={{
                                borderRadius: { xs: "5px", md: "12px" },
                                boxShadow: "none",
                                overflowX: "auto",

                                pt: 1,
                              }}
                            >
                              <Table
                                sx={{
                                  minWidth: { xs: "100%", md: "650px" },
                                  "& .MuiTableCell-root": {
                                    padding: { xs: "6px", md: "10px" },
                                    fontFamily: "Poppins, sans-serif",
                                  },
                                  "& .MuiTableRow-root": {
                                    height: "40px",
                                  },
                                  whiteSpace: "nowrap !important",
                                }}
                                aria-label="commissions table"
                              >
                                {/* Table Head */}
                                <TableHead>
                                  <TableRow>
                                    {/* <TableCell padding="checkbox">
                                      <Checkbox
                                        sx={{ color: "rgba(9, 30, 66, 0.14)" }}
                                        checked={selectAll}
                                        onChange={(e) =>
                                          handleCheckboxChange(e, "selectAll")
                                        }
                                      />
                                    </TableCell> */}
                                    {[
                                      { key: "commission_id", label: "Id" },
                                      {
                                        key: "name",
                                        label: "Account Executive Name",
                                      },
                                      {
                                        key: "company_name",
                                        label: "Company Name",
                                      },
                                      {
                                        key: "payment_amount",
                                        label: "Payment Amount",
                                      },
                                      {
                                        key: "commission_amount",
                                        label: "table.commissionInDollars",
                                      },
                                      {
                                        key: "payment_date",
                                        label: "Payment Date",
                                      },
                                      { key: "status", label: "Status" },
                                      {
                                        key: "action",
                                        label: "Action",
                                        sortable: false,
                                      },
                                    ].map((col) => (
                                      <TableCell
                                        key={col.key}
                                        align="center"
                                        sx={{
                                          fontWeight: 600,
                                          fontSize: "14px",
                                          color: "#44546F",
                                          cursor:
                                            col.sortable === false
                                              ? "default"
                                              : "pointer",
                                        }}
                                        onClick={() =>
                                          col.sortable !== false &&
                                          handleSort(col.key)
                                        }
                                      >
                                        {t(col.label)}
                                        {col.sortable !== false && (
                                          <SortIcons
                                            column={col.key}
                                            sortBy={sortBy}
                                            sortOrder={sortOrder}
                                          />
                                        )}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>

                                {/* Table Body */}
                                <TableBody>
                                  {allCommisions.map((item) => (
                                    <TableRow hover key={item.commission_id}>
                                      {/* <TableCell padding="checkbox">
                                        <Checkbox
                                          sx={{
                                            color: "rgba(9, 30, 66, 0.14)",
                                          }}
                                          checked={selectedRows.includes(
                                            item.commission_id
                                          )}
                                          onChange={(e) =>
                                            handleCheckboxChange(
                                              e,
                                              item.commission_id
                                            )
                                          }
                                        />
                                      </TableCell> */}

                                      {/* Id */}
                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontSize: { xs: "12px", md: "14px" },
                                          fontWeight: 400,
                                          color: "#172B4D",
                                        }}
                                      >
                                        {displayValue(item.commission_id)}
                                      </TableCell>

                                      {/* Name */}
                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontSize: { xs: "12px", md: "14px" },
                                          fontWeight: 400,
                                          color: "#172B4D",
                                        }}
                                      >
                                        {displayValue(item.name)}
                                        <br/>
                                          {displayValue(item.email)}
                                      </TableCell>

                                      {/* Company Name */}
                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontSize: { xs: "12px", md: "14px" },
                                          fontWeight: 400,
                                          color: "#172B4D",
                                          maxWidth: "200px",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {/* {displayValue(item.company_name)} */}
                                         {displayValue(item.company_name)}
                                        
                                      </TableCell>

                                      {/* Payment Amount */}
                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontSize: { xs: "12px", md: "14px" },
                                          fontWeight: 400,
                                          color: "#172B4D",
                                        }}
                                      >
                                        {isEmptyValue(item.payment_amount)
                                          ? t("N/A")
                                          : (
                                              <>
                                                {getCurrencySymbol("$")}
                                                {formatAmount(item.payment_amount)}
                                              </>
                                            )}
                                      </TableCell>

                                      {/* Commission % */}
                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontSize: { xs: "12px", md: "14px" },
                                          fontWeight: 400,
                                          color: "#172B4D",
                                        }}
                                      >
                                        {isEmptyValue(item.commission_amount)
                                          ? t("N/A")
                                          : `$${item.commission_amount}`}
                                      </TableCell>

                                      {/* Payment Date */}
                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontSize: { xs: "12px", md: "14px" },
                                          fontWeight: 400,
                                          color: "#172B4D",
                                        }}
                                      >
                                        {isEmptyValue(item?.payment_date) ? (
                                          t("N/A")
                                        ) : (
                                          <FormatDate inputDate={item?.payment_date} />
                                        )}
                                      </TableCell>

                                      {/* Status */}
                                      <TableCell align="center">
                                        <Box
                                          sx={{
                                            backgroundColor:
                                              item?.status === "paid"
                                                ? "#4BCE97"
                                                : "#F87168",
                                            display: "inline-flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: "6px",
                                            fontSize: {
                                              xs: "12px",
                                              md: "14px",
                                            },
                                            fontWeight: 500,
                                            color: "#fff",
                                            fontFamily: "Poppins, sans-serif",
                                          }}
                                        >
                                          {item?.status === "paid"
                                            ? t("Paid")
                                            : t("Unpaid")}
                                        </Box>
                                      </TableCell>

                                      {/* Action */}
                                      <TableCell align="center">
                                        {/* <IconButton
                                          onClick={(e) => {
                                            setAnchorEl(e.currentTarget);
                                            setCommisionDetails(item);
                                          }}
                                        >
                                          <Visibility
                                            sx={{
                                              color: "#006EC2",
                                              fontSize: 20,
                                            }}
                                          />
                                        </IconButton> */}
                                        <IconButton
  onClick={() => {
    setCommisionDetails(item);
    setOpenModalAdd(true); // OPEN MODAL DIRECTLY
  }}
>
  <Visibility sx={{ color: "#006EC2", fontSize: 20 }} />
</IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
    
                          )}
                        </>
                      )}
                    </Box>
                    </>
                     ) : (
        <>
       

          <CommissionThresholdTable />
        </>
      )}
                  </Grid>
                </Grid>
              </Box>
               

          </Box>
        }
      />

      <ModalAdd
        open={openModalAdd}
        onClose={() => setOpenModalAdd(false)}
        title={t("Commision Details")}
        data={
          <form style={{ backgroundColor: "#fff", margin: 12 }}>
            <Box
              sx={{
                height: { xs: "calc(100dvh - 50px)", sm: "91vh", md: "91vh" }, // control how tall the modal body can grow
                overflowY: "auto", // enable vertical scroll if content overflows
                px: 1,
                pb: 3, // padding left & right
              }}
            >
              <Grid container spacing={2} p={3}>
                {/* COMMISSION DETAILS HEADER */}
                <Grid xs={12}>
                  <TypographyMD
                    variant="paragraph"
                    label={t("Commission Details")}
                    color="#000000"
                    fontFamily="Roboto"
                    fontSize="15px"
                    fontWeight={750}
                    align="left"
                  />
                </Grid>

                {/* ID Section */}
                <Grid xs={5} mt={2}>
                  <TypographyMD
                    variant="h2"
                    label={t("Id")}
                    color="#5E5C5C"
                    lineHeight="25px"
                    fontFamily="Roboto"
                    fontSize="13px"
                    fontWeight={450}
                  />
                </Grid>
                <Grid xs={7} align="right" mt={2}>
                  <TypographyMD
                    variant="h2"
                    label={`# ${commisionDetails?.commission_id}`}
                    color="#172B4D"
                    lineHeight="25px"
                    fontFamily="Roboto"
                    fontSize="13px"
                    fontWeight={450}
                  />
                </Grid>

                {/* Account Executive */}
                <Grid xs={5}>
                  <TypographyMD
                    label={t("Account Executive")}
                    fontSize="13px"
                    color="#5E5C5C"
                    lineHeight="25px"
                  />
                </Grid>
                <Grid xs={7} align="right">
                  <TypographyMD
                    label={commisionDetails?.name}
                    fontSize="13px"
                    fontWeight={500}
                    // color="#172B4D"
                    color="#172B4D"
                    lineHeight="25px"
                  />
                </Grid>

                {/* Status */}
                <Grid xs={5}>
                  <TypographyMD
                    label={t("Status")}
                    fontSize="13px"
                    color="#5E5C5C"
                    lineHeight="25px"
                  />
                </Grid>
                <Grid xs={7} align="right">
                  <Box
                    sx={{
                      backgroundColor:
                        commisionDetails?.status === "paid"
                          ? "#4BCE97"
                          : commisionDetails?.status === "unpaid"
                          ? "#F87168"
                          : "#F87168",
                      width: "fit-content",
                      padding: "4px 4px",
                      color: "#172B4D",
                      borderRadius: "5px",
                      borderColor: "inherit",
                      boxShadow: "none",
                      fontFamily: "Roboto",
                      fontSize: "13px",
                      fontWeight: 500,
                      letterSpacing: ".5px",
                      textTransform: "capitalize",
                    }}
                  >
                    {commisionDetails?.status === "paid" ? (
                      <>
                        <CheckCircleOutline
                          fontSize="17px"
                          sx={{ ml: 0.5, mr: 0.5 }}
                        />{" "}
                         {t("commissionStatus.paid")}{" "}
                      </>
                    ) : commisionDetails?.status === "unpaid" ? (
                      <>
                        <PendingOutlined
                          fontSize="17px"
                          sx={{ ml: 0.5, mr: 0.5 }}
                        />{" "}
                         {t("commissionStatus.unpaid")}{" "}
                      </>
                    ) : (
                      <>
                        <Block fontSize="17px" sx={{ ml: 0.5, mr: 0.5 }} />{" "}
                       {t("commissionStatus.block")}{" "}
                      </>
                    )}
                  </Box>
                  {/* <TypographyMD
                                        label={commisionDetails?.status}
                                        fontSize="13px"
                                        fontWeight={500}
                                        color="#172B4D"
                                    /> */}
                </Grid>

                {/* Date - Time */}
                <Grid xs={5}>
                  <TypographyMD
                    label={t("Date")}
                    fontSize="13px"
                    color="#5E5C5C"
                    lineHeight="25px"
                  />
                </Grid>
                <Grid xs={7} align="right">
                  <TypographyMD
                    label={
                      <>
                        {" "}
                        <FormatDate
                          inputDate={commisionDetails?.payment_date}
                        />
                      </>
                    }
                    fontSize="13px"
                    fontWeight={500}
                    color="#172B4D"
                    lineHeight="25px"
                  />
                </Grid>

                {/* Commission % */}
                <Grid xs={5}>
                  <TypographyMD
                    label={t("Commission %")}
                    fontSize="13px"
                    color="#5E5C5C"
                    lineHeight="25px"
                  />
                </Grid>
                <Grid xs={7} align="right">
                  <TypographyMD
                    label={`${commisionDetails?.commission_amount}%`}
                    fontSize="13px"
                    fontWeight={500}
                    color="#172B4D"
                    lineHeight="25px"
                  />
                </Grid>

                {/* Amount */}
                <Grid xs={5}>
                  <TypographyMD
                    label={t("Amount")}
                    fontSize="13px"
                    color="#5E5C5C"
                    lineHeight="25px"
                  />
                </Grid>
                <Grid xs={7} align="right">
                  <TypographyMD
                    label={commisionDetails?.payment_amount}
                    fontSize="13px"
                    fontWeight={500}
                    color="#172B4D"
                    lineHeight="25px"
                  />
                </Grid>

                {/* --- BILLING DETAILS HEADER --- */}
                <Grid xs={12} mt={3}>
                  <TypographyMD
                    variant="paragraph"
                    label={t("Billing Details")}
                    color="#000000"
                    fontFamily="Roboto"
                    fontSize="15px"
                    fontWeight={750}
                    align="left"
                  />
                </Grid>

                {/* Center Logo */}
                {/* <Grid xs={12} align="center">
                                    <img src="/path/to/novacore-logo.png" alt="NovaCore Logo" width={100} />
                                    <TypographyMD
                                        label={t("NovaCore Technologies Inc.")}
                                        fontSize="14px"
                                        fontWeight={600}
                                        color="#172B4D" lineHeight="25px"
                                    />
                                </Grid> */}

                {/* Subscription Status */}
                <Grid xs={5} mt={2}>
                  <TypographyMD
                    label={t("Plan Id")}
                    fontSize="13px"
                    color="#5E5C5C"
                    lineHeight="25px"
                  />
                </Grid>
                <Grid xs={7} align="right" mt={2}>
                  <TypographyMD
                    label={`${commisionDetails?.subscription_details?.plan_id}`}
                    fontSize="13px"
                    fontWeight={500}
                    color="#172B4D"
                  />
                </Grid>

                <Grid xs={5}>
                  <TypographyMD
                    label={t("Plan Name")}
                    fontSize="13px"
                    color="#5E5C5C"
                    lineHeight="25px"
                  />
                </Grid>
                <Grid xs={7} align="right">
                  <TypographyMD
                    label={commisionDetails?.subscription_details?.plan_name}
                    fontSize="13px"
                    fontWeight={500}
                    color="#172B4D"
                  />
                </Grid>

                <Grid xs={5}>
                  <TypographyMD
                    label={t("Plan Currency")}
                    fontSize="13px"
                    color="#5E5C5C"
                    lineHeight="25px"
                  />
                </Grid>
                <Grid xs={7} align="right">
                  <TypographyMD
                    label={
                      commisionDetails?.subscription_details?.plan_currency
                    }
                    fontSize="13px"
                    fontWeight={500}
                    color="#172B4D"
                  />
                </Grid>

                <Grid xs={5}>
                  <TypographyMD
                    label={t("Plan Amount")}
                    fontSize="13px"
                    color="#5E5C5C"
                    lineHeight="25px"
                  />
                </Grid>
                <Grid xs={7} align="right">
                  <TypographyMD
                    label={commisionDetails?.subscription_details?.plan_amount}
                    fontSize="13px"
                    fontWeight={500}
                    color="#172B4D"
                  />
                </Grid>

                <Grid xs={5}>
                  <TypographyMD
                    label={t("Payment Date")}
                    fontSize="13px"
                    color="#5E5C5C"
                    lineHeight="25px"
                  />
                </Grid>
                <Grid xs={7} align="right">
                  <TypographyMD
                    label={
                      <>
                        <FormatDate
                          inputDate={
                            commisionDetails?.subscription_details?.payment_date
                          }
                        />
                      </>
                    }
                    fontSize="13px"
                    fontWeight={500}
                    color="#172B4D"
                  />
                </Grid>

                <Grid xs={5}>
                  <TypographyMD
                    label={t("Duration")}
                    fontSize="13px"
                    color="#5E5C5C"
                    lineHeight="25px"
                  />
                </Grid>
                <Grid xs={7} align="right">
                  <TypographyMD
                    label={`${commisionDetails?.subscription_details?.duration_days} days`}
                    fontSize="13px"
                    fontWeight={500}
                    color="#172B4D"
                  />
                </Grid>

                <Grid xs={5}>
                  <TypographyMD
                    label={t("Billing Cycle")}
                    fontSize="13px"
                    color="#5E5C5C"
                    lineHeight="25px"
                  />
                </Grid>
                <Grid xs={7} align="right">
                  <TypographyMD
                    label={
                      commisionDetails?.subscription_details?.billing_cycle
                    }
                    fontSize="13px"
                    fontWeight={500}
                    color="#172B4D"
                  />
                </Grid>

                {/* Delete Button */}
                {/* <Grid xs={12} mt={2} align="right">
                                    <Button variant="outlined" color="error">
                                        Delete
                                    </Button>
                                </Grid> */}
              </Grid>
            </Box>
          </form>
        }
      />

      {/* modal filter */}
      <ModalAdd
        open={openModalFilter}
        onClose={() => setOpenModalFilter(false)}
        // type="subscription_plan"
        title={t("Filter")}
        data={
          <form
            style={{ backgroundColor: "#fff", margin: 13 }}
            onSubmit={handleFilterSubmit}
          >
            <Box
              sx={{
                maxHeight: { xs: "100dvh", md: "91vh" }, // control how tall the modal body can grow
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

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginBottom: "15px",
                          marginTop: "10px",
                        }}
                      >
                        {/* {statuses.map((status) => (
                          <div
                            key={status}
onClick={() => setDraftStatus(status.value)}
                            style={{
                              display: "flex",
                              padding: "4px 12px",
                              borderRadius: "5px",
                              border: `2px solid ${
                                draftStatus === status ? "#006EC2" : "#ccc"
                              }`,
                              backgroundColor:
                                draftStatus === status
                                  ? "transparent"
                                  : "transparent",
                              cursor: "pointer",
                              width: "fit-content",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <TypographyMD
                              variant="paragraph"
                              label={status}
                              color={
                                draftStatus === status ? "#006EC2" : "#363333"
                              }
                              fontFamily="Roboto"
                              fontSize="12px"
                              fontWeight={500}
                              align="center"
                            />
                          </div>
                        ))} */}
                        {statuses.map((status) => (
  <div
    key={status.value}
    onClick={() => setDraftStatus(status.value)}
    style={{
                              display: "flex",
                              padding: "4px 12px",
                              borderRadius: "5px",
                              border: `2px solid ${
                                draftStatus === status ? "#006EC2" : "#ccc"
                              }`,
                              backgroundColor:
                                draftStatus === status
                                  ? "transparent"
                                  : "transparent",
                              cursor: "pointer",
                              width: "fit-content",
                              transition: "all 0.3s ease",
                            }}
  >
    <TypographyMD
      label={status.label}
      color={draftStatus === status.value ? "#006EC2" : "#363333"}
    />
  </div>
))}
                      </div>

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

                     <div style={{ marginBottom: "5px", marginTop: "10px" }}>
  <Box
    display="flex"
    flexDirection={{ xs: "column", md: "row" }}
    gap={2}
  >
    <SearchableDropdown
      value={draftExecId}
      onChange={(val) => setDraftExecId(val)}
      options={accountExecutives.map((exec) => ({
        id: exec.value,
        name: exec.email ? `${exec.label} (${exec.email})` : exec.label,
      }))}
      placeholder="Select Executive"
      disabled={accountExecutives.length === 0}
    />
  </Box>
</div>


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
  onBlur={(e) =>
    (e.target.style.borderColor = "rgba(9, 30, 66, 0.14)")
  }
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
  onBlur={(e) =>
    (e.target.style.borderColor = "rgba(9, 30, 66, 0.14)")
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

            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "#fff",
                py: 2,
                px: 1,
                mt: { xs: 0, md: -5 },
                zIndex: 1,
                display:'flex',
                alignItems:'center',
                gap:1
              }}
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
             

            </Box>
          </form>
        }
      />

      <ModalConfirmation
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        title={t("Pay Commision")}
        data={
          <>
            <div style={{ backgroundColor: "#fff", margin: { xs: 8, sm: 13 } }}>
              <Grid container spacing={0} p={{ xs: 1.5, sm: 2, md: 3, lg: 3, xl: 3 }}>
                <Grid xs={12} align="center">
                  <Stack 
                    align="center" 
                    direction="column" 
                    spacing={{ xs: 1.5, sm: 2 }} 
                    pb={{ xs: 2, sm: 3 }}
                  >
                    <Box
                      component="img"
                      src={confirmation_icon}
                      alt="..."
                      sx={{
                        alignSelf: "center",
                        width: { xs: "80px", sm: "100px" },
                        height: { xs: "80px", sm: "100px" }
                      }}
                    />

                    <TypographyMD
                      variant="paragraph"
                      color="#181818"
                      marginLeft={0}
                      fontSize={{ xs: "11px", sm: "13px" }}
                      fontWeight={650}
                      align="center"
                      sx={{
                        px: { xs: 0.5, sm: 0 },
                        lineHeight: { xs: 1.3, sm: 1.5 },
                        wordBreak: "break-word"
                      }}
                    >
                      {t("Are you sure you want to pay commission")}{" "}
                      <span style={{ color: "#006EC2", fontWeight: "bold" }}>
                        {commisionDetails?.commission_amount}%
                      </span>{" "}
                      to{" "}
                      <span style={{ color: "#006EC2", fontWeight: "bold" }}>
                        {commisionDetails?.name}
                      </span>
                      ?
                    </TypographyMD>
                  </Stack>
                </Grid>

                <Grid xs={12} align="center">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: { xs: "center", sm: "end" },
                      alignItems: "center",
                      gap: { xs: 1.5, sm: 1.25 },
                      width: "100%",
                      px: { xs: 1, sm: 0 }
                    }}
                  >
                    <ButtonMD
                      variant="outlined"
                      title="No"
                      width="100px"
                      type="submit"
                      borderColor="borderColor"
                      backgroundColor="orange"
                      borderRadius="5px"
                      onClickTerm={() => setOpenConfirmModal(false)}
                    />

                    <ButtonMD
                      variant="contained"
                      title={t("Yes")}
                      width="100px"
                      type="submit"
                      borderColor="orange"
                      backgroundColor="orange"
                      borderRadius="5px"
                      disabled={loading}
                      onClickTerm={payCommision}
                    />
                  </Box>
                </Grid>
              </Grid>
            </div>
          </>
        }
      />

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          disableGutters
          onClick={() => {
            handleClose();
            setOpenModalAdd(true);
          }}
          sx={{ px: 2, py: 1 }} // ✅ Padding added
        >
          <Box sx={{ display: "flex", justifyContent: "start", gap: 1 }}>
            <Visibility
              sx={{ cursor: "pointer", width: "20px", color: "#579DFF" }}
            />
            <span
              style={{
                color: "#363333",
                fontWeight: "bold",
                fontFamily: "Roboto",
              }}
            >
              {t("Commision Details")}
            </span>
          </Box>
        </MenuItem>

        {commisionDetails?.status === "unpaid" ? (
          <MenuItem
            disableGutters
            onClick={() => {
              handleClose();
              setOpenConfirmModal(true);
            }}
            sx={{ px: 2, py: 1 }} // ✅ Padding added
          >
            <Box sx={{ display: "flex", justifyContent: "start", gap: 1 }}>
              <Check
                sx={{ cursor: "pointer", width: "20px", color: "#4BCE97" }}
              />
              <span
                style={{
                  color: "#363333",
                  fontWeight: "bold",
                  fontFamily: "Roboto",
                }}
              >
                {t("Pay Commision")}
              </span>
            </Box>
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
}

export default CommissionManagement;
