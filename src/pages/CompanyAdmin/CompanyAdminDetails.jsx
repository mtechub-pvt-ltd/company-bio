import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import SidebarNew from "../../components/sidebar/SidebarNew";
import exportIcon from "../../Assets/export_icon.png";
import menu_icon from "../../Assets/menu_icon.png";
import dummy from '../../Assets/dummy.png'
import {
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Modal,
  OutlinedInput,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Add,
  ArrowBack,
  ArrowBackIos,
  ArrowDownward,
  ArrowForwardIos,
  ArrowUpward,
  Block,
  CheckCircleOutline,
  Close,
  Code,
  Delete,
  Download,
  Downloading,
  Edit,
  Email,
  Error,
  FilterAlt,
  FoodBank,
  Group,
  GroupAdd,
  Groups,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  MoreVert,
  PendingActions,
  Report,
  RequestedPage,
  Restaurant,
  Search,
  Star,
  StarBorder,
  StarHalf,
  ToggleOff,
  TwoWheeler,
  Unsubscribe,
  Visibility,
} from "@mui/icons-material";
import TypographyMD from "../../components/items/Typography";
import total_employess from "../../Assets/total_employess.png";
import remote_workers from "../../Assets/remote_workers.png";
import departments from "../../Assets/departments.png";
import total_requests from "../../Assets/total_requests.png";
import ongoing_tasks from "../../Assets/ongoing_tasks.png";
import completed_tasks from "../../Assets/completed_tasks.png";
import back_arrow from "../../Assets/back_arrow.png";
import company_logo from "../../Assets/company_logo.png";
import csvIcon from "../../Assets/csvIcon.png";

import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Topbar from "../../components/topbar/Topbar";
import DashboardCard from "../../components/DashboardCard";
import url from "../../url";
import Graph from "../../components/graph/Graph";
import { DashboardGoogleMap } from "../../components/items/Dashboardgooglemap";
import DashboardAreaChart from "../../components/items/DashboardAreaChart";
import ModalAdd from "../../components/items/Modal";
import ModalSuccess from "../../components/items/ModalSuccess";
import ButtonMD from "../../components/items/ButtonMD";
import { toast } from "react-hot-toast";
import UserCard from "../../components/items/Usercard";
import Expenses from "./Expenses";
import Chart from "react-apexcharts";
import SelectField from "../../components/items/Selectfield";
import { useTranslation } from "react-i18next";
import ExportMenuButton from "../../components/ExportMenuButton";
import DummyStatusMenuButton from "../../components/DummyStatusMenuButton";
import Attendence from "./Attendence";
import Tasks from "./Tasks";
import ActionButtons from "../../components/ActionButtons";
import Request from "./Requests";
import { useSelector } from "react-redux";
import Payments from "./Payments";
import FormatDate from "../../components/FormatDate";
import SearchIcon from "@mui/icons-material/Search";
import nodata from "../../Assets/nodata.png";
import pdfIcon from "../../Assets/pdfIcon.png";
import imageIcon from "../../Assets/imageIcon.png";
import StatusDropdown from "../../components/StatusDropdown";

// import { useState } from "react";


const SortIcons = ({ column, sortBy, sortOrder }) => (
  <>
    {sortBy === column && sortOrder === "ASC" ? (
      <ArrowUpward sx={{ fontSize: "17px" }} />
    ) : (
      <ArrowDownward sx={{ fontSize: "17px" }} />
    )}
  </>
);

function CompanyAdminDetails() {
  const { token, tokenExpiry } = useSelector((state) => state.auth);


  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const company_admin_id = searchParams.get("id");
  const company_admin_name = searchParams.get("name");

  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const [companyAdminDetails, setCompanyAdminDetails] = useState("");
  const [companyId, setCompanyId] = useState("");
  const getUserDetails = async (company_admin_id) => {
    const InsertAPIURL = `${url}company-admins/${company_admin_id}`;
    console.log("[getUserDetails] Fetching user details...");
    console.log("[getUserDetails] URL:", InsertAPIURL);
    console.log(
      "[getUserDetails] Token:",
      token ? "Token present ✅" : "❌ Missing token"
    );

    try {
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[getUserDetails] Raw response:", response);

      if (!response.ok) {
        toast.error("Something went wrong! Please try again ");
        return;
      }

      const data = await response.json();
      console.log("[getUserDetails] Parsed JSON:", data);

      if (data?.data?.company_admin) {
        console.log(
          "[getUserDetails] Company admin details found ✅:",
          data.data.company_admin.account_details.profile_picture_url
        );
        setCompanyAdminDetails(data.data.company_admin);
        if (data.data.company_admin.raw_data?.company_id) {
          setCompanyId(data.data.company_admin.raw_data.company_id);
        }
      } else {
        console.warn(
          "[getUserDetails] No company admin details in response ❌",
          data
        );
      }
    } catch (error) {
      console.error("[getUserDetails] Fetch failed:", error);
      toast.error("Something went wrong! Please try again.");
    }
  };

  const [userCardoverview, setUserCardoverview] = useState("");
  const getUserCardOverview = async (company_admin_id) => {
    var InsertAPIURL = `${url}company-admins/${company_admin_id}/company-overview`;
    await fetch(InsertAPIURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(),
    })
      .then((response) => response.json())
      .then((response) => {
        setUserCardoverview(response?.data);
      })
      .catch((error) => {
        toast.error("Something went wrong! Please try again.");
      });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10); // default 10 records per page
  const isSortingRef = useRef(false);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("DSC");
  const [companyWorkers, setCompanyWorkers] = useState("");
  const [tableLoading, setTableLoading] = useState(true);

  const getCompanyWorkers = async (
    company_id, // now using actual company_id
    page = 1,
    search = "",
    sort_by = sortBy,
    sort_order = sortOrder
  ) => {
    // build sort params
    let sortParams = sort_by
      ? `&sort_by=${sort_by}&sort_order=${sort_order}`
      : "";

    if (!company_id) return;

    // full API URL with company_id and status
    const InsertAPIURL = `${url}public/workers?company_id=${company_id}&status=active&page=${page}&limit=${limit}&search=${search}${sortParams}`;

    setTableLoading(true);
    try {
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.error) {
        setCompanyWorkers(data?.data?.records || []);
        setTotalPages(data?.data?.pagination?.pages || 1);
      } else {
        toast.error(data.message || "Failed to fetch workers");
      }
    } catch (error) {
      toast.error("Something went wrong! Please try again.");
    } finally {
      setTableLoading(false);
    }
  };

  const handleSort = (column) => {
    const newSortOrder =
      sortBy === column && sortOrder === "ASC" ? "DSC" : "ASC";

    isSortingRef.current = true; // Mark sorting in progress

    setSortBy(column);
    setSortOrder(newSortOrder);
  };
  const fieldCommonSx = {
    height: "35px",
    borderRadius: "6px",
    border: "2px solid rgba(9, 30, 66, 0.14)",
    backgroundColor: "#fff",
    fontSize: { xs: "12px", md: "14px" },
    "&:hover": { borderColor: "#006EC2" },
    "&.Mui-focused": { borderColor: "#006EC2" },
    color: "rgba(27, 27, 27, 0.67)",
  };
  const [data, setData] = useState(companyWorkers);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleCheckboxChange = (event, target) => {
    const checked = event.target.checked;

    if (target === "selectAll") {
      setSelectAll(checked);
      if (checked) {
        // Select all on the current page
        const allIds = companyWorkers.map((item) => item.id);
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

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  //Status
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusToChange, setStatusToChange] = useState(null);


  const [openModalStatusChange, setOpenModalStatusChange] = useState(false);
  const handleOpenModalStatusChange = (item, newStatus) => {
    setOpenModalStatusChange(true);

    setSelectedItem(item.id);
    setStatusToChange(newStatus);
  };

  const confirmStatusChange = () => {
    setLoading(true);
    setTimeout(() => {
      var InsertAPIURL = `${url}company-admins/status`;

      var Data = {
        company_admin_ids: [selectedItem],
        status: statusToChange,
        // "verification_status": "verified"
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
          setLoading(false);
          if (response.error) {
            toast.error("Something went wrong! Please try again.");
          } else {
            toast.success("Status updated successfully");
            setStatusToChange(null);
            setOpenModalStatusChange(false);

            getCompanyWorkers(companyId);
          }
        })
        .catch((error) => {
          setLoading(false);
          toast.error("Something went wrong! Please try again.");
        });
    }, 1000);
  };

  const getFileType = (url) => {
    if (!url) return null;
    return url.toLowerCase().endsWith(".pdf") ? "pdf" : "image";
  };

  const getFileName = (url) => {
    if (!url) return "-";
    return url.split("/").pop(); // Extract file name
  };


  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "-";

  // Define months
  const months = [
    t("Jan"),
    t("Feb"),
    t("Mar"),
    t("Apr"),
    t("May"),
    t("Jun"),
    t("Jul"),
    t("Aug"),
    t("Sep"),
    t("Oct"),
    t("Nov"),
    t("Dec"),
  ];

  const generateLast50Years = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 50 }, (_, i) => currentYear - i);
  };

  const years = generateLast50Years();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [chartSeries, setChartSeries] = useState([
    {
      name: "Total Users",
      data: Array(12).fill(0), // Initial empty chart
    },
  ]);
  const getWorkersCountMetrics = async (company_admin_id) => {
    const InsertAPIURL = `${url}company-admins/${company_admin_id}/workers-metrics?year=${selectedYear}`;
    try {
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      const apiData = result?.data?.metrics;

      if (Array.isArray(apiData)) {
        const monthlyCounts = Array(12).fill(0);
        apiData.forEach(({ month, count }) => {
          if (month >= 1 && month <= 12) {
            monthlyCounts[month - 1] = count;
          }
        });

        setChartSeries([
          {
            name: "Total Users",
            data: monthlyCounts,
          },
        ]);
      }
    } catch (error) {
      toast.error("Something went wrong! Please try again.");
    }
  };

  // Chart options
  const options = {
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      toolbar: { show: false },
    },
    colors: ["#579DFF"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "30%",
        endingShape: "rounded",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: months,
    },
    fill: {
      opacity: 1,
    },
    legend: {
      position: "bottom",
      itemMargin: {
        horizontal: 30,
        vertical: 8,
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} users`,
      },
    },
  };

  useEffect(() => {
    getUserDetails(company_admin_id);
    getUserCardOverview(company_admin_id);
    getWorkersCountMetrics(company_admin_id);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (companyId) {
        getCompanyWorkers(
          companyId,
          currentPage,
          searchTerm,
          sortBy,
          sortOrder,
          isSortingRef.current
        );
      }

      isSortingRef.current = false;
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [sortBy, sortOrder, searchTerm, currentPage, companyId]);

  useEffect(() => {
    if (selectedRows.length !== companyWorkers.length) {
      setSelectAll(false);
    }
  }, [selectedRows]);

  const [initialLoader, setInitialLoader] = useState(true);

  useEffect(() => {
    // Simulate a 2-second loading time
    const timer = setTimeout(() => {
      setInitialLoader(false);
    }, 3000);

    // Cleanup timeout on unmount
    return () => clearTimeout(timer);
  }, []);

  const [activeTab, setActiveTab] = useState("workers"); // default tab

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const tabs = [
    { id: "workers", label: t("Workers") },
    { id: "attendence", label: t("Attendance") }, // corrected spelling
    { id: "task", label: t("Tasks") },
    { id: "requests", label: t("Requests") },
    { id: "payments", label: t("Payments") },
    { id: "expenses", label: t("Expenses") },
  ];

  // Export spinner state
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  // Fetch all workers for export (no pagination)
  const fetchAllCompanyWorkers = async () => {
    const sortParams = sortBy ? `&sort_by=${sortBy}&sort_order=${sortOrder}` : "";
    const searchParam = searchTerm ? `&search=${searchTerm}` : "";
    if (!companyId) return [];
    // Use a very high limit to get all data
    const apiUrl = `${url}public/workers?company_id=${companyId}&status=active&no_pagination=true${searchParam}${sortParams}`;
    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data?.data?.records || [];
    } catch (err) {
      console.error("Export fetch failed", err);
      return [];
    }
  };

  // Format/flatten data for export
  const formatExportData = (allData) => {
    return allData.map((item) => ({
      Id: item.id,
      "Employee Name": `${item.first_name || ''} ${item.last_name || ''}`.trim(),
      "Employee Email": item.email,
      "Phone No.": item.phone,
      Department: item.department_id,
      Type: item.employee_type,
      Shift: item.shift_schedule,
      Registered: item.created_at ? formatDate(item.created_at) : "",
      Status: item.status,
    }));
  };

  // Export handler
  const handleExportData = async (format) => {
    setExporting(true);
    setExportFormat(format);
    try {
      const allData = await fetchAllCompanyWorkers();
      if (!allData.length) {
        toast.error(t("No data available for export."));
        return;
      }
      const formatted = formatExportData(allData);
      if (format.toLowerCase() === "pdf") {
        const { exportTable } = await import("../../helper_functions/ExportData");
        await exportTable(formatted, "Company Employees", "pdf", { skipColumns: [] });
      } else if (format.toLowerCase() === "excel") {
        const { exportTable } = await import("../../helper_functions/ExportData");
        await exportTable(formatted, "Company Employees", "xlsx", { skipColumns: [] });
      } else {
        toast.error(t("Unsupported export format."));
      }
    } catch (err) {
      toast.error(t("Failed to export workers. Please try again."));
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  const formatSubscription = (str) => {
    if (!str) return "";
    return str
      .replace(/_/g, " ")          // full_monthly → full monthly
      .replace(/\b\w/g, c => c.toUpperCase()); // full monthly → Full Monthly
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };



  const formatText = (value = "") => {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
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
            {initialLoader ? (
              <div
                style={{
                  height: "50vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress size={20} thickness={3} color="primary" />
              </div> // Or use a spinner
            ) : (
              <>
                <Grid container spacing={0} sx={{ pl: 2, pr: 2 }} pt={0}>
                  <Grid xs={12} pb={1}>
                    <Card
                      sx={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "2px solid rgba(9, 30, 66, 0.14)",
                        boxShadow: "none",
                        p: 2,
                      }}
                    >
                      <CardContent
                        sx={{ p: 0, "&:last-child": { paddingBottom: 0 } }}
                      >
                        <Box display="flex" alignItems="center" gap={1} mb={0}>
                          <Box
                            onClick={() => {
                              const backTo = (location && location.state && location.state.from) ? location.state.from : "/company-admin";
                              navigate(backTo);
                            }}
                            component="img"
                            src={back_arrow}
                            sx={{ cursor: "pointer", width: "30px" }}
                          />

                          <Breadcrumbs
                            separator="/"
                            aria-label="breadcrumb"
                            sx={{ lineHeight: 1, m: 0 }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 400,
                                fontSize: "15px",
                                fontFamily: "Roboto",
                                lineHeight: 1.2,
                                m: 0,
                              }}
                              color="#626F86"
                            >
                              {t("Company Admins")}
                            </Typography>
                            <Typography
                              sx={{
                                fontWeight: 400,
                                fontSize: "15px",
                                fontFamily: "Roboto",
                                lineHeight: 1.2,
                                m: 0,
                              }}
                              color="#626F86"
                            >
                              {company_admin_name}
                            </Typography>
                          </Breadcrumbs>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid container spacing={2} pt={0}>
                    <Grid
                      item
                      xs={12}
                      md={4}
                      align="center"
                      // onClick={() => alert("in development")}

                      p={0.7}
                    >
                      <UserCard
                        icon={
                          <img
                            src={total_employess}
                            alt="..."
                            style={{
                              marginTop: "5px",
                              marginLeft: "-3px",
                              width: "40px",
                              height: "40px",
                            }}
                          />
                        }
                        heading={t("Total Employees")}
                        value={userCardoverview?.workers_count}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={4}
                      align="center"
                      // onClick={() => alert("in development")}

                      p={0.7}
                    >
                      <UserCard
                        icon={
                          <img
                            src={remote_workers}
                            alt="..."
                            style={{
                              marginTop: "5px",
                              marginLeft: "-3px",
                              width: "40px",
                              height: "40px",
                            }}
                          />
                        }
                        heading={t("Remote Workers")}
                        value={userCardoverview?.remote_workers}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={4}
                      align="center"
                      // onClick={() => alert("in development")}

                      p={0.7}
                    >
                      <UserCard
                        icon={
                          <img
                            src={departments}
                            alt="..."
                            style={{
                              marginTop: "5px",
                              marginLeft: "-3px",
                              width: "40px",
                              height: "40px",
                            }}
                          />
                        }
                        heading={t("Departments")}
                        value={userCardoverview?.department_count}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={4}
                      align="center"
                      // onClick={() => alert("in development")}

                      p={0.7}
                    >
                      <UserCard
                        icon={
                          <img
                            src={total_requests}
                            alt="..."
                            style={{
                              marginTop: "5px",
                              marginLeft: "-3px",
                              width: "40px",
                              height: "40px",
                            }}
                          />
                        }
                        heading={t("Total Requests")}
                        value={userCardoverview?.total_requests}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={4}
                      align="center"
                      // onClick={() => alert("in development")}

                      p={0.7}
                    >
                      <UserCard
                        icon={
                          <img
                            src={ongoing_tasks}
                            alt="..."
                            style={{
                              marginTop: "5px",
                              marginLeft: "-3px",
                              width: "40px",
                              height: "40px",
                            }}
                          />
                        }
                        heading={t("Ongoing Tasks")}
                        value={userCardoverview?.ongoing_task}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={4}
                      align="center"
                      // onClick={() => alert("in development")}

                      p={0.7}
                    >
                      <UserCard
                        icon={
                          <img
                            src={completed_tasks}
                            alt="..."
                            style={{
                              marginTop: "5px",
                              marginLeft: "-3px",
                              width: "40px",
                              height: "40px",
                            }}
                          />
                        }
                        heading={t("Completed Tasks")}
                        value={userCardoverview?.completed_tasks}
                      />
                    </Grid>
                  </Grid>

                  {/* Left Section - details card(6 columns) */}
                  <Grid item xs={12} md={6} p={0.7}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} align="center">
                        <Card
                          sx={{
                            width: "100%",
                            height: "auto",
                            border: "2px solid rgba(9, 30, 66, 0.14)",
                            backgroundColor: "#ffffff",
                            borderRadius: "12px",
                            boxShadow: "none",
                          }}
                        >
                          <CardContent>
                            <Box align="left">
                              <Grid container spacing={0} p={0}>
                                <Grid
                                  xs={12}
                                  md={12}
                                  sm={12}
                                  align="left"
                                  p={0.7}
                                >
                                  <TypographyMD
                                    variant="paragraph"
                                    label={t("Account Details")}
                                    color="#424242"
                                    marginTop={-1}
                                    marginLeft={-1}
                                    fontFamily="Roboto"
                                    fontSize="16px"
                                    fontWeight={750}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={12} md={12} align="center">
                                  {/* <img
                                    src={
                                      companyAdminDetails?.account_details
                                        ?.profile_image || dummy
                                    }
                                    width={150}
                                    height={150}
                                    style={{
                                      border: "none",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                    alt="Profile"
                                    crossOrigin="anonymous"
                                  /> */}




                                  <img
                                    src={companyAdminDetails?.account_details
                                      ?.profile_image || dummy}
                                    onError={(e) => { e.target.src = dummy }}
                                    width={150}
                                    height={150}
                                    style={{
                                      border: "none",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                    alt="Logo"
                                    crossOrigin="anonymous"
                                  />

                                </Grid>

                                <Grid xs={5} md={5} align="center" pb={1}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Id")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="14px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid
                                  xs={7}
                                  md={7}
                                  align="right"
                                  pb={1}

                                >
                                  <TypographyMD
                                    variant="h2"
                                    label={`# ${companyAdminDetails?.account_details?.id}`}
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} md={5} align="center" pb={1}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Status")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="14px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid
                                  item
                                  xs={7}
                                  md={7}
                                  display="flex"
                                  justifyContent="flex-end"
                                  pb={0.5}
                                >
                                  <Box
                                    sx={{
                                      backgroundColor:
                                        companyAdminDetails?.account_details?.status === "active"
                                          ? "#4BCE97"
                                          : companyAdminDetails?.account_details?.status === "inactive"
                                            ? "#DFE1E6"
                                            : companyAdminDetails?.account_details?.status === "blocked"
                                              ? "#F87168"
                                              : companyAdminDetails?.account_details?.status === "invited"
                                                ? "#579DFF"
                                                : companyAdminDetails?.account_details?.status === "requested"
                                                  ? "#7E57C2"
                                                  : "#F87168",
                                      width: "fit-content",
                                      padding: "1px 10px",
                                      color: "#172B4D",
                                      borderRadius: "5px",
                                      borderColor: "inherit",
                                      boxShadow: "none",
                                      fontFamily: "Roboto",
                                      letterSpacing: ".5px",
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {companyAdminDetails?.account_details?.status === "active" ? (
                                      <>
                                        <CheckCircleOutline
                                          fontSize="17px"
                                          sx={{ mr: 0.5 }}
                                        />{" "}
                                        {t("Active")}
                                      </>
                                    ) : companyAdminDetails?.account_details?.status === "inactive" ? (
                                      <>
                                        <ToggleOff
                                          fontSize="17px"
                                          sx={{ mr: 0.5 }}
                                        />{" "}
                                        {t("Inactive")}{" "}
                                      </>
                                    ) : companyAdminDetails?.account_details?.status === "blocked" ? (
                                      <>
                                        <Block
                                          fontSize="17px"
                                          sx={{ mr: 0.5 }}
                                        />{" "}
                                        {t("Block")}
                                      </>
                                    ) : companyAdminDetails?.account_details?.status === "invited" ? (
                                      <>
                                        <Email
                                          fontSize="17px"
                                          sx={{ mr: 0.5 }}
                                        />{" "}
                                        {t("Invited")}{" "}
                                      </>
                                    ) : companyAdminDetails?.account_details?.status === "requested" ? (
                                      <>
                                        <Email
                                          fontSize="17px"
                                          sx={{ mr: 0.5 }}
                                        />{" "}
                                        {t("Requested")}{" "}
                                      </>
                                    ) : (
                                      <>
                                        <Block
                                          fontSize="17px"
                                          sx={{ mr: 0.5 }}
                                        />{" "}
                                        {t("Block")}{" "}
                                      </>
                                    )}
                                  </Box>
                                </Grid>

                                <Grid xs={5} md={5} align="center" pb={1}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Registered")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="14px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      <>
                                        <FormatDate
                                          inputDate={
                                            companyAdminDetails?.account_details
                                              ?.registered_on
                                          }
                                        />
                                      </>
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} md={5} align="center" pb={1}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Company Admin")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="14px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails?.account_details
                                        ?.company_admin
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Date of Birth")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={formatDate(companyAdminDetails?.account_details?.dob)}
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>


                                <Grid xs={5} md={5} align="center" pb={1}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Registered Email")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="14px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails?.account_details
                                        ?.registered_email
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} md={5} align="center" pb={1}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Phone No.")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="14px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails?.account_details
                                        ?.phone_no
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>
                              </Grid>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={12} p={0.7}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={12} align="center">
                            <Card
                              sx={{
                                width: "100%",
                                height: "auto",
                                border: "2px solid rgba(9, 30, 66, 0.14)",
                                backgroundColor: "#ffffff",
                                borderRadius: "12px",
                                boxShadow: "none",
                              }}
                            >
                              <CardContent>
                                <Box align="left">
                                  <Grid container spacing={0}>
                                    <Grid xs={8} md={10.1} sm={10} align="left">
                                      <TypographyMD
                                        variant="paragraph"
                                        label={t("User Metrics")}
                                        color="#424242"
                                        marginTop={-1}
                                        marginLeft={-1}
                                        fontFamily="Roboto"
                                        fontSize="16px"
                                        fontWeight={750}
                                        align="right"
                                      />
                                    </Grid>

                                    <Grid xs={4} md={1.9} sm={2} align="right">
                                      <SelectField
                                        graphfilter={true}
                                        value={selectedYear}
                                        onChangeTerm={(e) =>
                                          setSelectedYear(
                                            Number(e.target.value)
                                          )
                                        }
                                        options={years.map((year) => ({
                                          value: year,
                                          label: year,
                                        }))}
                                      />
                                    </Grid>

                                    <Grid xs={12} md={12} sm={12} align="">
                                      <div className="chart-container">
                                        <Chart
                                          options={options}
                                          series={chartSeries}
                                          type="bar"
                                          height={407}
                                        />
                                      </div>
                                    </Grid>
                                  </Grid>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Right Section - company details */}
                  <Grid item xs={12} md={6} p={0.7}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={12} align="center">
                        <Card
                          sx={{
                            width: "100%",
                            height: "auto",
                            border: "2px solid rgba(9, 30, 66, 0.14)",
                            backgroundColor: "#ffffff",
                            borderRadius: "12px",
                            boxShadow: "none",
                          }}
                        >
                          <CardContent>
                            <Box align="left">
                              <Grid container spacing={0} p={0}>
                                <Grid
                                  xs={12}
                                  md={12}
                                  sm={12}
                                  align="left"
                                  p={0.7}
                                >
                                  <TypographyMD
                                    variant="paragraph"
                                    label={t("Company Account Executive Details")}
                                    color="#424242"
                                    marginTop={-1}
                                    marginLeft={-1}
                                    fontFamily="Roboto"
                                    fontSize="16px"
                                    fontWeight={750}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={12} md={12} align="center">


                                  <img
                                    src={companyAdminDetails?.company_details?.company_logo || dummy}
                                    onError={(e) => { e.target.src = dummy }}
                                    width={150}
                                    height={150}
                                    style={{
                                      border: "none",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                    alt="Logo"
                                    crossOrigin="anonymous"
                                  />

                                </Grid>







                                {/* Account Executive Details */}
                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Account Executive Name")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={companyAdminDetails?.account_executive_details?.name || "--"}
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Account Executive Email")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={companyAdminDetails?.account_executive_details?.email || "--"}
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                {/*Acocunt executive DETAILS */}
                                <Grid
                                  xs={12}
                                  md={12}
                                  sm={12}
                                  align="left"
                                  mt={0.5}
                                  mb={0}
                                  p={0.7}
                                >
                                  <TypographyMD
                                    variant="paragraph"
                                    label={t("Company Details")}
                                    color="#424242"
                                    marginTop={-1}
                                    marginLeft={-1}
                                    fontFamily="Roboto"
                                    fontSize="16px"
                                    fontWeight={750}
                                    align="right"
                                  />
                                </Grid>
                                {/* LEGAL DETAILS */}
                                <Grid
                                  xs={12}
                                  md={12}
                                  sm={12}
                                  align="left"
                                  mt={0}
                                  mb={1}
                                  p={0.7}
                                >
                                  <TypographyMD
                                    variant="paragraph"
                                    label={t("Legal Details")}
                                    color="#424242"
                                    marginTop={-1}
                                    marginLeft={-1}
                                    fontFamily="Roboto"
                                    fontSize="16px"
                                    fontWeight={750}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Legal Name")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails?.company_details
                                        ?.legal_name
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Business Sector/Industry")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails?.company_details
                                        ?.business_sector_industry
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Trade No.")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails?.company_details
                                        ?.trade_no
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Business Email")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails?.company_details
                                        ?.business_email
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Business Phone No.")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails?.company_details
                                        ?.business_phone_no
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>



                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("administratorType")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={capitalize(companyAdminDetails?.account_details?.administrator_type)}

                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("primaryColor")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} pb={0.8} style={{ display: "flex", justifyContent: "right", alignItems: "center", gap: 8 }}>
                                  <TypographyMD
                                    variant="h2"
                                    label={companyAdminDetails?.company_details?.primary_color}
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    fontSize="13px"
                                    fontWeight={450}
                                  />
                                  <Box
                                    sx={{
                                      width: 14,
                                      height: 14,
                                      borderRadius: "3px",
                                      backgroundColor: companyAdminDetails?.company_details?.primary_color,
                                      border: "1px solid #ccc",
                                    }}
                                  />
                                </Grid>


                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("secondaryColor")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} pb={0.8} style={{ display: "flex", justifyContent: "right", alignItems: "center", gap: 8 }}>
                                  <TypographyMD
                                    variant="h2"
                                    label={companyAdminDetails?.company_details?.secondary_color}
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    fontSize="13px"
                                    fontWeight={450}
                                  />
                                  <Box
                                    sx={{
                                      width: 14,
                                      height: 14,
                                      borderRadius: "3px",
                                      backgroundColor: companyAdminDetails?.company_details?.secondary_color,
                                      border: "1px solid #ccc",
                                    }}
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("businessActivity")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={companyAdminDetails?.company_details?.business_activity}
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>




                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("adminDocument")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid
                                  xs={7}
                                  pb={0.8}
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-end",
                                    gap: "4px"
                                  }}
                                >
                                  {/* File Row */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <img
                                      src={
                                        getFileType(companyAdminDetails?.company_details?.admin_document_url) === "pdf"
                                          ? pdfIcon
                                          : imageIcon
                                      }
                                      alt="doc-icon"
                                      style={{ width: 20, height: 20 }}
                                    />

                                    <TypographyMD
                                      variant="h2"
                                      label={getFileName(companyAdminDetails?.company_details?.admin_document_url)}
                                      color="#172B4D"
                                      fontFamily="Roboto"
                                      fontSize="12px"
                                      fontWeight={450}
                                    />
                                  </Box>

                                  {/* Show Document Button */}
                                  <button
                                    onClick={() =>
                                      window.open(
                                        companyAdminDetails?.company_details?.admin_document_url,
                                        "_blank"
                                      )
                                    }
                                    style={{
                                      padding: "4px 10px",
                                      borderRadius: "6px",
                                      background: "#1976D2",
                                      color: "#fff",
                                      border: "none",
                                      cursor: "pointer",
                                      fontSize: "11px",
                                    }}
                                  >
                                    {t("viewDocument")}
                                  </button>
                                </Grid>


                                {/* ADDRESS DETAILS */}
                                <Grid
                                  xs={12}
                                  md={12}
                                  sm={12}
                                  align="left"
                                  mt={0.5}
                                  mb={1}
                                  p={0.7}
                                >
                                  <TypographyMD
                                    variant="paragraph"
                                    label={t("Address Details")}
                                    color="#424242"
                                    marginTop={-1}
                                    marginLeft={-1}
                                    fontFamily="Roboto"
                                    fontSize="16px"
                                    fontWeight={750}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Country")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails?.company_address_details?.country ?? "--"
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Community/Province")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails
                                        ?.company_address_details?.community_province ?? "--"
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("City")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails
                                        ?.company_address_details?.city
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Street Address")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails
                                        ?.company_address_details
                                        ?.street_address
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                {/* SUBSCRIPTION DETAILS */}
                                <Grid
                                  xs={12}
                                  md={12}
                                  sm={12}
                                  align="left"
                                  mt={0.5}
                                  mb={1}
                                  p={0.7}
                                >
                                  <TypographyMD
                                    variant="paragraph"
                                    label={t("Subscription Details")}
                                    color="#424242"
                                    marginTop={-1}
                                    marginLeft={-1}
                                    fontFamily="Roboto"
                                    fontSize="16px"
                                    fontWeight={750}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} md={5} align="center" pb={1}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Status")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid
                                  item
                                  xs={7}
                                  md={7}
                                  display="flex"
                                  justifyContent="flex-end"
                                  pb={0.5}
                                >
                                  <Box
                                    sx={{
                                      backgroundColor:
                                        companyAdminDetails
                                          ?.subscription_details?.subscription_status === "paid"
                                          ? "#4BCE97"
                                          : companyAdminDetails
                                            ?.subscription_details?.subscription_status === "active"
                                            ? "#4BCE97"
                                            : companyAdminDetails
                                              ?.subscription_details?.subscription_status === "trial"
                                              ? "#579DFF"
                                              : companyAdminDetails
                                                ?.subscription_details?.subscription_status === "unpaid"
                                                ? "#F87168"
                                                : companyAdminDetails
                                                  ?.subscription_details?.subscription_status ===
                                                  "requested"
                                                  ? "#579DFF"
                                                  : "#F87168",
                                      width: "fit-content",
                                      padding: "1px 10px",
                                      color: "#172B4D",
                                      borderRadius: "5px",
                                      borderColor: "inherit",
                                      boxShadow: "none",
                                      fontFamily: "Roboto",
                                      letterSpacing: ".5px",
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {companyAdminDetails?.subscription_details?.subscription_status === "active" ? (
                                      <>
                                        <CheckCircleOutline
                                          fontSize="17px"
                                          sx={{ mr: 0.5 }}
                                        />{" "}
                                        {t("Active")}
                                      </>
                                    ) : companyAdminDetails
                                      ?.subscription_details?.subscription_status === "invited" ? (
                                      <>
                                        <Email
                                          fontSize="17px"
                                          sx={{ mr: 0.5 }}
                                        />{" "}
                                        {t("Invited")}
                                      </>
                                    ) : companyAdminDetails
                                      ?.subscription_details?.subscription_status === "unpaid" ? (
                                      <>
                                        <Unsubscribe
                                          fontSize="17px"
                                          sx={{ mr: 0.5 }}
                                        />{" "}
                                        {t("Invited")}
                                      </>
                                    ) : companyAdminDetails
                                      ?.subscription_details?.subscription_status === "trial" ? (
                                      <>
                                        <Downloading
                                          fontSize="17px"
                                          sx={{ mr: 0.5 }}
                                        />{" "}
                                        {t("Trial")}
                                      </>
                                    ) : companyAdminDetails
                                      ?.subscription_details?.subscription_status === "requested" ? (
                                      <>
                                        <Email
                                          fontSize="17px"
                                          sx={{ mr: 0.5 }}
                                        />{" "}
                                        {t("Requested")}
                                      </>
                                    ) : (
                                      <>
                                        <Block
                                          fontSize="17px"
                                          sx={{ mr: 0.5 }}
                                        />{" "}
                                        {t("Block")}
                                      </>
                                    )}
                                  </Box>
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Subscription")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={formatSubscription(
                                      companyAdminDetails?.subscription_details?.subscription
                                    )}
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Amount")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={`$ ${companyAdminDetails?.subscription_details?.monthly_fee}`}
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Max Users")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails?.subscription_details?.max_users
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Duration")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      companyAdminDetails?.subscription_details?.duration
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Activation Date - Time")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={formatDate(companyAdminDetails?.subscription_details?.activation_date)}

                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Expiry")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={formatDate(companyAdminDetails?.subscription_details?.expiry)}

                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>

                                {/* Target Zone / Region */}
                                {/* <Grid
                                  xs={12}
                                  md={12}
                                  sm={12}
                                  align="left"
                                  mt={0.5}
                                  mb={1}
                                  p={0.7}
                                >
                                  <TypographyMD
                                    variant="paragraph"
                                    label={t("Target Zone / Region")}
                                    color="#424242"
                                    marginTop={-1}
                                    marginLeft={-1}
                                    fontFamily="Roboto"
                                    fontSize="16px"
                                    fontWeight={750}
                                    align="right"
                                  />
                                </Grid> */}

                                {/* <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label="Company Users" color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="35" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid> */}

                                {/* <Grid xs={5} pb={0.8}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Zone")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid
                                  xs={7}
                                  pb={0.8}
                                  display="flex"
                                  gap={0.7}
                                  flexWrap="wrap"
                                  justifyContent="flex-end"
                                >
                                  {companyAdminDetails?.target_zone_region?.zone?.map(
                                    (region) => (
                                      <Box
                                        key={region}
                                        sx={{
                                          backgroundColor: "#579DFF",
                                          color: "#09326C",
                                          borderRadius: "5px",
                                          px: 1.5,
                                          py: 0.3,
                                          fontSize: "13px",
                                          fontFamily: "Roboto",
                                          fontWeight: 450,
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        {region}
                                      </Box>
                                    )
                                  )}
                                </Grid> */}



                              </Grid>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* different categories action buttons */}
                  <Grid xs={12} p={1}>
                    <Card
                      sx={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "2px solid rgba(9, 30, 66, 0.14)",
                        boxShadow: "none",
                        p: 2,
                      }}
                    >
                      <CardContent
                        sx={{ p: 0, "&:last-child": { paddingBottom: 0 } }}
                      >
                        <Box
                          display="flex"
                          flexWrap={{ xs: "wrap", sm: "nowrap", md: "nowrap" }}
                          alignItems="center"
                          gap={{ xs: 0.5, sm: 0.8, md: 1.5 }}
                          mb={0}
                          overflowX={{ xs: "auto", sm: "auto", md: "visible" }}
                          sx={{
                            "&::-webkit-scrollbar": {
                              height: "4px",
                            },
                            "&::-webkit-scrollbar-track": {
                              backgroundColor: "#f1f1f1",
                              borderRadius: "2px",
                            },
                            "&::-webkit-scrollbar-thumb": {
                              backgroundColor: "#c1c1c1",
                              borderRadius: "2px",
                            },
                            "&::-webkit-scrollbar-thumb:hover": {
                              backgroundColor: "#a8a8a8",
                            },
                          }}
                        >
                          {tabs.map(({ id, label }) => (
                            <Box
                              key={id}
                              onClick={() => setActiveTab(id)}
                              sx={{
                                padding: { xs: "6px 6px", sm: "4px 6px", md: "5px 10px" },
                                cursor: "pointer",
                                color: activeTab === id ? "#006EC2" : "#44546F",
                                borderBottom:
                                  activeTab === id
                                    ? "3px solid #006EC2"
                                    : "3px solid transparent",
                                borderRadius: 0,
                                transition: "border-bottom 0.3s ease",
                                whiteSpace: "nowrap",
                                userSelect: "none",
                                minWidth: { xs: "auto", sm: "auto", md: "fit-content" },
                                flexShrink: 0,
                                flex: { xs: "0 0 auto", sm: "0 0 auto", md: "0 0 auto" },
                                "&:hover": {
                                  backgroundColor: "rgba(0, 110, 194, 0.04)",
                                  borderRadius: "4px",
                                },
                              }}
                            >
                              <Typography
                                variant="body2"
                                component="span"
                                fontWeight={550}
                                fontSize={{ xs: "10px", sm: "11px", md: "12px" }}
                                sx={{
                                  display: "block",
                                  textAlign: "center",
                                }}
                              >
                                {label}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {activeTab === "workers" ? (
                  <Box px={{ xs: 3, md: 0 }} pt={1}>
                    <Box
                      sx={{
                        ml: { xs: 0, md: 3 },
                        mr: { xs: 0, md: 3 },
                        backgroundColor: "white",
                        border: "2px solid rgba(9, 30, 66, 0.14)",
                        borderRadius: "12px",
                        width: { xs: "100%", md: "76vw" },
                        // p: { xs: 1, md: 2 },
                      }}
                    >
                      {/* Header */}
                      <Grid
                        container
                        spacing={0}
                        pb={1}
                        alignItems="center"
                        p={{ xs: 1, md: 2 }}
                      >
                        {/* Title */}
                        <Grid item xs={12} sm={4}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              height: "35px",
                            }}
                          >
                            <TypographyMD
                              variant="paragraph"
                              label={t("Workers")}
                              color="#424242"
                              marginLeft={1}
                              fontFamily="Poppins, sans-serif"
                              fontSize="18px"
                              fontWeight={600}
                            />
                          </Box>
                        </Grid>

                        {/* Search */}
                        <Grid item xs={12} sm={4}>
                          <OutlinedInput
                            autoComplete="off"
                            placeholder={t("Search here...")}
                            sx={{
                              height: "35px",
                              borderRadius: "6px",
                              border: "2px solid rgba(9, 30, 66, 0.14)",
                              backgroundColor: "#fff",
                              fontSize: { xs: "14px", md: "15px" },
                              "&:hover": { borderColor: "#006EC2" },
                              "&.Mui-focused": { borderColor: "#006EC2" },
                              color: "rgba(27, 27, 27, 0.67)",
                              width: { xs: "100%", sm: "100%", md: "240px" },
                              "& fieldset": { border: "none" },
                            }}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton edge="end" size="small">
                                  <SearchIcon sx={{ fontSize: "16px", color: "#222" }} />
                                </IconButton>
                              </InputAdornment>
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: { xs: "flex-start", sm: "flex-end" },
                            }}
                          >

                            <ExportMenuButton
                              onExport={handleExportData}
                              loading={exporting}
                              icon={
                                <img
                                  src={exportIcon}
                                  alt=""
                                  style={{ width: 30 }}
                                />
                              }
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

                      {/* Table */}
                      {tableLoading ? (
                        <Box
                          sx={{
                            height: "20vh",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <CircularProgress
                            size={30}
                            thickness={3}
                            color="primary"
                          />
                        </Box>
                      ) : companyWorkers.length === 0 ? (
                        <Box
                          display={"flex"}
                          flexDirection={"column"}
                          alignItems={"center"}
                          justifyContent="center"
                          py={10}
                        >
                          <img src={nodata} alt="" height={200} />
                          <TypographyMD
                            variant="h2"
                            label={t("No Employees Found!")}
                            color="#A5ADB0"
                            fontFamily="Roboto"
                            fontSize="15px"
                            fontWeight={450}
                            align="center"
                          />
                        </Box>
                      ) : (
                        <TableContainer sx={{ overflowX: "auto" }}>
                          <Table
                            sx={{
                              minWidth: 650,
                              "& .MuiTableCell-root": {
                                padding: { xs: "8px", md: "12px" },
                              },
                              whiteSpace: "nowrap !important",
                            }}
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={selectAll}
                                    onChange={(e) =>
                                      handleCheckboxChange(e, "selectAll")
                                    }
                                  />
                                </TableCell>

                                {[
                                  { label: "Id", key: "id" },
                                  { label: "Employee  Name", key: "first_name" },
                                  { label: "Employee Email", key: "email" },
                                  { label: "Phone No.", key: "phone" },
                                  { label: "Department", key: "department_id" },
                                  { label: "Type", key: "employee_type" },
                                  { label: "Shift", key: "shift_schedule" },
                                  { label: "Registered", key: "created_at" },
                                  { label: "Status", key: "status" },
                                ].map((col) => (
                                  <TableCell
                                    key={col.key}
                                    align="center"
                                    sx={{
                                      cursor: "pointer",
                                      fontWeight: "bold",
                                      color: "#44546F",
                                      fontFamily: "Poppins, sans-serif",
                                      fontSize: "14px",
                                    }}
                                    onClick={() => handleSort(col.key)}
                                  >
                                    {t(col.label)}
                                    <SortIcons
                                      column={col.key}
                                      sortBy={sortBy}
                                      sortOrder={sortOrder}
                                    />
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {companyWorkers.map((item) => (
                                <TableRow hover key={item.id}>
                                  <TableCell
                                    padding="checkbox"
                                    sx={{
                                      fontFamily: "Poppins, sans-serif",
                                      fontWeight: 400,
                                      fontSize: "14px",
                                    }}
                                  >
                                    <Checkbox
                                      checked={selectedRows.includes(item.id)}
                                      onChange={(e) =>
                                        handleCheckboxChange(e, item.id)
                                      }
                                    />
                                  </TableCell>

                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontFamily: "Poppins, sans-serif",
                                      fontWeight: 400,
                                      fontSize: "14px",
                                    }}
                                  >
                                    {item.id}
                                  </TableCell>

                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontFamily: "Poppins, sans-serif",
                                      fontWeight: 400,
                                      fontSize: "14px",
                                    }}
                                  >
                                    {item.first_name} {item.last_name}
                                  </TableCell>

                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontFamily: "Poppins, sans-serif",
                                      fontWeight: 400,
                                      fontSize: "14px",
                                    }}
                                  >
                                    {item.email}
                                  </TableCell>

                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontFamily: "Poppins, sans-serif",
                                      fontWeight: 400,
                                      fontSize: "14px",
                                    }}
                                  >
                                    {item.phone}
                                  </TableCell>

                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontFamily: "Poppins, sans-serif",
                                      fontWeight: 400,
                                      fontSize: "14px",
                                    }}
                                  >
                                    {item.department_id}
                                  </TableCell>

                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontFamily: "Poppins, sans-serif",
                                      fontWeight: 400,
                                      fontSize: "14px",
                                    }}
                                  >
                                    {/* {item.employee_type} */}
                                      {formatText(item.employee_type)}
                                  </TableCell>

                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontFamily: "Poppins, sans-serif",
                                      fontWeight: 400,
                                      fontSize: "14px",
                                    }}
                                  >
                                      {formatText(item.shift_schedule)}
                                  </TableCell>

                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontFamily: "Poppins, sans-serif",
                                      fontWeight: 400,
                                      fontSize: "14px",
                                    }}
                                  >
                                    <FormatDate inputDate={item.created_at} />
                                  </TableCell>

                                  <TableCell
                                    align="center"
                                    sx={{
                                      fontFamily: "Poppins, sans-serif",
                                      fontWeight: 400,
                                      fontSize: "14px",
                                    }}
                                  >
                                    {/* <Box
                                      sx={{
                                        backgroundColor:
                                          item.status === "Active"
                                            ? "rgba(40, 167, 69, 0.14)"
                                            : "rgba(220, 53, 69, 0.14)",
                                        color:
                                          item.status === "Active"
                                            ? "#28A745"
                                            : "#DC3545",
                                        borderRadius: "5px",
                                        px: 1,
                                        fontFamily: "Poppins, sans-serif",
                                        fontWeight: 400,
                                        fontSize: "14px",
                                      }}
                                    >
                                      {item.status}
                                    </Box> */}
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
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>

                          {/* Pagination */}
                          <Box
                            sx={{
                              mt: 1,
                              mb: 1,
                              display: "flex",
                              justifyContent: "center",
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
                          </Box>
                        </TableContainer>
                      )}
                    </Box>
                  </Box>
                ) : activeTab === "attendence" ? (
                  <Attendence id={company_admin_id} />
                ) : activeTab === "task" ? (
                  <Tasks id={company_admin_id} />
                ) : activeTab === "requests" ? (
                  <Request id={company_admin_id} />
                ) : activeTab === "payments" ? (
                  <Payments id={company_admin_id} />
                ) : activeTab === "expenses" ? (
                  <Expenses id={company_admin_id} />
                ) : null}
              </>
            )}
          </Box>
        }
      />
    </>
  );
}

export default CompanyAdminDetails;
