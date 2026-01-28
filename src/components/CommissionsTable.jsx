
// components/CommissionsTable.jsx
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Chip,
} from "@mui/material";
import { useSelector } from "react-redux";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import url from "../url";
import {
  formatAmount,
  getCurrencySymbol,
} from "../helper_functions/CurrencyFormate";
import nodata from "../Assets/no-payment.png";

const CommissionsTable = ({ onLoadingChange, }) => {
  const {t} = useTranslation()
  const token = useSelector((state) => state.auth.token);
  const [commissions, setCommissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Default sorting: payment_date desc
  const [sortConfig, setSortConfig] = useState({
    key: "payment_date",
    direction: "desc",
  });

  const pageSize = 5;

  // Local loading state to show small loader when backend request is in progress
  const [isLoading, setIsLoading] = useState(true);


  const fetchCommissions = async (page = 1) => {
  setIsLoading(true);

  try {
    // const params = new URLSearchParams({
    //   page,
    //   limit: pageSize,
    //   sort_by: sortConfig.key,
    //   sort_order: sortConfig.direction.toUpperCase(),
    //   ...filters,
    // });
    const params = new URLSearchParams({
  page,
  limit: pageSize,
  sort_by: sortConfig.key,
  sort_order: sortConfig.direction.toUpperCase(),
});

    console.log("🔵 COMMISSIONS API PARAMS:", Object.fromEntries(params));

    const res = await fetch(
      `${url}payments/super-admin/commissions?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();

    console.log("🟢 COMMISSIONS API RAW RESPONSE:", data);

    if (!data.error) {
      console.log(
        "🟡 COMMISSIONS FROM API (data.data.commissions):",
        data.data.commissions
      );

      setCommissions(data.data.commissions || []);
      setTotalPages(data.data.pagination?.pages || 1);
    } else {
      console.warn("🔴 API ERROR FLAG TRUE:", data);
      setCommissions([]);
      setTotalPages(1);
    }
  } catch (err) {
    console.error("❌ Error fetching commissions:", err);
    setCommissions([]);
    setTotalPages(1);
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    if (token) fetchCommissions(currentPage);
  }, [token, currentPage, sortConfig]);

  // Notify parent components about loading state changes (if a callback is provided)
  useEffect(() => {
    if (typeof onLoadingChange === "function") {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  // Sorting
 const handleSort = (key) => {
  let direction = "asc"; // default to ascending

  if (sortConfig.key === key) {
    // toggle direction if same key is clicked
    direction = sortConfig.direction === "asc" ? "desc" : "asc";
  }

  setSortConfig({ key, direction });
};

  // Arrow renderer
  const getSortSymbol = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? (
        <ArrowUpward sx={{ fontSize: "17px", ml: 0.5,  }} />
      ) : (
        <ArrowDownward sx={{ fontSize: "17px", ml: 0.5,  }} />
      );
    }
    return (
      <ArrowDownward sx={{ fontSize: "17px", ml: 0.5, color: "#ccc" }} />
    );
  };

  // Status color for badge
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "requested":
        return "info";
      default:
        return "default";
    }
  };
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

  return (
    <>
      {commissions.length > 0 ? (

    <TableContainer
      sx={{
        borderRadius: { xs: "5px", md: "20px" },
        boxShadow: "none",
        pt: 1,
        width: { xs: "100%", md: "45vw" },
      }}
    >
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Table
          sx={{
            minWidth: { xs: "100px", md: "1000px" },
            "& .MuiTableCell-root": { padding: "10px" },
            "& .MuiTableRow-root": { height: 60 },
          }}
          whiteSpace="nowrap !important"
        >
          <TableHead>
           
<TableRow>
  {[
    { key: "commission_id", label: "ID" },
    { key: "name", label: "Account Executive Name" },
    // { key: "email", label: "Email" },
    { key: "company_name", label: "Company" },
    { key: "plan_name", label: "Plan" },
    { key: "payment_amount", label: "Payment Amount" },
    { key: "commission_amount", label: "Commission Amount" },
    { key: "payment_date", label: "Payment Date" },
    { key: "status", label: "Status" },
  ].map((col) => (
    <TableCell
      key={col.key}
      align="center"
      sx={{
        fontWeight: "bold",
        color: "#44546F",
        fontFamily: "Roboto",
        fontSize: "14px",
        cursor: "pointer",
        whiteSpace: "nowrap !important",
      }}
      onClick={() => handleSort(col.key)}
    >
      {t(col.label)} {getSortSymbol(col.key)}
    </TableCell>
  ))}
</TableRow>
          </TableHead>

        
            <TableBody>
              {commissions.map((item) => (
                <TableRow key={item.commission_id} hover>
                  <TableCell align="center" sx={{ fontSize: "14px" ,fontWeight:'400',  whiteSpace: "nowrap !important",}}>
                    {item.commission_id}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "14px" ,fontWeight:'400',  whiteSpace: "nowrap !important",}}>
                    {/* {item.name} */}
                      {displayValue(item.name)}
                                        <br/>
                                          {displayValue(item.email)}
                  </TableCell>
                  {/* <TableCell align="center" sx={{ fontSize: "14px" ,fontWeight:'400',  whiteSpace: "nowrap !important",}}>
                    {item.email}
                  </TableCell> */}
                  <TableCell align="center" sx={{ fontSize: "14px" ,fontWeight:'400',  whiteSpace: "nowrap !important",}}>
                    {item.company_name}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "14px" ,fontWeight:'400',  whiteSpace: "nowrap !important",}}>
                    {item.plan_name}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "14px" ,fontWeight:'400',  whiteSpace: "nowrap !important",}}>
                    {getCurrencySymbol(item.plan_currency)}{" "}
                    {formatAmount(item.payment_amount)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "14px" ,fontWeight:'400',  whiteSpace: "nowrap !important",}}>
                    {getCurrencySymbol(item.plan_currency)}{" "}
                    {formatAmount(item.commission_amount)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "14px" ,fontWeight:'400',  whiteSpace: "nowrap !important",}}>
                     {new Date(item.payment_date).toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  })}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "14px" ,fontWeight:'400',  whiteSpace: "nowrap !important",}}>
                  
                     
                                                            <Box
                                                              sx={{
                                                                backgroundColor:
                                                                  item?.status === "paid"
                                                                    ? "#4BCE97"
                                                                    : "#F87168",
                                                                display: "inline-flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                px: 1.5,
                                                                py: 0.5,
                                                                borderRadius: "6px",
                                                                fontSize: {
                                                                  xs: "12px",
                                                                  md: "14px",
                                                                },
                                                                fontWeight: 500,
                                                                color: "#fff",
                                                                fontFamily: "Poppins, sans-serif",
                                                              }}
                                                            >
                                                              {item?.status === "paid"
                                                                ? t("Paid")
                                                                : t("Unpaid")}
                                                            </Box>
                                                         
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
         
        </Table>

      </Box>

      <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, value) => setCurrentPage(value)}
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
     ) : (
            <Box
              sx={{
                width: "100%",
                py: 8,
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
                color: "#888",
                fontSize: "14px",
                
                mt: 2,
              }}
            >
              <img src={nodata} height={100} alt="" />
              {t("No data found")}
             
            </Box>
          )}
    </>
  );
};

export default CommissionsTable;
