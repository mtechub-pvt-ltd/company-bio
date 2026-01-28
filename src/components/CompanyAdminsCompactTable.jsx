import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import Block from "@mui/icons-material/Block";
import Email from "@mui/icons-material/Email";
import CloudSync from "@mui/icons-material/CloudSync";
import next from "../Assets/next.png";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TypographyMD from "./items/Typography";
import url from "../url";
import DummyStatusMenuButton from "./DummyStatusMenuButton";
import VerificationStatusDropdown from "./VerificationStatusDropdown";
import FormatDate from "./FormatDate";
import StatusDisplayChip from "./DashboardSimpleStatus";
import VerificationStatusDisplayChip from "./VerificationChip"
const SortIcons = ({ column, sortBy, sortOrder }) => (
  <>
    {sortBy === column && sortOrder === "ASC" ? (
      <ArrowUpward sx={{ fontSize: "17px" }} />
    ) : (
      <ArrowDownward sx={{ fontSize: "17px" }} />
    )}
  </>
);

const CompanyAdminsCompactTable = ({ loading: externalLoading }) => {
  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth || {});
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortingLoader, setSortingLoader] = useState(false);
  const isSortingRef = useRef(false);

  const [sortBy, setSortBy] = useState("registered");
  const [sortOrder, setSortOrder] = useState("DSC");
  const limit = 5; // compact view

  const fetchCompanyAdmins = async (
    page = 1,
    sort_by = sortBy,
    sort_order = sortOrder,
    isSorting = false
  ) => {
    isSorting ? setSortingLoader(true) : setLoading(true);
    const sortParams = sort_by ? `&sort_by=${sort_by}&sort_order=${sort_order}` : "";
    const apiUrl = `${url}company-admins?page=${page}&limit=${limit}${sortParams}`;

    try {
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = data?.data?.company_admins || [];
      setRecords(list);
    } catch (e) {
      setRecords([]);
    } finally {
      setLoading(false);
      setSortingLoader(false);
      isSortingRef.current = false;
    }
  };

  useEffect(() => {
    if (token) {
      fetchCompanyAdmins();
    }
  }, [token]);

  // Use external loading if provided
  const isLoading = typeof externalLoading === "boolean" ? externalLoading : loading || sortingLoader;

  const handleSort = (column) => {
    const newOrder = sortBy === column && sortOrder === "ASC" ? "DSC" : "ASC";
    isSortingRef.current = true;
    setSortBy(column);
    setSortOrder(newOrder);
    fetchCompanyAdmins(1, column, newOrder, true);
  };

  // Verification status dropdown state (match admin page behavior)
  const [anchorElVerificationStatus, setAnchorElVerificationStatus] = useState(null);
  const [selectedVerificationItem, setSelectedVerificationItem] = useState(null);
  const handleOpenVerificationStatusMenu = (event, item) => {
    setSelectedVerificationItem(item);
    setAnchorElVerificationStatus(event.currentTarget);
  };
  const handleCloseVerificationStatusMenu = () => {
    setAnchorElVerificationStatus(null);
  };


  const handleNavigation = (path, state = null) => {
    try {
      navigate(path, state ? { state } : undefined);
    } catch (error) {}
  };

  return (
    <>
      <Box
        width="100%"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        p={2}
        sx={{ overflow: "visible" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TypographyMD
            variant="paragraph"
            label={t("Company admins")}
            color="rgb(33, 33, 33)"
            fontFamily="'Poppins', sans-serif"
            fontSize="18px"
          />
          {isLoading && (
            <CircularProgress size={16} thickness={4} sx={{ ml: 0.5 }} />
          )}
        </Box>
        <img
          src={next}
          alt="Navigate"
          style={{ width: "30px", cursor: "pointer" }}
          onClick={() => handleNavigation("/company-admin")}
        />
      </Box>

      {isLoading ? (
        <Box py={4} display="flex" justifyContent="center">
          <CircularProgress size={20} thickness={3} color="primary" />
        </Box>
      ) : records && records.length > 0 ? (
        <TableContainer sx={{ boxShadow: "none", pt: 1, width: { xs: "100%", md: "78vw" } }}>
          <Table
            sx={{
              minWidth: { xs: "100px", md: "250px" },
              "& .MuiTableCell-root": { padding: "10px" },
              "& .MuiTableRow-root": { height: "25px" },
              whiteSpace: "nowrap !important",
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{ cursor: "pointer", fontWeight: "bold", color: "#44546F", fontFamily: "Poppins, sans-serif", fontSize: "14px" }}
                  onClick={() => handleSort("full_name")}
                >
                  {t("Admin Name")} <SortIcons column="full_name" sortBy={sortBy} sortOrder={sortOrder} />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ cursor: "pointer", fontWeight: "bold", color: "#44546F", fontFamily: "Poppins, sans-serif", fontSize: "14px" }}
                  onClick={() => handleSort("email")}
                >
                  {t("Admin Email")} <SortIcons column="email" sortBy={sortBy} sortOrder={sortOrder} />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ cursor: "pointer", fontWeight: "bold", color: "#44546F", fontFamily: "Poppins, sans-serif", fontSize: "14px" }}
                  onClick={() => handleSort("company_name")}
                >
                  {t("Company Name")} <SortIcons column="company_name" sortBy={sortBy} sortOrder={sortOrder} />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ cursor: "pointer", fontWeight: "bold", color: "#44546F", fontFamily: "Poppins, sans-serif", fontSize: "14px" }}
                  onClick={() => handleSort("country")}
                >
                  {t("Country")} <SortIcons column="country" sortBy={sortBy} sortOrder={sortOrder} />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ cursor: "pointer", fontWeight: "bold", color: "#44546F", fontFamily: "Poppins, sans-serif", fontSize: "14px" }}
                  onClick={() => handleSort("status")}
                >
                  {t("Account Status")} <SortIcons column="status" sortBy={sortBy} sortOrder={sortOrder} />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ cursor: "pointer", fontWeight: "bold", color: "#44546F", fontFamily: "Poppins, sans-serif", fontSize: "14px" }}
                  onClick={() => handleSort("verification_status")}
                >
                  {t("Verification Status")} <SortIcons column="verification_status" sortBy={sortBy} sortOrder={sortOrder} />
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ cursor: "pointer", fontWeight: "bold", color: "#44546F", fontFamily: "Poppins, sans-serif", fontSize: "14px" }}
                  onClick={() => handleSort("registered")}
                >
                  {t("Registered")} <SortIcons column="registered" sortBy={sortBy} sortOrder={sortOrder} />
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {records.map((item) => (
                <TableRow hover key={item.id}>
                  <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 400, fontFamily: "Poppins, sans-serif", maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.full_name}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 400, fontFamily: "Poppins, sans-serif", maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.email}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 400, fontFamily: "Poppins, sans-serif", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.company_name}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 400, fontFamily: "Poppins, sans-serif", maxWidth: 150, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.country}</TableCell>
                  <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 400, fontFamily: "Poppins, sans-serif" }}>
                    {/* <DummyStatusMenuButton
                      status={item.status}
                      statusOptions={[
                        { value: "active", label: t("Active"), color: "#4BCE97", icon: <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} /> },
                        { value: "inactive", label: t("Inactive"), color: "#F87168", icon: <Block fontSize="17px" sx={{ mr: 1 }} /> },
                        { value: "invited", label: t("Invited"), color: "#579DFF", icon: <Email fontSize="17px" sx={{ mr: 1 }} /> },
                        { value: "requested", label: t("Requested"), color: "#ebc634", icon: <CloudSync fontSize="17px" sx={{ mr: 1 }} /> },
                      ]}
                      onChange={() => {}}
                    /> */}
                    <StatusDisplayChip
  status={item.status}
  statusOptions={[
    {
      value: "active",
      label: t("Active"),
      color: "#4BCE97",
      icon: <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} />,
    },
    {
      value: "inactive",
      label: t("Inactive"),
      color: "#F87168",
      icon: <Block fontSize="17px" sx={{ mr: 1 }} />,
    },
    {
      value: "invited",
      label: t("Invited"),
      color: "#579DFF",
      icon: <Email fontSize="17px" sx={{ mr: 1 }} />,
    },
    {
      value: "requested",
      label: t("Requested"),
      color: "#ebc634",
      icon: <CloudSync fontSize="17px" sx={{ mr: 1 }} />,
    },
  ]}
/>
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 400, fontFamily: "Poppins, sans-serif" }}>
                    {/* <VerificationStatusDropdown
                      item={item}
                      anchorEl={anchorElVerificationStatus}
                      onOpen={handleOpenVerificationStatusMenu}
                      onClose={handleCloseVerificationStatusMenu}
                      onStatusSelect={() => {}}
                    /> */}
                    <VerificationStatusDisplayChip status={item.verification_status} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: "14px", fontWeight: 400, fontFamily: "Poppins, sans-serif" }}>
                    <FormatDate inputDate={item.registered} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </TableContainer>
      ) : (
        <Box sx={{ width: "100%", py: 5, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#888", fontSize: "14px" }}>
          <img src={require('../Assets/nodata.png')} alt="No data" style={{ width: 120, opacity: 0.7, marginBottom: 8 }} />
          <span>{t("No Company Admins Found!")}</span>
        </Box>
      )}
    </>
  );
};

CompanyAdminsCompactTable.propTypes = {
  loading: PropTypes.bool,
};

export default CompanyAdminsCompactTable;


