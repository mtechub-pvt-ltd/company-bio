import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { Card, CardContent, Box, Grid, CircularProgress } from "@mui/material";
import TypographyMD from "./Typography";
import SelectField from "./Selectfield";
import { useTranslation } from "react-i18next";
import next from "../../Assets/next.png";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import url from "../../url";
import nodata from '../../Assets/nodata.png'
const UserGrowthChart = ({ dashboard }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());

  // State for chart data
  const [monthlyData, setMonthlyData] = useState(Array(12).fill(0));
  const [loading, setLoading] = useState(false);

   const months = [
  t("Jan"),
  t("Feb"),
  t("Mar"),
  t("Apr"),
  t("May"),
  t("Jun"),
  t("Jul"),
  t("Aug"),
  t("Sep"),
  t("Oct"),
  t("Nov"),
  t("Dec"),
];

  // Fetch data when year changes

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${url}/super-admin/statistics/yearly-registration?year=${selectedYear}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((result) => {
        if (result.error) {
          console.error("❌ API error:", result.message);
          setMonthlyData(Array(12).fill(0));
          setLoading(false);
          return;
        }
        const monthlyCounts = Array(12).fill(0);
        result.data.monthly_trends.forEach((item) => {
          monthlyCounts[item.month - 1] = item.registrations;
        });
        setMonthlyData(monthlyCounts);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Fetch error (yearly registration):", err);
        setMonthlyData(Array(12).fill(0));
        setLoading(false);
      });
  }, [token, selectedYear]);


  
  const options = {
    chart: { type: "bar", toolbar: { show: false }, animations: { enabled: true } },
    plotOptions: { bar: { borderRadius: 5, columnWidth: "80%", endingShape: "rounded" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: months,
      labels: { style: { fontSize: "13px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      tickAmount: 5, // forces 5 ticks even if data is low
      labels: {
        style: { fontSize: "13px" },
        formatter: (val) => {
          if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
          if (val >= 1000) return (val / 1000).toFixed(1) + "k";
          return val; // normal number if < 1000
        },
      },
    },
    grid: { strokeDashArray: 5, xaxis: { lines: { show: false } } },
    fill: {
      type: "gradient",
      gradient: { type: "vertical", shadeIntensity: 0.6, gradientToColors: ["#1E88E5"], opacityFrom: 0.95, opacityTo: 0.95, stops: [0, 100] },
    },
    colors: ["#64B5F6"],
    tooltip: {
      y: {
        formatter: (val) => {
          let label = t("usersLabel", { count: val, defaultValue: "users" });
          if (typeof label === "object" && label !== null) {
            label = label.other || label.one || "users";
          }
          return `${val.toLocaleString()} ${String(label)}`;
        }
      }
    },
  };

  const series = [{ name: t("usersLabel"), data: monthlyData }];

 return (
  <Grid xs={12} md={12}>
    <Card sx={{ boxShadow: "none", borderRadius: "10px", border: "2px solid #E5E7EB" }}>
      <CardContent>
        <Grid container spacing={0}>
          <Grid xs={8} md={dashboard ? 9.1 : 10.5}>
            <TypographyMD
              variant="paragraph"
              label={t("User Growth Map")}
              color="rgb(33, 33, 33)"
              fontSize="18px"
              align="right"
            />
          </Grid>

          <Grid xs={4} md={dashboard ? 2.9 : 1.5} align="right">
            <div style={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
              <SelectField
                graphfilter
                value={selectedYear}
                onChangeTerm={(e) => setSelectedYear(e.target.value)}
                options={years.map((year) => ({ value: year.toString(), label: year }))}
                style={{ height: 0 }}
              />
              {dashboard && (
                <div>
                  <img
                    src={next}
                    alt=""
                    style={{ width: "30px", cursor: "pointer" }}
                    onClick={() => navigate('/total-users')}
                  />
                </div>
              )}
            </div>
          </Grid>
        </Grid>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 266,
              color: "#888",
              fontSize: "16px",
            }}
          >
            <CircularProgress size={40} thickness={4} color="primary" />
          </Box>
        ) : monthlyData.every((val) => val === 0) ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: 'column',
              height: 266,
              color: "#888",
              fontSize: "14px",
            }}
          >
            <img src={nodata} alt="" height={100} />
            {t("No data found")}
          </Box>
        ) : (
          <Chart options={options} series={series} type="bar" height={266} />
        )}
      </CardContent>
    </Card>
  </Grid>
);

};

export default UserGrowthChart;
