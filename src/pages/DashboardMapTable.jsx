import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress
} from "@mui/material";
import { useTranslation } from "react-i18next";
import StatusDropdown from "../components/StatusDropdown";
import nodata from "../Assets/nodata.png"
const MapDataTable = ({ data,loading }) => {
  const { t } = useTranslation();

  const HaederStyles = {
    color: "#44546F",
    fontSize: "12px",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 600,
    textAlign: "center",
       whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const DataStyles = {
    color: "#172B4D",
    fontSize: "12px",
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
    fontWeight: 400,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const showOrDash = (value) => (value && value !== "" ? value : "--");

  return (
    <TableContainer
      component={Paper}
      sx={{
        mt: 3,
        maxHeight: 400,
        overflow: "auto",
        borderRadius: 2,
      }}
    >
      <Table
        size="small"
        stickyHeader
        sx={{
          minWidth: 900,
          tableLayout: "fixed",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={HaederStyles}>{t("table_id")}</TableCell>
            <TableCell sx={HaederStyles}>{t("table_name")}</TableCell>
            <TableCell sx={HaederStyles}>{t("table_business_email")}</TableCell>
            <TableCell sx={HaederStyles}>{t("table_admin_name")}</TableCell>
            <TableCell sx={HaederStyles}>{t("table_admin_email")}</TableCell>
            <TableCell sx={HaederStyles}>{t("table_country")}</TableCell>
         
            <TableCell sx={HaederStyles}>{t("table_status")}</TableCell>
            <TableCell sx={HaederStyles}>{t("table_created_at")}</TableCell>
          </TableRow>
        </TableHead>
<TableBody>


   {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box
                    sx={{
                      height: 250,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <CircularProgress size={32} thickness={4} color="primary" />
                  </Box>
                </TableCell>
              </TableRow>
            ) : data && data.length > 0 ? (

    data.map((item) => (
      <TableRow key={item.id} hover>
        <TableCell sx={DataStyles}>{item.id}</TableCell>

        <TableCell
          sx={{ ...DataStyles, maxWidth: 100, cursor: "pointer" }}
          title={showOrDash(item.info?.legalName)}
        >
          {item.info?.legalName
            ? item.info.legalName.length > 15
              ? item.info.legalName.substring(0, 15) + "..."
              : item.info.legalName
            : "--"}
        </TableCell>

        <TableCell sx={DataStyles}>
          {showOrDash(item.info?.businessEmail)}
        </TableCell>

        <TableCell
          sx={{ ...DataStyles, maxWidth: 100, cursor: "pointer" }}
          title={showOrDash(item.info?.adminName)}
        >
          {item.info?.adminName
            ? item.info.adminName.length > 15
              ? item.info.adminName.substring(0, 15) + "..."
              : item.info.adminName
            : "--"}
        </TableCell>

        <TableCell sx={DataStyles}>
          {showOrDash(item.info?.adminEmail)}
        </TableCell>

        <TableCell sx={DataStyles}>
          {showOrDash(item.region?.country)}
        </TableCell>

        <TableCell sx={DataStyles}>
          <Box sx={{ pointerEvents: "none" }}>
            <StatusDropdown
              currentStatus={item.company_status || item.status}
            />
          </Box>
        </TableCell>

        <TableCell sx={DataStyles}>
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "--"}
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={8}>
        <Box
          sx={{
            height: 250,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <img
            src={nodata}
            alt="No data"
            style={{ width: 120, opacity: 0.7 }}
          />
          <span
            style={{
              fontSize: 14,
              color: "#7A869A",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {t("no_data")}
          </span>
        </Box>
      </TableCell>
    </TableRow>
  )}
</TableBody>
      </Table>
    </TableContainer>
  );
};

export default MapDataTable;
