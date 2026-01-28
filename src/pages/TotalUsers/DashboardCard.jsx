import React, { useEffect, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Pagination,
  Button,
  IconButton,
} from "@mui/material";
import {
  CheckCircleOutline,
  ToggleOff,
  Block,
  Email,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined";
import TypographyMD from "../../components/items/Typography";
import StatusDropdown from "../../components/StatusDropdown";
// Import images
import total_users from "../../Assets/total_users.png";
import account_executive from "../../Assets/account_executive.png";
import company_admin from "../../Assets/company_admin.png";
import pro_users from "../../Assets/pro_users.png";
import next from "../../Assets/next.png";

import { useNavigate } from "react-router-dom";
import DashboardCard from "../../components/DashboardCard";

import url from "../../url";

import RoleCategorization from "../../components/items/RoleCategorization";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// import { useTranslation } from "react-i18next";
function DashboardCards() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state?.auth || {});

  // State variables
  const [loading, setLoading] = useState(false);
  const [cardStatics, setCardStatics] = useState({
    overview: {
      total_users: 0,
      account_executives: 0,
      company_admins: 0,
      active_companies: 0,
    },
  });
  const [latestAccountExecutives, setLatestAccountExecutives] = useState([]);
  const [accountExecutivesLoading, setAccountExecutivesLoading] =
    useState(false);
  const [accountExecutivesPage, setAccountExecutivesPage] = useState(1);
  const [accountExecutivesTotal, setAccountExecutivesTotal] = useState(0);
  const [accountExecutivesTotalPages, setAccountExecutivesTotalPages] =
    useState(0);
  const [companyAdmins, setCompanyAdmins] = useState([]);
  const [companyAdminsLoading, setCompanyAdminsLoading] = useState(false);
  const [companyAdminsPage, setCompanyAdminsPage] = useState(1);
  const [companyAdminsTotal, setCompanyAdminsTotal] = useState(0);
  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [workersPage, setWorkersPage] = useState(1);
  const [workersTotal, setWorkersTotal] = useState(0);
  const [workersTotalPages, setWorkersTotalPages] = useState(0);
  const [companyAdminsTotalPages, setCompanyAdminsTotalPages] = useState(0);
  const [initialLoader, setInitialLoader] = useState(true);
  const [noData, setNoData] = useState(false);
  const [selectedTableType, setSelectedTableType] =
    useState("account-executive"); // 'account-executive', 'company-admin', 'workers'

  // Sorting state for each table type
  // Default sorting: A-Z (ascending by name or relevant field)
  const [accountExecutiveSort, setAccountExecutiveSort] = useState({
    sort_by: "full_name",
    sort_order: "ASC",
  });
  const [companyAdminSort, setCompanyAdminSort] = useState({
    sort_by: "company_name",
    sort_order: "ASC",
  });
  const [workersSort, setWorkersSort] = useState({
    sort_by: "first_name",
    sort_order: "ASC",
  });

  // Fetch dashboard statistics
  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);

    fetch(`${url}/super-admin/statistics/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((result) => {
        if (result?.error) {
          console.error("API returned an error:", result.message);
          return;
        }

        if (result?.data) {
          setCardStatics(result.data);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        // Set default values on error
        setCardStatics({
          overview: {
            total_users: 0,
            account_executives: 0,
            company_admins: 0,
            active_companies: 0,
          },
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // Fetch account executives with pagination
  // Default sort: full_name ASC (A-Z)
  const fetchAccountExecutives = async (
    page = 1,
    limit = 10,
    sortBy = "full_name",
    sortOrder = "ASC"
  ) => {
    if (!token) return;

    setAccountExecutivesLoading(true);
    try {
      const apiURL = `${url}super-admin/account-executives?sort_by=${sortBy}&sort_order=${sortOrder}&page=${page}&limit=${limit}`;

      const res = await fetch(apiURL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.log("Account Executives", res);
        console.error("Fetch error:", res.status, res.statusText);
        setLatestAccountExecutives([]);
        return;
      }

      const data = await res.json();
      console.log("Account Executives Data", data);

      if (!data?.error && Array.isArray(data?.data?.account_executives)) {
        const formattedData = data.data.account_executives.map((executive) => ({
          name: executive?.full_name || "N/A",
          email: executive?.email || "N/A",
          status: executive?.status || "inactive",
          dob: executive?.registered
            ? new Date(executive.registered).toLocaleDateString()
            : "N/A",
          verification_status: executive?.verification_status || "pending",
          companies_count: executive?.companies_count ?? "N/A",
          id: executive?.id || 0,
        }));

        setLatestAccountExecutives(formattedData);
        // Use total_count from the response
        const total =
          data?.data?.total_count || data?.data?.pagination?.total || 0;
        const totalPages =
          data?.data?.pagination?.pages || Math.ceil(total / limit);
        setAccountExecutivesTotal(total);
        setAccountExecutivesTotalPages(totalPages);

        // Debug logging
        console.log("Account Executives Data:", {
          total: total,
          currentPage: page,
          limit: limit,
          totalPages: totalPages,
          dataLength: formattedData.length,
        });
      } else {
        setLatestAccountExecutives([]);
      }
    } catch (err) {
      console.error("Error fetching account executives:", err);
      setLatestAccountExecutives([]);
    } finally {
      setAccountExecutivesLoading(false);
    }
  };

  // Fetch company admins with pagination
  const fetchCompanyAdmins = async (
    page = 1,
    limit = 10,
    sortBy = "full_name",
    sortOrder = "ASC"
  ) => {
    if (!token) return;

    setCompanyAdminsLoading(true);
    try {
      const apiURL = `${url}company-admins?sort_by=${sortBy}&sort_order=${sortOrder}&page=${page}&limit=${limit}`;

      const res = await fetch(apiURL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Fetch error:", res.status, res.statusText);
        setCompanyAdmins([]);
        return;
      }

      const data = await res.json();
      console.log("Company Admins Data", data);

      if (!data?.error && Array.isArray(data?.data?.company_admins)) {
        const formattedData = data.data.company_admins.map((admin) => ({
          company_name: admin?.company_name || admin?.trade_name || "N/A",
          admin_name: admin?.full_name || "N/A",
          email:admin?.email||"N/A",
          account_executive_name: admin?.account_executive_name || "N/A",
          status: admin?.status || "inactive",
          id: admin?.id || 0,
        }));

        setCompanyAdmins(formattedData);
        // Use total_count from the response
        const total =
          data?.data?.total_count || data?.data?.pagination?.total || 0;
        const totalPages =
          data?.data?.pagination?.pages || Math.ceil(total / limit);
        setCompanyAdminsTotal(total);
        setCompanyAdminsTotalPages(totalPages);

        // Debug logging
        console.log("Company Admins Data:", {
          total: total,
          currentPage: page,
          limit: limit,
          totalPages: totalPages,
          dataLength: formattedData.length,
        });
      } else {
        setCompanyAdmins([]);
      }
    } catch (err) {
      console.error("Error fetching company admins:", err);
      setCompanyAdmins([]);
    } finally {
      setCompanyAdminsLoading(false);
    }
  };

  // Fetch workers with pagination (no token required)
  const fetchWorkers = async (
    page = 1,
    limit = 10,
    sortBy = "first_name",
    sortOrder = "ASC"
  ) => {
    setWorkersLoading(true);
    try {
      const apiURL = `${url}public/workers?sort_by=${sortBy}&sort_order=${sortOrder}&page=${page}&limit=${limit}`;

      const res = await fetch(apiURL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error("Fetch error:", res.status, res.statusText);
        setWorkers([]);
        return;
      }

      const data = await res.json();
      console.log("Workers Data", data);

      if (!data?.error && Array.isArray(data?.data?.records)) {
        const formattedData = data.data.records.map((worker) => ({
          id: worker?.id || 0,
          name:
            `${worker?.first_name || ""} ${worker?.middle_name || ""} ${worker?.last_name || ""
              }`.trim() || "N/A",
          email: worker?.email || "N/A",
          phone: worker?.phone || "N/A",
          status: worker?.status || "pending",
          dob: worker?.dob ? new Date(worker.dob).toLocaleDateString() : "N/A",
          designation: worker?.designation || "N/A",
          country: worker?.country || "N/A",
          created_at: worker?.created_at || "N/A",
          company_name: worker?.company_name || "N/A",
          account_executive: worker?.account_executive_name || 'N/A'
        }));

        setWorkers(formattedData);
        const total =
          data?.data?.total_count || data?.data?.pagination?.total || 0;
        const totalPages =
          data?.data?.pagination?.pages || Math.ceil(total / limit);
        setWorkersTotal(total);
        setWorkersTotalPages(totalPages);

        // Debug logging
        console.log("Workers Data:", {
          total: total,
          currentPage: page,
          limit: limit,
          totalPages: totalPages,
          dataLength: formattedData.length,
        });
      } else {
        setWorkers([]);
      }
    } catch (err) {
      console.error("Error fetching workers:", err);
      setWorkers([]);
    } finally {
      setWorkersLoading(false);
    }
  };

  // Initial loader effect and load account executives by default
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoader(false);
    }, 3000);

    // Load account executives by default, sorted A-Z
    if (token) {
      fetchAccountExecutives(1, 10, "full_name", "ASC");
    }

    return () => clearTimeout(timer);
  }, [token]);

  // Helper functions for status display
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "active":
        return "#4BCE97";
      case "inactive":
      case "blocked":
        return "#F87168";
      case "requested":
        return "#F5CD47";
      case "pending":
        return "#F5CD47";
      case "email_pending":
        return "#F5CD47";
      case "invited":
        return "#579DFF";
      default:
        return "#ccc";
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || "";
    const iconProps = { fontSize: "17px", sx: { mr: 1 } };

    switch (statusLower) {
      case "active":
        return <CheckCircleOutline {...iconProps} />;
      case "inactive":
        return <ToggleOff {...iconProps} />;
      case "blocked":
        return <Block {...iconProps} />;
      case "requested":
        return <CloudSyncOutlinedIcon {...iconProps} />;
      case "invited":
        return <Email {...iconProps} />;
      default:
        return null;
    }
  };

  // Safe navigation handler
  const handleNavigation = (path, state = null) => {
    try {
      navigate(path, state ? { state } : undefined);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  // Handle Account Executive card click
  const handleAccountExecutiveClick = () => {
    setSelectedTableType("account-executive");
    setAccountExecutivesPage(1); // Reset to page 1
    fetchAccountExecutives(
      1,
      10,
      accountExecutiveSort.sort_by,
      accountExecutiveSort.sort_order
    );
  };

  // Handle Company Admin card click
  const handleCompanyAdminClick = () => {
    setSelectedTableType("company-admin");
    setCompanyAdminsPage(1); // Reset to page 1
    fetchCompanyAdmins(
      1,
      10,
      companyAdminSort.sort_by,
      companyAdminSort.sort_order
    );
  };

  // Handle Workers card click
  const handleWorkersClick = () => {
    setSelectedTableType("workers");
    setWorkersPage(1); // Reset to page 1
    fetchWorkers(1, 10, workersSort.sort_by, workersSort.sort_order);
  };

  // Handle sorting toggle for Name column
  // const handleSortToggle = () => {
  //   if (selectedTableType === 'account-executive') {
  //     const newOrder = accountExecutiveSort.sort_order === 'ASC' ? 'DESC' : 'ASC';
  //     setAccountExecutiveSort({ sort_by: 'full_name', sort_order: newOrder });
  //     setAccountExecutivesPage(1);
  //     fetchAccountExecutives(1, 10, 'full_name', newOrder);
  //   } else if (selectedTableType === 'company-admin') {
  //     const newOrder = companyAdminSort.sort_order === 'ASC' ? 'DESC' : 'ASC';
  //     setCompanyAdminSort({ sort_by: 'company_name', sort_order: newOrder });
  //     setCompanyAdminsPage(1);
  //     fetchCompanyAdmins(1, 10, 'company_name', newOrder);
  //   } else if (selectedTableType === 'workers') {
  //     const newOrder = workersSort.sort_order === 'ASC' ? 'DESC' : 'ASC';
  //     setWorkersSort({ sort_by: 'first_name', sort_order: newOrder });
  //     setWorkersPage(1);
  //     fetchWorkers(1, 10, 'first_name', newOrder);
  //   }
  // };

  const handleSortToggle = (column) => {
    if (selectedTableType === "account-executive") {
      const newOrder =
        accountExecutiveSort.sort_by === column &&
          accountExecutiveSort.sort_order === "ASC"
          ? "DESC"
          : "ASC";
      setAccountExecutiveSort({ sort_by: column, sort_order: newOrder });
      setAccountExecutivesPage(1);
      fetchAccountExecutives(1, 10, column, newOrder);
    } else if (selectedTableType === "company-admin") {
      const newOrder =
        companyAdminSort.sort_by === column &&
          companyAdminSort.sort_order === "ASC"
          ? "DESC"
          : "ASC";
      setCompanyAdminSort({ sort_by: column, sort_order: newOrder });
      setCompanyAdminsPage(1);
      fetchCompanyAdmins(1, 10, column, newOrder);
    } else if (selectedTableType === "workers") {
      const newOrder =
        workersSort.sort_by === column && workersSort.sort_order === "ASC"
          ? "DESC"
          : "ASC";
      setWorkersSort({ sort_by: column, sort_order: newOrder });
      setWorkersPage(1);
      fetchWorkers(1, 10, column, newOrder);
    }
  };

  // Helper functions for dynamic table
  const getCurrentData = () => {
    switch (selectedTableType) {
      case "account-executive":
        return latestAccountExecutives;
      case "company-admin":
        return companyAdmins;
      case "workers":
        return workers;
      default:
        return [];
    }
  };

  const getCurrentLoading = () => {
    switch (selectedTableType) {
      case "account-executive":
        return accountExecutivesLoading;
      case "company-admin":
        return companyAdminsLoading;
      case "workers":
        return workersLoading;
      default:
        return false;
    }
  };

  const getCurrentPagination = () => {
    switch (selectedTableType) {
      case "account-executive":
        return {
          total: accountExecutivesTotal,
          totalPages: accountExecutivesTotalPages,
          page: accountExecutivesPage,
          limit: 10,
          onPageChange: (page) => {
            setAccountExecutivesPage(page);
            fetchAccountExecutives(
              page,
              10,
              accountExecutiveSort.sort_by,
              accountExecutiveSort.sort_order
            );
          },
        };
      case "company-admin":
        return {
          total: companyAdminsTotal,
          totalPages: companyAdminsTotalPages,
          page: companyAdminsPage,
          limit: 10,
          onPageChange: (page) => {
            setCompanyAdminsPage(page);
            fetchCompanyAdmins(
              page,
              10,
              companyAdminSort.sort_by,
              companyAdminSort.sort_order
            );
          },
        };
      case "workers":
        return {
          total: workersTotal,
          totalPages: workersTotalPages,
          page: workersPage,
          limit: 10,
          onPageChange: (page) => {
            setWorkersPage(page);
            fetchWorkers(page, 10, workersSort.sort_by, workersSort.sort_order);
          },
        };
      default:
        return null;
    }
  };

  const getTableTitle = () => {
    switch (selectedTableType) {
      case "account-executive":
        return t("Account Executive");
      case "company-admin":
        return t("Company Admin");
      case "workers":
        return t("Workers");
      default:
        return "";
    }
  };

  const getNavigationPath = () => {
    switch (selectedTableType) {
      case "account-executive":
        return "/account-executive";
      case "company-admin":
        return "/company-admin";
      case "workers":
        return "/workers";
      default:
        return "";
    }
  };

  // Safe alert handler for development features
  const showDevelopmentAlert = () => {
    alert(t("This feature is under development."));
  };

  const location = useLocation();

  const isFromDashboard = location.state?.fromDashboard === true;
  return (
    <SidebarNew
      componentTitle="Dashboard"
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
          {noData ? (
            <div className="empty-container">
              <img
                src="/emptyIcons/cash-wallet.png"
                alt="No data found"
                className="empty-image"
              />

              <p className="empty-paragraph">{t("No Payout Yet!")}</p>
            </div>
          ) : (
            <>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                {isFromDashboard && (
                  <IconButton
                    onClick={() => navigate(-1)}
                    sx={{ color: "#003149" }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={0}>
                <Grid
                  xs={12}
                  md={12}
                  sm={4}
                  p={2}
                  sx={{ display: { xs: "block", md: "none" } }}
                >
                  <TypographyMD
                    variant="paragraph"
                    label={t("Dashboard")}
                    color="#424242"
                    marginLeft={1}
                    fontFamily="'Poppins', sans-serif"
                    fontSize="20px"
                    fontWeight={700}
                    align="center"
                  />
                </Grid>
              </Grid>

              <div>
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
                  </div>
                ) : (
                  <>
                    <Grid container spacing={2} sx={{ pl: 2, pr: 2 }} pt={0}>
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        p={0.5}
                        sx={{ cursor: "pointer" }}
                        onClick={handleAccountExecutiveClick}
                      >
                        <DashboardCard
                          icon={
                            <img
                              src={account_executive}
                              alt="Account Executive"
                              style={{ width: "40px", height: "40px" }}
                            />
                          }
                          heading={t("Account Executive")}
                          value={
                            cardStatics?.overview?.account_executives || "-"
                          }
                          borderColor={
                            selectedTableType === "account-executive"
                              ? "#006EC2"
                              : "#E5E7EB"
                          }
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        p={0.5}
                        sx={{ cursor: "pointer" }}
                        onClick={handleCompanyAdminClick}
                      >
                        <DashboardCard
                          icon={
                            <img
                              src={pro_users}
                              alt="Company Admins"
                              style={{ width: "40px", height: "40px" }}
                            />
                          }
                          heading={t("Company Admins")}
                          value={cardStatics?.overview?.company_admins || "-"}
                          borderColor={
                            selectedTableType === "company-admin"
                              ? "#006EC2"
                              : "#E5E7EB"
                          }
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        p={0.5}
                        sx={{ cursor: "pointer" }}
                        onClick={handleWorkersClick}
                      >
                        <DashboardCard
                          icon={
                            <img
                              src={total_users}
                              alt="Total Workers"
                              style={{ width: "40px", height: "40px" }}
                            />
                          }
                          heading={t("Workers")}
                          value={cardStatics?.overview?.workers || "-"}
                          borderColor={
                            selectedTableType === "workers"
                              ? "#006EC2"
                              : "#E5E7EB"
                          }
                        />
                      </Grid>

                      {/* Charts */}

                      {/* Location Chart
                      <Grid item xs={12} md={12} p={0.7}>
                        <Box
                          sx={{
                            backgroundColor: "white",
                            border: "2px solid rgba(9, 30, 66, 0.14)",
                            borderRadius: "10px",
                          
                          }}
                        >
                          <Card sx={{ boxShadow: "none" }}>
                           
                          </Card>
                        </Box>
                      </Grid> */}
                    </Grid>

                    {/* Companies Table */}
                    {/* <Box
                      sx={{
                       
                        backgroundColor: "white",
                        borderRadius: "14px",
                        mt: 2,
                        ml: 2,
                        mr: 2,
                        overflow: "hidden"
                      }}
                      border="2px solid #E5E7EB"
                    > */}
                    {/* <Box
                        width="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        p={2}
                      >
                        <TypographyMD
                          variant="paragraph"
                          label={t("Company admins")}
                          color="rgb(33, 33, 33)"
                          fontFamily="'Poppins', sans-serif"
                          fontSize="18px"
                        />
                        <img
                          src={next}
                          alt="Navigate"
                          style={{ width: "30px", cursor: "pointer" }}
                          onClick={() => handleNavigation("/company-admin")}
                        />
                      </Box> */}

                    {/* </Box> */}

                    {/* Dynamic Table Section */}
                    {selectedTableType && (
                      <Grid
                        container
                        spacing={0}
                        sx={{ pt: 1, pl: 2, pr: 2, pb: 3 }}
                      >
                        <Grid
                          item
                          xs={12}
                          sx={{
                            p: 0.5,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Card
                            sx={{
                              boxShadow: "none",
                              borderRadius: "10px",
                              flex: 1,
                              border: "2px solid #E5E7EB",
                            }}
                          >
                            <CardContent
                              sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <Grid container spacing={0} sx={{ flex: 1 }}>
                                <Grid item xs={12} md={6} pt={1} pb={1}>
                                  <TypographyMD
                                    variant="paragraph"
                                    label={getTableTitle()}
                                    color="rgb(33, 33, 33)"
                                    marginLeft={2}
                                    fontFamily="'Poppins', sans-serif"
                                    fontSize="18px"
                                  />
                                </Grid>

                                <Grid item xs={12} md={6} pt={1} pb={1} pr={2}>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "flex-end",
                                    }}
                                  >
                                    <img
                                      src={next}
                                      alt="Navigate"
                                      style={{
                                        width: "30px",
                                        cursor: "pointer",
                                      }}
                                      onClick={() =>
                                        handleNavigation(getNavigationPath())
                                      }
                                    />
                                  </div>
                                </Grid>

                                <TableContainer
                                  sx={{
                                    boxShadow: "none",
                                    overflowX: "auto",
                                    pt: 1,
                                  }}
                                >
                                  <Table
                                    sx={{
                                      minWidth: { xs: "100px", md: "250px" },
                                      "& .MuiTableCell-root": {
                                        whiteSpace: "nowrap", // Prevent wrapping
                                      },
                                      "& .MuiTableRow-root": {
                                        height: "25px",
                                      },
                                      whiteSpace: "nowrap !important",
                                    }}
                                    aria-label="simple table"
                                  >
                                    <TableHead style={{ fontSize: "13px" }}>
                                      <TableRow>
                                        {/* Account Executive & Workers - Name Column */}
                                        {(selectedTableType ===
                                          "account-executive" ||
                                          selectedTableType === "workers") && (
                                            <TableCell
                                              align="left"
                                              onClick={() =>
                                                handleSortToggle(
                                                  selectedTableType ===
                                                    "account-executive"
                                                    ? "full_name"
                                                    : "first_name"
                                                )
                                              }
                                              sx={{
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                color: "#44546F",
                                                fontFamily: "Poppins, sans-serif",
                                                fontSize: "14px",
                                                "&:hover": {
                                                  backgroundColor:
                                                    "rgba(0, 110, 194, 0.05)",
                                                },
                                              }}
                                            >
                                              <Box
                                                display="inline-flex"
                                                alignItems="center"
                                                gap={0.5}
                                              >
                                                {t("Name")}
                                                {((selectedTableType ===
                                                  "account-executive" &&
                                                  accountExecutiveSort.sort_by ===
                                                  "full_name") ||
                                                  (selectedTableType ===
                                                    "workers" &&
                                                    workersSort.sort_by ===
                                                    "first_name")) &&
                                                  ((selectedTableType ===
                                                    "account-executive"
                                                    ? accountExecutiveSort.sort_order
                                                    : workersSort.sort_order) ===
                                                    "ASC" ? (
                                                    <ArrowUpward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ) : (
                                                    <ArrowDownward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ))}
                                              </Box>
                                            </TableCell>
                                          )}
                                        {(selectedTableType === "workers") && (
                                          <TableCell
                                            align="left"
                                            onClick={() =>
                                              handleSortToggle(
                                                selectedTableType ===
                                                  "workers"
                                                  ? "company_name"
                                                  : "company_name"
                                              )
                                            }
                                            sx={{
                                              cursor: "pointer",
                                              fontWeight: "bold",
                                              color: "#44546F",
                                              fontFamily: "Poppins, sans-serif",
                                              fontSize: "14px",
                                              "&:hover": {
                                                backgroundColor:
                                                  "rgba(0, 110, 194, 0.05)",
                                              },
                                            }}
                                          >
                                            <Box
                                              display="inline-flex"
                                              alignItems="center"
                                              gap={0.5}
                                            >
                                              {t("Company Name")}
                                              {(
                                                (selectedTableType ===
                                                  "workers" &&
                                                  workersSort.sort_by ===
                                                  "company_name")) &&
                                                ((selectedTableType ===
                                                  "account-executive"
                                                  ? accountExecutiveSort.sort_order
                                                  : workersSort.sort_order) ===
                                                  "ASC" ? (
                                                  <ArrowUpward
                                                    sx={{ fontSize: "16px" }}
                                                  />
                                                ) : (
                                                  <ArrowDownward
                                                    sx={{ fontSize: "16px" }}
                                                  />
                                                ))}
                                            </Box>
                                          </TableCell>
                                        )}
                                        {selectedTableType === "workers" && (
                                          <TableCell
                                            align="left"
                                            onClick={() =>
                                              handleSortToggle(
                                                "account_executive_name"
                                              )
                                            }
                                            sx={{
                                              cursor: "pointer",
                                              fontWeight: "bold",
                                              color: "#44546F",
                                              fontFamily: "Poppins, sans-serif",
                                              fontSize: "14px",
                                              "&:hover": {
                                                backgroundColor:
                                                  "rgba(0, 110, 194, 0.05)",
                                              },
                                            }}
                                          >
                                            <Box
                                              display="inline-flex"
                                              alignItems="center"
                                              gap={0.5}
                                            >
                                              {t("Account Executive")}
                                              {selectedTableType === "workers" &&
                                                workersSort.sort_by ===
                                                "account_executive_name" &&
                                                (workersSort.sort_order ===
                                                  "ASC" ? (
                                                  <ArrowUpward
                                                    sx={{ fontSize: "16px" }}
                                                  />
                                                ) : (
                                                  <ArrowDownward
                                                    sx={{ fontSize: "16px" }}
                                                  />
                                                ))}
                                            </Box>
                                          </TableCell>
                                        )}

                                        {/* Company Admin - Company Name Column */}
                                        {selectedTableType ===
                                          "company-admin" && (
                                            <TableCell
                                              align="left"
                                              onClick={() =>
                                                handleSortToggle("company_name")
                                              }
                                              sx={{
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                color: "#44546F",
                                                fontFamily: "Poppins, sans-serif",
                                                fontSize: "14px",
                                                "&:hover": {
                                                  backgroundColor:
                                                    "rgba(0, 110, 194, 0.05)",
                                                },
                                              }}
                                            >
                                              <Box
                                                display="inline-flex"
                                                alignItems="center"
                                                gap={0.5}
                                              >
                                                {t("Company Name")}
                                                {companyAdminSort.sort_by ===
                                                  "company_name" &&
                                                  (companyAdminSort.sort_order ===
                                                    "ASC" ? (
                                                    <ArrowUpward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ) : (
                                                    <ArrowDownward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ))}
                                              </Box>
                                            </TableCell>
                                          )}

                                        {/* Company Admin - Admin Name Column */}
                                        {selectedTableType ===
                                          "company-admin" && (
                                            <TableCell
                                              align="left"
                                              onClick={() =>
                                                handleSortToggle("admin_name")
                                              }
                                              sx={{
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                color: "#44546F",
                                                fontFamily: "Poppins, sans-serif",
                                                fontSize: "14px",
                                              }}
                                            >
                                              <Box
                                                display="inline-flex"
                                                alignItems="center"
                                                gap={0.5}
                                              >
                                                {t("Admin Name")}
                                                {companyAdminSort.sort_by ===
                                                  "admin_name" &&
                                                  (companyAdminSort.sort_order ===
                                                    "ASC" ? (
                                                    <ArrowUpward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ) : (
                                                    <ArrowDownward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ))}
                                              </Box>
                                            </TableCell>
                                          )}

                                        {/* Company Admin - Account Executive Column */}
                                        {selectedTableType ===
                                          "company-admin" && (
                                            <TableCell
                                              align="left"
                                              onClick={() =>
                                                handleSortToggle(
                                                  "account_executive"
                                                )
                                              }
                                              sx={{
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                color: "#44546F",
                                                fontFamily: "Poppins, sans-serif",
                                                fontSize: "14px",
                                              }}
                                            >
                                              <Box
                                                display="inline-flex"
                                                alignItems="center"
                                                gap={0.5}
                                              >
                                                {t("Account Executive")}
                                                {companyAdminSort.sort_by ===
                                                  "account_executive" &&
                                                  (companyAdminSort.sort_order ===
                                                    "ASC" ? (
                                                    <ArrowUpward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ) : (
                                                    <ArrowDownward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ))}
                                              </Box>
                                            </TableCell>
                                          )}

                                        {/* Other Tables - Email Column */}
                                        {selectedTableType !==
                                          "company-admin" && (
                                            <TableCell
                                              align="center"
                                              onClick={() =>
                                                handleSortToggle("email")
                                              }
                                              sx={{
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                color: "#44546F",
                                                fontFamily: "Poppins, sans-serif",
                                                fontSize: "14px",
                                              }}
                                            >
                                              <Box
                                                display="inline-flex"
                                                alignItems="center"
                                                gap={0.5}
                                              >
                                                {t("Email")}
                                                {((selectedTableType ===
                                                  "account-executive" &&
                                                  accountExecutiveSort.sort_by ===
                                                  "email") ||
                                                  (selectedTableType ===
                                                    "workers" &&
                                                    workersSort.sort_by ===
                                                    "email")) &&
                                                  ((selectedTableType ===
                                                    "account-executive"
                                                    ? accountExecutiveSort.sort_order
                                                    : workersSort.sort_order) ===
                                                    "ASC" ? (
                                                    <ArrowUpward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ) : (
                                                    <ArrowDownward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ))}
                                              </Box>
                                            </TableCell>
                                          )}

                                        {/* Account Executive - QTY Companies Column */}
                                        {selectedTableType ===
                                          "account-executive" && (
                                            <TableCell
                                              align="center"
                                              onClick={() =>
                                                handleSortToggle("qty_companies")
                                              }
                                              sx={{
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                color: "#44546F",
                                                fontFamily: "Poppins, sans-serif",
                                                fontSize: "14px",
                                              }}
                                            >
                                              <Box
                                                display="inline-flex"
                                                alignItems="center"
                                                gap={0.5}
                                              >
                                                {t("QTY Active Companies")}
                                                {accountExecutiveSort.sort_by ===
                                                  "qty_companies" &&
                                                  (accountExecutiveSort.sort_order ===
                                                    "ASC" ? (
                                                    <ArrowUpward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ) : (
                                                    <ArrowDownward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ))}
                                              </Box>
                                            </TableCell>
                                          )}

                                        {/* Status Column */}
                                        <TableCell
                                          align="center"
                                          onClick={() =>
                                            handleSortToggle("status")
                                          }
                                          sx={{
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            color: "#44546F",
                                            fontFamily: "Poppins, sans-serif",
                                            fontSize: "14px",
                                          }}
                                        >
                                          <Box
                                            display="inline-flex"
                                            alignItems="center"
                                            gap={0.5}
                                          >
                                            {t("Status")}
                                            {((selectedTableType ===
                                              "account-executive" &&
                                              accountExecutiveSort.sort_by ===
                                              "status") ||
                                              (selectedTableType ===
                                                "workers" &&
                                                workersSort.sort_by ===
                                                "status") ||
                                              (selectedTableType ===
                                                "company-admin" &&
                                                companyAdminSort.sort_by ===
                                                "status")) &&
                                              ((selectedTableType ===
                                                "company-admin"
                                                ? companyAdminSort.sort_order
                                                : selectedTableType ===
                                                  "account-executive"
                                                  ? accountExecutiveSort.sort_order
                                                  : workersSort.sort_order) ===
                                                "ASC" ? (
                                                <ArrowUpward
                                                  sx={{ fontSize: "16px" }}
                                                />
                                              ) : (
                                                <ArrowDownward
                                                  sx={{ fontSize: "16px" }}
                                                />
                                              ))}
                                          </Box>
                                        </TableCell>

                                        {/* Other Tables - DOB Column */}
                                        {selectedTableType !==
                                          "company-admin" && (
                                            <TableCell
                                              align="center"
                                              onClick={() =>
                                                handleSortToggle("dob")
                                              }
                                              sx={{
                                                cursor: "pointer",
                                                fontWeight: "bold",
                                                color: "#44546F",
                                                fontFamily: "Poppins, sans-serif",
                                                fontSize: "14px",
                                              }}
                                            >
                                              <Box
                                                display="inline-flex"
                                                alignItems="center"
                                                gap={0.5}
                                              >
                                                {t("DOB")}
                                                {((selectedTableType ===
                                                  "account-executive" &&
                                                  accountExecutiveSort.sort_by ===
                                                  "dob") ||
                                                  (selectedTableType ===
                                                    "workers" &&
                                                    workersSort.sort_by ===
                                                    "dob")) &&
                                                  ((selectedTableType ===
                                                    "account-executive"
                                                    ? accountExecutiveSort.sort_order
                                                    : workersSort.sort_order) ===
                                                    "ASC" ? (
                                                    <ArrowUpward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ) : (
                                                    <ArrowDownward
                                                      sx={{ fontSize: "16px" }}
                                                    />
                                                  ))}
                                              </Box>
                                            </TableCell>
                                          )}
                                      </TableRow>
                                    </TableHead>

                                    <TableBody>
                                      {getCurrentLoading() ? (
                                        <TableRow>
                                          <TableCell
                                            colSpan={
                                              selectedTableType ===
                                                "workers"
                                                ? 6
                                                : selectedTableType ===
                                                  "company-admin"
                                                  ? 4
                                                  : 5
                                            }
                                            align="center"
                                          >
                                            <CircularProgress size={20} />
                                          </TableCell>
                                        </TableRow>
                                      ) : getCurrentData() &&
                                        getCurrentData().length > 0 ? (
                                        getCurrentData().map((item, index) => (

                                          <TableRow
                                            key={item?.id || index}
                                            hover
                                          >
                                            {/* Company Admin Table - Company Name Cell */}
                                            {selectedTableType ===
                                              "company-admin" && (
                                                <TableCell
                                                  align="left"
                                                  sx={{
                                                    fontWeight: 400,
                                                    color: "#172B4D",
                                                    fontFamily:
                                                      "Poppins, sans-serif",
                                                    fontSize: "14px",
                                                    maxWidth: "100px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                >
                                                  {item?.company_name || "N/A"}
                                                </TableCell>
                                              )}

                                            {/* Company Admin Table - Admin Name Cell */}
                                            {selectedTableType ===
                                              "company-admin" && (
                                                <TableCell
                                                  align="left"
                                                  sx={{
                                                    fontWeight: 400,
                                                    color: "#172B4D",
                                                    fontFamily:
                                                      "Poppins, sans-serif",
                                                    fontSize: "14px",
                                                    maxWidth: "100px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                >
                                                  {/* {item?.admin_name || "--"}
                                                   */}
                                      {item?.admin_name && item.admin_name.trim().length > 0
                                           ? item.admin_name : "N/A"}
                                                </TableCell>
                                              )}

                                            {/* Company Admin Table - Account Executive Name Cell */}
                                            {selectedTableType ===
                                              "company-admin" && (
                                                <TableCell
                                                  align="left"
                                                  sx={{
                                                    fontWeight: 400,
                                                    color: "#172B4D",
                                                    fontFamily:
                                                      "Poppins, sans-serif",
                                                    fontSize: "14px",
                                                    maxWidth: "100px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                >
                                                  {item?.account_executive_name ||
                                                    "N/A"}
                                                </TableCell>
                                              )}




                                            {/* Company Admin Table - Status Cell */}
                                            {selectedTableType ===
                                              "company-admin" && (
                                                <TableCell
                                                  align="center"
                                                  sx={{
                                                    fontWeight: 400,
                                                    color: "#172B4D",
                                                    fontFamily:
                                                      "Poppins, sans-serif",
                                                    fontSize: "14px",
                                                    maxWidth: "100px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                >
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      justifyContent: "center",
                                                      alignItems: "center",
                                                      pointerEvents: "none",
                                                    }}
                                                  >
                                                    <StatusDropdown
                                                      currentStatus={item?.status}
                                                    />
                                                  </Box>
                                                </TableCell>
                                              )}

                                            {/* Account Executive and Workers Tables - Name Cell */}
                                            {(selectedTableType ===
                                              "account-executive" ||
                                              selectedTableType ===
                                              "workers") && (
                                                <TableCell
                                                  align="left"
                                                  sx={{
                                                    fontWeight: 400,
                                                    color: "#172B4D",
                                                    fontFamily:
                                                      "Poppins, sans-serif",
                                                    fontSize: "14px",
                                                    maxWidth: "100px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                >
                                                  {item?.name || "N/A"}
                                                </TableCell>
                                              )}
                                            {(
                                              selectedTableType ===
                                              "workers") && (
                                                <TableCell
                                                  align="left"
                                                  sx={{
                                                    fontWeight: 400,
                                                    color: "#172B4D",
                                                    fontFamily:
                                                      "Poppins, sans-serif",
                                                    fontSize: "14px",
                                                    maxWidth: "100px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                >
                                                  {item?.company_name || "N/A"}
                                                </TableCell>

                                              )}



                                            {(
                                              selectedTableType ===
                                              "workers") && (
                                                <TableCell
                                                  align="left"
                                                  sx={{
                                                    fontWeight: 400,
                                                    color: "#172B4D",
                                                    fontFamily:
                                                      "Poppins, sans-serif",
                                                    fontSize: "14px",
                                                    maxWidth: "100px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                >
                                                  {item?.account_executive || "N/A"}
                                                </TableCell>

                                              )}





                                            {/* Account Executive and Workers Tables - Email Cell */}
                                            {(selectedTableType ===
                                              "account-executive" ||
                                              selectedTableType ===
                                              "workers") && (
                                                <TableCell
                                                  align="center"
                                                  sx={{
                                                    fontWeight: 400,
                                                    color: "#172B4D",
                                                    fontFamily:
                                                      "Poppins, sans-serif",
                                                    fontSize: "14px",
                                                    maxWidth: "100px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                >
                                                  {item?.email || "N/A"}
                                                </TableCell>
                                              )}

                                            {/* Account Executive Table - QTY Companies Cell */}
                                            {selectedTableType ===
                                              "account-executive" && (
                                                <TableCell
                                                  align="center"
                                                  sx={{
                                                    fontWeight: 400,
                                                    color: "#172B4D",
                                                    fontFamily:
                                                      "Poppins, sans-serif",
                                                    fontSize: "14px",
                                                    maxWidth: "100px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                >
                                                  {item?.companies_count ?? "0"}
                                                </TableCell>
                                              )}

                                            {/* Account Executive and Workers Tables - Status Cell */}
                                            {(selectedTableType ===
                                              "account-executive" ||
                                              selectedTableType ===
                                              "workers") && (
                                                <TableCell
                                                  align="center"
                                                  sx={{
                                                    fontWeight: 400,
                                                    color: "#172B4D",
                                                    fontFamily:
                                                      "Poppins, sans-serif",
                                                    fontSize: "14px",
                                                    maxWidth: "100px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                >
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      justifyContent: "center",
                                                      alignItems: "center",
                                                      pointerEvents: "none",
                                                    }}
                                                  >
                                                    <StatusDropdown
                                                      currentStatus={item?.status}
                                                    />
                                                  </Box>
                                                </TableCell>
                                              )}

                                            {/* Account Executive and Workers Tables - DOB Cell */}
                                            {(selectedTableType ===
                                              "account-executive" ||
                                              selectedTableType ===
                                              "workers") && (
                                                <TableCell
                                                  align="center"
                                                  sx={{
                                                    fontWeight: 400,
                                                    color: "#172B4D",
                                                    fontFamily:
                                                      "Poppins, sans-serif",
                                                    fontSize: "14px",
                                                    maxWidth: "100px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                  }}
                                                >
                                                  {item?.dob || "N/A"}
                                                </TableCell>
                                              )}
                                          </TableRow>
                                        ))
                                      ) : (
                                        <TableRow>
                                          <TableCell
                                            colSpan={
                                              selectedTableType === "workers"
                                                ? 6
                                                : selectedTableType ===
                                                  "company-admin"
                                                  ? 4
                                                  : 5
                                            }
                                            align="center"
                                          >
                                            No data available
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </TableContainer>

                                {/* Dynamic Pagination Controls */}
                                {getCurrentPagination() && (
                                  <>
                                    <div
                                      style={{
                                        marginTop: "10px",
                                        marginBottom: "10px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignContent: "center",
                                      }}
                                    ></div>
                                    <Box
                                      mt={2}
                                      display="flex"
                                      justifyContent="center"
                                      alignItems="center"
                                      sx={{
                                        width: "100%",
                                        padding: "10px 0",
                                      }}
                                    >
                                      <Pagination
                                        count={
                                          getCurrentPagination().totalPages ||
                                          Math.ceil(
                                            getCurrentPagination().total /
                                            getCurrentPagination().limit
                                          )
                                        }
                                        page={getCurrentPagination().page}
                                        onChange={(event, page) => {
                                          getCurrentPagination().onPageChange(
                                            page
                                          );
                                        }}
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
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </Box>
      }
    />
  );
}

export default DashboardCards;
