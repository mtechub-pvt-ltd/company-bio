import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Chip,
} from "@mui/material";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import FormatDate from "../../components/FormatDate";
import TypographyMD from "../../components/items/Typography";
import url from "../../url";
import { useTranslation } from "react-i18next";
import csvIcon from "../../Assets/csvIcon.png";
import pdfIcon from "../../Assets/pdfIcon.png";
import exportIcon from "../../Assets/export_icon.png";
import ExportMenuButton from "../../components/ExportMenuButton";
import nodata from "../../Assets/nodata.png";

function Attendence({ id }) {
  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [initialLoader, setInitialLoader] = useState(true);
  const [data, setData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const recordsPerPage = 7;

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

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoader(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${url}/company-admins/${id}/data`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();

        const attendanceObj =
          result.data?.data?.attendance?.recent_activity || [];
        const transformed = attendanceObj.map((item, idx) => ({
          id: idx + 1,
          date: item.date,
          total_punches: item.total_punches,
          unique_workers: item.unique_workers,
          check_ins: item.check_ins,
          check_outs: item.check_outs,
          flagged_records: item.flagged_records,
        }));
        setData(transformed);
      } catch (err) {
        toast.error("Something went wrong! Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAttendanceData();
  }, [token]);

  // Checkbox handling
  const handleCheckboxChange = (e, target) => {
    const checked = e.target.checked;
    if (target === "selectAll") {
      setSelectAll(checked);
      setSelectedRows(checked ? paginatedData.map((item) => item.id) : []);
    } else {
      setSelectedRows((prev) =>
        checked ? [...prev, target] : prev.filter((id) => id !== target)
      );
    }
  };

  // Filter & paginate
  const filteredData = data.filter((item) =>
    item.date?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  // Sorting
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key !== key
        ? { key, direction: "asc" }
        : { key, direction: prev.direction === "asc" ? "desc" : "asc" }
    );
  };
  const getSortSymbol = (key) =>
    sortConfig.key === key ? (
      sortConfig.direction === "asc" ? (
        <ArrowUpward sx={{ fontSize: "17px" }} />
      ) : (
        <ArrowDownward sx={{ fontSize: "17px" }} />
      )
    ) : (
      <ArrowDownward sx={{ fontSize: "17px" }} />
    );

  const sortedData = useMemo(() => {
    const arr = [...paginatedData];
    if (sortConfig.key) {
      arr.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return arr;
  }, [paginatedData, sortConfig]);

  const handlePageChange = (_, value) => setCurrentPage(value);

  // Export spinner state
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  // Fetch all attendance data for export (no pagination)
  const fetchAllAttendanceData = async () => {
    try {
      const response = await fetch(`${url}/company-admins/${id}/data`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      const attendanceObj = result.data?.data?.attendance?.recent_activity || [];
      return attendanceObj.map((item, idx) => ({
        Id: idx + 1,
        Date: item.date,
        "Total Punches": item.total_punches,
        "Unique Workers": item.unique_workers,
        "Check Ins": item.check_ins,
        "Check Outs": item.check_outs,
        "Flagged Records": item.flagged_records,
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
      const allData = await fetchAllAttendanceData();
      if (!allData.length) {
        toast.error(t("No data available for export."));
        return;
      }
      if (format.toLowerCase() === "pdf") {
        const { exportTable } = await import("../../helper_functions/ExportData");
        await exportTable(allData, "Attendance", "pdf", { skipColumns: [] });
      } else if (format.toLowerCase() === "excel") {
        const { exportTable } = await import("../../helper_functions/ExportData");
        await exportTable(allData, "Attendance", "xlsx", { skipColumns: [] });
      } else {
        toast.error(t("Unsupported export format."));
      }
    } catch (err) {
      toast.error(t("Failed to export attendance. Please try again."));
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  if (initialLoader || loading)
    return (
      <Box
        sx={{
          height: "10vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={20} thickness={3} color="primary" />
      </Box>
    );

  return (
    <Box px={{ xs: 3, md: 0 }} pt={1}>
      <Box
        sx={{
          ml: { xs: 0, md: 3 },
          mr: { xs: 0, md: 3 },
          backgroundColor: "white",
          border: "2px solid rgba(9, 30, 66, 0.14)",
          borderRadius: "12px",
          // p: { xs: 1, md: 2 },
          width: { xs: "100%", md: "77vw" },
        }}
      >
        {/* Header */}
        <Grid
          container
          spacing={2}
          alignItems="center"
          mb={1}
          p={{ xs: 1, md: 2 }}
        >
          <Grid item xs={12} sm={4}>
            <TypographyMD
              variant="paragraph"
              label={t("Attendance")}
              color="#424242"
              fontFamily="Roboto"
              fontSize={{ xs: "16px", md: "18px" }}
              fontWeight={600}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <OutlinedInput
              autoComplete="off"
              placeholder={t("Search by date...")}
              sx={{
                ...fieldCommonSx,
                width: "100%",
                "& fieldset": { border: "none" },
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton edge="end" size="small" />
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
                icon={<img src={exportIcon} alt="" style={{ width: 30 }} />}
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
              label={t("No Attendence Found!")}
              color="#A5ADB0"
              fontFamily="Roboto"
              fontSize="15px"
              fontWeight={450}
              align="center"
            />
          </Box>
        ) : (
          <TableContainer
            sx={{
              overflowX: "auto",

              width: "100%",
            }}
          >
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
                      onChange={(e) => handleCheckboxChange(e, "selectAll")}
                    />
                  </TableCell>
                  {[
                    "Id",
                    "Date",
                    "Total Punches",
                    "Unique Workers",
                    "Check Ins",
                    "Check Outs",
                    "Flagged Records",
                  ].map((col) => (
                    <TableCell
                      key={col}
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "#44546F",
                        fontSize: { xs: "12px", md: "14px" },
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleSort(col.toLowerCase().replace(/ /g, "_"))
                      }
                    >
                      {t(col)}{" "}
                      {getSortSymbol(col.toLowerCase().replace(/ /g, "_"))}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedData.map((item) => (
                  <TableRow hover key={item.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.includes(item.id)}
                        onChange={(e) => handleCheckboxChange(e, item.id)}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 400,
                        fontSize: { xs: "12px", md: "14px" },
                      }}
                    >
                      {item.id}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 400,
                        fontSize: { xs: "12px", md: "14px" },
                      }}
                    >
                      <FormatDate inputDate={item.date} />
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 400,
                        fontSize: { xs: "12px", md: "14px" },
                      }}
                    >
                      {item.total_punches}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 400,
                        fontSize: { xs: "12px", md: "14px" },
                      }}
                    >
                      {item.unique_workers}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 400,
                        fontSize: { xs: "12px", md: "14px" },
                      }}
                    >
                      {item.check_ins}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 400,
                        fontSize: { xs: "12px", md: "14px" },
                      }}
                    >
                      {item.check_outs}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 400,
                        fontSize: { xs: "12px", md: "14px" },
                      }}
                    >
                      <Chip
                        label={item.flagged_records}
                        size="small"
                        sx={{
                          backgroundColor:
                            item.flagged_records > 0 ? "#FEF3F2" : "#F0F9FF",
                          color:
                            item.flagged_records > 0 ? "#D92D20" : "#0369A1",
                          fontWeight: 500,
                        }}
                      />
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
                onChange={handlePageChange}
                siblingCount={1}
                boundaryCount={1}
                shape="rounded"
                size="small"
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontSize: "12px",
                    minWidth: "30px",
                    height: "30px",
                    color: "#172B4D !important",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#F0F9FF !important",
                    color: "#006EC2 !important",
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

export default Attendence;
