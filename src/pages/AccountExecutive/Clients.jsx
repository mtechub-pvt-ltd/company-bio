import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from "@mui/material";
import nousers from '../../Assets/no-user.png'
import { ArrowDownward, ArrowUpward, Search, Error } from "@mui/icons-material";
import TypographyMD from "../../components/items/Typography";
import ExportMenuButton from "../../components/ExportMenuButton";
import csvIcon from "../../Assets/csvIcon.png";
import pdfIcon from "../../Assets/pdfIcon.png";
import exportIcon from "../../Assets/export_icon.png";
import url from "../../url";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import FormatDate from "../../components/FormatDate";
import toast from "react-hot-toast";
import StatusDropdown from "../../components/StatusDropdown"
const SortIcons = ({ column, sortBy, sortOrder }) => (
  <>{sortBy === column && sortOrder === "ASC" ? <ArrowUpward sx={{ fontSize: "17px" }} /> : <ArrowDownward sx={{ fontSize: "17px" }} />}</>
);

function Clients({ user_id }) {
  const { token } = useSelector((state) => state.auth || {});
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(7);
  const isSortingRef = useRef(false);
  const [sortBy, setSortBy] = useState("registered");
  const [sortOrder, setSortOrder] = useState("DSC");
  const [clients, setClients] = useState([]);

  const getClients = async (user_id, page = 1, search = "", sort_by = sortBy, sort_order = sortOrder) => {
    try {
      const q = encodeURIComponent(search || "");
      const endpoint = `${url}company-admins/by-account-executive/${user_id}?page=${page}&limit=${limit}&search=${q}&status=active&sort_by=${sort_by}&sort_order=${sort_order}`;
      const res = await fetch(endpoint, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClients(data?.data?.company_admins || []);
      setTotalPages(data?.data?.pagination?.pages || 1);
    } catch (err) {
      toast.error("Something went wrong! Please try again.");
    }
  };

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

  // Fetch all clients for export (no pagination)
  const fetchAllClients = async () => {
    try {
      const q = encodeURIComponent(searchTerm || "");
      // Use a very large limit to get all data
      const endpoint = `${url}company-admins/by-account-executive/${user_id}?page=1&limit=10000&search=${q}&status=active&sort_by=${sortBy}&sort_order=${sortOrder}`;
      const res = await fetch(endpoint, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data?.data?.company_admins || [];
    } catch (err) {
      toast.error(t("Failed to fetch all clients for export!"));
      return [];
    }
  };

  // Export handler
  const handleExportData = async (format) => {
    setExporting(true);
    try {
      const allClients = await fetchAllClients();
      const data = (allClients || []).map((item) => ({
        ID: displayValue(item.id),
        [t("Company Admin")]: displayValue(item.full_name),
        [t("Company Legal Name")]: displayValue(item.company_name),
        [t("Country")]: displayValue(item.country),
        [t("Registered Email")]: displayValue(item.email),
        [t("subscription_plan")]: displayValue(item.subscription_plan),
        [t("Usage Days")]: displayValue(item.usage_days),
        [t("Status")]: displayValue(item.status),
        [t("Date-Time")]: formatDateForExport(item.registered),
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
        XLSX.utils.book_append_sheet(wb, ws, "Clients");
        XLSX.writeFile(wb, `clients_${new Date().getTime()}.xlsx`);
      } else if (format === "PDF") {
        const jsPDF = (await import("jspdf")).default;
        const autoTable = (await import("jspdf-autotable")).default;
        const doc = new jsPDF();
        autoTable(doc, {
          head: [Object.keys(data[0])],
          body: data.map((row) => Object.values(row)),
        });
        doc.save(`clients_${new Date().getTime()}.pdf`);
      }
    } catch (err) {
      toast.error(t("Failed to export data!"));
    }
    setExporting(false);
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

  const handleSort = (column) => {
    const newSortOrder = sortBy === column && sortOrder === "ASC" ? "DSC" : "ASC";
    isSortingRef.current = true;
    setCurrentPage(1);
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleCheckboxChange = (event, target) => {
    const checked = event.target.checked;
    if (target === "selectAll") {
      setSelectAll(checked);
      if (checked) setSelectedRows(clients.map((c) => c.id));
      else setSelectedRows([]);
    } else {
      if (checked) setSelectedRows((prev) => [...prev, target]);
      else setSelectedRows((prev) => prev.filter((id) => id !== target));
    }
  };

  const handlePageChange = (e, value) => setCurrentPage(value);

  useEffect(() => {
    const tmr = setTimeout(() => {
      if (user_id) getClients(user_id, currentPage, searchTerm, sortBy, sortOrder);
      isSortingRef.current = false;
    }, 200);
    return () => clearTimeout(tmr);
  }, [user_id, currentPage, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    if (selectedRows.length !== clients.length) setSelectAll(false);
  }, [selectedRows, clients]);

  const columns = [
    { key: "id", label: "Id" },
    { key: "full_name", label: "Company Admin" },
    { key: "company_name", label: "Company Legal Name" },
    { key: "country", label: "Country" },
    { key: "email", label: "Registered Email" },
    { key: "subscription_plan", label: "subscription_plan" },
    { key: "usage_days", label: "Usage Days" },
    { key: "status", label: "Status" },
    { key: "registered", label: "Date-Time" },
  ];

  return (
    <Box sx={{ width: "100%" }} overflow="hidden">
      <Box
        sx={{
          width: {
            xs: '100%',
            md: '76vw',
          },
        }}
      >

        <Grid container spacing={0} p={2} pb={1} alignItems="center">
          {/* Title */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: "flex", alignItems: "center", height: "35px" }}>
              <TypographyMD
                variant="paragraph"
                label={t("Clients")}
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
                  fontWeight: 500
                }}
              />
            </Box>
          </Grid>
        </Grid>


        {clients?.length == 0 ? (
          <Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent="center" py={10}>
            <img src={nousers} alt="" height={200} />
            <TypographyMD
              variant="h2"
              label={t("No Clients Found!")}
              color="#A5ADB0"
              fontFamily="Roboto"
              fontSize="15px"
              fontWeight={450}
              align="center"
            />   </Box>
        ) : (
          <TableContainer sx={{ boxShadow: "none", pt: 1, overflowX: "auto" }}>
            <Table sx={{
              tableLayout: "auto",
              "& .MuiTableCell-root": {
                padding: "5px",
                whiteSpace: "nowrap !important",
                overflow: "hidden",
                textOverflow: "ellipsis"
              },
              "& .MuiTableRow-root": { height: "25px" }
            }} aria-label="clients table">
              <TableHead style={{ fontSize: "13px", fontFamily: "Poppins, sans-serif" }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox sx={{ color: "rgba(9, 30, 66, 0.14)" }} checked={selectAll} indeterminate={false} onChange={(e) => handleCheckboxChange(e, "selectAll")} />
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.key} align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Poppins, sans-serif", fontSize: "14px", cursor: col.key !== "status" ? "pointer" : "default", whiteSpace: "nowrap !important", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }} onClick={() => col.key !== "status" && handleSort(col.key)}>
                      {t(col.label)}
                      {col.key !== "status" && <SortIcons column={col.key} sortBy={sortBy} sortOrder={sortOrder} />}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {clients.map((item) => (
                  <TableRow hover key={item.id}>
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox sx={{ color: "rgba(9, 30, 66, 0.14)" }} checked={selectedRows.includes(item.id)} onChange={(e) => handleCheckboxChange(e, item.id)} />
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif", fontSize: "14px", maxWidth: "50px", whiteSpace: "nowrap !important", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.id}
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap !important", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.full_name}
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap !important", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.company_name}
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap !important", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.country}
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap !important", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.email}
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap !important", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.subscription_plan}
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap !important", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.usage_days}
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap !important", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {/* <Chip label={item.status ? String(item.status).charAt(0).toUpperCase() + String(item.status).slice(1) : "-"} size="small" variant="outlined" sx={{ textTransform: "capitalize", fontWeight: 500, backgroundColor: item.status && (item.status.toLowerCase() === "active" ? "#E6F4EA" : item.status.toLowerCase() === "inactive" ? "#FDECEA" : "transparent"), color: item.status && (item.status.toLowerCase() === "active" ? "#2E7D32" : item.status.toLowerCase() === "inactive" ? "#C62828" : "#172B4D"), borderColor: "rgba(0,0,0,0.08)" }} /> */}
                     <Box
                                                                 sx={{
                                                                 
                                                                   pointerEvents: "none",
                                                                 }}
                                                               >
                                                                 <StatusDropdown currentStatus={item?.status} />
                                                               </Box>
                    </TableCell>

                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif", fontSize: "14px", maxWidth: "200px", whiteSpace: "nowrap !important", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <FormatDate inputDate={item?.registered} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div style={{ marginTop: "10px", marginBottom: "10px", display: "flex", justifyContent: "center", alignContent: "center" }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, v) => handlePageChange(_, v)}
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
    </Box>
  );
}

export default Clients;
