// components/CompaniesTable.jsx
import React, { useEffect, useState, useRef } from "react";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import next from "../Assets/next.png";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import axios from "axios";
import url from "../url";
import nodata from "../Assets/nodata.png";
import { useTranslation } from "react-i18next";
import TypographyMD from "./items/Typography";
import { useNavigate } from "react-router-dom";
const CompaniesTable = () => {
  const { t } = useTranslation();
  const token = useSelector((state) => state.auth.token);
  const [companies, setCompanies] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Loading states
  const [sortingLoader, setSortingLoader] = useState(false);
  const isSortingRef = useRef(false);

  // Fetch companies from API
  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${url}public/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.data.error) {
        setCompanies(response.data.data.companies);
        setSortedData(response.data.data.companies);
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  useEffect(() => {
    if (token) fetchCompanies();
  }, [token]);

  // Sorting state (default column = id, default direction = desc)
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "desc",
  });
  const navigate = useNavigate();
  const handleNavigation = (path, state = null) => {
    try {
      navigate(path, state ? { state } : undefined);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };


 const handleSort = (key) => {
  let direction = "asc";

  if (sortConfig.key === key) {
    // If same column, toggle direction
    direction = sortConfig.direction === "asc" ? "desc" : "asc";
  }

  isSortingRef.current = true; // Mark sorting in progress
  setSortingLoader(true);

  // Simulate API delay for sorting (like Account Executive)
  setTimeout(() => {
    const sorted = [...companies].sort((a, b) => {
      const aVal = a[key] ?? "";
      const bVal = b[key] ?? "";
      return direction === "desc"
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    });

    setSortedData(sorted);
    setSortConfig({ key, direction });
    setSortingLoader(false);
    isSortingRef.current = false;
  }, 200);
};

  // Arrow renderer (always show something)
  const getSortSymbol = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? (
        <ArrowUpward sx={{ fontSize: "17px", ml: 0.5, }} />
      ) : (
        <ArrowDownward sx={{ fontSize: "17px", ml: 0.5, }} />
      );
    }
    // Inactive column → faint down arrow
    return (
      <ArrowDownward sx={{ fontSize: "17px", ml: 0.5, color: "#ccc" }} />
    );
  };

  // Pagination
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    "id",
    "name",
    "legal_name",
    "trade_name",
    "business_type",
    "business_sector",
    "business_email",
    "business_phone",
    "country",
    "province",
    "city",
    "community",
    "postal_code",
    "street_address",
  ];

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
                        <Box sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: 1, 
                          
                        }}>
                          <TypographyMD
                            variant="paragraph"
                            label={t("Company admins")}
                            color="rgb(33, 33, 33)"
                            fontFamily="'Poppins', sans-serif"
                            fontSize="18px"
                          />
                          {sortingLoader && (
                            <CircularProgress 
                              size={16}
                              thickness={4}
                              sx={{ 
                                ml: 0.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }} 
                            />
                          )}
                        </Box>
                        <img
                          src={next}
                          alt="Navigate"
                          style={{ width: "30px", cursor: "pointer" }}
                          onClick={() => handleNavigation("/company-admin")}
                        />
                      </Box>
    

     {sortedData.length > 0 ? (
      
    <TableContainer
      sx={{
        minWidth: "900px",
        borderRadius: "5px",
        boxShadow: "none",
        pt: 1,
        width: { xs: "100%", md: "78vw" },
      }}
    >
      <Table
        sx={{
          minWidth: { xs: "100px", md: "250px" },
          "& .MuiTableCell-root": { padding: "10px" },
          "& .MuiTableRow-root": { height: 60 },
        }}
        whiteSpace='nowrap !important'      >
        <TableHead>
          <TableRow>
           {columns.map((key, i) => (
  <TableCell
    key={i}
    align="center"
    sx={{
      fontWeight: "bold",
      color: "#44546F",
      fontFamily: "Roboto",
      fontSize: "14px",
      cursor: "pointer",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: 150,
    }}
    onClick={() => handleSort(key.toLowerCase().replace(/ /g, "_"))}
  >
    {t(key)} {getSortSymbol(key.toLowerCase().replace(/ /g, "_"))}
  </TableCell>
))}
          </TableRow>
        </TableHead>

       
          <TableBody>
            {paginatedData.map((company) => (
              <TableRow key={company.id} hover>
                <TableCell
                  align="center"
                  sx={{
                    whiteSpace: "nowrap !important",
                    overflow: "hidden",
                    
                    maxWidth: 150,
                    fontSize: 14,
                    fontWeight: 400,
                  }}
                >
                  {company.id}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14, fontWeight:'400',  whiteSpace: "nowrap !important", }}>
                  {company.name}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14, fontWeight:'400',  whiteSpace: "nowrap !important", }}>
                  {company.legal_name}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14, fontWeight:'400',  whiteSpace: "nowrap !important", }}>
                  {company.trade_name}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14, fontWeight:'400',  whiteSpace: "nowrap !important", }}>
                  {company.business_type}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14, fontWeight:'400',  whiteSpace: "nowrap !important", }}>
                  {company.business_sector || "-"}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14, fontWeight:'400',  whiteSpace: "nowrap !important", }}>
                  {company.business_email}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14, fontWeight:'400',  whiteSpace: "nowrap !important", }}>
                  {company.business_phone || "-"}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14, fontWeight:'400',  whiteSpace: "nowrap !important", }}>
                  {company.country}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14, fontWeight:'400',  whiteSpace: "nowrap !important", }}>
                  {company.province || "-"}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14 ,  fontWeight:'400', whiteSpace: "nowrap !important",}}>
                  {company.city}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14, fontWeight:'400',  whiteSpace: "nowrap !important", }}>
                  {company.community || "-"}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14, fontWeight:'400',  whiteSpace: "nowrap !important", }}>
                  {company.postal_code || "-"}
                </TableCell>
                <TableCell align="center" sx={{ fontSize: 14 , fontWeight:'400',  whiteSpace: "nowrap !important",}}>
                  {company.street_address}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
       
      </Table>

      <Box
        sx={{
          mt: 1,
          mb: 1,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Pagination
          count={Math.ceil(sortedData.length / pageSize)}
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
              py: 5,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "#888",
              fontSize: "14px",
            }}
          >
            <img src={nodata} alt="" height={100} />
            No companies found
          </Box>
        )}
    </>
  );
};

export default CompaniesTable;




