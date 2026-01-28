import React, { useEffect, useMemo, useState } from "react";
import SidebarNew from "../components/sidebar/SidebarNew";
import { Box, Button, Card, CardContent, Checkbox, CircularProgress, Divider, Grid, IconButton, InputAdornment, Menu, MenuItem, OutlinedInput, Pagination, Select, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tabs, Tooltip, Typography } from "@mui/material";
import full_map_image from "../Assets/full_map_image.png";
import url from "../url";
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from "react-router-dom";
import 'react-phone-input-2/lib/style.css';
import RoleCategorization from "../components/items/RoleCategorization";
import SubscriptionCategorization from "../components/items/SubscriptionCategorization";
import menu_icon from "../Assets/menu_icon.png";
import back_arrow from "../Assets/back_arrow.png";
import filter from "../Assets/filter.png";
import { ArrowDownward, ArrowUpward, Block, CheckCircleOutline, Close, Email, Error, KeyboardArrowDown, KeyboardArrowRight, Search } from "@mui/icons-material";
import TypographyMD from "../components/items/Typography";
import ModalAdd from "../components/items/Modal";
import ButtonMD from "../components/items/ButtonMD";
import Inputfield from "../components/items/Inputfield";
import SelectField from "../components/items/Selectfield";
import { useTranslation } from "react-i18next";
import DummyStatusMenuButton from "../components/DummyStatusMenuButton";

function SystemOversightDetail() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const dummyUsers = [
        {
            user_id: 1,
            role: "Admin",
            full_name: "John Doe",
            email: "john@example.com",
            phone_no: "+34 612 345 678",
            status: "Active",
            registered: "01 Jan, 2025 - 09:15 AM"
        },
        {
            user_id: 2,
            role: "Manager",
            full_name: "Jane Smith",
            email: "jane@example.com",
            phone_no: "+34 612 876 543",
            status: "Active",
            registered: "05 Feb, 2025 - 11:45 AM"
        },
        {
            user_id: 3,
            role: "Editor",
            full_name: "Michael Jones",
            email: "michael@example.com",
            phone_no: "+34 612 234 567",
            status: "Inactive",
            registered: "12 Mar, 2025 - 03:20 PM"
        },
        {
            user_id: 4,
            role: "Viewer",
            full_name: "Sarah Williams",
            email: "sarah@example.com",
            phone_no: "+34 612 345 111",
            status: "Inactive",
            registered: "22 Mar, 2025 - 10:05 AM"
        },
        {
            user_id: 5,
            role: "Guest",
            full_name: "David Brown",
            email: "david@example.com",
            phone_no: "+34 612 999 888",
            status: "Invited",
            registered: "01 Apr, 2025 - 02:10 PM"
        },
        {
            user_id: 6,
            role: "Admin",
            full_name: "Emma Wilson",
            email: "emma@example.com",
            phone_no: "+34 612 654 321",
            status: "Active",
            registered: "08 Apr, 2025 - 04:30 PM"
        },
        {
            user_id: 7,
            role: "Manager",
            full_name: "Olivia Taylor",
            email: "olivia@example.com",
            phone_no: "+34 612 777 555",
            status: "Active",
            registered: "15 Apr, 2025 - 09:50 AM"
        },
        {
            user_id: 8,
            role: "Editor",
            full_name: "Liam Martin",
            email: "liam@example.com",
            phone_no: "+34 612 888 222",
            status: "Inactive",
            registered: "20 Apr, 2025 - 12:40 PM"
        },
        {
            user_id: 9,
            role: "Viewer",
            full_name: "Sophia Moore",
            email: "sophia@example.com",
            phone_no: "+34 612 333 444",
            status: "Inactive",
            registered: "25 Apr, 2025 - 11:15 AM"
        },
        {
            user_id: 10,
            role: "Guest",
            full_name: "Noah Thompson",
            email: "noah@example.com",
            phone_no: "+34 612 555 666",
            status: "Invited",
            registered: "28 Apr, 2025 - 01:25 PM"
        }
    ];

    const [allusers, setAllusers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const getallusers = async () => {

        setAllusers(dummyUsers);

    }

    const [searchTerm, setSearchTerm] = useState('');
    const filteredData = allusers.filter(item =>
        item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const recordsPerPage = 5;

    // Calculate data for current page
    const paginatedData = filteredData.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    const [sortConfig, setSortConfig] = useState({ key: "full_name", direction: "desc" });

    const handleSort = (columnKey) => {
        setSortConfig((prev) => {
            if (prev.key !== columnKey) {
                // First click on a different column: start with ascending
                return { key: columnKey, direction: "asc" };
            }
            // Toggle between asc and desc
            return {
                key: columnKey,
                direction: prev.direction === "asc" ? "desc" : "asc",
            };
        });
    };

    const getSortSymbol = (columnKey) => {
        if (sortConfig.key === columnKey) {
            return sortConfig.direction === "asc"
                ? <ArrowUpward sx={{ fontSize: "17px" }} />
                : <ArrowDownward sx={{ fontSize: "17px" }} />;
        }
        // For all other columns (not currently sorted), show default ▼ icon
        return <ArrowDownward sx={{ fontSize: "17px" }} />;
    };

    const sortedData = useMemo(() => {
        const sortableItems = [...paginatedData];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
                const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";
                if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [paginatedData, sortConfig]);

    const totalPages = Math.ceil(filteredData.length / recordsPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

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

    const [openModalAdd, setOpenModalAdd] = useState(false);
    const roleTypes = [
        t("All"),
        t("Account Executive"),
        t("Company"),
        t("Workers"),
        t("Lenders"),
        t("Suppliers"),
        t("Applicants")
    ];

    const [activeTab, setActiveTab] = useState('All');

    const statuses = [
        t("All"),
        t("Active"),
        t("Inactive")
    ];

    const [activeStatus, setActiveStatus] = useState('All');

    const validationSchema = yup.object({
        locations: yup.array().of(yup.string()).nullable(),
        max_user: yup.array().of(yup.string()).nullable(),
        start_date: yup.string().nullable(),
        end_date: yup.string().nullable(),
    });

    const formik = useFormik({
        initialValues: {
            locations: [],
            max_user: [],
            start_date: null,
            end_date: null
        },
        validationSchema: validationSchema,
        onSubmit: (values, { resetForm }) => {
            
            setOpenModalAdd(false);
            resetForm();
        }
    });

    useEffect(() => {

        getallusers();

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

                            </div>
                        ) : (
                            <Grid container spacing={0} sx={{ pl: 1, pr: 1 }} pt={0}>
                                <Grid xs={12} pb={1}>
                                    <Card
                                        sx={{
                                            width: '100%',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '12px',
                                            border: "1px solid rgba(9, 30, 66, 0.14)",
                                            boxShadow: 'none',
                                            p: 1,
                                        }}
                                    >
                                        <CardContent sx={{ p: 0, '&:last-child': { paddingBottom: 0 } }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <Box display="flex" alignItems="center" gap={1} mb={0}>
                                                    <Box
                                                        onClick={() => navigate(-1)}
                                                        component="img"
                                                        src={back_arrow}
                                                        sx={{ cursor: "pointer", width: '30px' }}
                                                    />

                                                    <Box sx={{ mt: { xs: 1, md: .5 }, backgroundColor: "#fff", border: "2px solid rgba(9, 30, 66, 0.14)", borderRadius: "5px", width: "240px" }}>
                                                        <OutlinedInput
                                                        autoComplete="off"
                                                            placeholder={t("Search...")}
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
                                                        // value={searchTerm}
                                                        // onChange={e => setSearchTerm(e.target.value)}
                                                        />
                                                    </Box>
                                                </Box>

                                                <img src={filter} alt="..."
                                                    // onClick={() => setOpenModalAdd(true)}
                                                    onClick={() => alert("This feature is under development")}

                                                    style={{ cursor: "pointer", width: "25px" }} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* map */}
                                <Grid xs={12} md={12} align="">
                                    <Box sx={{ backgroundColor: "white", border: "2px solid rgba(9, 30, 66, 0.14)", borderRadius: "10px" }}>

                                        <Box sx={{
                                            backgroundImage: `url(${full_map_image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center center',
                                            backgroundRepeat: "no-repeat",
                                            width: "100%",
                                            height: "75vh",
                                            borderTopLeftRadius: "8px",
                                            borderTopRightRadius: "8px"
                                        }}>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* role categorization */}
                                <Grid xs={12} md={3.7} pt={1} >
                                    <RoleCategorization fullmap={true} />
                                </Grid>

                                {/* Subscription Categorization */}
                                <Grid xs={12} md={8.3} pt={1.1} pl={{ xs: 0, md: 2 }} pb={4}>
                                    <Card sx={{ boxShadow: "none", borderRadius: "10px" }}>
                                        <CardContent>
                                            {sortedData?.length == 0 || undefined || null ?
                                                <Grid container spacing={0} pt={10} pb={10}>
                                                    <Grid xs={10} md={12} lg={12} align="center">
                                                        <Stack direction="column">
                                                            <Error sx={{ fontSize: "5vh", color: "#A5ADB0", opacity: 0.5, alignSelf: "center" }} />
                                                            <TypographyMD variant='h2' label={t("Data Not Found")} color="#A5ADB0" fontFamily="Roboto" marginLeft={0} fontSize="13px" fontWeight={450} align="center" />
                                                        </Stack>
                                                    </Grid>
                                                </Grid>
                                                :
                                                <TableContainer
                                                    sx={{
                                                        borderRadius: { xs: "5px", md: "5px" },
                                                        boxShadow: "none",
                                                        pl: 0, pr: 0, pt: 1
                                                    }} >

                                                    <Table
                                                        sx={{
                                                            minWidth: { xs: "100px", md: '250px' },
                                                            '& .MuiTableCell-root': {
                                                                padding: '6px',
                                                            },
                                                            '& .MuiTableRow-root': {
                                                                height: '30px',
                                                            }
                                                        }}
                                                        aria-label="simple table"
                                                    >

                                                        <TableHead style={{ fontSize: "13px", backgroundColor: '#F4F6FA' }}>
                                                            <TableRow  >
                                                                {/* <TableCell padding="Checkbox">
                                                                    <Checkbox
                                                                        sx={{
                                                                            color: 'rgba(9, 30, 66, 0.14)'
                                                                        }}
                                                                        checked={selectAll}
                                                                        indeterminate={false} // We no longer show partial state
                                                                        onChange={(e) => handleCheckboxChange(e, "selectAll")}
                                                                    />

                                                                </TableCell> */}

                                                                <TableCell
                                                                    align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px", cursor: "pointer" }}
                                                                    onClick={() => handleSort("user_id")}
                                                                >
                                                                    {t("Id")}
                                                                    {getSortSymbol("user_id")}
                                                                </TableCell>
                                                                <TableCell
                                                                    align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px", cursor: "pointer" }}
                                                                    onClick={() => handleSort("full_name")}
                                                                >
                                                                    {t("Full Name")}
                                                                    {getSortSymbol("full_name")}
                                                                </TableCell>
                                                                <TableCell
                                                                    align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px", cursor: "pointer" }}
                                                                    onClick={() => handleSort("email")}
                                                                >
                                                                    {t("Email")}
                                                                    {getSortSymbol("email")}
                                                                </TableCell>
                                                                <TableCell
                                                                    align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px", cursor: "pointer" }}
                                                                    onClick={() => handleSort("phone_no")}
                                                                >
                                                                    {t("Phone No.")}
                                                                    {getSortSymbol("phone_no")}
                                                                </TableCell>
                                                                <TableCell
                                                                    align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px", cursor: "pointer" }}
                                                                    onClick={() => handleSort("status")}
                                                                >
                                                                    {t("Status")}
                                                                    {getSortSymbol("status")}
                                                                </TableCell>
                                                                <TableCell
                                                                    align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px", cursor: "pointer" }}
                                                                    onClick={() => handleSort("registered")}
                                                                >
                                                                    {t("Registered")}
                                                                    {getSortSymbol("registered")}
                                                                </TableCell>
                                                                {/* <TableCell align="center" sx={{ fontWeight: "bold", color: "#44546F", fontFamily: "Roboto", fontSize: "14px" }}> {t("Action")} </TableCell> */}
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {sortedData.map((item) => (
                                                                <TableRow hover>

                                                                    {/* <TableCell padding="Checkbox" onClick={(e) => {
                                                                        e.stopPropagation();
                                                                    }}>
                                                                        <Checkbox
                                                                            sx={{
                                                                                color: 'rgba(9, 30, 66, 0.14)'
                                                                            }}
                                                                            checked={selectedRows.includes(item.user_id)}
                                                                            onChange={(e) => handleCheckboxChange(e, item.user_id)}
                                                                        />
                                                                    </TableCell> */}

                                                                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                                                                        {item.user_id}
                                                                    </TableCell>

                                                                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                                                                        {item.full_name}
                                                                    </TableCell>

                                                                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                                                                        {item.email}
                                                                    </TableCell>

                                                                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                                                                        {item.phone_no}
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

                                                                    <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                                                                        {item.registered}
                                                                    </TableCell>

                                                                    {/* <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Roboto", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                                                                        <div style={{ display: "flex", justifyContent: "center", alignContent: "cenetr", gap: "10px" }}>
                                                                            <img src={menu_icon} style={{ width: "15px" }} />
                                                                        </div>
                                                                    </TableCell> */}

                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>

                                                    <div style={{ marginTop: "10px", marginBottom: "10px", display: "flex", justifyContent: "center", alignContent: "center" }}>
                                                        <Pagination
                                                            count={totalPages}
                                                            page={currentPage}
                                                            onChange={(_, p) => handlePageChange(_, p)}
                                                            shape="rounded"
                                                            color="primary"
                                                            size="small"
                                                            sx={{
                                                                '& .MuiPaginationItem-root': {
                                                                    fontFamily: 'Poppins, sans-serif',
                                                                    fontSize: 13,
                                                                    fontWeight: 500,
                                                                },
                                                                '& .Mui-selected': {
                                                                    backgroundColor: '#E9F3FF',
                                                                    color: '#006EC2'
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </TableContainer>
                                            }
                                        </CardContent>
                                    </Card>
                                </Grid>

                            </Grid >
                        )
                        }

                    </Box >
                }
            />

            <ModalAdd
                open={openModalAdd}
                onClose={() => setOpenModalAdd(false)}
                type="subscription_plan"
                title={t("Filter")}
                data={
                    <form style={{ backgroundColor: "#fff", margin: 13 }} onSubmit={formik.handleSubmit}>
                        <Box
                            sx={{
                                maxHeight: { xs: "100dvh", md: '91vh' },   // control how tall the modal body can grow
                                overflowY: 'auto',   // enable vertical scroll if content overflows
                                px: 1,
                                pb: 3            // padding left & right
                            }}
                        >
                            <Grid container spacing={0}>
                                <Grid xs={12} align="left">

                                    <div>
                                        <Box sx={{ marginTop: "15px", marginBottom: "30px" }} width={{ xs: "97%", md: "100%" }}>
                                            {/* --- Filter Location --- */}
                                            <TypographyMD
                                                variant="paragraph"
                                                label={t("Filter Location")}
                                                color="#000000"
                                                fontFamily="Roboto"
                                                fontSize="15px"
                                                fontWeight={750}
                                                align="left"
                                            />

                                            <div style={{ marginBottom: "5px", marginTop: "10px" }}>
                                                <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
                                                    <Box width={{ xs: "100%", md: "100%" }}>
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Add Locations")}
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="13px"
                                                            marginBottom={1}
                                                            fontWeight={450}
                                                            align="left"
                                                        />
                                                        <SelectField
                                                            multiple
                                                            value={formik.values.locations}
                                                            onChangeTerm={(e) => formik.setFieldValue("locations", e.target.value)}
                                                            options={[
                                                                { value: 'pancras_international_station', label: 'St. Pancras International Station' },
                                                                { value: 'granary_square', label: 'Granary Square' },
                                                                { value: 'regen_canal', label: 'Regent’s Canal' },
                                                                { value: 'coal_drops_yard', label: 'Coal Drops Yard' },
                                                            ]}
                                                            error={formik.touched.locations && Boolean(formik.errors.locations)}
                                                            helperText={formik.touched.locations && formik.errors.locations}
                                                        />

                                                        {/* Display selected locations as tags/chips */}
                                                        <Box mt={0} display="flex" flexWrap="wrap" gap={1}>
                                                            {formik.values.locations.map((locValue) => {
                                                                // Find the label from the options list
                                                                const option = [
                                                                    { value: 'pancras_international_station', label: 'St. Pancras International Station' },
                                                                    { value: 'granary_square', label: 'Granary Square' },
                                                                    { value: 'regen_canal', label: 'Regent’s Canal' },
                                                                    { value: 'coal_drops_yard', label: 'Coal Drops Yard' },
                                                                ].find(opt => opt.value === locValue);

                                                                return (
                                                                    <Box
                                                                        key={locValue}
                                                                        display="flex"
                                                                        alignItems="center"
                                                                        px={1}
                                                                        py={0.3}
                                                                        border="1px solid #579DFF"
                                                                        borderRadius="5px"
                                                                        color="#09326C"
                                                                        bgcolor="#579DFF"
                                                                    >
                                                                        <TypographyMD fontSize="13px" color="#09326C">
                                                                            {option?.label || locValue}
                                                                        </TypographyMD>
                                                                        <Box
                                                                            ml={0.5}
                                                                            mt={-0.5}
                                                                            // sx={{ cursor: 'pointer' }}
                                                                            onClick={() => {
                                                                                const updated = formik.values.locations.filter(v => v !== locValue);
                                                                                formik.setFieldValue("locations", updated);
                                                                            }}
                                                                        >
                                                                            <Close sx={{ width: "17px" }} />
                                                                        </Box>
                                                                    </Box>
                                                                );
                                                            })}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </div>

                                            {/* --- Role Type --- */}
                                            <TypographyMD
                                                variant="paragraph"
                                                label={t("Role Type")}
                                                color="#000000"
                                                fontFamily="Roboto"
                                                fontSize="15px"
                                                fontWeight={750}
                                                align="left"

                                            />

                                            <div style={{ display: "flex", gap: 8, marginBottom: "10px", marginTop: "10px" }}>
                                                {roleTypes.map((role) => (
                                                    <div
                                                        key={role}
                                                        onClick={() => setActiveTab(role)}
                                                        style={{
                                                            display: "flex",
                                                            padding: '4px 12px',
                                                            borderRadius: '5px',
                                                            border: `2px solid ${activeTab === role ? '#006EC2' : '#ccc'}`,
                                                            backgroundColor: activeTab === role ? 'transparent' : 'transparent',
                                                            cursor: 'pointer',
                                                            width: 'fit-content',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={role}
                                                            color={activeTab === role ? '#006EC2' : '#363333'}
                                                            fontFamily="Roboto"
                                                            fontSize="12px"
                                                            fontWeight={500}
                                                            align="center"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* --- Status --- */}
                                            <TypographyMD
                                                variant="paragraph"
                                                label="Status"
                                                color="#000000"
                                                fontFamily="Roboto"
                                                fontSize="15px"
                                                fontWeight={750}
                                                align="left"

                                            />

                                            <div style={{ display: "flex", gap: 8, marginBottom: "10px", marginTop: "10px" }}>
                                                {statuses.map((status) => (
                                                    <div
                                                        key={status}
                                                        onClick={() => setActiveStatus(status)}
                                                        style={{
                                                            display: "flex",
                                                            padding: '4px 12px',
                                                            borderRadius: '5px',
                                                            border: `2px solid ${activeStatus === status ? '#006EC2' : '#ccc'}`,
                                                            backgroundColor: activeStatus === status ? 'transparent' : 'transparent',
                                                            cursor: 'pointer',
                                                            width: 'fit-content',
                                                            transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={status}
                                                            color={activeStatus === status ? '#006EC2' : '#363333'}
                                                            fontFamily="Roboto"
                                                            fontSize="12px"
                                                            fontWeight={500}
                                                            align="center"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* --- Max Users --- */}
                                            <TypographyMD
                                                variant="paragraph"
                                                label={t("Max Users")}
                                                color="#000000"
                                                fontFamily="Roboto"
                                                fontSize="15px"
                                                fontWeight={750}
                                                align="left"
                                            />

                                            <div style={{ marginBottom: "5px", marginTop: "10px" }}>
                                                <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
                                                    <Box width={{ xs: "100%", md: "100%" }}>
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Add No. of Users")}
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="13px"
                                                            marginBottom={1}
                                                            fontWeight={450}
                                                            align="left"
                                                        />
                                                        <Inputfield
                                                            autoFocus={false}
                                                            value={formik.values.tempMaxUser || ''}
                                                            onChngeterm={(e) => formik.setFieldValue("tempMaxUser", e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && formik.values.tempMaxUser) {
                                                                    e.preventDefault();  // prevent form submission
                                                                    const updated = [...formik.values.max_user, formik.values.tempMaxUser];
                                                                    formik.setFieldValue("max_user", updated);
                                                                    formik.setFieldValue("tempMaxUser", '');  // clear input
                                                                }
                                                            }}
                                                            type="number"
                                                            variant="outlined"
                                                        />

                                                        {/* Show max users as tags */}
                                                        <Box mt={0} display="flex" flexWrap="wrap" gap={1}>
                                                            {formik.values.max_user.map((user, index) => (
                                                                <Box
                                                                    key={index}
                                                                    display="flex"
                                                                    alignItems="center"
                                                                    px={1}
                                                                    py={0.3}
                                                                    border="1px solid #579DFF"
                                                                    borderRadius="5px"
                                                                    color="#09326C"
                                                                    bgcolor="#579DFF"
                                                                >
                                                                    <TypographyMD fontSize="13px" color="#09326C">{user}</TypographyMD>
                                                                    <Box
                                                                        ml={0.5}
                                                                        mt={-0.3}
                                                                        // sx={{ cursor: 'pointer' }}
                                                                        onClick={() => {
                                                                            const updated = formik.values.max_user.filter((_, i) => i !== index);
                                                                            formik.setFieldValue("max_user", updated);
                                                                        }}
                                                                    >
                                                                        <Close sx={{ width: "15px" }} />
                                                                    </Box>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                </Box>

                                                <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
                                                    <Box width={{ xs: "100%", md: "50%" }}>
                                                        <TypographyMD variant="paragraph" label={t("Start Date")} color="#626F86" fontFamily="Roboto" fontSize="13px" marginBottom={1} fontWeight={450} align="left" />
                                                        <Inputfield
                                                            autoFocus={false}
                                                            value={formik.values.start_date}
                                                            onChngeterm={(e) => formik.setFieldValue("start_date", e.target.value)}
                                                            error={formik.touched.start_date && Boolean(formik.errors.start_date)}
                                                            helperText={formik.touched.start_date && formik.errors.start_date}
                                                            type="date"
                                                            variant="outlined"
                                                        />
                                                    </Box>

                                                    <Box width={{ xs: "100%", md: "50%" }}>
                                                        <TypographyMD variant="paragraph" label={t("End Date")} color="#626F86" fontFamily="Roboto" fontSize="13px" marginBottom={1} fontWeight={450} align="left" />
                                                        <Inputfield
                                                            autoFocus={false}
                                                            value={formik.values.end_date}
                                                            onChngeterm={(e) => formik.setFieldValue("end_date", e.target.value)}
                                                            error={formik.touched.end_date && Boolean(formik.errors.end_date)}
                                                            helperText={formik.touched.end_date && formik.errors.end_date}
                                                            type="date"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                </Box>
                                            </div>

                                        </Box>
                                    </div>

                                </Grid>
                            </Grid>


                        </Box>

                        <Box
                            sx={{
                                position: 'sticky',
                                bottom: 0,
                                backgroundColor: '#fff',
                                py: 2,
                                px: 1,
                                mt: { xs: 0, md: -5 },
                                zIndex: 1,
                            }}
                        >
                            <ButtonMD
                                variant="contained"
                                title={t("Save")}
                                startIcon={<CheckCircleOutline />}
                                width="fit-content"
                                type="submit"
                                borderColor="orange"
                                backgroundColor="orange"
                                borderRadius="5px"
                                disabled={loading}
                            />
                        </Box>

                    </form>
                }
            />

        </>
    )
}

export default SystemOversightDetail;