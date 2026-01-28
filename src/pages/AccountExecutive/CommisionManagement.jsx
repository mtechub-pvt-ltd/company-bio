import React, { useEffect, useMemo, useState } from "react";
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
  AvTimer,
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
  HighlightOff,
  History,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  MoreTime,
  MoreVert,
  PendingActions,
  PendingOutlined,
  PersonRemove,
  Report,
  RequestedPage,
  Restaurant,
  Search,
  Star,
  StarBorder,
  StarHalf,
  TwoWheeler,
  Visibility,
} from "@mui/icons-material";
import nopayment from '../../Assets/no-payment.png'
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
import pdfIcon from "../../Assets/pdfIcon.png";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { exportTable } from "../../helper_functions/ExportData";
import UserCard from "../../components/items/Usercard";
import { useSelector } from "react-redux";
import Chart from "react-apexcharts";
import SelectField from "../../components/items/Selectfield";
import { useTranslation } from "react-i18next";
import ExportMenuButton from "../../components/ExportMenuButton";
import DummyStatusMenuButton from "../../components/DummyStatusMenuButton";
import ActionButtons from "../../components/ActionButtons";
import StatusDropdown from "../../components/StatusDropdown";
function CommisionManagement({ user_id }) {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const [currentPage, setCurrentPage] = useState(1);

  const [data, setData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  // get data from api
useEffect(() => {
  const fetchData = async () => {
    console.log("fetchData called"); // Debug: Entry point

    if (!token) {
      console.log("No token found"); // Debug: Missing token
      toast.error("Unauthorized: No token found");
      return;
    }

    try {
      setLoading(true);
      console.log("Loading started"); // Debug: Loading state

      const endpoint = `${url}/super-admin/account-executives/${user_id}/analytics`;
      console.log("Fetching data from:", endpoint); // Debug: Endpoint

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status); // Debug: HTTP status

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Raw result:", result); // Debug: Raw JSON

      if (!result.data) {
        console.log("No data in result"); // Debug: Missing data
        return;
      }

      const { commissions, companies, profile } = result.data;
      console.log("Commissions:", commissions); // Debug: Commissions
      console.log("Companies:", companies); // Debug: Companies
      console.log("Profile:", profile); // Debug: Profile

      // Build company lookup
      const companyMap = {};
      companies.list.forEach((c) => {
        companyMap[c.id] = c;
      });
      console.log("Company map:", companyMap); // Debug: Mapping

      // Format commissions for table
      const formatted = commissions.list.map((item) => ({
        commision_id: item.id,
        company_id: item.company_id,
        company_name: item.company_name,
        country: companyMap[item.company_id]?.country || "N/A",
        subscription: item.subscription_plan,
        subscription_status: item.subscription_status,
        payment_amount: parseFloat(item.amount),
        commision_in_percentage: profile?.commission_rate || "0",
        commission_period: item.commission_period || "-",
        calculation_date: item.calculation_date
          ? formatDate(item.calculation_date)
          : "-",
        paid_date: item.paid_date ? formatDate(item.paid_date) : "-",
        created_at: item.created_at ? formatDate(item.created_at) : "-",
        updated_at: item.updated_at ? formatDate(item.updated_at) : "-",
        date: item.formatted_date,
        status: item.status
          ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
          : "Pending",
      }));

      console.log("Formatted data:", formatted); // Debug: Final table data

      setData(formatted);
    } catch (error) {
      console.error("Fetch error:", error); // Debug: Error details
      toast.error("Failed to load commissions");
    } finally {
      setLoading(false);
      setInitialLoader(false);
      console.log("Loading finished"); // Debug: End of fetch
    }
  };

  fetchData();
}, [token]);

  // Handle checkbox changes

  const handleCheckboxChange = (event, target) => {
    const checked = event.target.checked;

    if (target === "selectAll") {
      setSelectAll(checked);
      if (checked) {
        // Select all on the current page
        const allIds = paginatedData.map((item) => item.commision_id);
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
 const fieldCommonSx = {
  height: "35px",
  borderRadius: "6px",
  border: "2px solid rgba(9, 30, 66, 0.14)",
  backgroundColor: "#fff",
  fontSize: { xs: "14px", md: "15px" },
  "&:hover": {
    borderColor: "#006EC2",   // ✅ consistent hover
  },
  "&.Mui-focused": {
    borderColor: "#006EC2",   // ✅ consistent focus
  },
   color:"rgba(27, 27, 27, 0.67)"
};

  const [searchTerm, setSearchTerm] = useState("");
  const filteredData = data.filter(
    (item) =>
      item.commision_id.toString().includes(searchTerm.toLowerCase()) ||
      item.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recordsPerPage = 7;

  // Calculate data for current page
  const paginatedData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const [sortConfig, setSortConfig] = useState({
    key: "commision_id",
    direction: "desc",
  });

  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key !== columnKey) {
        return { key: columnKey, direction: "asc" }; // default to descending
      }
      return {
        key: columnKey,
        direction: prev.direction === "asc" ? "desc" : "asc",
      };
    });
  };

  const getSortSymbol = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === "asc" ? (
        <ArrowUpward sx={{ fontSize: "17px" }} />
      ) : (
        <ArrowDownward sx={{ fontSize: "17px" }} />
      );
    }
    // For all other columns (not currently sorted), show default ▼ icon
    return <ArrowDownward sx={{ fontSize: "17px" }} />;
  };

  const sortedData = useMemo(() => {
    const sortableItems = [...paginatedData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [paginatedData, sortConfig]);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const [initialLoader, setInitialLoader] = useState(true);

  useEffect(() => {
    // Simulate a 2-second loading time
    const timer = setTimeout(() => {
      setInitialLoader(false);
    }, 1000);

    // Cleanup timeout on unmount
    return () => clearTimeout(timer);
  }, []);


  // Fetch all commissions for export (no pagination)
  const fetchAllCommissions = async () => {
    if (!token) {
      toast.error(t("Unauthorized: No token found"));
      return [];
    }
    try {
      const endpoint = `${url}/super-admin/account-executives/${user_id}/analytics`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch commissions");
      const result = await response.json();
      if (!result.data) return [];
      const { commissions, companies, profile } = result.data;
      // Build company lookup
      const companyMap = {};
      companies.list.forEach((c) => {
        companyMap[c.id] = c;
      });
      // Format commissions for export
      return commissions.list.map((item) => ({
        Id: item.id,
        "Company Name": item.company_name,
        Subscription: item.subscription_plan,
        "Payment Amount": parseFloat(item.amount),
        "Commision %": profile?.commission_rate || "0",
        "Paid Date": item.paid_date ? formatDate(item.paid_date) : "-",
        "Created At": item.created_at ? formatDate(item.created_at) : "-",
        Status: item.status
          ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
          : "Pending",
      }));
    } catch (err) {
      toast.error(t("Failed to fetch commissions for export."));
      return [];
    }
  };

  const handleExportData = async (format) => {
    setExporting(true);
    setExportFormat(format);
    try {
      const allData = await fetchAllCommissions();
      if (!allData.length) {
        toast.error(t("No data available for export."));
        return;
      }
      if (format.toLowerCase() === "pdf") {
        await exportTable(allData, "Commissions", "pdf", { skipColumns: [] });
      } else if (format.toLowerCase() === "excel") {
        await exportTable(allData, "Commissions", "xlsx", { skipColumns: [] });
      } else {
        toast.error(t("Unsupported export format."));
      }
    } catch (err) {
      toast.error(t("Failed to export commissions. Please try again."));
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  const cellStyle = {
    fontWeight: 400,
    color: "#172B4D",
   fontFamily: "Poppins, sans-serif",
    fontSize: "14px",
    maxWidth: "150px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  // Remove: subscription_status, country, calculation_date columns
  // Show status as a badge (Chip)
  const tableColumns = [
    { key: "commision_id", label: "Id" },
    { key: "company_name", label: "Company Name" },
    { key: "subscription", label: "Subscription" },
    { key: "payment_amount", label: "Payment Amount" },
    { key: "commision_in_percentage", label: "Commision %" },
    { key: "paid_date", label: "Paid Date" },
    { key: "created_at", label: "Created At" },
    { key: "status", label: "Status" },
  ];

  return (
    <>
      {initialLoader ? (
        <div
          style={{
            height: "10vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={20} thickness={3} color="primary" />
        </div>
      ) : (
        <>
        
<Grid container spacing={{ xs: 1, sm: 2, md: 3, lg: 4 }} p={{ xs: 1, sm: 2, md: 3, lg: 4 }} pb={1} alignItems="center">
  {/* Title */}
 <Grid item xs={12} sm={12} md={4} lg={4}>
    <Box sx={{ 
      display: "flex", 
      alignItems: "center", 
      height: { xs: "auto", sm: "35px", md: "35px", lg: "40px" },
      minWidth: "fit-content",
      overflow: "visible",
      mb: { xs: 1, sm: 0, md: 0, lg: 0 }
    }}>
      <TypographyMD
        variant="paragraph"
        label={t("Commision Management")}
        color="#424242"
        marginLeft={0}
        fontFamily="Roboto"
        fontSize={{ xs: "16px", sm: "17px", md: "18px", lg: "20px" }}
        fontWeight={600}
        sx={{
          whiteSpace: "nowrap",
          overflow: "visible",
          textOverflow: "unset",
          minWidth: "fit-content"
        }}
      />
    </Box>
  </Grid>

  {/* Search */}
  <Grid item xs={12} sm={12} md={4} lg={4}>
    <Box sx={{ display: "flex", justifyContent: { md: "center", lg: "center" } }}>
      <OutlinedInput
        autoComplete="off"
        placeholder={t("Search here...")}
        sx={{
          ...fieldCommonSx,
          width: "100%",
          maxWidth: { xs: "100%", sm: "100%", md: "300px", lg: "400px" },
          "& fieldset": { border: "none" },
        }}
        endAdornment={
          <InputAdornment position="end">
            <IconButton edge="end" size="small">
              <Search sx={{ fontSize: { xs: "14px", sm: "16px", md: "16px", lg: "18px" }, color: "#222" }} />
            </IconButton>
          </InputAdornment>
        }
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </Box>
  </Grid>

  {/* Actions */}
  <Grid item xs={12} sm={12} md={4} lg={4}>
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row", md: "row", lg: "row" },
        justifyContent: { xs: "flex-start", sm: "flex-start", md: "flex-end", lg: "flex-end" },
        alignItems: { xs: "stretch", sm: "center", md: "center", lg: "center" },
        gap: { xs: 1, sm: 1, md: 1, lg: 2 },
        mt: { xs: 0, sm: 0, md: 0, lg: 0 },
        width: "100%",
        height: { xs: "auto", sm: "35px", md: "35px", lg: "40px" },
      }}
    >
      <ExportMenuButton
        onExport={handleExportData}
        loading={exporting}
        icon={
          exporting ? (
            <CircularProgress size={22} thickness={4} color="primary" />
          ) : (
            <img
              src={exportIcon}
              alt=""
              style={{ width: 28 }}
            />
          )
        }
        options={[
          { label: "PDF", icon: pdfIcon },
          { label: "Excel", icon: csvIcon },
        ]}
        sx={{
          ...fieldCommonSx,
          px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
          textTransform: "capitalize",
          width: { xs: "100%", sm: "auto", md: "auto", lg: "auto" },
          minWidth: { xs: "auto", sm: "100px", md: "100px", lg: "140px" },
          borderStyle: "solid",
          "&:hover": {
            borderColor: "#006EC2",
            backgroundColor: "#fff",
            borderWidth: "2px",
          },
          fontFamily: "Poppins, sans-serif",
          fontSize: { xs: "13px", sm: "14px", md: "15px", lg: "16px" },
          fontWeight: 500,
        }}
      />
    </Box>
  </Grid>
</Grid>


          {(!paginatedData || paginatedData.length === 0) ? (
           <Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent="center" py={10}>
          <img src={nopayment} alt="" height={200} />
          <TypographyMD variant="h2" label={t("No Commissions Found!")} color="#A5ADB0" fontFamily="Roboto" fontSize="15px" fontWeight={450} align="center" />
        </Box>
          ) : (
            <TableContainer
              sx={{
             
                boxShadow: "none",
               
                pt: 1,
              }}
            >
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Table
                  sx={{
                    minWidth: 900,
                    "& .MuiTableCell-root": {
                      padding: "5px",
                    },
                    "& .MuiTableRow-root": {
                      height: "25px",
                    },
                  }}
                  aria-label="scrollable table"
                >
                  <TableHead
                    style={{ fontSize: "13px",}}
                  >
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          sx={{ color: "rgba(9, 30, 66, 0.14)" }}
                          checked={selectAll}
                          indeterminate={false}
                          onChange={(e) => handleCheckboxChange(e, "selectAll")}
                        />
                      </TableCell>
                      {tableColumns.map((col) => (
                        <TableCell
                          key={col.key}
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            color: "#44546F",
                           fontFamily: "Poppins, sans-serif",
                            fontSize: "14px",
                            cursor: "pointer",
                            maxWidth: "150px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          onClick={() => handleSort(col.key)}
                        >
                          {t(col.label)} {getSortSymbol(col.key)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {sortedData.map((item) => (
                      <TableRow hover key={item.commision_id}>
                        <TableCell
                          padding="checkbox"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            sx={{ color: "rgba(9, 30, 66, 0.14)" }}
                            checked={selectedRows.includes(item.commision_id)}
                            onChange={(e) =>
                              handleCheckboxChange(e, item.commision_id)
                            }
                          />
                        </TableCell>
                        {tableColumns.map((col) =>
                          col.key === "status" ? (
                            <TableCell align="center" sx={cellStyle} key={col.key}>
                                  <Box
                                                sx={{
                                                  display: "flex",
                                                  justifyContent: "center",
                                                  alignItems: "center",
                                                  pointerEvents: "none",
                                                }}
                                              >
                                                <StatusDropdown currentStatus={item?.status} />
                                              </Box>
                           
                            </TableCell>
                          ) : (
                            <TableCell align="center" sx={cellStyle} key={col.key}>
                              {col.key === "payment_amount"
                                ? `$ ${item[col.key]}`
                                : item[col.key]}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

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

 
    </>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date)) return "-";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default CommisionManagement;
