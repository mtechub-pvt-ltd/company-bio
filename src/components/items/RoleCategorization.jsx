import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import {
  Card,
  CardContent,
  Grid,
  Box,
  Typography,
  MenuItem,
  Select,
  CircularProgress
} from "@mui/material";
import nodata from '../../Assets/nodata.png';
import { useTranslation } from "react-i18next";
import TypographyMD from "./Typography";
import next from "../../Assets/next.png";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import url from "../../url";

const RoleCategorization = ({ dashboard }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  // API-driven states
  const [series, setSeries] = useState([]);
  const [pieLabels, setPieLabels] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const pieColors = ["#2E90FA", "#FFA654", "#A367DC", "#6FCF97", "#F24E1E"];

 useEffect(() => {
  if (!token) {
    console.warn("⚠️ No token found, skipping role distribution fetch");
    return;
  }
  setLoading(true);
  fetch(`${url}/super-admin/statistics/role-distribution`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then((result) => {
      if (result.error) {
        setPieLabels([]);
        setSeries([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      const distribution = result.data.distribution || [];
      const labels = distribution.map((item) => item.role);
      const counts = distribution.map((item) => item.count);
      setPieLabels(labels);
      setSeries(counts);
      setTotalCount(result.data.total_users);
      setLoading(false);
    })
    .catch((err) => {
      setPieLabels([]);
      setSeries([]);
      setTotalCount(0);
      setLoading(false);
    });
}, [token]);


  const pieOptions = {
    chart: { type: "donut" },
    // Use localized labels for the chart internals (legend/tooltip)
    labels: pieLabels.map((label) => t(label)),
    colors: pieColors,
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { show: true, width: 10, colors: ["#fff"], lineCap: "round" },
    tooltip: {
      y: {
        formatter: (val, opts) => {
          const name = opts?.w?.globals?.seriesNames?.[opts?.seriesIndex] || "";
          return `${name}: ${val}`;
        },
      },
    },
    plotOptions: {
      pie: { donut: { size: "75%", labels: { show: false } } },
    },
  };

  return (
    <Card sx={{ boxShadow: "none", borderRadius: "10px", border: "2px solid #E5E7EB" }}>
      <CardContent>
        <Grid container spacing={2}>
          {/* Header */}
          <Grid item xs={6}>
            <Typography sx={{ fontSize: "18px !important", color: "rgb(33, 33, 33) !important" }}>
              {t("Role Categorisation")}
            </Typography>
          </Grid>
          <Grid item xs={6} display="flex" justifyContent="flex-end">
            <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
              {/* <Select
                size="small"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                sx={{
                  minWidth: "80px",
                  height: "30px",
                  fontSize: "13px",
                  fontWeight: 500,
                  "& .MuiSelect-select": { padding: "4px 10px" },
                }}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select> */}
              {dashboard ? (
                <div>
                  <img src={next} alt="" style={{ width: "25px", cursor: "pointer" }} onClick={() => navigate("/total-users")} />
                </div>
              ) : null}
            </div>
          </Grid>

          {/* Donut Chart or Loading/No Data */}
          <Grid item xs={12} display="flex" justifyContent="center" position="relative">
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={210} width={210}>
                <CircularProgress size={48} thickness={4} color="primary" />
              </Box>
            ) : (series.length === 0 || series.every((val) => val === 0)) ? (
              <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={210} width={210}>
                <img src={nodata} alt="No data found" height={100} />
                <Typography color="#888" fontSize={14}>{t("No data found")}</Typography>
              </Box>
            ) : (
              <Box position="relative" width={210} height={210}>
                <Chart options={pieOptions} series={series} type="donut" width={210} height={210} />
                <Box position="absolute" top="47%" left="52%" sx={{ display: "flex", flexDirection: "column", justifyContent: "center", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                  <TypographyMD variant="paragraph" label={totalCount.toLocaleString()} color="#2E2E30" fontFamily="'Poppins', sans-serif" lineHeight="14px" fontSize="30px" />
                  <TypographyMD variant="paragraph" label={<>{t("biometric.overallBiometric")} <br /> {t("biometric.clients")}</>} color="#5E5C5C" fontFamily="'Poppins', sans-serif" lineHeight="20px" fontSize="12px" fontWeight={400} />
                </Box>
              </Box>
            )}
          </Grid>

          {/* Legend */}
          <Grid item xs={12} ml={2} mt={-3}>
            <Box display="flex" flexDirection="column" gap={1} alignItems="flex-start">
              {pieLabels.map((label, index) => (
                <Box key={label || index} display="flex" alignItems="center">
                  <Box sx={{ width: 17, height: 17, borderRadius: "50%", backgroundColor: pieColors[index % pieColors.length], mr: 1.5 }} />
                  <TypographyMD variant="paragraph" label={t(label)} color="#161515" fontFamily="'Poppins', sans-serif" lineHeight="15px" fontSize="15px" />
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RoleCategorization;
