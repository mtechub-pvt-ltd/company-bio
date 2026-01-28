import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import SidebarNew from "../components/sidebar/SidebarNew";
import exportIcon from "../Assets/export_icon.png";
import menu_icon from "../Assets/menu_icon.png";
import { Avatar, Box, Breadcrumbs, Button, Card, CardContent, Checkbox, Chip, CircularProgress, Divider, Grid, IconButton, InputAdornment, Menu, MenuItem, Modal, OutlinedInput, Pagination, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Add, ArrowBack, ArrowBackIos, ArrowForwardIos, Block, CheckCircleOutline, Close, Code, Delete, Download, Edit, Email, Error, FilterAlt, FoodBank, Group, GroupAdd, Groups, KeyboardArrowDown, KeyboardArrowLeft, MoreVert, PendingActions, Report, RequestedPage, Restaurant, Search, Star, StarBorder, StarHalf, TwoWheeler, Visibility } from "@mui/icons-material";
import TypographyMD from "../components/items/Typography";
import total_employess from "../Assets/total_employess.png";
import remote_workers from "../Assets/remote_workers.png";
import departments from "../Assets/departments.png";
import total_requests from "../Assets/total_requests.png";
import ongoing_tasks from "../Assets/ongoing_tasks.png";
import completed_tasks from "../Assets/completed_tasks.png";
import back_arrow from "../Assets/back_arrow.png";
import company_logo from "../Assets/company_logo.png";
import csvIcon from "../Assets/csvIcon.png";
import pdfIcon from "../Assets/pdfIcon.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import Topbar from "../components/topbar/Topbar";
import DashboardCard from "../components/items/Dashboardcard";
import url from "../url";
import Graph from "../components/graph/Graph";
import { DashboardGoogleMap } from "../components/items/Dashboardgooglemap";
import DashboardAreaChart from "../components/items/DashboardAreaChart";
import ModalAdd from "../components/items/Modal";
import ModalSuccess from "../components/items/ModalSuccess";
import ButtonMD from "../components/items/ButtonMD";
import UserCard from "../components/items/Usercard";
import UserSales from "./UserSales";
import UserPurchases from "./UserPurchases";
import UserFollowers from "./UserFollowers";
import UserFollowing from "./UserFollowing";
import WalletHistory from "./UserWalletHistory";

import Chart from "react-apexcharts";
import SelectField from "../components/items/Selectfield";
import { useTranslation } from "react-i18next";
import ExportMenuButton from "../components/ExportMenuButton";
import DummyStatusMenuButton from "../components/DummyStatusMenuButton";
import toast from "react-hot-toast";

function CompanyAdminDetails() {

    const { t } = useTranslation();
    const [searchParams] = useSearchParams();

    const company_admin_id = searchParams.get('company_admin_id');

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    const [allSales, setAllSales] = useState([]);
    const getUserSales = async (company_admin_id) => {

        var InsertAPIURL = `${url}order/getSalesByUser?user_id=${company_admin_id}`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {


                setAllSales(response?.data);

            }
            )
            .catch(error => {

                toast.error("Something went wrong. Please try again.",)
            });

    }

    const [userId, setUserId] = useState("");
    const getUserDetails = async (user_id) => {
        var InsertAPIURL = `${url}user/getById?user_id=${user_id}`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {

                setUserId(response?.data);

            }
            )
            .catch(error => {
                toast.error("Something went wrong. Please try again.",)
            });

    }

    const dummyUsers = [
        {
            user_id: 1,
            profile_image: "https://randomuser.me/api/portraits/men/10.jpg",
            fullname: "john_doe",
            email: "john@example.com",
            phone_no: "+34 612 345 678",
            department: "Financial",
            type: "Remote",
            shift: "Night",
            status: "Active",
            earning: 34,
            registered: "11 Apr, 2025 - 10:30 AM"
        },
        {
            user_id: 2,
            profile_image: "https://randomuser.me/api/portraits/women/20.jpg",
            fullname: "jane_smith",
            email: "jane@example.com",
            phone_no: "+34 612 345 678",
            department: "Sales",
            type: "Remote",
            shift: "Evening",
            status: "Active",
            earning: 34,
            registered: "12 Apr, 2025 - 10:30 AM"
        },
        {
            user_id: 3,
            profile_image: "https://randomuser.me/api/portraits/men/30.jpg",
            fullname: "michael_jones",
            email: "michael@example.com",
            phone_no: "+34 612 345 678",
            department: "Marketing",
            type: "Remote",
            shift: "Morning",
            status: "Inactive",
            earning: 34,
            registered: "12 Apr, 2025 - 10:30 AM"
        },
        {
            user_id: 4,
            profile_image: "https://randomuser.me/api/portraits/women/40.jpg",
            fullname: "sarah_williams",
            email: "sarah@example.com",
            phone_no: "+34 612 345 678",
            department: "Design",
            type: "Hybrid",
            shift: "Morning",
            status: "Inactive",
            earning: 34,
            registered: "12 Apr, 2025 - 10:30 AM"
        },
        {
            user_id: 5,
            profile_image: "https://randomuser.me/api/portraits/men/50.jpg",
            fullname: "david_brown",
            email: "david@example.com",
            phone_no: "+34 612 345 678",
            department: "Development",
            type: "Remote",
            shift: "Day",
            status: "Trial",
            earning: 34,
            registered: "12 Apr, 2025 - 10:30 AM"
        },
        {
            user_id: 6,
            profile_image: "https://randomuser.me/api/portraits/men/60.jpg",
            fullname: "kevin_turner",
            email: "kevin@example.com",
            phone_no: "+34 612 345 678",
            department: "HR",
            type: "Remote",
            shift: "Evening",
            status: "Active",
            earning: 34,
            registered: "15 Feb, 2025 - 01:10 PM"
        },
        {
            user_id: 7,
            profile_image: "https://randomuser.me/api/portraits/women/60.jpg",
            fullname: "emma_davis",
            email: "emma@example.com",
            phone_no: "+34 612 345 678",
            department: "Marketing",
            type: "Onsite",
            shift: "Day",
            status: "Invited",
            earning: 34,
            registered: "27 Feb, 2025 - 05:35 PM"
        },
        {
            user_id: 8,
            profile_image: "https://randomuser.me/api/portraits/men/70.jpg",
            fullname: "william_miller",
            email: "william@example.com",
            phone_no: "+34 612 345 678",
            department: "IT",
            type: "Remote",
            shift: "-",
            status: "Active",
            earning: 34,
            registered: "08 March, 2025 - 08:20 AM"
        },
        {
            user_id: 9,
            profile_image: "https://randomuser.me/api/portraits/women/80.jpg",
            fullname: "olivia_johnson",
            email: "olivia@example.com",
            phone_no: "+34 612 345 678",
            department: "Marketing",
            type: "Remote",
            shift: "Day",
            status: "Inactive",
            earning: 34,
            registered: "19 March, 2025 - 06:55 PM"
        },
        {
            user_id: 10,
            profile_image: "https://randomuser.me/api/portraits/men/90.jpg",
            fullname: "alex_taylor",
            email: "alex@example.com",
            phone_no: "+34 612 345 678",
            department: "Service",
            type: "Remote",
            shift: "Night",
            status: "Trial",
            earning: 34,
            registered: "05 March, 2025 - 03:40 PM"
        }
    ];

    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    const handleCheckboxChange = (event, target) => {
        const checked = event.target.checked;

        if (target === "selectAll") {
            setSelectAll(checked);
            if (checked) {
                // Select all on the current page
                const allIds = paginatedData.map(item => item.user_id);
                setSelectedRows(allIds);
            } else {
                // Deselect all
                setSelectedRows([]);
            }
        } else {
            if (checked) {
                setSelectedRows(prev => [...prev, target]);
            } else {
                setSelectedRows(prev => prev.filter(id => id !== target));
            }
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const filteredData = dummyUsers.filter(item =>
        item.fullname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const recordsPerPage = 7;

    // Calculate data for current page
    const paginatedData = filteredData.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const totalPages = Math.ceil(filteredData.length / recordsPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    useEffect(() => {

        getUserDetails(company_admin_id);
        getUserSales(company_admin_id);

    }, []);

    const [initialLoader, setInitialLoader] = useState(true);

    useEffect(() => {
        // Simulate a 2-second loading time
        const timer = setTimeout(() => {
            setInitialLoader(false);
        }, 3000);

        // Cleanup timeout on unmount
        return () => clearTimeout(timer);
    }, []);

    const [activeTab, setActiveTab] = useState('workers'); // default tab

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const tabs = [
        { id: 'workers', label: t("Workers") },
        { id: 'attendence', label: t("Attendence") },
        { id: 'task', label: t("Tasks") },
        { id: 'Requesteds', label: t("Requesteds") }
    ];

    const generateLast50Years = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 50 }, (_, i) => currentYear - i);
    };

    const years = generateLast50Years();

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const filteredUsers = dummyUsers.filter(user => {
        const parts = user.registered.split(" - ")[0];
        const parsedDate = new Date(parts.replace(",", ""));
        return parsedDate.getFullYear() === selectedYear;
    });

    const monthlyUserCounts = Array(12).fill(0); // 12 months

    filteredUsers.forEach(user => {
        const parts = user.registered.split(" - ")[0];
        const parsedDate = new Date(parts.replace(",", ""));
        const month = parsedDate.getMonth();
        monthlyUserCounts[month]++;
    });


    const chartSeries = [
        {
            name: "Total Users",
            data: monthlyUserCounts
        }
    ];

    // Define months
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "June",
        "July", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Create default data structure for each month
    const initialData = Array.from({ length: 12 }, () => ({
        Active: 0,
        Trial: 0,
        Inactive: 0
    }));

    // Helper to parse "11 Apr, 2025 - 10:30 AM" safely
    const parseMonth = dateStr => {
        const parts = dateStr.split(" - ")[0]; // e.g., "11 Apr, 2025"
        const parsedDate = new Date(parts.replace(",", ""));
        return isNaN(parsedDate) ? null : parsedDate.getMonth();
    };

    // Fill in monthly counts
    dummyUsers.forEach(user => {
        const monthIndex = parseMonth(user.registered);
        if (monthIndex !== null && initialData[monthIndex]) {
            if (user.status === "Active") initialData[monthIndex].Active += 1;
            else if (user.status === "Trial") initialData[monthIndex].Trial += 1;
            else if (user.status === "Inactive") initialData[monthIndex].Inactive += 1;
        }
    });

    // Chart options
    const options = {
        chart: {
            type: "bar",
            height: 350,
            stacked: false,
            toolbar: { show: false }
        },
        colors: ["#579DFF"],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "30%",
                endingShape: "rounded"
            }
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ["transparent"] },
        xaxis: {
            categories: months
        },
        // yaxis: {
        //     title: {
        //         text: "Users"
        //     }
        // },
        fill: {
            opacity: 1
        },
        legend: {
            position: "bottom",
            itemMargin: {
                horizontal: 30,
                vertical: 8
            },
        },
        tooltip: {
            y: {
                formatter: val => `${val} users`
            }
        }
    };

    const handleExportData = (format) => {
        toast.success(`Exporting as ${format}`);
        // Add actual export logic based on `format` here
    }

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
                        {initialLoader ? (
                            <div style={{
                                height: "50vh",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>

                                <CircularProgress size={20} thickness={3} color="primary" />

                            </div> // Or use a spinner
                        ) : (
                            <>
                                <Grid container spacing={0} sx={{ pl: 2, pr: 2 }} pt={0}>
                                    <Grid xs={12} pb={1}>

                                        <Card
                                            sx={{
                                                width: '100%',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '12px',
                                                border: "2px solid rgba(9, 30, 66, 0.14)",
                                                boxShadow: 'none',
                                                p: 2,
                                            }}
                                        >
                                            <CardContent sx={{ p: 0, '&:last-child': { paddingBottom: 0 } }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={0}>
                                                    <Box
                                                        onClick={() => navigate(-1)}
                                                        component="img"
                                                        src={back_arrow}
                                                        sx={{ width: '30px' }}
                                                    />

                                                    <Breadcrumbs separator="/" aria-label="breadcrumb" sx={{ lineHeight: 1, m: 0 }}>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 400,
                                                                fontSize: '15px',
                                                                fontFamily: 'Roboto',
                                                                lineHeight: 1.2,
                                                                m: 0,
                                                            }}
                                                            color="#626F86"
                                                        >
                                                            {t("Company Admins")}
                                                        </Typography>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 400,
                                                                fontSize: '15px',
                                                                fontFamily: 'Roboto',
                                                                lineHeight: 1.2,
                                                                m: 0,
                                                            }}
                                                            color="#626F86"
                                                        >
                                                            NovaCore Technologies Inc.
                                                        </Typography>
                                                    </Breadcrumbs>
                                                </Box>
                                            </CardContent>
                                        </Card>

                                    </Grid>

                                    <Grid item xs={12} md={2} align="center" p={0.7}>
                                        <UserCard
                                            icon={<img src={total_employess} alt="..." style={{ marginTop: "5px", marginLeft: "-3px", width: "40px", height: "40px" }} />}
                                            heading={t("Total Employees")}
                                            value={10}
                                            cursor={"default !important"}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2} align="center" p={0.7}>
                                        <UserCard
                                            icon={<img src={remote_workers} alt="..." style={{ marginTop: "5px", marginLeft: "-3px", width: "40px", height: "40px" }} />}
                                            heading={t("Remote Workers")}
                                            value={<>12</>}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2} align="center" p={0.7}>
                                        <UserCard
                                            icon={<img src={departments} alt="..." style={{ marginTop: "5px", marginLeft: "-3px", width: "40px", height: "40px" }} />}
                                            heading={t("Departments")}
                                            value={12}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2} align="center" p={0.7}>
                                        <UserCard
                                            icon={<img src={total_requests} alt="..." style={{ marginTop: "5px", marginLeft: "-3px", width: "40px", height: "40px" }} />}
                                            heading={t("Total Requesteds")}
                                            value={10}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2} align="center" p={0.7}>
                                        <UserCard
                                            icon={<img src={ongoing_tasks} alt="..." style={{ marginTop: "5px", marginLeft: "-3px", width: "40px", height: "40px" }} />}
                                            heading={t("Ongoing Tasks")}
                                            value={18}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={2} align="center" p={0.7}>
                                        <UserCard
                                            icon={<img src={completed_tasks} alt="..." style={{ marginTop: "5px", marginLeft: "-3px", width: "40px", height: "40px" }} />}
                                            heading={t("Completed Tasks")}
                                            value={18}
                                        />
                                    </Grid>

                                    {/* Left Section - details card(6 columns) */}
                                    <Grid item xs={12} md={6} p={0.7}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} align="center">
                                                <Card sx={{
                                                    width: "100%", height: "auto", border: "2px solid rgba(9, 30, 66, 0.14)", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "none",
                                                }}>
                                                    <CardContent>
                                                        <Box align="left" >
                                                            <Grid container spacing={0} p={0}>

                                                                <Grid xs={12} md={12} sm={12} align="left" p={0.7} >
                                                                    <TypographyMD variant='paragraph' label={t("Account Details")} color="#424242" marginTop={-1} marginLeft={-1} fontFamily="Roboto" fontSize="16px" fontWeight={750} align="right" />
                                                                </Grid>

                                                                <Grid xs={12} md={12} align="center">
                                                                    <Box
                                                                        component="img"
                                                                        src="https://randomuser.me/api/portraits/men/10.jpg"
                                                                        sx={{ borderRadius: "100%", width: "130px" }}
                                                                    />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label={t("Id")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="14px" fontWeight={450} align="left" />
                                                                </Grid>

                                                                <Grid xs={7} md={7} align="right" pb={1}>
                                                                    <TypographyMD variant='h2' label={`# 10000`} color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label={t("Status")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="14px" fontWeight={450} align="left" />
                                                                </Grid>

                                                                <Grid item xs={7} md={7} display="flex" justifyContent="flex-end" pb={0.5}>
                                                                    <Box
                                                                        sx={{
                                                                            backgroundColor: "#4BCE97",
                                                                            width: "90px",
                                                                            padding: "1px",
                                                                            color: '#172B4D',
                                                                            borderRadius: '5px',
                                                                            borderColor: 'inherit',
                                                                            boxShadow: "none",
                                                                            fontFamily: "Roboto",
                                                                            letterSpacing: ".5px",
                                                                            textTransform: "capitalize",
                                                                            display: "flex",                 // added
                                                                            alignItems: "center",           // vertical centering
                                                                            justifyContent: "center",
                                                                            fontSize: "13px",      // horizontal centering
                                                                            gap: "4px",                     // spacing between icon and text
                                                                            '&:hover': {
                                                                                backgroundColor: "#4BCE97",
                                                                                boxShadow: "none",
                                                                            },
                                                                        }}
                                                                    >
                                                                        <CheckCircleOutline fontSize="17px" />
                                                                        Active
                                                                    </Box>
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label={t("Registered")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="14px" fontWeight={450} align="left" />
                                                                </Grid>

                                                                <Grid xs={7} md={7} align="right" pb={0.5} >
                                                                    <TypographyMD variant='h2' label={"11 Apr, 2025 - 10:30 AM"} color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label={t("Company Admin")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="14px" fontWeight={450} align="left" />
                                                                </Grid>

                                                                <Grid xs={7} md={7} align="right" pb={0.5} >
                                                                    <TypographyMD variant='h2' label={`John Doe`} color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label={t("Registered Email")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="14px" fontWeight={450} align="left" />
                                                                </Grid>

                                                                <Grid xs={7} md={7} align="right" pb={0.5} >
                                                                    <TypographyMD variant='h2' label={`Johndoe@gmail.com`} color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label={t("Phone No.")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="14px" fontWeight={450} align="left" />
                                                                </Grid>

                                                                <Grid xs={7} md={7} align="right" pb={0.5} >
                                                                    <TypographyMD variant='h2' label={`+34 612 345 678`} color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" />
                                                                </Grid>

                                                            </Grid>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={12} p={0.7}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12} md={12} align="center">
                                                        <Card sx={{
                                                            width: "100%", height: "auto", border: "2px solid rgba(9, 30, 66, 0.14)", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "none",
                                                        }}>
                                                            <CardContent>
                                                                <Box align="left" >
                                                                    <Grid container spacing={0}>
                                                                        <Grid xs={8} md={10.1} sm={10} align="left"  >
                                                                            <TypographyMD variant='paragraph' label={t("User Metrics")} color="#424242" marginTop={-1} marginLeft={-1} fontFamily="Roboto" fontSize="16px" fontWeight={750} align="right" />
                                                                        </Grid>

                                                                        <Grid xs={4} md={1.9} sm={2} align="right"  >
                                                                            <SelectField
                                                                                graphfilter={true}
                                                                                value={selectedYear}
                                                                                onChangeTerm={(e) => setSelectedYear(Number(e.target.value))}
                                                                                options={years.map((year) => ({
                                                                                    value: year,
                                                                                    label: year,
                                                                                }))}
                                                                            />
                                                                        </Grid>

                                                                        <Grid xs={12} md={12} sm={12} align="">
                                                                            <div className="chart-container">
                                                                                <Chart options={options} series={chartSeries} type="bar" height={407} />
                                                                            </div>
                                                                        </Grid>

                                                                    </Grid>
                                                                </Box>
                                                            </CardContent>
                                                        </Card>

                                                    </Grid>

                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Right Section - company details */}
                                    <Grid item xs={12} md={6} p={0.7}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={12} align="center">
                                                <Card sx={{
                                                    width: "100%", height: "auto", border: "2px solid rgba(9, 30, 66, 0.14)", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "none",
                                                }}>
                                                    <CardContent>
                                                        <Box align="left" >
                                                            <Grid container spacing={0} p={0}>

                                                                <Grid xs={12} md={12} sm={12} align="left" p={0.7} >
                                                                    <TypographyMD variant='paragraph' label={t("Company Details")} color="#424242" marginTop={-1} marginLeft={-1} fontFamily="Roboto" fontSize="16px" fontWeight={750} align="right" />
                                                                </Grid>

                                                                <Grid xs={12} md={12} align="center">
                                                                    <Box
                                                                        component="img"
                                                                        src={company_logo}
                                                                        sx={{ borderRadius: "100%", width: "130px" }}
                                                                    />
                                                                </Grid>

                                                                {/* LEGAL DETAILS */}
                                                                <Grid xs={12} md={12} sm={12} align="left" mt={0.5} mb={1} p={0.7} >
                                                                    <TypographyMD variant='paragraph' label={t("Legal Details")} color="#424242" marginTop={-1} marginLeft={-1} fontFamily="Roboto" fontSize="16px" fontWeight={750} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Legal Name")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="NovaCore Technologies Inc." color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Business Sector/Industry")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="RM-MAD-2025-0012345" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Trade No.")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="B12345678" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Business Email")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="Nova@info.tech" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Business Phone No.")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="+34 612 345 678" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                {/* ADDRESS DETAILS */}
                                                                <Grid xs={12} md={12} sm={12} align="left" mt={0.5} mb={1} p={0.7} >
                                                                    <TypographyMD variant='paragraph' label={t("Address Details")} color="#424242" marginTop={-1} marginLeft={-1} fontFamily="Roboto" fontSize="16px" fontWeight={750} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Country")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="Spain" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Community/Province")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="Comunidad de Madrid" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("City")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="Madrid" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Street Address")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="Calle de Alcalá, 45, Piso 3B" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                {/* SUBSCRIPTION DETAILS */}
                                                                <Grid xs={12} md={12} sm={12} align="left" mt={0.5} mb={1} p={0.7} >
                                                                    <TypographyMD variant='paragraph' label={t("Subscription Details")} color="#424242" marginTop={-1} marginLeft={-1} fontFamily="Roboto" fontSize="16px" fontWeight={750} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label={t("Status")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" />
                                                                </Grid>

                                                                <Grid item xs={7} md={7} display="flex" justifyContent="flex-end" pb={0.5}>
                                                                    <Box
                                                                        sx={{
                                                                            backgroundColor: "#4BCE97",
                                                                            width: "70px",
                                                                            padding: "1px",
                                                                            color: '#172B4D',
                                                                            borderRadius: '5px',
                                                                            borderColor: 'inherit',
                                                                            boxShadow: "none",
                                                                            fontFamily: "Roboto",
                                                                            letterSpacing: ".5px",
                                                                            textTransform: "capitalize",
                                                                            display: "flex",                 // added
                                                                            alignItems: "center",           // vertical centering
                                                                            justifyContent: "center",
                                                                            fontSize: "13px",      // horizontal centering
                                                                            gap: "4px",                     // spacing between icon and text
                                                                            '&:hover': {
                                                                                backgroundColor: "#4BCE97",
                                                                                boxShadow: "none",
                                                                            },
                                                                        }}
                                                                    >
                                                                        <CheckCircleOutline fontSize="17px" sx={{ mr: 0.5 }} />
                                                                        Paid
                                                                    </Box>
                                                                </Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Subscription")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="Advance" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Amount")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="$12K" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Max Users")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="1000" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Duration")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="Per Month" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Activation Date - Time")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="11 Apr, 2025 - 10:30 AM" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Expiry")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="11 Apr, 2026 - 12 AM" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid>

                                                                {/* Target Zone / Region */}
                                                                {/* <Grid xs={12} md={12} sm={12} align="left" mt={0.5} mb={1} p={0.7} >
                                                                    <TypographyMD variant='paragraph' label={t("Target Zone / Region")} color="#424242" marginTop={-1} marginLeft={-1} fontFamily="Roboto" fontSize="16px" fontWeight={750} align="right" />
                                                                </Grid> */}

                                                                {/* <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label="Company Users" color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8}><TypographyMD variant='h2' label="35" color="#172B4D" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="right" /></Grid> */}

                                                                {/* <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Zone")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8} display="flex" gap={0.7} flexWrap="wrap" justifyContent="flex-end">
                                                                    {["North America", "South America", "Northern Europe", "Southern Europe"].map((region) => (
                                                                        <Box
                                                                            key={region}
                                                                            sx={{
                                                                                backgroundColor: '#579DFF',
                                                                                color: '#09326C',
                                                                                borderRadius: '5px',
                                                                                px: 1.5,
                                                                                py: 0.3,
                                                                                fontSize: '13px',
                                                                                fontFamily: 'Roboto',
                                                                                fontWeight: 450,
                                                                                whiteSpace: 'nowrap'
                                                                            }}
                                                                        >
                                                                            {region}
                                                                        </Box>
                                                                    ))}
                                                                </Grid> */}

                                                                <Grid xs={5} pb={0.8}><TypographyMD variant='h2' label={t("Countries")} color="#5E5C5C" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="left" /></Grid>
                                                                <Grid xs={7} pb={0.8} display="flex" gap={0.7} flexWrap="wrap" justifyContent="flex-end">
                                                                    {["Spain", "Italy", "Portugul"].map((country) => (
                                                                        <Box
                                                                            key={country}
                                                                            sx={{
                                                                                backgroundColor: '#579DFF',
                                                                                color: '#09326C',
                                                                                borderRadius: '5px',
                                                                                px: 1.5,
                                                                                py: 0.3,
                                                                                fontSize: '13px',
                                                                                fontFamily: 'Roboto',
                                                                                fontWeight: 450,
                                                                                whiteSpace: 'nowrap'
                                                                            }}
                                                                        >
                                                                            {country}
                                                                        </Box>
                                                                    ))}
                                                                </Grid>
                                                            </Grid>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                        </Grid>
                                    </Grid>

                                    {/* different categories action buttons */}
                                    <Grid xs={12} p={1}>
                                        <Card
                                            sx={{
                                                width: '100%',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '12px',
                                                border: '2px solid rgba(9, 30, 66, 0.14)',
                                                boxShadow: 'none',
                                                p: 2,
                                            }}
                                        >
                                            <CardContent sx={{ p: 0, '&:last-child': { paddingBottom: 0 } }}>
                                                <Box
                                                    display="flex"
                                                    flexWrap={isSmallScreen ? 'wrap' : 'nowrap'}
                                                    alignItems="center"
                                                    gap={isSmallScreen ? 1 : 2}
                                                    mb={0}
                                                >
                                                    {tabs.map(({ id, label }) => (
                                                        <Box
                                                            key={id}
                                                            onClick={() => setActiveTab(id)}
                                                            sx={{
                                                                padding: isSmallScreen ? '6px 8px' : '5px 5px',

                                                                color: activeTab === id ? '#006EC2' : '#44546F',
                                                                borderBottom: activeTab === id ? '3px solid #006EC2' : '3px solid transparent',
                                                                borderRadius: 0,
                                                                transition: 'border-bottom 0.3s ease',
                                                                whiteSpace: 'nowrap',
                                                                userSelect: 'none',
                                                            }}
                                                        >
                                                            <Typography variant="body2" component="span" fontWeight={550} fontSize='12px'>
                                                                {label}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                </Grid>

                                <Box sx={{ ml: 3, mr: 3, backgroundColor: "white", border: "2px solid rgba(9, 30, 66, 0.14)", borderRadius: "12px" }}>

                                    <Grid container spacing={0} p={2} pb={1}>
                                        <Grid xs={12} sm={4} >
                                            <TypographyMD variant='paragraph' label={("Workers")} color="#424242" marginLeft={1} fontFamily="Roboto" fontSize="25px" fontWeight={850} align="center" />
                                        </Grid>

                                        <Grid xs={12} sm={4} >
                                            <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
                                                <Box sx={{ mt: { xs: 1, md: .5 }, backgroundColor: "#fff", border: "2px solid rgba(9, 30, 66, 0.14)", borderRadius: "5px", width: "240px" }}>
                                                    <OutlinedInput
                                                        autoComplete="off"
                                                        placeholder={t("Search here...")}
                                                        id="input-with-icon-adornment"
                                                        sx={{
                                                            width: "100%",
                                                            fontSize: "15px",
                                                            height: "35px",
                                                            "& fieldset": { border: 'none' },
                                                        }}
                                                        endAdornment={
                                                            <InputAdornment position="end">

                                                                <IconButton edge="end" >
                                                                    <Search sx={{ fontSize: "15px", color: "#222" }} />
                                                                </IconButton>

                                                            </InputAdornment>
                                                        }
                                                        value={searchTerm}
                                                        onChange={e => setSearchTerm(e.target.value)}
                                                    />
                                                </Box>
                                            </div>
                                        </Grid>

                                        <Grid xs={12} sm={4} pt={{ xs: 2, md: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "right", alignContent: "right", gap: "10px" }}>

                                                <div>
                                                    <ExportMenuButton
                                                        onExport={handleExportData}
                                                        icon={<img src={exportIcon} alt="..." style={{ width: 25 }} />}
                                                        options={[
                                                            { label: "PDF", icon: pdfIcon },
                                                            { label: "Excel", icon: csvIcon },
                                                        ]}
                                                    />
                                                </div>

                                            </div>
                                        </Grid>
                                    </Grid>

                                    {paginatedData?.length == 0 || undefined || null ?
                                        <Grid container spacing={0} pt={10} pb={10}>
                                            <Grid xs={10} md={12} lg={12} align="center"  >
                                                <Stack direction="column">
                                                    <Error sx={{ fontSize: "5vh", color: "#A5ADB0", opacity: 0.5, alignSelf: "center" }} />
                                                    <TypographyMD variant='h2' label={t("Data Not Found")} color="#A5ADB0" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="center" />
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                        :
                                        <TableContainer
                                            sx={{
                                                borderRadius: { xs: "5px", md: "50px" },
                                                boxShadow: "none",
                                                pl: 2, pr: 2, pt: 1,
                                                width: '100%',
                                                overflowX: 'auto',
                                            }} >

                                            <Table
                                                sx={{
                                                    width: '100%',
                                                    tableLayout: 'auto',
                                                    '& .MuiTableCell-root': {
                                                        padding: '5px',
                                                        wordBreak: 'break-word',
                                                        overflowWrap: 'anywhere',
                                                        whiteSpace: { xs: 'normal', md: 'nowrap' }
                                                    },
                                                    '& .MuiTableRow-root': {
                                                        height: '25px',
                                                    }
                                                }}
                                                aria-label="simple table"
                                            >

                                                <TableHead style={{ fontSize: "13px", backgroundColor: '#F4F6FA' }}>
                                                    <TableRow  >
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                sx={{
                                                                    color: 'rgba(9, 30, 66, 0.14)'
                                                                }}
                                                                checked={selectAll}
                                                                indeterminate={false} // We no longer show partial state
                                                                onChange={(e) => handleCheckboxChange(e, "selectAll")}
                                                            />

                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px" }}> {t("Id")} </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px" }}> {t("Worker Name")} </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px" }}> {t("Worker Email")}</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px" }}> {t("Phone No.")} </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px" }}> {t("Department")} </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px" }}> {t("Type")} </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px" }}> {t("Shift")} </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px" }}> {t("Status")} </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px" }}> {t("Registered")} </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px" }}> {t("Action")} </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {paginatedData.map((item) => (
                                                        <TableRow hover>

                                                            <TableCell padding="checkbox" onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}>
                                                                <Checkbox
                                                                    sx={{
                                                                        color: 'rgba(9, 30, 66, 0.14)'
                                                                    }}
                                                                    checked={selectedRows.includes(item.user_id)}
                                                                    onChange={(e) => handleCheckboxChange(e, item.user_id)}
                                                                />
                                                            </TableCell>

                                                            <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: { xs: '120px', md: '150px' }, whiteSpace: { xs: 'normal', md: 'nowrap' }, overflow: 'hidden', textOverflow: 'ellipsis' }} >
                                                                {item.user_id}
                                                            </TableCell>

                                                            <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: { xs: '140px', md: '150px' }, whiteSpace: { xs: 'normal', md: 'nowrap' }, overflow: 'hidden', textOverflow: 'ellipsis' }} >
                                                                {item.fullname}
                                                            </TableCell>

                                                            <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: { xs: '160px', md: '220px' }, whiteSpace: { xs: 'normal', md: 'nowrap' }, overflow: 'hidden', textOverflow: 'ellipsis' }} >
                                                                {item.email}
                                                            </TableCell>

                                                            <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: { xs: '140px', md: '150px' }, whiteSpace: { xs: 'normal', md: 'nowrap' }, overflow: 'hidden', textOverflow: 'ellipsis' }} >
                                                                {item.phone_no}
                                                            </TableCell>

                                                            <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: { xs: '140px', md: '150px' }, whiteSpace: { xs: 'normal', md: 'nowrap' }, overflow: 'hidden', textOverflow: 'ellipsis' }} >
                                                                {item.department}
                                                            </TableCell>

                                                            <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: { xs: '120px', md: '150px' }, whiteSpace: { xs: 'normal', md: 'nowrap' }, overflow: 'hidden', textOverflow: 'ellipsis' }} >
                                                                {item.type}
                                                            </TableCell>

                                                            <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: { xs: '120px', md: '150px' }, whiteSpace: { xs: 'normal', md: 'nowrap' }, overflow: 'hidden', textOverflow: 'ellipsis' }} >
                                                                {item.shift}
                                                            </TableCell>

                                                            <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                                                                <div style={{ display: "flex", justifyContent: "center", alignContent: "center", gap: "10px" }}>
                                                                    <DummyStatusMenuButton
                                                                        status={item.status.toLowerCase()}
                                                                        statusOptions={[
                                                                            { value: "Active", label: "Active", color: "#4BCE97", icon: <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} /> },
                                                                            { value: "Inactive", label: "Inactive", color: "#F87168", icon: <Block fontSize="17px" sx={{ mr: 1 }} /> },
                                                                            { value: "Invited", label: "Invited", color: "#579DFF", icon: <Email fontSize="17px" sx={{ mr: 1 }} /> },
                                                                        ]}
                                                                        onChange={(newStatus) => {

                                                                        }}
                                                                    />
                                                                </div>
                                                            </TableCell>

                                                            <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: { xs: '160px', md: '150px' }, whiteSpace: { xs: 'normal', md: 'nowrap' }, overflow: 'hidden', textOverflow: 'ellipsis' }} >
                                                                {item.registered}
                                                            </TableCell>

                                                            <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: { xs: '80px', md: '150px' }, whiteSpace: { xs: 'normal', md: 'nowrap' }, overflow: 'hidden', textOverflow: 'ellipsis' }} >
                                                                <div style={{ display: "flex", justifyContent: "center", alignContent: "cenetr", gap: "10px" }}>
                                                                    <img src={menu_icon} style={{ width: "15px" }} />
                                                                </div>
                                                            </TableCell>

                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>

                                            <div style={{ marginTop: "10px", marginBottom: "10px", display: "flex", justifyContent: "center", alignContent: "center" }}>
                                                <Pagination
                                                    count={totalPages}
                                                    page={currentPage}
                                                    onChange={handlePageChange}
                                                    siblingCount={1}
                                                    boundaryCount={1}
                                                    shape="rounded"
                                                    size="small"
                                                    showFirstButton
                                                    showLastButton
                                                    sx={{
                                                        '& .MuiPaginationItem-root': {
                                                            fontSize: '12px',
                                                            minWidth: '30px',
                                                            height: '30px',
                                                            color: "#172B4D !important"
                                                        },
                                                        '& .Mui-selected': {
                                                            backgroundColor: '#F0F9FF !important',
                                                            color: '#006EC2 !important'
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </TableContainer>
                                    }
                                </Box>

                                {/* {activeTab === 'sales' && <UserSales user_id={user_id} />}
                                {activeTab === 'purchases' && <UserPurchases user_id={user_id} />}  */}

                            </>
                        )}

                    </Box >
                }
            />

        </>
    )
}

export default CompanyAdminDetails;