import React, { useEffect, useState } from "react";
import SidebarNew from "../components/sidebar/SidebarNew";
import { Box, Button, Card, CardContent, Checkbox, CircularProgress, Divider, Grid, IconButton, InputAdornment, Menu, MenuItem, OutlinedInput, Pagination, Select, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, Tooltip, Typography } from "@mui/material";
import map_image from "../Assets/map_image.png";

import spain from "../Assets/spain.png";
import us from "../Assets/us.png";
import uk from "../Assets/uk.png";
import russia from "../Assets/russia.png";
import china from "../Assets/china.png";
import japan from "../Assets/japan.png";
import saudia_arabia from "../Assets/saudia_arabia.png";
import australia from "../Assets/australia.png";
import others from "../Assets/others.png";
import LocationBasedChart from '../components/StaticsByCountry'
import url from "../url";
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from "react-router-dom";
import 'react-phone-input-2/lib/style.css';
import Chart from "react-apexcharts";
import TypographyMD from "../components/items/Typography";
import SelectField from "../components/items/Selectfield";
import UserGrowthChart from "../components/items/UserGrowth";
import RoleCategorization from "../components/items/RoleCategorization";
import SubscriptionCategorization from "../components/items/SubscriptionCategorization";
import ButtonMD from "../components/items/ButtonMD";
import { KeyboardArrowRight } from "@mui/icons-material";
import AllPinsTabs from "./AllUsersPins";
import { useTranslation } from "react-i18next";

function SystemOversight() {
    //my code for implementing empty icons
    const [noData, setNoData] = useState(false);
    //==



    const { t } = useTranslation();
    const navigate = useNavigate();
    const [initialLoader, setInitialLoader] = useState(true);

    useEffect(() => {
        // Simulate a 2-second loading time
        const timer = setTimeout(() => {
            setInitialLoader(false);
        }, 3000);

        // Cleanup timeout on unmount
        return () => clearTimeout(timer);
    }, []);



    const series = [
        {
            data: [
                { x: "Spain", y: 5912982 },
                { x: "US", y: 5211300 },
                { x: "UK", y: 4175737 },
                { x: "Russia", y: 3145001 },
                { x: "China", y: 989170 },
                { x: "Japan", y: 1075560 },
                { x: "Saudi Arabia", y: 1752300 },
                { x: "Australia", y: 799300 },
                { x: "Others", y: 805900 },
            ],
        },
    ];

    const yLabels = [
        { name: "Spain", flag: spain },
        { name: "US", flag: us },
        { name: "UK", flag: uk },
        { name: "Russia", flag: russia },
        { name: "China", flag: china },
        { name: "Japan", flag: japan },
        { name: "Saudi Arabia", flag: saudia_arabia },
        { name: "Australia", flag: australia },
        { name: "Others", flag: others },
    ];

    const options = {
        chart: {
            type: "bar",
            height: 500,
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 8,
                barHeight: "85%",
            },
        },
        colors: ["#5DA6BF"],
        dataLabels: {
            enabled: true,
            style: {
                fontSize: "13px",
            },
            formatter: (val) => val.toLocaleString(),
        },
        xaxis: {
            type: "numeric",
            labels: {
                formatter: (val) => Number(val).toLocaleString(),
                style: {
                    fontSize: "12px",
                    fontWeight: 500,
                },
            },
            title: {
                // text: "Users",
                style: {
                    fontSize: "12px",
                    fontWeight: 600,
                },
            },
            axisTicks: { show: false },
            axisBorder: { show: false },
        },
        yaxis: {
            labels: {
                show: false, // ❌ hide Apex default labels (we'll overlay flags manually)
            },
            axisTicks: { show: false },
            axisBorder: { show: false },
        },
        tooltip: { enabled: false },
        grid: { show: false },
        states: {
            hover: { filter: { type: "none" } },
            active: { filter: { type: "none" } },
        },

        // ✅ Responsive logic
        responsive: [
            {
                breakpoint: 768, // Mobile and small tablets
                options: {
                    chart: {
                        height: 400,
                    },
                    dataLabels: {
                        style: {
                            fontSize: "11px",
                        },
                    },
                    xaxis: {
                        labels: {
                            style: {
                                fontSize: "10px",
                            },
                            formatter: (val) => {
                                if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
                                if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
                                return val;
                            },
                        },
                        title: {
                            style: {
                                fontSize: "11px",
                            },
                        },
                    },
                    yaxis: {
                        labels: {
                            show: false, // still hide y-axis labels
                        },
                    },
                },
            },
        ],
    };

    const dummyUsers = [
        {
            user_id: 1,
            profile_image: "https://randomuser.me/api/portraits/men/10.jpg",
            fullname: "john_doe",
            email: "john@example.com",
            company_name: "NovaCore Technologies Inc.",
            country: "US",
            br_no: "56-7890123",
            status: "Active",
            earning: 34,
            registered: "11 Apr, 2025 - 10:30 AM"
        },
        {
            user_id: 2,
            profile_image: "https://randomuser.me/api/portraits/women/20.jpg",
            fullname: "jane_smith",
            email: "jane@example.com",
            company_name: "NovaCore Technologies Inc.",
            country: "UK",
            br_no: "56-7890123",
            status: "Active",
            earning: 34,
            registered: "12 Apr, 2025 - 10:30 AM"
        },
        {
            user_id: 3,
            profile_image: "https://randomuser.me/api/portraits/men/30.jpg",
            fullname: "michael_jones",
            email: "michael@example.com",
            company_name: "NovaCore Technologies Inc.",
            country: "US",
            br_no: "56-7890123",
            status: "Inactive",
            earning: 34,
            registered: "12 Apr, 2025 - 10:30 AM"
        },
        {
            user_id: 4,
            profile_image: "https://randomuser.me/api/portraits/women/40.jpg",
            fullname: "sarah_williams",
            email: "sarah@example.com",
            company_name: "NovaCore Technologies Inc.",
            country: "UAE",
            br_no: "56-7890123",
            status: "Inactive",
            earning: 34,
            registered: "12 Apr, 2025 - 10:30 AM"
        },
        {
            user_id: 5,
            profile_image: "https://randomuser.me/api/portraits/men/50.jpg",
            fullname: "david_brown",
            email: "david@example.com",
            company_name: "NovaCore Technologies Inc.",
            country: "Germany",
            br_no: "56-7890123",
            status: "Trial",
            earning: 34,
            registered: "12 Apr, 2025 - 10:30 AM"
        }
    ];

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "June",
        "July", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const generateLast50Years = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 50 }, (_, i) => currentYear - i);
    };

    const years = generateLast50Years();

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Filter users by selected year
    const filteredActiveUserList = dummyUsers.filter(user => {
        const dateStr = user.registered.split(" - ")[0];
        const dateObj = new Date(dateStr.replace(",", ""));
        return dateObj.getFullYear() === selectedYear;
    });

    // Build monthly stats
    const initialMonthlyUserStats = Array(12).fill(null).map(() => ({
        Active: 0,
        Trial: 0,
        Inactive: 0,
    }));

    filteredActiveUserList.forEach(user => {
        const dateStr = user.registered.split(" - ")[0];
        const dateObj = new Date(dateStr.replace(",", ""));
        const monthIndex = dateObj.getMonth();
        const status = user.status;

        if (initialMonthlyUserStats[monthIndex][status] !== undefined) {
            initialMonthlyUserStats[monthIndex][status]++;
        }
    });

    // Bar chart series for user types (localized)
    const seriesActiveUsers = [
        {
            name: t("userStatus.active"),
            data: initialMonthlyUserStats.map(m => m.Active)
        },
        {
            name: t("userStatus.trial"),
            data: initialMonthlyUserStats.map(m => m.Trial)
        },
        {
            name: t("userStatus.inactive"),
            data: initialMonthlyUserStats.map(m => m.Inactive)
        }
    ];

    // Bar chart options
    const optionsActiveUsers = {
        chart: {
            type: "bar",
            height: 350,
            stacked: false,
            toolbar: { show: false }
        },
        colors: ["#2ECC71", "#F39C12", "#E74C3C"],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "55%",
                endingShape: "rounded"
            }
        },
        dataLabels: { enabled: false },
        stroke: {
            show: true,
            width: 2,
            colors: ["transparent"]
        },
        xaxis: {
            categories: months // assume months = ['Jan', ..., 'Dec']
        },
        fill: {
            opacity: 1
        },
        legend: {
            show: false
        },
        tooltip: {
            y: {
                formatter: val => `${val} ${t("usersLabel")}`
            }
        }
    };
  const [pinData, setPinData] = useState([]); // ✅ ADD THIS

    return (
        <>
            <SidebarNew
                componentTitle="Admin"
                componentData={
                    <Box
                        sx={{
                            width: "100%",
                            overflowX: "hidden",
                            height: {
                                xs: "calc(100vh - 70px)",   // extra-small screens (mobile)
                                sm: "calc(100vh - 80px)",   // small screens (tablets)
                                md: "calc(100vh - 85px)",   // medium screens (laptops)
                                lg: "calc(100vh - 85px)",  // large screens (desktops)
                                xl: "calc(100vh - 110px)"   // extra-large screens (big monitors)
                            }
                        }}
                    >

                        {/* this check is temprary , need to handle properly when APIs wil get implemented, for all data is dummy thats why only added this simple check  */}

                        {noData ? (
                            <div className="empty-container">
                                <img src="/emptyIcons/commision.png" alt="No data found" className="empty-image" />
                                <h1 className="empty-heading">Empty!</h1>
                                <p className="empty-paragraph">No Reports and Statics Yet!</p>
                            </div>
                        ) :
                            (
                                <div>

                                    {initialLoader ? (
                                        <div style={{
                                            height: "50vh",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center"
                                        }}>

                                            <CircularProgress size={20} thickness={3} color="primary" />

                                        </div>
                                    ) : (
                                        <Grid container spacing={0} sx={{ pl: 1, pr: 1 }} pt={0}>

                                            <Grid xs={12} md={12} bgcolor={'white'} borderRadius={2} py={1.5} px={1.5} border={'2px solid #dcdfe4'}>
                                               {/* <LocationBasedChart/> */}
                                             
                                               <AllPinsTabs setPinData={setPinData}/>
                                            </Grid>

                                        

                                            {/* users growth */}
                                            <Grid xs={12} md={12} pt={1} pl={{ xs: 0, md: 2 }}>
                                                <UserGrowthChart />
                                            </Grid>

                                            {/* RoleCategorization */}
                                            <Grid xs={12} md={6} pt={1} pb={4}>
                                                <RoleCategorization />
                                            </Grid>

                                            {/* Subscription Categorization */}
                                            <Grid xs={12} md={6} pt={1.1} pl={{ xs: 0, md: 2 }} pb={4}>
                                                <SubscriptionCategorization />
                                            </Grid>

                                        </Grid >
                                    )
                                    }
                                </div>
                            )}

                    </Box >
                }
            />

        </>
    )
}

export default SystemOversight;