import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import SidebarNew from "../../components/sidebar/SidebarNew";
import exportIcon from "../../Assets/export_icon.png";
import menu_icon from "../../Assets/menu_icon.png";
import {
  Avatar,
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
  CloudSync,
  Code,
  ContentCopy,
  Delete,
  Download,
  Edit,
  Email,
  Error,
  FilterAlt,
  FoodBank,
  Group,
  GroupAdd,
  Groups,
  HistoryToggleOff,
  HourglassBottom,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  MoreVert,
  PendingActions,
  Report,
  RequestPage,
  Restaurant,
  Search,
  Star,
  StarBorder,
  StarHalf,
  ToggleOff,
  TwoWheeler,
  Visibility,
} from "@mui/icons-material";
import { formatAmount, getCurrencySymbol } from '../../helper_functions/CurrencyFormate'
import TypographyMD from "../../components/items/Typography";
import confirmation_icon from "../../Assets/confirmation_icon.png";
import company_clients from "../../Assets/company_clients.png";
import earning from "../../Assets/earning.png";
import total_payouts from "../../Assets/total_payouts.png";
import invited_companies from "../../Assets/invited_companies.png";
import companies_request from "../../Assets/companies_request.png";
import back_arrow from "../../Assets/back_arrow.png";
import csvIcon from "../../Assets/csvIcon.png";
import pdfIcon from "../../Assets/pdfIcon.png";
import companyico from '../../Assets/campaign.png'
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
import nousers from '../../Assets/no-user.png'
import UserCard from "../../components/items/Usercard";

import Chart from "react-apexcharts";
import SelectField from "../../components/items/Selectfield";
import { useTranslation } from "react-i18next";
import ExportMenuButton from "../../components/ExportMenuButton";
import DummyStatusMenuButton from "../../components/DummyStatusMenuButton";
import Clients from "./Clients";
import Payments from "./Payments";
import CommisionManagement from "./CommisionManagement";
import { toast, Toaster } from 'react-hot-toast';
import ActionButtons from "../../components/ActionButtons";
import { useSelector } from "react-redux";
import ModalConfirmation from "../../components/items/ModalConfirmation";
import FormatDate from "../../components/FormatDate";
import imageIcon from "../../Assets/imageIcon.png";

const SortIcons = ({ column, sortBy, sortOrder }) => (
  <>
    {sortBy === column && sortOrder === "ASC" ? (
      <ArrowUpward sx={{ fontSize: "17px" }} />
    ) : (
      <ArrowDownward sx={{ fontSize: "17px" }} />
    )}
  </>
);

function AccountExecutiveDetails() {
  const { token, tokenExpiry } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const user_id = searchParams.get("id");

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);



  const [userId, setUserId] = useState("");
  const getUserDetails = async (user_id) => {
    var InsertAPIURL = `${url}user/getById?user_id=${user_id}`;
    await fetch(InsertAPIURL, {
      method: "GET",
      body: JSON.stringify(),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("userDetails", response?.data);
        setUserId(response?.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(7); // default 10 records per page
  const isSortingRef = useRef(false);
  const [sortBy, setSortBy] = useState("full_name");
  const [sortOrder, setSortOrder] = useState("DSC");
  const [userCompanyAquisition, setUserCompanyAquisition] = useState("");

  const getCompanyAquisition = async (
    user_id,
    page = 1,
    sort_by = sortBy,
    sort_order = sortOrder,
    search = ""
  ) => {
    let sortParams = sort_by
      ? `&sort_by=${sort_by}&sort_order=${sort_order}`
      : "";
    var InsertAPIURL = `${url}company-admins/by-account-executive/${user_id}?page=${page}&limit=${limit}&search=${search}${sortParams}&status=trial`;
    await fetch(InsertAPIURL, {
      method: "GET",
      body: JSON.stringify(),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("Company Aquisition", response?.data);
        setUserCompanyAquisition(response?.data?.company_admins);
        setTotalPages(response?.data?.pagination?.pages || 1);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSort = (column) => {
    const newSortOrder =
      sortBy === column && sortOrder === "ASC" ? "DSC" : "ASC";

    isSortingRef.current = true; // Mark sorting in progress

    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const [data, setData] = useState(userCompanyAquisition);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleCheckboxChange = (event, target) => {
    const checked = event.target.checked;

    if (target === "selectAll") {
      setSelectAll(checked);
      if (checked) {
        // Select all on the current page
        const allIds = userCompanyAquisition.map((item) => item.id);
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
  const isPDF = (url) => {
    if (!url) return false;
    return url.toLowerCase().includes(".pdf");
  };
  const getFileName = (url) => url?.split("/").pop() || "--";

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
    console.log("selectedItem", selectedItem);
    console.log("statusToChange", statusToChange);
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
          console.log(response);
          setLoading(false);
          if (response.error) {
            toast.error(t("Something went wrong! Please try again."));
          } else {
            toast.success(t("Status changed successfully"));
            setStatusToChange(null);
            setOpenModalStatusChange(false);

            getCompanyAquisition(user_id);
          }
        })
        .catch((error) => {
          setLoading(false);
          console.error(error);
        });
    }, 1000);
  };
  const [isValidImg, setIsValidImg] = useState(true);
  const [userCardoverview, setUserCardoverview] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [fullAddress, setFullAddress] = useState("");
  const getUserCardOverview = async (user_id) => {
    var InsertAPIURL = `${url}/super-admin/account-executives/${user_id}/analytics`;
    await fetch(InsertAPIURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("Card Counts", response?.data.summary);
        setUserCardoverview(response?.data.summary);
        // Set the profile data to newUser state
        if (response?.data?.profile) {
          setNewUser(response.data.profile);

        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

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


  // Helper to parse "11 Apr, 2025 - 10:30 AM" safely
  const generateLast50Years = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 50 }, (_, i) => currentYear - i);
  };

  const years = generateLast50Years();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [initialData, setInitialData] = useState(
    Array.from({ length: 12 }, () => ({
      Active: 0,
      Trial: 0,
      Inactive: 0,
    }))
  );
  const getPerformanceMetrics = async (user_id) => {
    const InsertAPIURL = `${url}account-executive/${user_id}/performance-metrics?year=${selectedYear}`;
    try {
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      const apiData = result?.data;

      if (Array.isArray(apiData)) {
        const transformed = Array.from({ length: 12 }, (_, i) => {
          const monthData = apiData.find((d) => d.month === i + 1);
          return {
            Active: monthData?.active || 0,
            Trial: monthData?.trial || 0,
            Inactive: monthData?.inactive || 0,
          };
        });
        setInitialData(transformed);
      }
    } catch (error) {
      console.log("Performance Metrics Error:", error);
    }
  };
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
    color: "rgba(27, 27, 27, 0.67)"
  };
  // Chart series
  const series = [
    {
      name: t("Active User"),
      data: initialData.map((m) => m.Active),
    },
    {
      name: t("Trial"),
      data: initialData.map((m) => m.Trial),
    },
    {
      name: t("Inactive"),
      data: initialData.map((m) => m.Inactive),
    },
  ];

  // Chart options
  const options = {
    chart: {
      type: "bar",
      height: 350,
      stacked: false,
      toolbar: { show: false },
    },
    colors: ["#2ECC71", "#F39C12", "#E74C3C"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
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

  const location = useLocation();
  const [newUser, setNewUser] = useState(location.state?.newUser || null);

  const [userRows, setUserRows] = useState([]);

  useEffect(() => {
    if (newUser) {
      setUserRows((prev) => {
        const alreadyExists = prev.some((row) => row.user_id === newUser.id);
        if (alreadyExists) return prev;

        const newRow = {
          profile_image: newUser.profile_image,
          user_id: newUser.id,
          status: newUser.status,
          registered: newUser.registered,
          company_clients: newUser.clients,
          referral_code: newUser.referral_code,
          earning: newUser.earning,
          full_name: newUser.full_name,
          email: newUser.email,
          phone_no: newUser.phone ? newUser.phone : t("Not Provided"),
          region: newUser.region,
        };

        return [...prev, newRow];
      });
    }
  }, [newUser]);

  console.log("newUser", newUser);

  useEffect(() => {
    getUserDetails(user_id);
    getUserCardOverview(user_id);
    getPerformanceMetrics(user_id);
  }, [selectedYear, user_id]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getCompanyAquisition(
        user_id,
        1,
        searchTerm,
        sortBy,
        sortOrder,
        isSortingRef.current
      );

      isSortingRef.current = false; // Reset the flag after fetch
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [sortBy, sortOrder, searchTerm]);

  useEffect(() => {
    if (selectedRows.length !== userCompanyAquisition.length) {
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

  const [activeTab, setActiveTab] = useState("my_clients"); // default tab

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isTabletScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const tabs = [
    // { id: "company_clients", label: t("Client Acquisition") },
    { id: "my_clients", label: t("Clients") },
    { id: "payments", label: t("Payments") },
    { id: "commission_management", label: t("Commission Management") },
  ];

  const handleExportData = (format) => {
    console.log(t("Exporting as"), format);
    // Add actual export logic based on `format` here
  };

  const statusColors = {
    active: "#4BCE97",
    inactive: "#DFE1E6",
    blocked: "#F87168",
    invited: "#579DFF",
    requested: "#7E57C2",
  };

  const statusKey = newUser?.status?.toLowerCase();
  const backgroundColor = statusColors[statusKey] || "#F87168";
  const localizedStatus = t(`status.${statusKey}`); // <--- Translated label
  console.log("LEGAL DOC URL:", newUser?.legal_document_url);
  console.log("isPDF:", isPDF(newUser?.legal_document_url));
  // Export state for company clients
  const [exportingClients, setExportingClients] = useState(false);
  const [exportingClientsFormat, setExportingClientsFormat] = useState(null);

  // Helper: Format date for export (reuse or adjust as needed)
  const formatDateForExport = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  // Helper: Get display value (N/A for empty)
  const displayValue = (value) => (value === undefined || value === null || value === "" ? t("N/A") : value);


  // Fetch all company clients for export (no pagination, use same API as getCompanyAquisition)
  const fetchAllCompanyClients = async () => {
    try {
      // Use a very large limit to get all data in one call
      const sortParams = sortBy ? `&sort_by=${sortBy}&sort_order=${sortOrder}` : "";
      // Remove pagination by setting page=1 and a very high limit
      const InsertAPIURL = `${url}company-admins/by-account-executive/${user_id}?page=1&limit=1000000&search=${searchTerm || ""}${sortParams}&status=trial`;
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      return result?.data?.company_admins || [];
    } catch (err) {
      // Optionally show error toast
      return [];
    }
  };

  // Export handler for company clients
  const handleExportCompanyClients = async (format) => {
    setExportingClients(true);
    setExportingClientsFormat(format);
    try {
      // Fetch all company clients (no pagination)
      const allClients = await fetchAllCompanyClients();
      const data = (allClients || []).map((item) => ({
        ID: displayValue(item.id),
        [t("Admin Name")]: displayValue(item.full_name),
        [t("Admin Email")]: displayValue(item.email),
        [t("Company Name")]: displayValue(item.company_name),
        [t("Country")]: displayValue(item.country),
        [t("Status")]: displayValue(item.status),
        [t("Registered")]: formatDateForExport(item.registered),
      }));

      if (data.length === 0) {
        toast.error(t("No data available to export!"));
        setExportingClients(false);
        setExportingClientsFormat(null);
        return;
      }

      if (format === "Excel") {
        // Excel export (xlsx)
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "CompanyClients");
        XLSX.writeFile(wb, `company_clients_${new Date().getTime()}.xlsx`);
      } else if (format === "PDF") {
        // PDF export (jsPDF + autotable)
        const jsPDF = (await import("jspdf")).default;
        const autoTable = (await import("jspdf-autotable")).default;
        const doc = new jsPDF();
        autoTable(doc, {
          head: [Object.keys(data[0])],
          body: data.map((row) => Object.values(row)),
        });
        doc.save(`company_clients_${new Date().getTime()}.pdf`);
      }
    } catch (err) {
      toast.error(t("Failed to export data!"));
    }
    setExportingClients(false);
    setExportingClientsFormat(null);
  };

  return (
    <>
      <Toaster />
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
                            onClick={() => navigate(-1)}
                            component="img"
                            src={back_arrow}
                            sx={{ width: "30px" }}
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
                              {t("Account Executive")}
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
                              {newUser?.full_name ? newUser?.full_name : "N/A"}
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
                      md={3}
                      align="center"
                      onClick={() => { }}
                      p={0.7}
                    >
                      <UserCard
                        icon={<img src={company_clients} alt="..." style={{ width: 50, height: 50 }} />}
                        heading={t("Invited Clients")}
                        value={userCardoverview?.invited_clients_qty || 0}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={3}
                      align="center"
                      onClick={() => { }}
                      p={0.7}
                    >
                      <UserCard
                        icon={<img src={companies_request} alt="..." style={{ width: 50, height: 50 }} />}
                        heading={t("Clients Requests")}
                        value={userCardoverview?.client_request_qty || 0}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={3}
                      align="center"
                      onClick={() => { }}
                      p={0.7}
                    >
                      <UserCard
                        icon={<img src={invited_companies} alt="..." style={{ width: 50, height: 50 }} />}
                        heading={t("On Trial")}
                        value={userCardoverview?.on_trial_qty || 0}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={3}
                      align="center"
                      onClick={() => { }}
                      p={0.7}
                    >
                      <UserCard
                        icon={<img src={company_clients} alt="..." style={{ width: 50, height: 50 }} />}
                        heading={t("Active Companies")}
                        value={userCardoverview?.active_companies || 0}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={3}
                      align="center"
                      onClick={() => { }}
                      p={0.7}
                    >
                      <UserCard
                        icon={<img src={companyico} alt="..." style={{ width: 50, height: 50 }} />}
                        heading={t("Inactive Companies")}
                        value={userCardoverview?.inactive_companies_qty || 0}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={3}
                      align="center"
                      onClick={() => { }}
                      p={0.7}
                    >
                      <UserCard
                        icon={<img src="/Avatar.png" alt="..." style={{ width: 50, height: 50 }} />}
                        heading={t("Earnings")}
                        value={`${getCurrencySymbol("$")}${formatAmount(userCardoverview?.total_earnings || "0.00")}`}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={3}
                      align="center"
                      onClick={() => { }}
                      p={0.7}
                    >
                      <UserCard
                        icon={<img src={total_payouts} alt="..." style={{ width: 50, height: 50 }} />}
                        heading={t("Pending Earnings")}
                        value={`${getCurrencySymbol("$")}${formatAmount(userCardoverview?.pending_earnings || "0.00")}`}
                      />
                    </Grid>

                    <Grid
                      item
                      xs={12}
                      md={3}
                      align="center"
                      onClick={() => { }}
                      p={0.7}
                    >
                      <UserCard
                        icon={<img src={invited_companies} alt="..." style={{ width: 50, height: 50 }} />}
                        heading={t("Total Commission")}
                        value={userCardoverview?.total_commissions || "0.00"}
                      />
                    </Grid>
                  </Grid>


                  {/* Left Section - details card(6 columns) */}
                  <Grid item xs={12} md={5} p={0.7}>
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
                                  {isValidImg && newUser?.profile_picture ? (
                                    <img
                                      src={newUser.profile_picture}
                                      crossOrigin="anonymous"
                                      alt="User"
                                      style={{
                                        width: 150,
                                        height: 150,
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                      }}
                                      onError={() => setIsValidImg(false)}
                                    />
                                  ) : (
                                    <Avatar
                                      sx={{
                                        borderRadius: "100%",
                                        width: 150,
                                        height: 150,
                                      }}
                                    />


                                  )}


                                </Grid>

                                <Grid xs={5} md={5} align="center" pb={1}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Id")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={newUser?.id ? newUser?.id : "12345"}
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
                                      backgroundColor,
                                      width: "fit-content",
                                      padding: "4px 4px",
                                      color: "#172B4D",
                                      borderRadius: "5px",
                                      borderColor: "inherit",
                                      boxShadow: "none",
                                      fontFamily: "Roboto",
                                      letterSpacing: ".5px",
                                      textTransform: "capitalize",
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: "center"
                                    }}
                                  >
                                    {/* {localizedStatus} */}

                                    {newUser?.status === "active" ? (
                                      <>
                                        <CheckCircleOutline
                                          fontSize="17px"
                                          sx={{ ml: 0.5, mr: 0.5 }}
                                        />{" "}
                                        {t("Active")}
                                      </>
                                    ) : newUser?.status === "inactive" ? (
                                      <>
                                        <ToggleOff
                                          fontSize="17px"
                                          sx={{ ml: 0.5, mr: 0.5 }}
                                        />{" "}
                                        {t("Inactive")}
                                      </>
                                    ) : newUser?.status === "blocked" ? (
                                      <>
                                        <Block
                                          fontSize="17px"
                                          sx={{ ml: 0.5, mr: 0.5 }}
                                        />{" "}
                                        {t("Block")}
                                      </>
                                    ) : newUser?.status === "invited" ? (
                                      <>
                                        <Email
                                          fontSize="17px"
                                          sx={{ ml: 0.5, mr: 0.5 }}
                                        />{" "}
                                        {t("Invited")}
                                      </>
                                    ) : newUser?.status === "requested" ? (
                                      <>
                                        <RequestPage
                                          fontSize="17px"
                                          sx={{ ml: 0.5, mr: 0.5 }}
                                        />{" "}
                                        {t("Requested")}
                                      </>
                                    ) : (
                                      <>
                                        <Block
                                          fontSize="17px"
                                          sx={{ ml: 0.5, mr: 0.5 }}
                                        />{" "}
                                        {t("Block")}
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
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      newUser?.registered ? (
                                        <FormatDate
                                          inputDate={newUser?.registered}
                                        />
                                      ) : (
                                        "11 Apr, 2025 - 10:30 AM"
                                      )
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
                                    label={t("Company Clients")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      newUser?.clients ? newUser?.clients : "5"
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
                                    label={t("referralLink")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                {/* <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      <>
                                        {newUser?.referral_link ? (
                                          <>

                                            {newUser.referral_link.slice(0, 12)}...
                                            <ContentCopy
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard
                                                  .writeText(newUser.referral_link)
                                                  .then(() => {
                                                    toast.success(t("Referral link copied to clipboard!"))
                                                  })
                                                  .catch((err) => {
                                                    toast.error(t("Failed to copy referral link."))
                                                  });
                                              }}
                                              sx={{
                                                ml: 1,
                                                cursor: "pointer",
                                                width: "15px",
                                              }}
                                            />
                                          </>
                                        ) : (
                                          "-"
                                        )}
                                      </>
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />

                                </Grid> */}

                                <Grid xs={7} md={7} pb={0.5}>
                                  <Box
                                    sx={{
                                      border: "1px solid #D0D5DD",
                                      padding: "6px 10px",
                                      borderRadius: "6px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      backgroundColor: "#fff",
                                      cursor: newUser?.referral_link ? "pointer" : "default",
                                      overflow: "hidden",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: "13px",
                                        color: "#172B4D",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        flexGrow: 1,
                                        mr: 1,
                                      }}
                                    >
                                      {newUser?.referral_link || "-"}
                                    </Typography>

                                    {newUser?.referral_link && (
                                      <ContentCopy
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(newUser.referral_link)
                                            .then(() =>
                                              toast.success(t("Referral link copied to clipboard!"))
                                            )
                                            .catch(() =>
                                              toast.error(t("Failed to copy referral link."))
                                            );
                                        }}
                                        sx={{
                                          cursor: "pointer",
                                          width: "16px",
                                          color: "#172B4D",
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Grid>





                                <Grid xs={5} md={5} align="center" pb={1}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("First Name")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      newUser?.first_name
                                        ? newUser?.first_name
                                        : "John"
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
                                    label={t("Middle Name")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      newUser?.middle_name
                                        ? newUser?.middle_name
                                        : "-"
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
                                    label={t("Last Name")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      newUser?.last_name
                                        ? newUser?.last_name
                                        : "Doe"
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
                                    label={t("Date of Birth")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      newUser?.dob
                                        ? <FormatDate inputDate={newUser?.dob} />
                                        : "-"
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
                                    label={t("Companies")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      newUser?.companies && newUser?.companies.length > 0
                                        ? newUser?.companies.map(company => company.name).join(", ")
                                        : "-"
                                    }
                                    color="#172B4D"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="right"
                                  />
                                </Grid>
                                {/* --- Verification Status --- */}
                                <Grid xs={5} md={5} align="center" pb={1}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Verification Status")}
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
                                      backgroundColor: newUser?.verification_status === "verified" ? "#2196F3" : newUser?.verification_status === "pending" ? "#FF9800" : "#F87168",
                                      width: "fit-content",
                                      padding: "4px 4px",
                                      color: "#172B4D",
                                      borderRadius: "5px",
                                      borderColor: "inherit",
                                      boxShadow: "none",
                                      fontFamily: "Roboto",
                                      letterSpacing: ".5px",
                                      textTransform: "capitalize",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {newUser?.verification_status === "verified" ? (
                                      <>
                                        <CheckCircleOutline
                                          fontSize="17px"

                                          sx={{ ml: 0.5, mr: 0.5 }}
                                        />{" "}
                                        {t("Verified")}
                                      </>
                                    ) : newUser?.verification_status === "pending" ? (
                                      <>
                                        <HourglassBottom
                                          fontSize="17px"

                                          sx={{ ml: 0.5, mr: 0.5 }}
                                        />{" "}
                                        {t("Pending")}
                                      </>
                                    ) : newUser?.verification_status === "rejected" ? (
                                      <>
                                        <Block
                                          fontSize="17px"

                                          sx={{ ml: 0.5, mr: 0.5 }}
                                        />{" "}
                                        {t("Rejected")}
                                      </>
                                    ) : (
                                      <>
                                        <Block
                                          fontSize="17px"
                                          sx={{ ml: 0.5, mr: 0.5 }}
                                        />{" "}
                                        {t("Unknown")}
                                      </>
                                    )}
                                  </Box>
                                </Grid>


                                <Grid xs={5} md={5} align="center" pb={1}>
                                  <TypographyMD
                                    variant="h2"
                                    label={t("Email")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      newUser?.email
                                        ? newUser?.email
                                        : "john_doe@gmail.com"
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
                                    label={t("Country")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      newUser?.country
                                        ? newUser?.country
                                        : "-"
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
                                    label={t("Province")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      newUser?.province
                                        ? newUser?.province
                                        : "-"
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
                                    label={t("City")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>

                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      newUser?.city
                                        ? newUser?.city
                                        : "-"
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
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>
                                <Grid xs={7} md={7} align="right" pb={0.5}>
                                  <TypographyMD
                                    variant="h2"
                                    label={
                                      newUser?.phone
                                        ? newUser?.phone
                                        : "023263836388"
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
                                    label={t("streetAddress")}
                                    color="#5E5C5C"
                                    fontFamily="Roboto"
                                    marginLeft={0}
                                    fontSize="13px"
                                    fontWeight={450}
                                    align="left"
                                  />
                                </Grid>



                                <Grid xs={7} pb={0.8} container spacing={0.7}>
                                  {/* {["North America", "South America", "Northern Europe", "Southern Europe"].map((region) => ( */}
                                  <Grid item xs={12} align="right">
                                    {newUser?.street_address ? (
                                      <Box
                                        onClick={() => {
                                          setFullAddress(newUser?.street_address);
                                          setShowAddressModal(true);
                                        }}
                                        sx={{
                                          // backgroundColor: "#579DFF",
                                          color: "#09326C",
                                          borderRadius: "5px",
                                          px: 1.5,
                                          py: 0.3,
                                          fontSize: "13px",
                                          fontFamily: "Roboto",
                                          fontWeight: 450,
                                          textAlign: "right",
                                          whiteSpace: {
                                            xs: "normal",
                                            md: "nowrap",
                                          },
                                          wordWrap: "break-word",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          maxWidth: "100%",
                                          display: "block",
                                          lineHeight: 1.2,
                                          cursor: "pointer",
                                          transition: "all 0.2s ease",

                                        }}
                                        title={t("Click to view full address")}
                                      >
                                        {newUser?.street_address}
                                      </Box>
                                    ) : (
                                      "-"
                                    )}
                                  </Grid>
                                  {/* ))} */}
                                </Grid>




                                <Grid container alignItems="center" pb={0.8}>
                                  {/* Label */}
                                  <Grid item xs={5}>
                                    <TypographyMD
                                      variant="h2"
                                      label={t("legalDocument")}
                                      color="#5E5C5C"
                                      fontFamily="Roboto"
                                      fontSize="13px"
                                      fontWeight={450}
                                      align="left"
                                    />
                                  </Grid>

                                  {/* Document UI */}
                                  <Grid
                                    item
                                    xs={7}
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "flex-end",
                                      gap: "4px"
                                    }}
                                  >
                                    {/* Icon + File Name */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                      <img
                                        src={isPDF(newUser?.legal_document_url) ? pdfIcon : imageIcon}
                                        alt="doc-icon"
                                        style={{ width: 20, height: 20 }}
                                      />

                                      <TypographyMD
                                        variant="h2"
                                        label={getFileName(newUser?.legal_document_url)}
                                        color="#172B4D"
                                        fontFamily="Roboto"
                                        fontSize="12px"
                                        fontWeight={450}
                                      />
                                    </Box>

                                    {/* View Document Button */}
                                    <button
                                      onClick={() =>
                                        window.open(newUser?.legal_document_url, "_blank")
                                      }
                                      style={{
                                        padding: "4px 10px",
                                        borderRadius: "6px",
                                        background: "#006EC2",
                                        color: "#fff",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "11px",
                                      }}
                                    >
                                      {t("viewDocument")}
                                    </button>
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Right Section - Graph */}
                  <Grid item xs={12} md={7} p={0.7}>
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
                                <Grid xs={8} md={10.4} sm={10} align="left">
                                  <TypographyMD
                                    variant="paragraph"
                                    label={t("Performance Metrics")}
                                    color="#424242"
                                    marginTop={-1}
                                    marginLeft={-1}
                                    fontFamily="Roboto"
                                    fontSize="16px"
                                    fontWeight={750}
                                    align="right"
                                  />
                                </Grid>

                                <Grid xs={4} md={1.6} sm={2} align="right">
                                  <SelectField
                                    graphfilter={true}
                                    value={selectedYear}

                                    onChangeTerm={(e) =>
                                      setSelectedYear(Number(e.target.value))
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
                                      series={series}
                                      type="bar"
                                      height={423}
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

                  {/* different categories action buttons */}
                  <Grid xs={12} p={1}>
                    <Card
                      sx={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "2px solid rgba(9, 30, 66, 0.14)",
                        boxShadow: "none",
                        p: { xs: 1, sm: 1.5, md: 2 },
                        overflow: "hidden",
                      }}
                    >
                      <CardContent
                        sx={{ p: 0, "&:last-child": { paddingBottom: 0 } }}
                      >
                        <Box
                          display="flex"
                          flexWrap="wrap"
                          alignItems="center"
                          gap={{ xs: 0.5, sm: 1, md: 1.5 }}
                          mb={0}
                          sx={{
                            overflowX: "auto",
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
                                padding: { xs: "8px 6px", sm: "8px 8px", md: "8px 12px" },
                                cursor: "pointer",
                                color: activeTab === id ? "#006EC2" : "#44546F",
                                borderBottom:
                                  activeTab === id
                                    ? "3px solid #006EC2"
                                    : "3px solid transparent",
                                borderRadius: 0,
                                transition: "all 0.3s ease",
                                whiteSpace: "nowrap",
                                userSelect: "none",
                                minWidth: "fit-content",
                                flexShrink: 0,
                                "&:hover": {
                                  backgroundColor: activeTab === id ? "transparent" : "rgba(0, 110, 194, 0.04)",
                                  borderRadius: "4px",
                                },
                              }}
                            >
                              <Typography
                                variant="body2"
                                component="span"
                                fontWeight={550}
                                fontSize={{ xs: "11px", sm: "12px", md: "13px" }}
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

                <Box
                  sx={{
                    ml: 3,
                    mr: 3,
                    backgroundColor: "white",
                    border: "2px solid rgba(9, 30, 66, 0.14)",
                    borderRadius: "12px",
                  }}
                >
                  {


                    activeTab === "my_clients" ? (
                      <Clients user_id={user_id} />
                    ) : activeTab === "payments" ? (
                      <Payments user_id={user_id} />
                    ) : activeTab === "commission_management" ? (

                      <CommisionManagement user_id={user_id} />
                    ) : null}
                </Box>
              </>
            )}
          </Box>
        }
      />

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
                      label={
                        statusToChange === "active"
                          ? t("Are you sure you want to active this company?")
                          : statusToChange === "inactive"
                            ? t("Are you sure you want to inactive this company?")
                            : statusToChange === "invited"
                              ? t("Are you sure you want to invite this company?")
                              : statusToChange === "requested"
                                ? t("Are you sure you want to send request this company?")
                                : t("Are you sure you want to perform this action?")
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
                      title={t("Cancel")}
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
                          ? t("Active")
                          : statusToChange === "inactive"
                            ? t("Inactive")
                            : statusToChange === "invited"
                              ? t("Invited")
                              : statusToChange === "requested"
                                ? t("Request")
                                : t("Trial")
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

      {/* Address Modal */}
      <Modal
        open={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        aria-labelledby="address-modal-title"
        aria-describedby="address-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "500px", md: "600px" },
            maxHeight: "80vh",
            bgcolor: "background.paper",
            borderRadius: "12px",
            boxShadow: 24,
            p: 3,
            outline: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              id="address-modal-title"
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 600,
                color: "#424242",
                fontFamily: "Roboto",
              }}
            >
              {t("Full Address")}
            </Typography>
            <IconButton
              onClick={() => setShowAddressModal(false)}
              sx={{
                color: "#666",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>

          <Box
            sx={{
              backgroundColor: "#F8F9FA",
              border: "1px solid #E1E5E9",
              borderRadius: "8px",
              p: 2,
              mb: 2,
            }}
          >
            <Typography
              id="address-modal-description"
              sx={{
                fontSize: "14px",
                lineHeight: 1.6,
                color: "#172B4D",
                fontFamily: "Roboto",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {fullAddress}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                navigator.clipboard.writeText(fullAddress);
                toast.success(t("Address copied to clipboard!"));
              }}
              startIcon={<ContentCopy />}
              sx={{
                textTransform: "none",
                fontFamily: "Roboto",
                fontSize: "14px",
              }}
            >
              {t("Copy")}
            </Button>
            <Button
              variant="contained"
              onClick={() => setShowAddressModal(false)}
              sx={{
                textTransform: "none",
                fontFamily: "Roboto",
                fontSize: "14px",
                backgroundColor: "#006EC2",
                "&:hover": {
                  backgroundColor: "#0056A3",
                },
              }}
            >
              {t("Close")}
            </Button>
          </Box>
        </Box>
      </Modal>


    </>
  );
}

export default AccountExecutiveDetails;
