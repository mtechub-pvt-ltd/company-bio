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
import {toast} from "react-hot-toast";
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

import UserCard from "../../components/items/Usercard";
import { useSelector } from "react-redux";

import Chart from "react-apexcharts";
import SelectField from "../../components/items/Selectfield";
import { useTranslation } from "react-i18next";
import ExportMenuButton from "../../components/ExportMenuButton";
import DummyStatusMenuButton from "../../components/DummyStatusMenuButton";
import ActionButtons from "../../components/ActionButtons";

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

function Payments({ user_id }) {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

 const fieldCommonSx = {
  height: "35px",
  borderRadius: "6px",
  border: "2px solid rgba(9, 30, 66, 0.14)",
  backgroundColor: "#fff",
  fontSize: { xs: "14px", md: "15px" },
  "&:hover": {
    borderColor: "#006EC2",   // ✅ unified hover
  },
  "&.Mui-focused": {
    borderColor: "#006EC2",   // ✅ unified focus
  },
   color:"rgba(27, 27, 27, 0.67)"
};
  const [data, setData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const token = useSelector((state) => state.auth.token);

  // data from api
  useEffect(() => {
    const fetchPayments = async () => {
      if (!token) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      try {
        setLoading(true);

        const endpoint = `${url}/super-admin/account-executives/${user_id}/analytics`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (!result.data) return;

        const { payments } = result.data;

        // Format payments for table (user-friendly)
        const formatted = payments.list.map((item) => ({
          id: item.id,
          company_id: item.company_id,
          company_name: item.company_name,
          company_email: item.company_email || "-",
          amount: item.amount
            ? Number(item.amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })
            : "-",
          status: item.status
            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
            : "-",
          payment_method: item.payment_method
            ? item.payment_method.charAt(0).toUpperCase() +
              item.payment_method.slice(1)
            : "-",
          transaction_id: item.transaction_id || "-",
          payment_date: formatDate(item.payment_date),
          due_date: formatDate(item.due_date),
          invoice_number: item.invoice_number || "-",
          subscription_period_start: formatDate(item.subscription_period_start),
          subscription_period_end: formatDate(item.subscription_period_end),
          created_at: formatDate(item.created_at),
          updated_at: formatDate(item.updated_at),
          subscription_plan: item.subscription_plan
            ? item.subscription_plan.charAt(0).toUpperCase() +
              item.subscription_plan.slice(1)
            : "-",
        }));

        setData(formatted);
      } catch (error) {
        toast.error("Failed to load payments");
      } finally {
        setLoading(false);
        setInitialLoader(false);
      }
    };

    fetchPayments();
  }, [token]);

  const handleCheckboxChange = (event, target) => {
    const checked = event.target.checked;

    if (target === "selectAll") {
      setSelectAll(checked);
      if (checked) {
        // Select all on the current page
        const allIds = paginatedData.map((item) => item.payment_id);
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

  const [searchTerm, setSearchTerm] = useState("");
  const filteredData = data.filter((item) =>
    (item.payment_method || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recordsPerPage = 7;

  // Calculate data for current page
  const paginatedData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const [sortConfig, setSortConfig] = useState({
    key: "payment_id",
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


  // Export state
  const [exporting, setExporting] = useState(false);

  // Helper: Format date for export
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

  // Fetch all payments for export (no pagination)
  const fetchAllPayments = async () => {
    try {
      if (!token) return [];
      const endpoint = `${url}/super-admin/account-executives/${user_id}/analytics`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return [];
      const result = await response.json();
      if (!result.data) return [];
      const { payments } = result.data;
      return payments.list || [];
    } catch (err) {
      toast.error(t("Failed to fetch all payments for export!"));
      return [];
    }
  };

  // Export handler
  const handleExportData = async (format) => {
    setExporting(true);
    try {
      const allPayments = await fetchAllPayments();
      const data = (allPayments || []).map((item) => ({
        [t("Payment ID")]: displayValue(item.id),
        [t("Company Name")]: displayValue(item.company_name),
        [t("Company Email")]: displayValue(item.company_email),
        [t("Amount (USD)")]: displayValue(item.amount),
        [t("Status")]: displayValue(item.status),
        [t("Method")]: displayValue(item.payment_method),
        [t("Transaction ID")]: displayValue(item.transaction_id),
        [t("Payment Date")]: formatDateForExport(item.payment_date),
        [t("Due Date")]: formatDateForExport(item.due_date),
        [t("Invoice #")]: displayValue(item.invoice_number),
        [t("Sub. Start")]: formatDateForExport(item.subscription_period_start),
        [t("Sub. End")]: formatDateForExport(item.subscription_period_end),
        [t("Created At")]: formatDateForExport(item.created_at),
        [t("Plan")]: displayValue(item.subscription_plan),
      }));
      if (data.length === 0) {
        toast.error(t("No data available to export!"));
        setExporting(false);
        return;
      }
      if (format === "Excel") {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Payments");
        XLSX.writeFile(wb, `payments_${new Date().getTime()}.xlsx`);
      } else if (format === "PDF") {
        const jsPDF = (await import("jspdf")).default;
        const autoTable = (await import("jspdf-autotable")).default;
        const doc = new jsPDF();
        autoTable(doc, {
          head: [Object.keys(data[0])],
          body: data.map((row) => Object.values(row)),
        });
        doc.save(`payments_${new Date().getTime()}.pdf`);
      }
    } catch (err) {
      toast.error(t("Failed to export data!"));
    }
    setExporting(false);
  };

  // Update columns array: remove width property
  const columns = [
    { key: "id", label: "Payment ID" },
    { key: "company_name", label: "Company Name" },
    { key: "company_email", label: "Company Email" },
    { key: "amount", label: "Amount (USD)" },
    { key: "status", label: "Status" },
    { key: "payment_method", label: "Method" },
    { key: "transaction_id", label: "Transaction ID" },
    { key: "payment_date", label: "Payment Date" },
    { key: "due_date", label: "Due Date" },
    { key: "invoice_number", label: "Invoice #" },
    { key: "subscription_period_start", label: "Sub. Start" },
    { key: "subscription_period_end", label: "Sub. End" },
    { key: "created_at", label: "Created At" },
    { key: "subscription_plan", label: "Plan" },
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
        <Box
          sx={{
            width: {
              xs: "100%",
              md: "76vw",
            },
          }}
        >
          {/* ...existing search/filter/export UI... */}
       

<Grid container spacing={0} p={2} pb={1} alignItems="center">
  {/* Title */}
  <Grid item xs={12} sm={4}>
    <Box sx={{ display: "flex", alignItems: "center", height: "35px" }}>
      <TypographyMD
        variant="paragraph"
        label={t("Payments")}
        color="#424242"
        marginLeft={1}
        fontFamily="Roboto"
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
        ...fieldCommonSx,
        width: { xs: "100%", sm: "100%", md: "240px" },
        "& fieldset": { border: "none" },
      }}
      endAdornment={
        <InputAdornment position="end">
          <IconButton edge="end" size="small">
            <Search sx={{ fontSize: "16px", color: "#222" }} />
          </IconButton>
        </InputAdornment>
      }
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </Grid>

  {/* Actions */}
  <Grid item xs={12} sm={4}>
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: { xs: "flex-start", sm: "flex-end" },
        alignItems: { xs: "stretch", sm: "center" },
        gap: { xs: 1.2, sm: 1 },
        mt: { xs: 1, sm: 0 },
        width: "100%",
      }}
    >
  <ExportMenuButton
    onExport={handleExportData}
    icon={
      exporting ? (
        <CircularProgress size={22} thickness={4} color="primary" />
      ) : (
        <img
          src={exportIcon}
          alt=""
          style={{ width: 30 }}
        />
      )
    }
    options={[
      { label: "PDF", icon: pdfIcon },
      { label: "Excel", icon: csvIcon },
    ]}
    loading={exporting}
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
      fontWeight:500
    }}
  />
    </Box>
  </Grid>
</Grid>


          {paginatedData?.length == 0 || undefined || null ? (
           <Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent="center" py={10}>
          <img src={nopayment} alt="" height={200}/>
          <TypographyMD variant="h2" label={t("No Payments Found!")} color="#A5ADB0" fontFamily="Roboto" fontSize="15px" fontWeight={450} align="center" />
        </Box>
          ) : (
            <TableContainer
              sx={{
              
                boxShadow: "none",
                
                pt: 1,
                maxWidth: "100%",
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  tableLayout: "auto",
                  "& .MuiTableCell-root": {
                    padding: "5px",
                  },
                  "& .MuiTableRow-root": {
                    height: "25px",
                  },
                }}
                aria-label="payments table"
              >
                <TableHead
                  style={{ fontSize: "13px", }}
                >
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ width: 40 }}>
                      <Checkbox
                        sx={{ color: "rgba(9, 30, 66, 0.14)" }}
                        checked={selectAll}
                        indeterminate={false}
                        onChange={(e) => handleCheckboxChange(e, "selectAll")}
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        align="center"
                        sx={{
                          fontWeight: "bold",
                          color: "#44546F",
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "14px",
                          cursor: "pointer",
                          whiteSpace: "nowrap !important",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 120,
                        }}
                        onClick={() => handleSort(col.key)}
                      >
                        {t(col.label)}
                        {getSortSymbol(col.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedData.map((item) => (
                    <TableRow hover key={item.id}>
                      <TableCell
                        padding="checkbox"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        sx={{ width: 40 }}
                      >
                        <Checkbox
                          sx={{ color: "rgba(9, 30, 66, 0.14)" }}
                          checked={selectedRows.includes(item.id)}
                          onChange={(e) => handleCheckboxChange(e, item.id)}
                        />
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell
                          key={col.key}
                          align="center"
                          sx={{
                            fontWeight: 400,
                            color: "#172B4D",
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "14px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 120, // same as header
                          }}
                          title={item[col.key]} // show full value on hover
                        >
                          {col.key === "amount"
                            ? `$ ${item[col.key]}`
                            : item[col.key] || "-"}
                        </TableCell>
                      ))}
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
        </Box>
      )}

   
    </>
  );
}

export default Payments;
