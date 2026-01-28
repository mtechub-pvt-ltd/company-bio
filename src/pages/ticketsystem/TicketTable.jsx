import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputBase,
  Button,
  Typography,
  Menu,
  MenuItem,
  Pagination,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import toast from "react-hot-toast";
import ExportMenuButton from "../../components/ExportMenuButton";
import exportIcon from "../../Assets/export_icon.png"; // main button icon
import pdfIcon from "../../Assets/pdfIcon.png"; // PDF option icon
import csvIcon from "../../Assets/csvIcon.png"; // Excel option icon
import { exportTable } from "../../helper_functions/ExportData";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import CustomText, { textStyles } from "../../components/CustomText";
import StatusDropdown from "../../components/StatusDropdown";
import { OutlinedInput, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";

// import ExportDropdown from '../../../components/ExportDropdown';
// import { showUnderDevelopment } from '../../../components/alerts';
import CreateTicketModal from "./CreateDrawer";

import TicketDetails from "./TicketsDetails";
import { useTranslation } from "react-i18next";
// import { BASE_URL } from "../../../components/BaseUrl";
import url from "../../url";
// import { decryptToken } from "../../../Utlis/Encryption";

import { useSelector } from "react-redux";
import NorthIcon from "@mui/icons-material/North"; // Ascending
import SouthIcon from "@mui/icons-material/South";
import FilterModal from "./FilterDrawer"; // 👈 import
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import emptytickets from "../../Assets/tickets/emptytickets.png";

const cellHeaderSX = {
  color: "#44546F",
  fontSize: 14,
  fontWeight: 500,
  fontFamily: "Poppins, sans-serif",
  whiteSpace: "nowrap",
};

const cellDataSX = {
  color: "#172B4D",
  fontSize: 14,
  fontWeight: 400,
  fontFamily: "Poppins, sans-serif",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const formatDateTime = (iso) =>
  new Date(iso)
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", " -");

const TicketsTable = ({ onView }) => {
  const [rows, setRows] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const [totalPages, setTotalPages] = useState(1);
  const rawEncryptedToken = localStorage.getItem("token");
  const { token } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery("(max-width:768px)");
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true); // 👈 loader state
  const [sortBy, setSortBy] = useState("created_at"); // default sort column
  const [sortOrder, setSortOrder] = useState("desc");
  const [initialLoading, setInitialLoading] = useState(true); // first load only
  const [tableLoading, setTableLoading] = useState(false); // subsequent loads
  const didInit = useRef(false);
  const columns = [
    { key: "ticket_id", label: t("ID") },
    { key: "subject", label: t("Subject") },
    { key: "creator_name", label: t("Username") },

    { key: "category", label: t("Category") },
    { key: "priority", label: t("Priority") },
    { key: "status", label: t("Status") },
    { key: "created_at", label: t("Registered") },
    { key: "action", label: t("Action") },
  ];

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState(null); // store applied filters
  const isFilterApplied = !!filters;

  // localized fallback helpers
  const isEmptyValue = (value) => {
    return (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      value === "null" ||
      value === "undefined"
    );
  };

  const displayValue = (value) => (isEmptyValue(value) ? t("N/A") : value);

  const fetchTickets = async () => {
    try {
      if (!didInit.current) {
        setInitialLoading(true);
      } else {
        setTableLoading(true);
      }

      const queryParams = new URLSearchParams({
        page,
        limit: rowsPerPage,
        search,
      });

      // Only add sorting parameters if they are valid
      if (sortBy && sortBy !== "action") {
        queryParams.append("sort_by", sortBy);
        queryParams.append("sort_order", sortOrder);
      }

      console.log("Fetching tickets with params:", {
        page,
        limit: rowsPerPage,
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (filters?.statuses?.length) {
        const val =
          typeof filters.statuses[0] === "object"
            ? filters.statuses[0].value
            : filters.statuses[0];
        queryParams.append("status", val);
      }
      if (filters?.categories?.length) {
        const val =
          typeof filters.categories[0] === "object"
            ? filters.categories[0].value
            : filters.categories[0];
        queryParams.append("category", val);
      }
      if (filters?.priorities?.length) {
        const val =
          typeof filters.priorities[0] === "object"
            ? filters.priorities[0].value
            : filters.priorities[0];
        queryParams.append("priority", val);
      }
      if (filters?.startDate) {
        queryParams.append("date_from", filters.startDate);
      }
      if (filters?.endDate) {
        queryParams.append("date_to", filters.endDate);
      }
      const fullUrl = `${url}/tickets?${queryParams.toString()}`;
      console.log("🌐 Full API URL:", fullUrl);
      
      const res = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();

      if (!data.error) {
        let tickets = data.data.tickets;
        
        // Fallback: Client-side sorting if API doesn't support it
        if (sortBy && sortBy !== "action" && tickets && tickets.length > 0) {
          console.log("🔄 Applying client-side sorting as fallback");
          tickets = [...tickets].sort((a, b) => {
            const aVal = a[sortBy] || "";
            const bVal = b[sortBy] || "";
            
            if (sortBy === "created_at") {
              const aDate = new Date(aVal);
              const bDate = new Date(bVal);
              return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
            }
            
            const comparison = aVal.toString().localeCompare(bVal.toString());
            return sortOrder === "asc" ? comparison : -comparison;
          });
        }
        
        setRows(tickets);
        setTotalPages(data.data.pagination.totalPages);
        console.log("🎯 Filters applied in this fetch:", filters); // now always latest
        console.log("👉 Filtered rows:", tickets);
        console.log("📊 Sort applied - sortBy:", sortBy, "sortOrder:", sortOrder);
        
        // Check if data is actually sorted
        if (tickets && tickets.length > 0) {
          console.log("🔍 First few tickets for sorting verification:");
          tickets.slice(0, 3).forEach((ticket, index) => {
            console.log(`  ${index + 1}. ${ticket.ticket_id} - ${ticket.subject} - ${ticket.created_at}`);
          });
        }
      }
    } catch (err) {
      console.error("❌ Tickets fetch error:", err);
    } finally {
      if (!didInit.current) {
        setInitialLoading(false);
        didInit.current = true;
      } else {
        setTableLoading(false);
      }
    }
  };

  // useEffect just calls it
  useEffect(() => {
    fetchTickets();
  }, [page, rowsPerPage, search, token, sortBy, sortOrder, filters]);

  const pageRows = rows;
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);
  const menuAnchorsRef = useRef({});
  const [openCreate, setOpenCreate] = useState(false);
  const [viewLoadingId, setViewLoadingId] = useState(null);
  const clearFilters = () => {
    setFilters(null);
    setPage(1); // reset to first page
  };
  const [categoriesMap, setCategoriesMap] = useState({});
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch(`${url}/categories`, {
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!data.error) {
        const map = {};
        data.data.categories.forEach((c) => {
          map[c.value] = c.label; // build value → label mapping
        });
        setCategoriesMap(map);
      }
    };
    fetchCategories();
  }, []);
  const CATEGORY_LABELS = {
    account_login: "Account & Login",
    punching_time_tracking: "Punching / Time Tracking",
    scheduling_shifts: "Scheduling & Shifts",
    timesheets_payroll: "Timesheets & Payroll",
    approvals_permissions: "Approvals & Permissions",
    device_technical_issue: "Device / Technical Issue",
    integrations: "Integrations",
    billing_subscription: "Billing & Subscription",
    feature_request_feedback: "Feature Request / Feedback",
    general_inquiry: "General Inquiry",
    other: "Other",
  };

 const fetchAllTicketsForExport = async () => {
  let page = 1;
  let combinedTickets = [];
  let keepFetching = true;

  try {
    while (keepFetching) {
      const queryParams = new URLSearchParams({
        page,
        limit: rowsPerPage,
        search,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (filters?.statuses?.length) {
        const val = typeof filters.statuses[0] === "object" ? filters.statuses[0].value : filters.statuses[0];
        queryParams.append("status", val);
      }
      if (filters?.categories?.length) {
        const val = typeof filters.categories[0] === "object" ? filters.categories[0].value : filters.categories[0];
        queryParams.append("category", val);
      }
      if (filters?.priorities?.length) {
        const val = typeof filters.priorities[0] === "object" ? filters.priorities[0].value : filters.priorities[0];
        queryParams.append("priority", val);
      }
      if (filters?.startDate) queryParams.append("date_from", filters.startDate);
      if (filters?.endDate) queryParams.append("date_to", filters.endDate);

      const res = await fetch(`${url}/tickets?${queryParams.toString()}`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const tickets = data?.data?.tickets || [];
      combinedTickets = [...combinedTickets, ...tickets];

      const totalPagesFromAPI = data?.data?.pagination?.totalPages || 1;
      if (page >= totalPagesFromAPI) keepFetching = false;
      else page += 1;
    }
  } catch (err) {
    toast.error("Failed to fetch tickets for export");
    console.error(err);
  }

  // Flatten nested or computed fields for export
  const flattenedTickets = combinedTickets.map((t) => ({
    ticket_id: isEmptyValue(t.ticket_id) ? t("N/A") : t.ticket_id,
    subject: isEmptyValue(t.subject) ? t("N/A") : t.subject,
    creator_name: isEmptyValue(t.creator?.full_name || t.creator_name)
      ? t("N/A")
      : (t.creator?.full_name || t.creator_name),
    category: isEmptyValue(CATEGORY_LABELS[t.category] || categoriesMap[t.category] || t.category)
      ? t("N/A")
      : (CATEGORY_LABELS[t.category] || categoriesMap[t.category] || t.category),
    priority: isEmptyValue(t.priority) ? t("N/A") : t.priority,
    status: isEmptyValue(t.status) ? t("N/A") : t.status,
    created_at: isEmptyValue(t.created_at) ? t("N/A") : formatDateTime(t.created_at),
    updated_at: isEmptyValue(t.updated_at) ? t("N/A") : formatDateTime(t.updated_at),
  }));

  return flattenedTickets;
};

const [exporting, setExporting] = useState(false); // track export state

const handleExportData = async (format) => {
  setExporting(true); // start loader
  try {
    const allData = await fetchAllTicketsForExport(); // fetch full data

    if (!allData.length) {
      toast.error("No tickets available for export");
      return;
    }

    const skipColumns = [];

    if (format.toLowerCase() === "pdf") {
      await exportTable(allData, "Tickets", "pdf", { skipColumns });
    } else if (format.toLowerCase() === "excel") {
      await exportTable(allData, "Tickets", "xlsx", { skipColumns });
    } else {
      console.error("Unsupported export format:", format);
    }
  } catch (err) {
    console.error(err);
    toast.error("Export failed. Please try again.");
  } finally {
    setExporting(false); // stop loader
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
    color: "rgba(27, 27, 27, 0.67)",
  };
  return (
    <Box sx={{ py: 2, px: 1 }}>
      <Box
        sx={{
          border: "2px solid #dcdfe4",
          borderRadius: 2,
          backgroundColor: "#fff",
          p: 2,
          mb: 2,
          width: { xs: "100%", md: "78.4vw" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CustomText
              sx={{
                ...textStyles.h1,
                fontWeight: 600,
                fontSize: "18px",
                color: "#003149",
                textAlign: "center",
              }}
            >
              {t("ticketsTable.header")}
            </CustomText>

            {tableLoading && (
              <CircularProgress
                size={18}
                thickness={4}
                sx={{ color: "#006EC2" }}
              />
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                px: 0.75,
                py: 0.25,

                height: 34,

                display: "flex",
                alignItems: "center",
                minWidth: isMobile ? 180 : 260,
              }}
            >
              <OutlinedInput
                placeholder={t("ticketsTable.search")} // your translation key
                sx={{
                  ml: 0.5,
                  fontSize: 14,
                  fontFamily: "Poppins, sans-serif",
                  color: "#616161",
                  width: "100%",
                  ...fieldCommonSx,
                  "& fieldset": { border: "none" }, // remove outline
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton edge="end">
                      <Search sx={{ fontSize: "16px", color: "#222" }} />
                    </IconButton>
                  </InputAdornment>
                }
                value={search}
                onChange={(e) => {
                  setPage(1); // keep pagination reset
                  setSearch(e.target.value); // update search term
                }}
              />
            </Box>

            <ExportMenuButton
  onExport={handleExportData}
  icon={
    exporting ? (
      <CircularProgress size={15} /> // show loader while exporting
    ) : (
      <img
        src={exportIcon}
        alt="Export"
        style={{ width: 30 }}
      />
    )
  }
  options={[
    { label: "PDF", icon: pdfIcon },
    { label: "Excel", icon: csvIcon },
  ]}
  disabled={exporting} // disable while exporting
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


            <Button
              onClick={() => setOpenCreate(true)}
              variant="contained"
              size="small"
              sx={{
                px: 2,
                backgroundColor: "#006EC2",
                height: 32,
                fontSize: 14,
                fontWeight: 400,
                fontFamily: "Poppins, sans-serif",
                borderRadius: "4px",
                textTransform: "none",
              }}
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            >
              {t("ticketsTable.create")}
            </Button>

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
                  bgcolor: "#006EC2",
                }}
              >
                <FilterAltIcon sx={{ color: "white", fontSize: 20 }} />
                <IconButton
                  size="small"
                  onClick={clearFilters}
                  sx={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    bgcolor: "white",
                    width: 18,
                    height: 18,
                    border: "1px solid #C4C4C4",
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
                  backgroundColor: "white",
                  "&:hover": { backgroundColor: "#F2F2F2" },
                }}
              >
                <FilterAltIcon sx={{ fontSize: 22 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Table */}

        {initialLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 260, // same as your empty state height
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
              <Table
                size="small"
                sx={{ minWidth: "max-content", tableLayout: "auto" }}
              >
                <TableHead>
                  <TableRow>
                    {columns.map((c) => (
                      <TableCell
                        key={c.key}
                        sx={{
                          ...cellHeaderSX,
                          cursor: c.key !== "action" ? "pointer" : "default",
                        }}
                        onClick={() => {
                          if (c.key === "action") return;
                          
                          console.log("Sorting clicked:", c.key, "Current sortBy:", sortBy, "Current sortOrder:", sortOrder);
                          
                          if (sortBy === c.key) {
                            const newOrder = sortOrder === "asc" ? "desc" : "asc";
                            console.log("Toggling order to:", newOrder);
                            setSortOrder(newOrder);
                          } else {
                            console.log("Setting new column:", c.key);
                            setSortBy(c.key);
                            setSortOrder("desc"); // default when switching
                          }
                          setPage(1);
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {t(`ticketsTable.columns.${c.key}`)}

                          {c.key !== "action" &&
                            (sortBy === c.key ? (
                              sortOrder === "asc" ? (
                                <NorthIcon sx={{ fontSize: 12 }} />
                              ) : (
                                <SouthIcon sx={{ fontSize: 12 }} />
                              )
                            ) : (
                              // 👇 default: show South (desc) for all inactive columns
                              <SouthIcon sx={{ fontSize: 12 }} />
                            ))}
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pageRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1}>
                        {/* <Box sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography
                          sx={{ fontFamily: 'Poppins, sans-serif', color: '#003149', fontSize: 16 }}
                        >
                          {t("ticketsTable.empty")}
                        </Typography>
                      </Box> */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            height: 300,
                          }}
                        >
                          <img
                            src={emptytickets}
                            alt="No Data"
                            style={{ width: 200 }}
                          />
                          <CustomText
                            sx={{
                              ...textStyles.h1,
                              fontWeight: 500,
                              fontSize: "16px",
                              color: "#003149",
                              pt: 1,
                            }}
                          >
                            {t("ticketsTable.empty")}
                          </CustomText>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageRows.map((row) => (
                      <TableRow key={row.ticket_id} hover>
                        <TableCell sx={{ ...cellDataSX }}>
                          {isEmptyValue(row.ticket_id) ? t("N/A") : row.ticket_id.substring(0, 6)}
                        </TableCell>
                        <TableCell sx={{ ...cellDataSX }}>
                          {displayValue(row.subject)}
                        </TableCell>
                        <TableCell sx={{ ...cellDataSX }}>
                          {displayValue(row.creator_name)}
                        </TableCell>

                        {/* <TableCell sx={{ ...cellDataSX }}>{row.category}</TableCell> */}
                        <TableCell sx={{ ...cellDataSX }}>
                          {displayValue(CATEGORY_LABELS[row.category] || row.category)}
                        </TableCell>
                        <TableCell sx={{ ...cellDataSX }}>
                          <Box sx={{ pointerEvents: "none" }}>
                            <StatusDropdown currentStatus={row.priority} />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...cellDataSX }}>
                          <Box sx={{ pointerEvents: "none" }}>
                            <StatusDropdown currentStatus={row.status} />
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...cellDataSX }}>
                          {isEmptyValue(row.created_at) ? t("N/A") : formatDateTime(row.created_at)}
                        </TableCell>
                        <TableCell sx={{ width: 100 }}>
                          <IconButton
                            ref={(el) => {
                              if (el)
                                menuAnchorsRef.current[row.ticket_id] = el;
                            }}
                            onClick={() => {
                              setAnchorEl(
                                menuAnchorsRef.current[row.ticket_id]
                              );
                              setMenuRowId(row.ticket_id);
                            }}
                          >
                            <MoreVertIcon
                              fontSize="small"
                              sx={{ fontSize: 22 }}
                            />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
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

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          MenuListProps={{ sx: { py: 0 } }}
        >
          <MenuItem
            onClick={() => {
              onView(menuRowId); // send ticketId up
              setAnchorEl(null);
              setMenuRowId(null);
            }}
            sx={{ fontSize: 14, fontFamily: "Poppins, sans-serif" }}
          >
            {viewLoadingId === menuRowId ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                {t("ticketsTable.view")}
              </Box>
            ) : (
              t("ticketsTable.view")
            )}
          </MenuItem>
        </Menu>

        {/* Pagination */}
      </Box>
      {/* </>
      )} */}
      <CreateTicketModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSave={() => {
          setOpenCreate(false);
          fetchTickets(); // 👈 reload tickets after success
        }}
      />
      <FilterModal
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        initial={filters ?? {}}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setPage(1);
        }}
      />
    </Box>
  );
};

export default TicketsTable;
