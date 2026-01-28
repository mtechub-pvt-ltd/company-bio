import React, { useEffect, useMemo, useRef, useState } from "react";
import SidebarNew from "../components/sidebar/SidebarNew";
import SearchableDropdown from "../components/SearchableCountryDropdown";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Pagination,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  Divider,
  Chip,
} from "@mui/material";
import TypographyMD from "../components/items/Typography";
import exportIcon from "../Assets/export_icon.png";
import addIcon from "../Assets/add_icon.png";
import csvIcon from "../Assets/csvIcon.png";
import pdfIcon from "../Assets/pdfIcon.png";
import filter from "../Assets/filter.png";
import nodata from "../Assets/nodata.png";
import { exportTable } from "../helper_functions/ExportData";
import { useLocation } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import {  Typography } from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  Error,
  Search,
  Visibility,
  CheckCircleOutline,
  Block,
  CancelOutlined,
  HelpOutline,
  PendingOutlined,
  Close,
  AttachFile,
} from "@mui/icons-material";
import ModalAdd from "../components/items/Modal";
import ButtonMD from "../components/items/ButtonMD";
import url from "../url";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import Inputfield from "../components/items/Inputfield";
import SelectField from "../components/items/Selectfield";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ExportMenuButton from "../components/ExportMenuButton";
import DummyStatusMenuButton from "../components/DummyStatusMenuButton";
import { useSelector } from "react-redux";
import FormatDate from "../components/FormatDate";
import StatusFilter from "../components/StatusFilter";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import {
  getCurrencySymbol,
  formatAmount,
} from "../helper_functions/CurrencyFormate";

// export const payoutStatusConfig = {
//   initiated: { label: "payoutStatus.initiated" },
//   success: { label: "payoutStatus.success" },
//   failed: { label: "payoutStatus.failed" },
//   blocked: { label: "payoutStatus.blocked" },
//   unclaimed: { label: "payoutStatus.unclaimed" },
// };
const SortIcons = ({ column, sortBy, sortOrder }) => (
  <>
    {sortBy === column && sortOrder === "ASC" ? (
      <ArrowUpward sx={{ fontSize: "17px" }} />
    ) : (
      <ArrowDownward sx={{ fontSize: "17px" }} />
    )}
  </>
);

function PayoutLogs() {
  const { token } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

const location = useLocation();
// const payoutStatusConfig = {
//   pending: {
//     label: t("payoutStatus.pending"),
//     color: "#F5CD47",
//     icon: <PendingOutlined fontSize="17px" sx={{ mr: 1 }} />,
//   },
//   ready_for_payout: {
//     label: t("payoutStatus.ready_for_payout"),
//     color: "#579DFF",
//     icon: <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} />,
//   },
//   paid: {
//     label: t("payoutStatus.paid"),
//     color: "#4BCE97",
//     icon: <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} />,
//   },
//   no_commission: {
//     label: t("payoutStatus.no_commission"),
//     color: "#A1A1A1",
//     icon: <Block fontSize="17px" sx={{ mr: 1 }} />,
//   },
// };
const payoutStatusConfig = {
  pending: {
    apiValue: "initiated",
    label: "payoutStatus.pending",
    color: "#F5CD47",
    icon: <PendingOutlined sx={{ mr: 1 }} />,
  },
  ready_for_payout: {
    apiValue: "initiated",
    label: "payoutStatus.ready_for_payout",
    color: "#579DFF",
    icon: <CheckCircleOutline sx={{ mr: 1 }} />,
  },
  paid: {
    apiValue: "success",
    label: "payoutStatus.paid",
    color: "#4BCE97",
    icon: <CheckCircleOutline sx={{ mr: 1 }} />,
  },
  no_commission: {
    apiValue: "unclaimed",
    label: "payoutStatus.no_commission",
    color: "#A1A1A1",
    icon: <Block sx={{ mr: 1 }} />,
  },
};

// detect if coming from threshold
const isFromThreshold = location?.state?.from === "threshold";

  const [payoutLogDetails, setPayoutLogDetails] = useState("");
  const [initialLoader, setInitialLoader] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [allPayoutLogs, setAllPayoutLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const isSortingRef = useRef(false);
  const [sortingLoader, setSortingLoader] = useState(false);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
const execIdFromThreshold = location?.state?.from === "threshold" ? location?.state?.exec_id : null;

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

const startDateRef = useRef(null);
const endDateRef = useRef(null);
  const displayValue = (value) => (isEmptyValue(value) ? t("N/A") : value);

  // Detail Modal States
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedPayoutDetail, setSelectedPayoutDetail] = useState(null);

  const statuses = [
    { key: "all", display: "All" },
    { key: "initiated", display: t("Processing") },
    { key: "success", display: "Paid" },
    { key: "failed", display: t("Failed") },
    { key: "blocked", display: t("Blocked") },
    { key: "unclaimed", display: t("Unclaimed") },
  ];

  const [activeStatus, setActiveStatus] = useState("all");
  // const [draftStatus, setDraftStatus] = useState([]);
  const [draftExecId, setDraftExecId] = useState("all");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [noData, setNoData] = useState(false);

  const toggleStatus = (statusKey) => {
    // If the clicked button is already selected, deselect it
    if (draftStatus === statusKey) {
      setDraftStatus("");
    } else {
      setDraftStatus(statusKey);
    }
  };

  const getAllPayoutLogs = async (
  page = 1,
  search = "",
  status = activeStatus,
  sort_by = sortBy,
  sort_order = sortOrder,
  isSorting = false,
  exec_id_param = "all",
  date_from = dateFrom,
  date_to = dateTo
) => {
  if (isSorting) setSortingLoader(true);
  else setInitialLoader(true);

  try {
    // ✅ Determine exec_id: if navigation came from Threshold, override it
    const exec_id = execIdFromThreshold ? execIdFromThreshold : exec_id_param;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort_by,
      sort_order,
      ...(search && { search }),
      ...(status !== "all" && { status }),
      ...(exec_id !== "all" && { exec_id }),  // only add if exec_id exists
      ...(date_from && { date_from }),
      ...(date_to && { date_to }),
    });

    const InsertAPIURL = `${url}/payments/super-admin/all-payouts?${params}`;
    console.log("Fetching:", InsertAPIURL);

    const response = await fetch(InsertAPIURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    const payoutData = data?.data?.payouts;

    if (!data || data.error || !Array.isArray(payoutData)) {
      toast.error("Something went wrong. Please try again.");
      setAllPayoutLogs([]);
      setTotalPages(1);
      setNoData(true);
      return;
    }

    setAllPayoutLogs(payoutData);
    setTotalPages(data?.data?.pagination?.pages || 1);
    setNoData(false);
  } catch (error) {
    console.error("Fetch error:", error);
    setAllPayoutLogs([]);
    setNoData(true);
    toast.error("Failed to fetch payouts");
  } finally {
    setSortingLoader(false);
    setInitialLoader(false);
  }
};

const [draftStatus, setDraftStatus] = useState("all"); // initial string

const handleFilterSubmit = (e) => {
  e.preventDefault();
  setLoading(true);

  // const statusParam =
  //   typeof draftStatus === "string" ? draftStatus.toLowerCase() : "all";
  const statusParam =
  draftStatus === "all"
    ? "all"
    : payoutStatusConfig[draftStatus]?.apiValue || "all";

  const execParam = draftExecId || "all";

  // Update active filter states
  setActiveStatus(statusParam);
  setSelectedExecId(execParam);
  setDateFrom(draftStartDate);
  setDateTo(draftEndDate);

  // Call API immediately with selected filters
  getAllPayoutLogs(
    1,
    "",
    statusParam,
    sortBy,
    sortOrder,
    false,
    execParam,
    draftStartDate,
    draftEndDate
  );

  setOpenModalFilter(false);
  setLoading(false);
};


  const [selectedExecId, setSelectedExecId] = useState("all");
  const [accountExecutives, setAccountExecutives] = useState([
    { value: "all", label: "All" },
  ]);

  const getAllExecutives = async () => {
    const InsertAPIURL = `${url}/super-admin/public/account-executives?no_pagination=true`;
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
      }));
      setAccountExecutives([
        { value: "all", label: "All" },
        { value: "na", label: "N/A" },
        ...execs,
      ]);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleSort = (column) => {
    const newSortOrder =
      sortBy === column && sortOrder === "ASC" ? "DESC" : "ASC";

    isSortingRef.current = true;
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Handle row click to open detail modal
  const handleRowClick = (payoutItem) => {
    setSelectedPayoutDetail(payoutItem);
    setOpenDetailModal(true);
  };

  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleCheckboxChange = (event, target) => {
    const checked = event.target.checked;

    if (target === "selectAll") {
      setSelectAll(checked);
      if (checked) {
        const allIds = allPayoutLogs.map((item) => item.id);
        setSelectedRows(allIds);
      } else {
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

  const [openModalFilter, setOpenModalFilter] = useState(false);


const fetchAllPayoutLogsForExport = async () => {
  let page = 1;
  let combinedLogs = [];
  let keepFetching = true;

  const statusParam = activeStatus !== "all" ? `&status=${activeStatus}` : "";
  const execIdParam = selectedExecId !== "all" ? `&exec_id=${selectedExecId}` : "";
  const sortParams = sortBy ? `&sort_by=${sortBy}&sort_order=${sortOrder}` : "";
  const dateFromParam = dateFrom ? `&date_from=${dateFrom}` : "";
  const dateToParam = dateTo ? `&date_to=${dateTo}` : "";
  const searchParam = searchTerm ? `&search=${searchTerm}` : "";

  try {
    while (keepFetching) {
      const InsertAPIURL = `${url}/payments/super-admin/all-payouts?page=${page}&limit=${limit}${searchParam}${sortParams}${statusParam}${execIdParam}${dateFromParam}${dateToParam}`;

      const response = await fetch(InsertAPIURL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      const currentPageData = data?.data?.payouts || [];

      // No flattening, just push data as-is
      combinedLogs = [...combinedLogs, ...currentPageData];

      const totalPagesFromAPI = data?.data?.pagination?.pages || 1;
      if (page >= totalPagesFromAPI) {
        keepFetching = false;
      } else {
        page += 1;
      }
    }
  } catch (error) {
    toast.error("Something went wrong! Please try again.");
  }

  return combinedLogs;
};


// ===== Export payout logs =====
const [exporting, setExporting] = useState(false);
const [exportingFormat, setExportingFormat] = useState(null);
const formatLabel = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
    const formatExportDate = (date) => {
  if (!date) return "N/A";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";

  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
};
const handleExportData = async (format) => {
  setExporting(true);
  setExportingFormat(format);

  try {
    const allData = await fetchAllPayoutLogsForExport();

    if (!allData.length) {
      toast.error("No data available for export.");
      return;
    }

    const skipColumns = ["id"]; // internal only

    const formattedData = allData.map((row) => {
      const out = {};

Object.entries(row).forEach(([key, value]) => {
  if (skipColumns.includes(key)) return;

  const label = formatLabel(key);

  // ✅ HANDLE ALL DATE FIELDS
  if (
    key === "created_at" ||
    key === "updated_at" ||
    key === "commission_created_at"
  ) {
    out[label] = formatExportDate(value);
    return;
  }

  // fallback
  out[label] =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    value === "null" ||
    value === "undefined"
      ? t("N/A")
      : value;
});

      return out;
    });

    if (format === "pdf") {
      await exportTable(formattedData, "Payout Logs", "pdf");
    }

    if (format === "excel") {
      await exportTable(formattedData, "Payout Logs", "xlsx");
    }
  } catch (err) {
    toast.error("Failed to export payout logs.");
  } finally {
    setExporting(false);
    setExportingFormat(null);
  }
};



  useEffect(() => {
    if (token) {
      const delayDebounce = setTimeout(() => {
        getAllPayoutLogs(
          currentPage,
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
    }
  }, [
    token,
    currentPage,
    activeStatus,
    sortBy,
    sortOrder,
    searchTerm,
    selectedExecId,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    if (selectedRows.length !== allPayoutLogs.length) {
      setSelectAll(false);
    }
  }, [selectedRows]);

  useEffect(() => {
    getAllExecutives();
  }, []);


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

  const payoutId = selectedPayoutDetail?.paypal_payout_item_id;

const cleanPayoutId = payoutId
  ? payoutId.split("_").filter(part => /^\d+$/.test(part)).join(" ")
  : "-";



  const payoutStatusKey =
selectedPayoutDetail?.payout_status?.toLowerCase();


const payoutStatus =
payoutStatusConfig[payoutStatusKey] || {
label: "Unknown",
color: "#ccc",
icon: null,
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
                xs: "calc(100vh - 70px)",
                sm: "calc(100vh - 80px)",
                md: "calc(100vh - 85px)",
                lg: "calc(100vh - 85px)",
                xl: "calc(100vh - 110px)",
              },
            }}
          >
            {isFromThreshold && (
  <Box
    sx={{
     border: '1px solid #E4E6EF',
      borderRadius: 2,
      px: 2,
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      minHeight: 55,
      mb: 2,
      mt:0.5,
      ml:1.5, mr:1.5,
      cursor:"pointer"
    }}
    onClick={() => navigate(-1)}
  >
    <ArrowBack sx={{ color: "#1976D2", fontSize: 22, mr: 1 }} />
    <Typography
      sx={{
        color: "#1976D2",
        fontWeight: 500,
        fontFamily: "Poppins, sans-serif",
        fontSize: "14px",
      }}
    >
      Back to Threshold Summary
    </Typography>
  </Box>
)}
            <Grid container spacing={0} sx={{ pl: 2, pr: 2 }} pt={0}>
              <Grid xs={12} md={12} align="">
                <Box
                  sx={{
                    backgroundColor: "white",
                    border: "2px solid rgba(9, 30, 66, 0.14)",
                    borderRadius: "12px",
                  }}
                >
                  <Grid container spacing={2} p={2} pb={1}>
                    {/* Title */}
                    <Grid item xs={12} md={4} mt={{ xs: 0, md: 1 }}>
                      <Box
                        display="flex"
                        justifyContent={{ xs: "center", md: "flex-start" }}
                        flexDirection="row"
                      >
                        <TypographyMD
                          variant="paragraph"
                          label={t("Manage Payout Logs")}
                          color="#003149"
                          marginLeft={1}
                          fontFamily="Roboto"
                          fontSize="18px"
                          fontWeight={600}
                          align="center"
                        />
                        {sortingLoader && (
                          <CircularProgress size={12} sx={{ ml: 0.5 }} />
                        )}
                      </Box>
                    </Grid>

                    {/* Search */}
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          mt: { xs: 1, md: 0.5 },
                          backgroundColor: "#fff",
                          border: "2px solid rgba(9, 30, 66, 0.14)",
                          borderRadius: "5px",
                          width: { xs: "100%", md: "240px" }, // full width on small
                        }}
                      >
                        <OutlinedInput
                          autoComplete="off"
                          placeholder={t("Search Payouts")}
                          id="input-with-icon-adornment"
                          sx={{
                            width: "100%",
                            fontSize: "15px",
                            height: "35px",
                            "& fieldset": { border: "none" },
                          }}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton edge="end">
                                <Search
                                  sx={{ fontSize: "15px", color: "#222" }}
                                />
                              </IconButton>
                            </InputAdornment>
                          }
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </Box>
                    </Grid>

                    {/* Filter + Export */}
                    <Grid item xs={12} md={4} pt={{ xs: 2, md: 0 }}>
                      <Box
                        display="flex"
                        flexDirection={{ xs: "column", md: "row" }} // stack on mobile
                        justifyContent={{ xs: "center", md: "flex-end" }}
                        alignItems="center"
                        gap={1.5}
                        width="100%"
                      >
                        <Box
                          width={{ xs: "100%", md: "auto" }}
                          display="flex"
                          justifyContent={{ xs: "center", md: "flex-start" }}
                        >
                          <Tooltip title={t("Filter")}>
                            <img
                              src={filter}
                              alt="..."
                              onClick={() => setOpenModalFilter(true)}
                              style={{ cursor: "pointer", width: "25px" }}
                              className="filter-icon"
                            />

                            <Button
                              sx={{
                                ...fieldCommonSx,
                                display: { xs: "block", md: "none" },
                                width: "100% !important",
                              }}
                              onClick={() => setOpenModalFilter(true)}
                            >
                              {t("Filter")}
                            </Button>
                          </Tooltip>
                        </Box>

                        <Box width={{ xs: "100%", md: "auto" }}>
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
                      {allPayoutLogs?.length === 0 ? (
                        <Box
                          display={"flex"}
                          flexDirection={"column"}
                          alignItems={"center"}
                          justifyContent={"center"}
                        >
                          <img src={nodata} alt="" height={200} width={200} />
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
                            boxShadow: "none",

                            pt: 1,
                            width: { xs: "100%", md: "76vw" },
                          }}
                        >
                          <Table
                            sx={{
                              minWidth: { xs: "100px", md: "250px" },
                              "& .MuiTableCell-root": {
                                padding: "5px",
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
                              }}
                            >
                              <TableRow>
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    sx={{ color: "rgba(9, 30, 66, 0.14)" }}
                                    checked={selectAll}
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
                                  onClick={() => handleSort("plan_name")}
                                  align="center"
                                  sx={{
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    color: "#44546F",
                                    fontFamily: "Poppins, sans-serif",
                                    fontSize: "14px",
                                  }}
                                >
                                  {t("Plan Name")}
                                  <SortIcons
                                    column="plan_name"
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                  />
                                </TableCell>

                                <TableCell
                                  onClick={() => handleSort("exec_name")}
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
                                    column="exec_name"
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                  />
                                </TableCell>

                                <TableCell
                                  onClick={() => handleSort("exec_email")}
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
                                    column="exec_email"
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
                                  onClick={() => handleSort("payout_amount")}
                                  align="center"
                                  sx={{
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    color: "#44546F",
                                    fontFamily: "Poppins, sans-serif",
                                    fontSize: "14px",
                                  }}
                                >
                                  {t("Payout Amount")}
                                  <SortIcons
                                    column="payout_amount"
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                  />
                                </TableCell>

                                <TableCell
                                  onClick={() => handleSort("currency")}
                                  align="center"
                                  sx={{
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    color: "#44546F",
                                    fontFamily: "Poppins, sans-serif",
                                    fontSize: "14px",
                                  }}
                                >
                                  {t("Currency")}
                                  <SortIcons
                                    column="currency"
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                  />
                                </TableCell>

                                <TableCell
                                  onClick={() => handleSort("payout_status")}
                                  align="center"
                                  sx={{
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    color: "#44546F",
                                    fontFamily: "Poppins, sans-serif",
                                    fontSize: "14px",
                                  }}
                                >
                                  {t("Status")}
                                  <SortIcons
                                    column="payout_status"
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                  />
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
                                  }}
                                >
                                  {t("Payment Date")}
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
                                  {t("Action")}
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {allPayoutLogs.map((item) => {
                                const status =
                                  item?.payout_status?.toLowerCase();
                                const { label, color, icon } =
                                  payoutStatusConfig[status] || {
                                    label: "Unknown",
                                    color: "#ccc",
                                    icon: null,
                                  };
                                return (
                                  <TableRow
                                    key={item.id}
                                    hover
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => handleRowClick(item)}
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
                                        maxWidth: "150px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
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
                                        maxWidth: "150px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {displayValue(item.plan_name)}
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
                                      {displayValue(item.exec_name)}
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
                                      {displayValue(item.exec_email)}
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
                                      {isEmptyValue(item.payout_amount)
                                        ? t("N/A")
                                        : (
                                            <>
                                              {getCurrencySymbol("$")}
                                              {formatAmount(item.payout_amount)}
                                            </>
                                          )}
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
                                      {displayValue(item.currency)}
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
                                        <Box
                                          sx={{
                                            backgroundColor: color,
                                            width: "fit-content",
                                            padding: "4px 8px",
                                            color: "#172B4D",
                                            borderRadius: "5px",
                                            display: "flex",
                                            alignItems: "center",
                                            fontFamily: "Poppins, sans-serif",
                                            fontWeight: 550,
                                            letterSpacing: ".5px",
                                            textTransform: "capitalize",
                                          }}
                                        >
                                          {icon}
                                          {t(label)}
                                        </Box>
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
                                      {isEmptyValue(item?.created_at) ? (
                                        t("N/A")
                                      ) : (
                                        <FormatDate inputDate={item?.created_at} />
                                      )}
                                    </TableCell>

                                    <TableCell>
                                      <IconButton
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRowClick(item);
                                        }}
                                      >
                                        <Visibility
                                          sx={{
                                            cursor: "pointer",
                                            width: "20px",
                                            color: "#579DFF",
                                          }}
                                        />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
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
                      )}
                      <Box
                        width={"100%"}
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        mt={2}
                        mb={2}
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
                      </Box>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        }
      />

      <ModalAdd
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        title={t("Payout Details")}
        data={
          selectedPayoutDetail && (
            <Box
              sx={{
                m:1,
                p: 2,
                maxHeight: "90vh",
                overflowY: "auto",
                bgcolor: "white",
              }}
            >
              <Grid container spacing={2}>
                {/* Basic Information Header */}
                <Grid item xs={12}>
                  <TypographyMD
                    variant="h6"
                    label={t("Basic Information")}
                    color="#1976d2"
                    fontFamily="Roboto"
                    fontSize="18px"
                    fontWeight={600}
                    marginBottom={2}
                  />
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                {/* Basic Information Fields */}
                {[
                  {
                    label: t("Payout ID"),
                    value: selectedPayoutDetail.id?.toString() || "-",
                  },
                  {
                    label: t("Commission ID"),
                    value:
                      selectedPayoutDetail.commission_id?.toString() || "-",
                  },
                  {
                    label: t("Payout Amount"),
                    value: `${selectedPayoutDetail.payout_amount || "0"} ${
                      selectedPayoutDetail.currency || ""
                    }`,
                  },
                  {
                    label: t("Status"),
                    value: (
                      // <Chip
                      //   label={
                      //     payoutStatusConfig[
                      //       selectedPayoutDetail.payout_status?.toLowerCase()
                      //     ]?.label || "Unknown"
                      //   }
                      //   sx={{
                      //     backgroundColor:
                      //       payoutStatusConfig[
                      //         selectedPayoutDetail.payout_status?.toLowerCase()
                      //       ]?.color || "#ccc",

                      //     color: "#172B4D",
                      //     fontWeight: 600,
                      //     fontSize: "12px",
                      //     height: "24px",
                      //   }}
                      // />
                      <Box
sx={{
backgroundColor: payoutStatus.color,
padding: "4px 8px",
borderRadius: "5px",
display: "inline-flex",
alignItems: "center",
gap: "6px",
fontFamily: "Poppins, sans-serif",
fontWeight: 600,
fontSize: "12px",
color: "#172B4D",
width: "fit-content",
}}
>
{payoutStatus.icon}
{t(payoutStatus.label)}
</Box>
                    ),
                  },
                ].map((item, idx) => (
                  <React.Fragment key={idx}>
                    <Grid item xs={6}>
                      <TypographyMD
                        variant="subtitle2"
                        label={item.label}
                        color="#666"
                        fontWeight={600}
                        fontSize="14px"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      {typeof item.value === "string" ? (
                        <TypographyMD
                          variant="body2"
                          label={item.value}
                          color="#333"
                          fontSize="14px"
                          fontWeight={500}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        />
                      ) : (
                        item.value
                      )}
                    </Grid>
                  </React.Fragment>
                ))}

                {/* Sections: Account Executive, Company & Plan, Commission, PayPal, Timestamps */}
                {[
                  {
                    title: t("Account Executive Information"),
                    fields: [
                      {
                        label: t("Executive ID"),
                        value: selectedPayoutDetail.exec_id?.toString() || "-",
                      },
                      {
                        label: t("Executive Name"),
                        value: selectedPayoutDetail.exec_name || "-",
                      },
                      {
                        label: t("Executive Email"),
                        value: selectedPayoutDetail.exec_email || "-",
                      },
                      {
                        label: t("Executive User ID"),
                        value:
                          selectedPayoutDetail.exec_user_id?.toString() || "-",
                      },
                    ],
                  },
                  {
                    title: t("Company & Plan Information"),
                    fields: [
                      {
                        label: t("Company ID"),
                        value:
                          selectedPayoutDetail.company_id?.toString() || "-",
                      },
                      {
                        label: t("Company Name"),
                        value: selectedPayoutDetail.company_name || "-",
                      },
                      {
                        label: t("Plan Name"),
                        value: selectedPayoutDetail.plan_name || "-",
                      },
                      {
                        label: t("Plan Amount"),
                        value: `${selectedPayoutDetail.plan_amount || "0"} ${
                          selectedPayoutDetail.plan_currency || ""
                        }`,
                      },
                    ],
                  },
                  {
                    title: t("Commission Information"),
                    fields: [
                      {
                        label: t("Commission Amount"),
                        value: `${
                          selectedPayoutDetail.commission_amount || "0"
                        } ${selectedPayoutDetail.currency || ""}`,
                      },
                      {
                        label: t("Commission Rate"),
                        value: `${
                          selectedPayoutDetail.commission_rate || "0"
                        }%`,
                      },
                      {
                        label: t("Commission Status"),
                        value: selectedPayoutDetail.commission_status || "-",
                        style: { textTransform: "capitalize" },
                      },
                    {
  label: t("Commission Created At"),
  value: selectedPayoutDetail.commission_created_at
    ? new Date(selectedPayoutDetail.commission_created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
    : "-",
}

                    ],
                  },
                  {
                    title: t("PayPal Information"),
                    fields: [
                      {
                        label: t("PayPal Batch ID"),
                        value: selectedPayoutDetail.paypal_batch_id || "-",
                      },
                      {
                        label: t("PayPal Payout Item ID"),
                         value: cleanPayoutId,

                      },
                      {
                        label: t("Recipient Email"),
                        value: selectedPayoutDetail.recipient_email || "-",
                      },
                      {
                        label: t("PayPal Transaction ID"),
                        value:
                          selectedPayoutDetail.paypal_transaction_id || "-",
                      },
                      {
                        label: t("PayPal Fee"),
                        value: `${selectedPayoutDetail.paypal_fee || "0.00"} ${
                          selectedPayoutDetail.currency || ""
                        }`,
                      },
                    ],
                  },
           {
  title: t("Timestamps"),
  fields: [
    {
      label: t("Created At"),
      value: selectedPayoutDetail.created_at
        ? new Date(selectedPayoutDetail.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          })
        : "-",
    },
    {
      label: t("Updated At"),
      value: selectedPayoutDetail.updated_at
        ? new Date(selectedPayoutDetail.updated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
          })
        : "-",
    },
  ],
}
,
                ].map((section, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <Grid item xs={12} sx={{ mt: 3 }}>
                      <TypographyMD
                        variant="h6"
                        label={section.title}
                        color="#1976d2"
                        fontFamily="Roboto"
                        fontSize="18px"
                        fontWeight={600}
                        marginBottom={2}
                      />
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    {section.fields.map((field, fIdx) => (
                      <React.Fragment key={fIdx}>
                        <Grid item xs={6}>
                          <TypographyMD
                            variant="subtitle2"
                            label={field.label}
                            color="#666"
                            fontWeight={600}
                            fontSize="14px"
                          />
                        </Grid>
                        <Grid item xs={6}>
                          {typeof field.value === "string" ? (
                            <TypographyMD
                              variant="body2"
                              label={field.value}
                              color="#333"
                              fontSize="14px"
                              fontWeight={500}
                              sx={
                                field.style || {
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }
                              }
                            />
                          ) : (
                            field.value
                          )}
                        </Grid>
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}

                {/* Error Message */}
                {selectedPayoutDetail.error_message && (
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Box
                      sx={{
                        backgroundColor: "#ffebee",
                        border: "1px solid #f44336",
                        borderRadius: "8px",
                        p: 2,
                      }}
                    >
                      <TypographyMD
                        variant="subtitle2"
                        label={t("Error Message")}
                        color="#d32f2f"
                        fontWeight={600}
                        fontSize="14px"
                        marginBottom={1}
                      />
                      <TypographyMD
                        variant="body2"
                        label={selectedPayoutDetail.error_message}
                        color="#d32f2f"
                        fontSize="14px"
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )
        }
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
                maxHeight: { xs: "100vh", md: "100vh" },
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
                      {/* Status */}
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
                          gap: { xs: 1, sm: 1.5 },
                          marginBottom: "15px",
                          marginTop: "10px",
                          justifyContent: { xs: "flex-start", sm: "flex-start" },
                        }}
                      >
  {Object.keys(payoutStatusConfig).map((statusKey) => {
  const statusObj = payoutStatusConfig[statusKey];

  console.log("FILTER STATUS:", statusKey, statusObj);

  return (
    <Box
      key={statusKey}
      onClick={() => toggleStatus(statusKey)}
      sx={{
        display: "flex",
        padding: { xs: "6px 8px", sm: "4px 12px" },
        borderRadius: "5px",
        border: `2px solid ${
          draftStatus === statusKey ? "#006EC2" : "#ccc"
        }`,
        backgroundColor: "transparent",
        cursor: "pointer",
        minWidth: { xs: "auto", sm: "fit-content" },
        flex: { xs: "1 1 calc(50% - 4px)", sm: "none" },
        maxWidth: { xs: "calc(50% - 4px)", sm: "none" },
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: "#006EC2",
          backgroundColor: "rgba(0, 110, 194, 0.05)",
        },
      }}
    >
      <TypographyMD
        variant="paragraph"
        label={t(statusObj.label)}
        color={draftStatus === statusKey ? "#006EC2" : "#363333"}
        fontFamily="Roboto"
        fontSize={{ xs: "11px", sm: "12px" }}
        fontWeight={500}
        align="center"
        sx={{
          width: "100%",
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      />
    </Box>
  );
})}


                      </Box>
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
        name: exec.label,
      }))}
      placeholder="Select Executive"
      disabled={accountExecutives.length === 0}
      // Optional: Adjust height to match original 35px
      sx={{
        "& .MuiOutlinedInput-root": {
          height: 35,
        },
      }}
    />
  </Box>
</div>


                      {/* Date Range */}
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
    </>
  );
}

export default PayoutLogs;
