import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Paper,
  TextField,
} from "@mui/material";
import { useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import url from "../url";
import nodata from "../Assets/nodata.png";
import { useTranslation } from "react-i18next";
import ThresholdFilterDrawer from "./ThresholdSummaryFilter";
import { IconButton } from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useNavigate } from "react-router-dom";
const CommissionThresholdTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // ← search input state
  const rowsPerPage = 5;
  const { token } = useSelector((state) => state.auth);
  const { t } = useTranslation();
const [filters, setFilters] = useState({ status: "", executive: "" });
const [isFilterApplied, setIsFilterApplied] = useState(false);
const [markingPaidId, setMarkingPaidId] = useState(null);
const [totalPages, setTotalPages] = useState(1);
const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
const navigate=useNavigate()
  const HaederStyles = {
    color: "#44546F",
    fontSize: "14px",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const DataStyles = {
    color: "#172B4D",
    fontSize: "13px",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

useEffect(() => {
  const fetchThresholdData = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("page", page + 1);
      params.append("limit", rowsPerPage);

      if (searchQuery) params.append("exec_email", searchQuery);
      if (filters.status) params.append("status", filters.status);
      if (filters.executive) params.append("exec_email", filters.executive);

      const endpoint = `${url}payments/super-admin/commission-threshold-summary?${params.toString()}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Failed to fetch data");

      setRows(result.data.summary || []);
      setTotalPages(result.data.pagination.pages || 1);
    } catch (error) {
      toast.error("Failed to fetch data!");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  fetchThresholdData();
}, [token, page, filters, searchQuery]);


  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleChangePage = (event, value) => {
    setPage(value - 1);
  };

const markAsPaid = async (exec_id, ) => {
  console.log("Mark as Paid clicked:", { exec_id,  });

  if (!exec_id) {
    console.error("❌ Missing exec_id ");
    toast.error("Missing IDs — cannot process payment");
    return;
  }
  setMarkingPaidId(exec_id);
  try {
    const endpoint = `${url}payments/super-admin/mark-commission-paid`;
    console.log("Sending POST request to:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ exec_id }),
    });

    console.log("Response status:", response.status);
    const data = await response.json().catch(() => ({}));
    console.log("Response data:", data);

    if (!response.ok) {
      throw new Error(`Failed: ${response.status}`);
    }

    toast.success("Commission marked as paid successfully!");
    setRows((prev) =>
      prev.map((row) =>
        row.exec_id === exec_id
          ? { ...row, commission_status: "paid" }
          : row
      )
    );
  } catch (error) {
    console.error("Error marking as paid:", error);
    toast.error("Error marking commission as paid");
  }
  finally {
    setMarkingPaidId(null); // hide loader
  }
};






  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );


  return (
    <>
 <Box
    sx={{
      backgroundColor: "white",
      border: "2px solid rgba(9, 30, 66, 0.14)",
      borderRadius: "12px",
      mb: 2,
      py: 3,
      px:1.5,

      mt: 2,
    }}
  >
    <Toaster />

<Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    mb: 2,
    px: 1,
  }}
>
  <Typography variant="h6" mb={2}>
    {t("threshold.title")}
  </Typography>

  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <TextField
      variant="outlined"
      size="small"
      placeholder={t("threshold.searchPlaceholder")}
      value={searchQuery}
     onChange={(e) => {
  setSearchQuery(e.target.value);
  setPage(0);
}}
      sx={{ width: "260px" }}
    />

    {isFilterApplied ? (
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: 1,
          bgcolor: "#1976d2",
        }}
      >
        <FilterAltIcon sx={{ color: "white", fontSize: 20 }} />
        <IconButton
          size="small"
          onClick={() => {
            const cleared = { status: "", executive: "" };
            setFilters(cleared);
            setIsFilterApplied(false);
            setPage(0);
          }}
          sx={{
            position: "absolute",
            top: -6,
            right: -6,
            bgcolor: "white",
            width: 18,
            height: 18,
            border: "1px solid #C4C4C4",
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 14, color: "#333" }} />
        </IconButton>
      </Box>
    ) : (
      <IconButton
        onClick={() => setFilterDrawerOpen(true)}
        sx={{
          border: "1px solid #C4C4C4",
          borderRadius: 1,
          width: 34,
          height: 34,
        }}
      >
        <FilterAltIcon />
      </IconButton>
    )}
  </Box>
</Box>

    <TableContainer component={Paper} sx={{    boxShadow: "none",
    overflowX: "auto",  // enables horizontal scroll
    maxWidth: "100%",  }}>
      <Table   sx={{
    "& .MuiTableCell-root": {
      padding: "6px 12px",   // reduces padding inside each cell
    },
    "& .MuiTableRow-root": {
      height: "36px",        // optional: fixes row height
    },
  }}>
        <TableHead   sx={{
    "& .MuiTableCell-root": {
      padding: "8px 12px",
      fontWeight: 600,
    },
  }}>
          <TableRow>
            <TableCell sx={HaederStyles}>{t('threshold.headers.executiveName')}</TableCell>
            <TableCell sx={HaederStyles}>{t('threshold.headers.email')}</TableCell>
            <TableCell sx={HaederStyles} align="center">
             {t('threshold.headers.pending')}
            </TableCell>
            <TableCell sx={HaederStyles} align="center">
           {t('threshold.headers.ready')}
            </TableCell>
            <TableCell sx={HaederStyles} align="center">
            {t('threshold.headers.paid')}
            </TableCell>
            <TableCell sx={HaederStyles} align="center">
           {t('threshold.headers.amountNeeded')}
            </TableCell>

                <TableCell sx={HaederStyles} align="center">
           {t('threshold.headers.status')}
            </TableCell>
            <TableCell sx={HaederStyles} align="center">
             {t('threshold.headers.latestDate')}
            </TableCell>
            <TableCell sx={HaederStyles} align="center">
              {t('threshold.headers.action')}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
      {rows.length > 0 ? (
    rows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell sx={DataStyles}>{row.executive_name}</TableCell>
                  <TableCell sx={DataStyles}>{row.executive_email}</TableCell>
                  <TableCell sx={DataStyles} align="center">
                    ${row.pending_amount}
                  </TableCell>
                  <TableCell sx={DataStyles} align="center">
                    ${row.ready_amount}
                  </TableCell>
                  <TableCell sx={DataStyles} align="center">
                    ${row.total_paid}
                  </TableCell>
                  <TableCell align="center">
                    ${row.amount_needed_for_threshold}
                  </TableCell>

<TableCell align="center">
  <Box
    sx={{
      display: "inline-block",
      backgroundColor:
        row.threshold_status === "threshold_met"
          ? "#E8F5E9" // light green background
          : row.threshold_status === "below_threshold"
          ? "#FFF3E0" // light orange background
          : "#E3F2FD", // fallback light blue
      color:
        row.threshold_status === "threshold_met"
          ? "#2E7D32" // dark green text
          : row.threshold_status === "below_threshold"
          ? "#EF6C00" // orange text
          : "#1565C0", // blue text
      fontWeight: 600,
      borderRadius: "8px",
      py: 0.6,   // vertical padding inside box
      px: 1,     // horizontal padding inside box
      textAlign: "center",
      fontSize:"12px",
      minWidth: "130px", // consistent box size
    }}
  >
    {/* {row.commission_status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")} */}
      {t(`thresholdStatus.${row.commission_status}`)}
  </Box>
</TableCell>


                  <TableCell align="center">
                    {formatDateTime(row.latest_commission_date)}
                  </TableCell>
<TableCell align="center">
  {row.commission_status === "paid" ? (
    <Box
      sx={{
        display: "inline-block",
        backgroundColor: "#E8F5E9",
        color: "#2E7D32",
        borderRadius: "8px",
        py: 0.8,
        px: 1.5,
        fontWeight: 500,
        fontFamily: "Poppins, sans-serif",
        fontSize: "12px",
        minWidth: "130px",
        cursor: "pointer",
        "&:hover": { backgroundColor: "#C8E6C9" },
      }}
   onClick={() =>
  navigate("/payout-logs", {
    state: { from: "threshold", exec_id: row.exec_id },
  })
}
    >
     {t("commissionTable.viewDetails")}
    </Box>
  ) : row.commission_status === "ready_for_payout" ? (
  <Box
  sx={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1976D2",
    color: "white",
    borderRadius: "8px",
    py: 0.8,
    px: 1.5,
    cursor: "pointer",
    fontWeight: 500,
    fontFamily: "Poppins, sans-serif",
    fontSize: "12px",
    minWidth: "130px",
    "&:hover": { backgroundColor: "#1565C0" },
  }}
  onClick={() => markAsPaid(row.exec_id)}
>
  {markingPaidId === row.exec_id ? (
    <CircularProgress size={16} color="inherit" />
  ) : (
    t("commissionTable.markAsPaid")

  )}
</Box>
  ) : (
    <Box
      sx={{
        display: "inline-block",
        backgroundColor: "#FFF3E0",
        color: "#EF6C00",
        borderRadius: "8px",
        py: 0.8,
        px: 1.5,
        fontWeight: 500,
        fontFamily: "Poppins, sans-serif",
        fontSize: "12px",
        minWidth: "130px",
      }}
    >
  {t("commissionTable.pending")}

    </Box>
  )}
</TableCell>


                </TableRow>
              ))
          ) : (
            <TableRow>
              <TableCell colSpan={8}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  py={4}
                >
                  <img src={nodata} alt="No Data" height={180} width={180} />
                  <Typography
                    sx={{
                      color: "#A5ADB0",
                      fontFamily: "Roboto",
                      fontSize: "13px",
                      fontWeight: 450,
                      textAlign: "center",
                      mt: 1,
                    }}
                  >
                  {t('threshold.messages.noData')}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2,
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "primary.main",
            color: "#fff",
          },
        }}
      >
    <Pagination
  count={totalPages}
  page={page + 1}
  onChange={(event, value) => setPage(value - 1)}
  shape="rounded"
  size="small"
/>
      </Box>
           <ThresholdFilterDrawer
  open={filterDrawerOpen}
  onClose={() => setFilterDrawerOpen(false)}
  filters={filters}
  setFilters={setFilters}
onApplyFilters={(newFilters) => {
  setFilters(newFilters);
  setIsFilterApplied(
    newFilters.status !== "" || newFilters.executive !== ""
  );
  setFilterDrawerOpen(false);
  setPage(0);
}}
/>
    </TableContainer>
 
  </Box>

</>
  );
};

export default CommissionThresholdTable;


