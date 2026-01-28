

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Cell,   
} from "recharts";
import { Box, CircularProgress, Typography, Paper } from "@mui/material";
import { useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import url from "../url";
import { useTranslation } from "react-i18next";

const CommissionAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);
  const {t} =useTranslation()
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          `${url}/payments/super-admin/commission-threshold-summary`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Network response was not ok");

        const result = await response.json();
        console.log("Full API response:", result);

        if (result?.data?.analytics) {
          setAnalytics(result.data.analytics);
          toast.success(t("analytics.fetchSuccess"))
        } else {
toast.error(t("analytics.notFound"))        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast.error(t("analytics.fetchError"))

      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  const formatTo3Decimals = (value) => {
  if (value === null || value === undefined) return "0.000";
  return Number(value).toFixed(3);
};


  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (!analytics)
    return (
      <Typography align="center" mt={5} color="error">
{t("analytics.noData")}      </Typography>
    );

  // top summary cards
  const summaryCards = [
    {
      label: t("cards.totalExecutives"),
      value: analytics.total_executives,
      color: "#2196F3",
    },
    {
      label: t("cards.aboveThreshold"),
      value: analytics.executives_above_threshold,
      color: "#4CAF50",
    },
    {
      label:t("cards.belowThreshold"),
      value: analytics.executives_below_threshold,
      color: "#FF7043",
    },
    {
      label: t("cards.pendingAmount"),
      // value: `$${analytics.total_pending_amount}`,
        value: `$${formatTo3Decimals(analytics.total_pending_amount)}`,

      color: "#FFA000",
    },
    {
      label: t("cards.readyAmount"),
      value: `$${analytics.total_ready_amount}`,
      color: "#1976D2",
    },
    {
      label:t("cards.paidAmount"),
      // value: `$${analytics.total_paid_amount}`,
        value: `$${formatTo3Decimals(analytics.total_paid_amount)}`,

      color: "#009688",
    },
  ];

  // progress style bar data
  const barData = [
    {
      name: t("analytics.pending"),
      amount: analytics.total_pending_amount,
      
    },
    {
      name:t("analytics.ready"),
      amount: analytics.total_ready_amount,
    },
    {
      name: t("analytics.paid"),
      amount: analytics.total_paid_amount,
    },
  ];

  return (
  <Box
    sx={{
      backgroundColor: "white",
      border: "2px solid rgba(9, 30, 66, 0.14)",
      borderRadius: "12px",
      mb: 2,
      p: 3,
      ml:1.5,mr:1.5, 
      mt:2,
    }}
  >
    <Toaster />

    {/* Main grid layout: left (cards) + right (chart) */}
    <Box
      display="flex"
      flexWrap="wrap"
      justifyContent="space-between"
      alignItems="center"
      gap={4}
    >
      {/* Left side – summary cards */}
      <Box
        sx={{
          flex: "1 1 55%",
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "flex-start",
        }}
      >
        {summaryCards.map((card, i) => (
<Box
  key={i}
  sx={{
    flex: "1 1 calc(50% - 16px)", // two cards per row, responsive wrap
    textAlign: "center",
    p: 2,
       border: "2px solid rgba(9, 30, 66, 0.14)",
      borderRadius: "12px",
    // borderTop: `4px solid ${card.color}`,
    minWidth: "130px",
  }}
>
  <Typography variant="subtitle2" color="textSecondary">
    {card.label}
  </Typography>
  <Typography variant="h6" sx={{ color: card.color }}>
    {card.value}
  </Typography>
</Box>
        ))}
      </Box>

      {/* Right side – centered chart */}
      <Box
        sx={{
          flex: "1 1 40%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
             border: "2px solid rgba(9, 30, 66, 0.14)",
      borderRadius: "12px",
        }}
      >
        <Typography variant="h6" mb={2} pt={1}>
  {t("analytics.commissionProgressOverview")}
        </Typography>
        <BarChart
          width={400}
          height={250}
          data={barData}
          barSize={45}
          margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
        <Tooltip
    formatter={(value) => [`$${value}`, t("amount")]} // localized tooltip
    cursor={{ fill: "rgba(0,0,0,0.05)" }}
  />
          <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
            {barData.map((entry, index) => {
              let fillColor;
              if (entry.name === t("analytics.pending")) fillColor = "#FFC107"; // yellow
              else if (entry.name === t("analytics.ready")) fillColor = "#FF7043"; // orange
              else if (entry.name === t("analytics.paid")) fillColor = "#4CAF50"; // green
              return <Cell key={index} fill={fillColor} />;
            })}
            <LabelList dataKey="amount" position="top" />
          </Bar>
        </BarChart>
      </Box>
    </Box>
  </Box>
  );
};

export default CommissionAnalytics;