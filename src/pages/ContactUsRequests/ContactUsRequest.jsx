import React, { useState, useEffect } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew.jsx";
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Pagination,
  Typography,
} from "@mui/material";
import url from "../../url.jsx";
import TruncatedCell from "../../components/TruncatedCell.js";
import AddContactModal from "./DetailsDrawer.jsx";
import nodata from "../../Assets/nodata.png";
import { useTranslation } from "react-i18next";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ContactDetailsDrawer from "./DetailsDrawer.jsx";
function ContactUsRequests() {
  const [loading, setLoading] = useState(true);
  const [contactList, setContactList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
const [miniLoading, setMiniLoading] = useState(false);
  const rowsPerPage = 5;
const { t } = useTranslation();
  // ---------------------------
  // Fetch API Data
  // ---------------------------
 const fetchData = async (isInitial = false) => {
  try {
    if (isInitial) {
      setLoading(true);        // ONLY initial load
    } else {
      setMiniLoading(true);    // pagination or refresh
    }

    const res = await fetch(
      `${url}/contact-us?page=${page}&limit=${rowsPerPage}&sortBy=created_at&sortOrder=DESC`
    );

    const data = await res.json();

    if (!data.error) {
      setContactList(data.data.data);
      setTotalPages(data.data.pagination.totalPages);
    }
  } catch (error) {
    console.error("API Error:", error);
  } finally {
    if (isInitial) {
      setLoading(false);
    }
    setMiniLoading(false);
  }
};


 useEffect(() => {
  fetchData(true);
}, []);
useEffect(() => {
fetchData(false);
}, [page]);


    const HaederStyles = {
    color: "#44546F",
    fontSize: "14px",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
      whiteSpace: 'nowrap', // ✅ Prevent text wrap
 
      overflow: 'hidden',
  textOverflow: 'ellipsis',
    cursor: "pointer",
  };
  const DataStyles = {
    color: "#172B4D",
    fontSize: "12px",
      
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
      whiteSpace: 'nowrap', // ✅ Prevent text wrap
   
      overflow: 'hidden',
  textOverflow: 'ellipsis',
  };
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
const [openDrawer, setOpenDrawer] = useState(false);
const [selectedRow, setSelectedRow] = useState(null);

  // ---------------------------
  // Render Component
  // ---------------------------
return (
  <SidebarNew
    componentTitle="Admin"
    componentData={
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          overflowY: "auto",
          padding: 1,
          height: "calc(100vh - 100px)",
        }}
      >
        <Box
          sx={{
            boxShadow: "none",
            borderRadius: "10px",
            p: 2,
            backgroundColor: "#FFFFFF",
            border: "2px solid #E5E7EB",
          }}
        >
          {/* Heading + Add Button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontSize: "20px", fontWeight: 600 }}>
                {t("contact_requests_heading")}
              </Typography>

              {/* Small Loader */}
              {miniLoading && (
                <CircularProgress size={18} thickness={4} color="primary" />
              )}
            </Box>

          
          </Box>

          {/* MAIN LOADING */}
          {loading ? (
            <Box
              sx={{
                width: "100%",
                height: "300px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : contactList.length === 0 ? (
            /* EMPTY SCREEN WHEN NO DATA */
            <Box
              sx={{
                width: "100%",
                height: "300px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                mt: 3,
              }}
            >
              <img
                src={nodata}
                alt="No Data"
                style={{ width: "250px", opacity: 0.8 }}
              />
              <Typography sx={{ mt: 1, color: "#6B7280", fontSize: "14px" }}>
                {t("no_data_found")}
              </Typography>
            </Box>
          ) : (
            <>
              {/* TABLE */}
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: "none",
                  overflowX: "hidden",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={HaederStyles}>{t("column_id")}</TableCell>
                      <TableCell sx={HaederStyles}>{t("column_name")}</TableCell>
                      <TableCell sx={HaederStyles}>
                        {t("column_email")}
                      </TableCell>
                      <TableCell sx={HaederStyles}>
                        {t("column_subject")}
                      </TableCell>
                      <TableCell sx={HaederStyles}>
                        {t("column_message")}
                      </TableCell>
                      <TableCell sx={HaederStyles}>
                        {t("column_created_at")}
                      </TableCell>
                      <TableCell sx={HaederStyles}>{t("column_action")}</TableCell>

                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {contactList.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={DataStyles}>{row.id}</TableCell>
                        <TableCell sx={DataStyles}>{row.name}</TableCell>
                        <TableCell sx={DataStyles}>{row.email}</TableCell>
                        <TableCell sx={DataStyles}>{row.subject}</TableCell>
                        <TableCell sx={DataStyles}>
                          <TruncatedCell
                            text={row.message}
                            maxLength={25}
                          />
                        </TableCell>
                        <TableCell sx={DataStyles}>
                          {formatDate(row.created_at)}
                        </TableCell>
                        <TableCell sx={DataStyles}>
  <VisibilityIcon
    onClick={() => {
      setSelectedRow(row); 
      setOpenDrawer(true);
    }}
    style={{ cursor: "pointer", color: "#1976d2" }}
  />
</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* PAGINATION */}
              <Box
                sx={{ display: "flex", justifyContent: "center", mt: 2 }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
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
            </>
          )}

     <ContactDetailsDrawer
  open={openDrawer}
  onClose={() => setOpenDrawer(false)}
  data={selectedRow}
/>
        </Box>
      </Box>
    }
  />
);

}

export default ContactUsRequests;
