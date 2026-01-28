import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import { toast } from "react-hot-toast";
import url from "../../url";
import FormatDate from "../../components/FormatDate";
import TypographyMD from "../../components/items/Typography";
import { formatAmount, getCurrencySymbol } from "../../helper_functions/CurrencyFormate";
import csvIcon from "../../Assets/csvIcon.png";
import pdfIcon from "../../Assets/pdfIcon.png";
import exportIcon from "../../Assets/export_icon.png";
import ExportMenuButton from "../../components/ExportMenuButton";
import nopayment from '../../Assets/no-payment.png'
function Payments({id}) {
  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [initialLoader, setInitialLoader] = useState(true);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const recordsPerPage = 7;

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

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${url}/company-admins/${id}/data`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        const paymentsObj = result.data?.data?.payments?.recent_activity || [];
        const transformed = paymentsObj.map((item, idx) => ({
          id: idx + 1,
          type: item.type,
          payment_date: item.payment_date,
          payment_count: item.payment_count,
          total_amount: item.total_amount,
          currency: item.currency,
        }));
        setData(transformed);
       
      } catch (err) {
      
      toast.error("Something went wrong! Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPayments();
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoader(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleCheckboxChange = (e, target) => {
    const checked = e.target.checked;
    if (target === "selectAll") {
      setSelectAll(checked);
      setSelectedRows(checked ? paginatedData.map((item) => item.id) : []);
    } else {
      setSelectedRows((prev) => (checked ? [...prev, target] : prev.filter((id) => id !== target)));
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.currency?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);
  const handlePageChange = (_, value) => setCurrentPage(value);

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: "payment_date", direction: "desc" });
  const handleSort = (key) =>
    setSortConfig((prev) => (prev.key !== key ? { key, direction: "asc" } : { key, direction: prev.direction === "asc" ? "desc" : "asc" }));
  const getSortSymbol = (key) =>
    sortConfig.key === key
      ? sortConfig.direction === "asc"
        ? <ArrowUpward sx={{ fontSize: "17px" }} />
        : <ArrowDownward sx={{ fontSize: "17px" }} />
      : <ArrowDownward sx={{ fontSize: "17px" }} />;

  const sortedData = useMemo(() => {
    const arr = [...paginatedData];
    if (sortConfig.key)
      arr.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    return arr;
  }, [paginatedData, sortConfig]);

  // Export spinner state
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  // Fetch all payments for export (no pagination)
  const fetchAllPaymentsData = async () => {
    try {
      const res = await fetch(`${url}/company-admins/${id}/data`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      const paymentsObj = result.data?.data?.payments?.recent_activity || [];
      return paymentsObj.map((item, idx) => ({
        ID: idx + 1,
        Type: item.type,
        "Payment Date": item.payment_date,
        Count: item.payment_count,
        "Total Amount": item.total_amount,
        Currency: item.currency,
      }));
    } catch (err) {
      console.error("Export fetch failed", err);
      return [];
    }
  };

  // Export handler
  const handleExportData = async (format) => {
    setExporting(true);
    setExportFormat(format);
    try {
      const allData = await fetchAllPaymentsData();
      if (!allData.length) {
        toast.error(t("No data available for export."));
        return;
      }
      if (format.toLowerCase() === "pdf") {
        const { exportTable } = await import("../../helper_functions/ExportData");
        await exportTable(allData, "Payments", "pdf", { skipColumns: [] });
      } else if (format.toLowerCase() === "excel") {
        const { exportTable } = await import("../../helper_functions/ExportData");
        await exportTable(allData, "Payments", "xlsx", { skipColumns: [] });
      } else {
        toast.error(t("Unsupported export format."));
      }
    } catch (err) {
      toast.error(t("Failed to export payments. Please try again."));
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  if (initialLoader || loading)
    return (
      <Box sx={{ height: "10vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress size={20} thickness={3} color="primary" />
      </Box>
    );
const formatText = (value = "") => {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
  return (
   <Box px={{xs:3,md:0}} pt={1}>
     <Box sx={{ ml: { xs: 0, md: 3 }, mr: { xs: 0, md: 3 }, backgroundColor: "white", border: "2px solid rgba(9, 30, 66, 0.14)", borderRadius: "12px", }}>
      {/* Header */}
      <Grid container spacing={2} alignItems="center" mb={1} p = { {xs: 1, md: 2} }>
        <Grid item xs={12} sm={4}>
          <TypographyMD variant="paragraph" label="Payments" color="#424242" fontFamily="Roboto" fontSize={{ xs: "16px", md: "18px" }} fontWeight={600} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <OutlinedInput
            autoComplete="off"
            placeholder={t("Search by type/currency...")}
            sx={{ ...fieldCommonSx, width: "100%", "& fieldset": { border: "none" } }}
            endAdornment={<InputAdornment position="end"><IconButton edge="end" size="small" /></InputAdornment>}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
           
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
      {paginatedData.length === 0 ? (
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent="center" py={10}>
                  <img src={nopayment} alt=""  height={200}/>
                  <TypographyMD variant="h2" label={t("No Payments Found!")} color="#A5ADB0" fontFamily="Roboto" fontSize="15px" fontWeight={450} align="center" />
                </Box>
      ) : (
        <TableContainer sx={{ overflowX: "auto", width: "100%" }}>
          <Table sx={{ minWidth: 650, "& .MuiTableCell-root": { padding: { xs: "8px", md: "12px" } },whiteSpace:'nowrap !important' }}>
            <TableHead >
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox checked={selectAll} onChange={(e) => handleCheckboxChange(e, "selectAll")} />
                </TableCell>
                {["ID", "Type", "Payment Date", "Count", "Total Amount", "Currency"].map((col, idx) => (
                  <TableCell
                    key={idx}
                    align="center"
                    sx={{ fontWeight: "bold", color: "#44546F", fontSize: { xs: "12px", md: "14px" }, cursor: "pointer" }}
                    onClick={() => handleSort(col.toLowerCase().replace(/ /g, "_"))}
                  >
                    {col} {getSortSymbol(col.toLowerCase().replace(/ /g, "_"))}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedData.map((item) => (
                <TableRow hover key={item.id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      sx={{ color: "rgba(9, 30, 66, 0.14)" }}
                      checked={selectedRows.includes(item.id)}
                      onChange={(e) => handleCheckboxChange(e, item.id)}
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontSize: { xs: "12px", md: "14px" } }}>
                    {item.id}
                  </TableCell>

                  <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontSize: { xs: "12px", md: "14px" } }}>
                    {/* {item.type} */}
                      {formatText(item.type)}
                  </TableCell>

                  <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontSize: { xs: "12px", md: "14px" } }}>
                    <FormatDate inputDate={item.payment_date} />
                  </TableCell>

                  <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontSize: { xs: "12px", md: "14px" } }}>
                    {item.payment_count}
                  </TableCell>

                  <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontSize: { xs: "12px", md: "14px" } }}>
                    {getCurrencySymbol(item.currency)}{formatAmount(item.total_amount)}
                  </TableCell>

                  <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontSize: { xs: "12px", md: "14px" } }}>
                    {item.currency}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
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
  );
}

export default Payments;
