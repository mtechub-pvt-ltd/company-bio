import React, { useEffect, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Pagination,IconButton
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeletionRequestFilterDrawer from "./FilterDrawer";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import url from "../../url";
import DeletionRequestStatusDropdown from "../../components/DeletionRequestDropdown";
import DeletionRequestActionModal from "./UpdateConfirmationModel";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
function DeleteRequests() {
  const { token } = useSelector((state) => state?.auth || {});
  const { t } = useTranslation();


  const [requests, setRequests] = useState([]);
const [page, setPage] = useState(0);       // page starts from 0 for frontend
const [limit] = useState(5);               // always 5 rows
const [totalPages, setTotalPages] = useState(1);
const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

const [filters, setFilters] = useState({
  status: "",
});

const isFilterApplied = filters.status !== "";
const [initialLoading, setInitialLoading] = useState(true); 
const [tableLoading, setTableLoading] = useState(false);
const fetchDeletionRequests = async ({ initial = false } = {}) => {
  try {
    if (initial) setInitialLoading(true);
    else setTableLoading(true);

    const queryParams = new URLSearchParams({
      page: page + 1,
      limit: limit,
    });

    if (filters.status) queryParams.append("status", filters.status);

    console.log("📡 Fetching:", `${url}deletion-requests?${queryParams.toString()}`);

    const res = await fetch(`${url}deletion-requests?${queryParams.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    console.log("📥 API Response:", json);

    if (!json.error) {
      setRequests(json.data.requests || []);
      setTotalPages(json.data.pagination?.pages || 1);
    }
  } catch (err) {
    console.error("❌ Fetch Error:", err);
  } finally {
    if (initial) setInitialLoading(false);
    else setTableLoading(false);
  }
};



useEffect(() => {
  fetchDeletionRequests({ initial: true });
}, [token]);

useEffect(() => {
  if (token) fetchDeletionRequests({ initial: false });
}, [page]);

const firstRender = React.useRef(true);

useEffect(() => {
  if (firstRender.current) {
    firstRender.current = false;
    return; // ⛔ skip first time
  }

  if (token) {
    console.log("Filters changed 🟦 Running API...", filters);
    setTableLoading(true);
    fetchDeletionRequests({ initial: false });
  }
}, [filters]);
  // truncate helper
  const truncate = (text, length = 10) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  // Same UI style as Departments Table
  const headerCell = {
    color: "#44546F",
    fontSize: "14px",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    padding: "10px 12px",
    whiteSpace: "nowrap",
  };

  const dataCell = {
    color: "#172B4D",
    fontSize: "13px",
    fontFamily: "Poppins, sans-serif",
    padding: "8px 12px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: "16px",
  };
const [statusAnchorEl, setStatusAnchorEl] = useState(null);
const [selectedItem, setSelectedItem] = useState(null);

const [actionModalOpen, setActionModalOpen] = useState(false);
const [actionType, setActionType] = useState(""); // "APPROVE" or "REJECT"
const [actionLoading, setActionLoading] = useState(false);


const submitAction = async (comment) => {
  if (!selectedItem) return;

  setActionLoading(true);

  try {
    const id = selectedItem.id;
    const endpoint =
      actionType === "APPROVED"
        ? `${url}deletion-requests/${id}/approve`
        : `${url}deletion-requests/${id}/reject`;

    await fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ admin_comment: comment }),
    });

    setActionModalOpen(false);
    setActionLoading(false);
    fetchDeletionRequests();
  } catch (error) {
    console.error("Failed action:", error);
    setActionLoading(false);
  }
};


  return (
    <SidebarNew
      componentTitle={t("deletionRequests.title")}
      componentData={
        <Box sx={{ width: "100%", mt: 2, px: 1 }}>
          <Card sx={{ boxShadow: "none", border: "2px solid #E5E7EB", borderRadius: 2 }}>
            <CardContent>
             <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex",  alignItems: "center",gap:1, }}>

  <Typography
    sx={{
      fontSize: "18px",
      fontFamily: "Poppins, sans-serif",
    }}
  >
    {t("deletionRequests.title")}
  </Typography>
{tableLoading && <CircularProgress size={20} sx={{ ml: 1 }} />}
</Box>
  {/* Filter Icon */}
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
      <FilterAltIcon sx={{ color: "#fff", fontSize: 20 }} />

      <IconButton
        size="small"
        onClick={() => {
          setFilters({ status: "" });
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
        }}
      >
        <CloseRoundedIcon sx={{ fontSize: 14, color: "#006EC2" }} />
      </IconButton>
    </Box>
  ) : (
    <IconButton
      onClick={() => setFilterDrawerOpen(true)}
      sx={{
        border: "1px solid #C4C4C4",
        width: 34,
        height: 34,
        borderRadius: 1,
        backgroundColor: "white",
        color: "#5E5C5C",
      }}
    >
      <FilterAltIcon />
    </IconButton>
  )}
</Box>

              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "none",
              
                }}
              >
                <Table
                  stickyHeader
                  size="small"
                  sx={{
                    tableLayout: "auto", // NO FIXED WIDTH — Responsive like Departments
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headerCell}>{t("deletionRequests.columns.accountExecutive")}</TableCell>
                      <TableCell sx={headerCell}>{t("deletionRequests.columns.targetUser")}</TableCell>
                      <TableCell sx={headerCell}>{t("deletionRequests.columns.status")}</TableCell>
                      <TableCell sx={headerCell}>{t("deletionRequests.columns.reason")}</TableCell>
                      <TableCell sx={headerCell}>{t("deletionRequests.columns.createdAt")}</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                 {initialLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <CircularProgress size={20} />
                        </TableCell>
                      </TableRow>
                    ) : requests.length > 0 ? (
                      requests.map((item) => (
                        <TableRow key={item.id} sx={{ height: "48px" }}>
                          
                          {/* Requester */}
                          <TableCell sx={dataCell}>
                            <div style={{ fontWeight: 600 }}>{item.requester?.name}</div>
                            <div style={{ fontSize: "12px", color: "#555" }}>
                              {item.requester?.email}
                            </div>
                          </TableCell>

                          {/* Target User */}
                          <TableCell sx={dataCell}>
                            <div style={{ fontWeight: 600 }}>{item.target_user?.name}</div>
                            <div style={{ fontSize: "12px", color: "#555" }}>
                              {item.target_user?.email}
                            </div>
                            <div style={{ fontSize: "12px" }}>
                             {t("company")}: {item.target_user?.company_name}
                            </div>
                          </TableCell>

                          {/* Status */}
                   <TableCell sx={dataCell}>
  <DeletionRequestStatusDropdown
    item={item}
    anchorEl={statusAnchorEl}
    onOpen={(e, selectedItem) => {
      setStatusAnchorEl(e.currentTarget);
      setSelectedItem(selectedItem);
    }}
    onClose={() => setStatusAnchorEl(null)}
  onStatusSelect={(newStatus) => {
  setActionType(newStatus);        // APPROVED or REJECTED
  setActionModalOpen(true);        // open modal
  setStatusAnchorEl(null);
}}
  />
</TableCell>

                          {/* Reason (truncated) */}
                          <TableCell
                            sx={dataCell}
                            title={item.deletion_reason}
                          >
                            {truncate(item.deletion_reason, 10)}
                          </TableCell>

                          {/* Date */}
                        <TableCell sx={dataCell}>
  {new Date(item.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          No records found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
  <Pagination
    count={totalPages}
    page={page + 1}
    onChange={(e, value) => setPage(value - 1)}
    shape="rounded"
    color="primary"
    size="small"
    sx={{
      "& .MuiPaginationItem-root": {
        fontFamily: "Poppins, sans-serif",
        fontSize: 13,
        fontWeight: 500,
      },
    }}
  />
</Box>
            </CardContent>
          </Card>
          <DeletionRequestActionModal
  open={actionModalOpen}
  onClose={() => setActionModalOpen(false)}
  action={actionType === "APPROVED" ? "APPROVE" : "REJECT"}
  item={selectedItem}
  loading={actionLoading}
  onSubmit={submitAction}
/>
<DeletionRequestFilterDrawer
  open={filterDrawerOpen}
  onClose={() => setFilterDrawerOpen(false)}
  filters={filters}
  onApply={(newFilters) => {
    setFilters(newFilters);
    setPage(0);
  }}
/>
        </Box>
      }
    />
  );
}

export default DeleteRequests;
