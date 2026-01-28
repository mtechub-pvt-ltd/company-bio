import React, { useEffect, useState } from "react";
import SidebarNew from "../components/sidebar/SidebarNew";
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
} from "@mui/material";
import {
  CheckCircleOutline,
  ToggleOff,
  Block,
  Email,
} from "@mui/icons-material";
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined";
import TypographyMD from "../components/items/Typography";

// Import images
import total_users from "../Assets/total_users.png";
import account_executive from "../Assets/account_executive.png";
import company_admin from "../Assets/company_admin.png";
import pro_users from "../Assets/pro_users.png";
import next from "../Assets/next.png";
import AllPinsTabs from "./AllUsersPins"
import nodata from '../Assets/nodata.png';
import CommissionsTable from "../components/CommissionsTable";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";
import StatusDropdown from "../components/StatusDropdown";
import url from "../url";
import UserGrowthChart from "../components/items/UserGrowth";
import RoleCategorization from "../components/items/RoleCategorization";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import LocationBasedChart from "../components/StaticsByCountry";
import CompaniesTable from "../components/CompaniesTable";
import CompanyAdminsCompactTable from "../components/CompanyAdminsCompactTable";
import AccountExecutivePins from "./AccountExecutive/AccountExecutivePins";
import CompanyAdminPins from "./CompanyAdmin/companyAdminPins";
import WorkersPins from "./Workers/WorkersPins";
import MapDataTable from "./DashboardMapTable"
// import { useTranslation } from "react-i18next";
function Dashboard() {
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
  const [initialLoader, setInitialLoader] = useState(true);
  const [noData, setNoData] = useState(false);
  const [latestExecLoading, setLatestExecLoading] = useState(false);
  const [commTableLoading, setCommTableLoading] = useState(false);

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

  // Fetch latest account executives
  useEffect(() => {
    if (!token) return;
    setLatestExecLoading(true);
    const fetchLatestAccountExecutives = async () => {
      try {
        const sort_by = "created_at";
        const sort_order = "DESC";
        const apiURL = `${url}super-admin/account-executives?sort_by=${sort_by}&sort_order=${sort_order}&limit=5`;

        const res = await fetch(apiURL, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Fetch error:", res.status, res.statusText);
          setLatestAccountExecutives([]);
          setLatestExecLoading(false);
          return;
        }

        const data = await res.json();

        if (!data?.error && Array.isArray(data?.data?.account_executives)) {
          const sortedExecutives = data.data.account_executives
            .sort(
              (a, b) =>
                new Date(b.registered || 0) - new Date(a.registered || 0)
            )
            .slice(0, 5);

          const formattedData = sortedExecutives.map((executive) => ({
            name: executive?.full_name || "N/A",
            status: executive?.status || "inactive",
            verification_status: executive?.verification_status || "pending",
            id: executive?.id || 0,
          }));

          setLatestAccountExecutives(formattedData);
        } else {
          setLatestAccountExecutives([]);
        }
      } catch (err) {
        console.error("Error fetching latest account executives:", err);
        setLatestAccountExecutives([]);
      } finally {
        setLatestExecLoading(false);
      }
    };

    fetchLatestAccountExecutives();
  }, [token]);

  // Initial loader effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoader(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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

  // Safe alert handler for development features
  const showDevelopmentAlert = () => {
    alert(t("This feature is under development."));
  };

const [pinData, setPinData] = useState([]);
const [pinDataLoading, setPinDataLoading] = useState(false);

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
                      {/* Dashboard Cards */}
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        p={0.5}
                        sx={{ cursor: "pointer" }}
                        // onClick={() => handleNavigation("/total-users")}
                        onClick={() =>
handleNavigation("/total-users", {
  fromDashboard: true
})
}  
                      >
                        <DashboardCard
                          icon={
                            <img
                              src={total_users}
                              alt="Total Users"
                              style={{ width: "40px", height: "40px" }}
                            />
                          }
                          heading={t("Total Users")}
                          value={cardStatics?.overview?.total_users || "-"}
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        p={0.5}
                        sx={{ cursor: "pointer" }}
onClick={() =>
handleNavigation("/account-executive", {
  fromDashboard: true
})
}                      >
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
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        p={0.5}
                        sx={{ cursor: "pointer" }}
                        // onClick={() => handleNavigation("/company-admin")}
                        onClick={() =>
handleNavigation("/company-admin", {
  fromDashboard: true
})
}  
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
                        />
                      </Grid>

                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        p={0.5}
                        sx={{ cursor: "pointer" }}
                        // onClick={() => handleNavigation("/workers")}
                        onClick={() =>
handleNavigation("/workers", {
  fromDashboard: true
})
}  
                      >
                        <DashboardCard
                          icon={
                            <img
                              src={total_users}
                              alt="Workers"
                              style={{ width: "40px", height: "40px" }}
                            />
                          }
                          heading={t("Workers")}
                          value={cardStatics?.overview?.workers || "-"}
                        />
                      </Grid>

                      {/* Charts */}
                      <Grid item xs={12} md={6} p={0.5}>
                        <UserGrowthChart dashboard={true} />
                      </Grid>

                      <Grid item xs={12} md={6} p={0.5}>
                        <RoleCategorization dashboard={true} />
                      </Grid>



                          <Grid item xs={12}>
                        <Box
                          sx={{
                            backgroundColor: "white",
                            p: 2,
                            borderRadius: "10px",
                            border: "2px solid #E5E7EB",
                          }}
                        >
                         
                          <AllPinsTabs
                            setPinData={(data) => {
                              setPinData(data);
                              setPinDataLoading(false);
                            }}
                            setLoading={setPinDataLoading}
                          />
                        </Box>
                      </Grid>




                          <Grid item xs={12}>
                        <Box
                          sx={{
                            backgroundColor: "white",
                            p: 2,
                            borderRadius: "10px",
                            border: "2px solid #E5E7EB",
                          }}
                        >
                         
                          <MapDataTable data={pinData} loading={pinDataLoading} />
                        </Box>
                      </Grid>
                     
                    </Grid>
                    
                    {/* Company Admins Table with loading state */}
                    <Box
                      sx={{
                        backgroundColor: "white",
                        borderRadius: "14px",
                        mt: 2,
                        ml: 2,
                        mr: 2,
                        overflow: "hidden",
                      }}
                      border="2px solid #E5E7EB"
                    >
                      <CompanyAdminsCompactTable loading={false} />
                    </Box>

                    {/* Bottom Section */}
                    <Grid
                      container
                      spacing={0}
                      sx={{ pt: 1, pl: 2, pr: 2, pb: 3 }}
                    >
                      {/* Biometric Clients */}
                      <Grid
                        item
                        xs={12}
                        md={5}
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
                                  label={t("Account Executive")}
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
                                    style={{ width: "30px", cursor: "pointer" }}
                                    onClick={() =>
                                      handleNavigation("/account-executive")
                                    }
                                  />
                                </div>
                              </Grid>

                              <TableContainer>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>
                                        {t("Executive Name")}
                                      </TableCell>
                                      <TableCell align="center">
                                        {t("Account Status")}
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {latestExecLoading ? (
                                      <TableRow>
                                        <TableCell colSpan={2} align="center">
                                          <CircularProgress size={20} thickness={3} color="primary" />
                                        </TableCell>
                                      </TableRow>
                                    ) : latestAccountExecutives && latestAccountExecutives.length > 0 ? (
                                      latestAccountExecutives.map(
                                        (executive, index) => (
                                          <TableRow
                                            key={executive?.id || index}
                                            hover
                                          >
                                            <TableCell sx={{ fontWeight: 400 }}>
                                              {executive?.name || "N/A"}
                                            </TableCell>
                                            <TableCell align="center">
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  justifyContent: "center",
                                                  alignItems: "center",
                                                  pointerEvents: "none",
                                                }}
                                              >
                                                <StatusDropdown currentStatus={executive?.status} />
                                              </Box>
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )
                                    ) : (
                                      <TableRow>
                                        <TableCell colSpan={2} align="center">
                                          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                            <img src={nodata} alt="No data found" height={60} style={{ marginBottom: 8 }} />
                                            <span style={{ color: '#888', fontSize: 14 }}>{t("No data found")}</span>
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Commission Management */}
                      <Grid
                        item
                        xs={12}
                        md={7}
                        sx={{
                          p: 0.5,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: "white",
                            borderRadius: "14px",
                            border: "2px solid #E5E7EB",
                            overflow: "hidden",
                          }}
                        >
                          <Grid container spacing={0}>
                            <Grid item xs={12} md={6} pt={1} pb={1}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  pl: 2,
                                  gap: 1,
                                }}
                              >
                                <TypographyMD
                                  variant="paragraph"
                                  label={t("Commission Management")}
                                  color="rgb(33, 33, 33)"
                                  fontFamily="'Poppins', sans-serif"
                                  fontSize="18px"
                                />
                                {commTableLoading && (
                                  <CircularProgress
                                    size={16}
                                    thickness={3}
                                    color="primary"
                                  />
                                )}
                              </Box>
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
                                  style={{ width: "30px", cursor: "pointer" }}
                                  onClick={() =>
                                    handleNavigation("/commission-management")
                                  }
                                />
                              </div>
                            </Grid>

                            <Grid item xs={12}>
                              <CommissionsTable
                                filters={{ status: "unpaid" }}
                                onLoadingChange={setCommTableLoading}
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>
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

export default Dashboard;
