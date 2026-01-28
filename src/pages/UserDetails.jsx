import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Sidebar from "../components/sidebar/Sidebar";
import { Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Grid, IconButton, InputAdornment, Menu, MenuItem, Modal, OutlinedInput, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { Add, ArrowBack, ArrowBackIos, ArrowForwardIos, Block, Close, Code, Delete, Download, Edit, Error, FilterAlt, FoodBank, Group, GroupAdd, Groups, KeyboardArrowLeft, MoreVert, PendingActions, Report, RequestedPage, Restaurant, Search, Star, StarBorder, StarHalf, TwoWheeler, Visibility } from "@mui/icons-material";
import TypographyMD from "../components/items/Typography";
import sales from "../Assets/sales.png";
import purchase from "../Assets/purchase.png";
import wallet_amount from "../Assets/wallet_amount.png";
import products from "../Assets/products.png";
import followers from "../Assets/followers.png";
import followings from "../Assets/followings.png";
import average_rating from "../Assets/average_rating.png";

import { useNavigate, useSearchParams } from "react-router-dom";
import Topbar from "../components/topbar/Topbar";
import DashboardCard from "../components/DashboardCard";
import url from "../url";
import Graph from "../components/graph/Graph";
import { DashboardGoogleMap } from "../components/items/Dashboardgooglemap";
import DashboardAreaChart from "../components/items/DashboardAreaChart"; 
import ModalAdd from "../components/items/Modal";
import ModalSuccess from "../components/items/ModalSuccess";
import ButtonMD from "../components/items/ButtonMD";
import {toast} from "react-hot-toast";
import UserCard from "../components/items/Usercard";
import UserSales from "./UserSales";
import UserPurchases from "./UserPurchases";
import UserFollowers from "./UserFollowers";
import UserFollowing from "./UserFollowing";
import WalletHistory from "./UserWalletHistory";

function UserDetails() {

    const [searchParams] = useSearchParams();

    const user_id = searchParams.get('user_id');

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeFilter, setActiveFilter] = useState('A-Z');
    const [filteredRows, setFilteredRows] = useState([]);
    const [allproducts, setAllproducts] = useState([]);
    const getUserProducts = async (user_id) => {

        var InsertAPIURL = `${url}product/getByUser?user_id=${user_id}`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {

             

                setAllproducts(response?.data);
                setFilteredRows([...response?.data]);

            }
            )
            .catch(error => {

               toast.error(t("Something went wrong"));
            });

    }

    const rowsPerPageOptions = [5, 10, 25];

    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the total number of pages
    const totalPages = Math.ceil(allproducts?.length / rowsPerPage);

    // Calculate the index range for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const [allPurchases, setAllPurchases] = useState([]);
    const getUserPurchases = async (user_id) => {

        var InsertAPIURL = `${url}order/getPurchaseByUser?user_id=${user_id}`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {

            

                setAllPurchases(response?.data);

            }
            )
            .catch(error => {

               toast.error(t("Something went wrong"));
            });

    }

    const [allSales, setAllSales] = useState([]);
    const getUserSales = async (user_id) => {

        var InsertAPIURL = `${url}order/getSalesByUser?user_id=${user_id}`
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

              toast.error(t("Something went wrong"));
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

            toast.error(t("Something went wrong"));
            });

    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleFilterSelect = (filter) => {
        setActiveFilter(filter);
    

        let sortedRows = [...filteredRows];

        if (filter === 'A-Z') {
            sortedRows.sort((a, b) =>
                (a.product?.product_name?.toString() || '').localeCompare(b.product?.product_name?.toString() || '')
            );
        } else if (filter === 'Newest') {
            sortedRows.sort((a, b) => {
                const dateB = new Date(b.product?.created_at?.slice(0, 10));
                const dateA = new Date(a.product?.created_at?.slice(0, 10));
                return dateB - dateA;
            });
        } else if (filter === 'Oldest') {
            sortedRows.sort((a, b) => {
                const dateA = new Date(a.product?.created_at?.slice(0, 10));
                const dateB = new Date(b.product?.created_at?.slice(0, 10));
                return dateA - dateB;
            });
        } else if (filter === 'Z-A') {
            sortedRows.sort((a, b) =>
                (b.product?.product_name?.toString() || '').localeCompare(a.product?.product_name?.toString() || '')
            );
        }

        const filteredData = sortedRows.filter(item =>
            (item?.product?.product_name || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

       
        setFilteredRows(filteredData);
        handleClose();
    };

    const filteredData = allproducts?.filter(item =>
        (item?.product?.product_name || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const highlightMatch = (text, term) => {
        const lowerText = text.toLowerCase();
        const lowerTerm = term.toLowerCase();
        const startIndex = lowerText.indexOf(lowerTerm);

        if (startIndex === -1) {
            return text;
        }

        const beforeMatch = text.slice(0, startIndex);
        const match = text.slice(startIndex, startIndex + term.length);
        const afterMatch = text.slice(startIndex + term.length);
        return (
            <>
                {beforeMatch}
                <span style={{ backgroundColor: '#FF144D29' }}>{match}</span>
                {afterMatch}
            </>
        );
    };

    // Get the rows to display on the current page
    const displayedRows = searchTerm ? filteredData?.slice(startIndex, endIndex) : filteredRows?.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle next and previous page
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Generate an array of page numbers
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    const [openmodalview, setOpenmodalview] = useState(false);
    const [orderDetails, setOrderDetails] = useState("");
    const handleOpenmodalview = (data) => {
        setOpenmodalview(true);
        setOrderDetails(data);
    };

    const handleClosemodalview = () => setOpenmodalview(false);

    const [opensuccess, setOpensuccess] = useState(false);
    const handleOpensuccess = () => {
        setOpensuccess(true);
        setOpenmodalview(false);
        setTimeout(() => {
            setOpensuccess(false);
        }, 3000);
    };
    const handleClosesuccess = () => setOpensuccess(false);

    const [openmodalconfirmation, setOpenmodalconfirmation] = useState(false);
    const handleOpenmodalconfirmation = (data) => {
        setOpenmodalconfirmation(true);
        setOpenmodalview(false);
    };

    const handleOpenmodalviewconfirmation = () => {
        setOpenmodalconfirmation(true);
        setOpenmodalview(false);
    };


    const handleChangeStatus = (data) => {
       toast.success(t("Status updated successfully"));
        // Your logic to update status here...
    };

    useEffect(() => {

        // const items = JSON.parse(localStorage.getItem('ID_User'));
        // if (items != null) {
        //     navigate(`/dashboard`);
        // } else {
        //     navigate(`/`);
        // }

        getUserDetails(user_id);
        getUserSales(user_id);
        getUserPurchases(user_id);
        getUserProducts(user_id);

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

    const [activeTab, setActiveTab] = useState('products'); // default tab

    return (
        <>
            <Sidebar
                componentData={
                    <Box sx={{ overflow: "hidden" }} height="auto">
                        <Grid container spacing={0}>

                            <Grid xs={12} md={12} align="" >
                                <Box sx={{ borderBottom: "1px solid rgb(16, 16, 16, 0.1)", backgroundColor: "#ffffff" }}>
                                    <Grid container spacing={0}>
                                        <Grid xs={12} md={4} align="" >
                                            <Stack sx={{ mt: { xs: 1.5, md: .5 } }} p={2.5} pb={0}>
                                                <TypographyMD variant='paragraph' label={t("User Management")} color="#424242" marginLeft={0} fontFamily="Nunito Sans" fontSize="25px" fontWeight={850} align="left" />
                                            </Stack>
                                        </Grid>

                                        <Grid xs={12} md={8} align="" >
                                            <Stack p={2.5}>
                                                <div style={{ display: "flex", justifyContent: "right", alignContent: "right", gap: "10px" }}>
                                                    <div>
                                                        <Topbar />
                                                    </div>
                                                </div>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>

                        </Grid>

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
                                <div style={{ marginTop: "40px" }}></div>
                                <Grid container spacing={0} sx={{ pl: 2, pr: 2 }} pt={0}>
                                    {/* Left Section - Cards (6 columns) */}
                                    <Grid item xs={12} md={4} p={0.5}>
                                        <Grid container spacing={2}>

                                            <Grid item xs={12} align="center">
                                                <Card sx={{
                                                    width: "100%", height: "auto", backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid transparent", boxShadow: "none",
                                                }}>
                                                    <CardContent>
                                                        <Box align="left" >
                                                            <Grid container spacing={0} p={0}>
                                                                <Grid xs={4} md={4} align="left" pb={0.5}>
                                                                    <ArrowBack sx={{ mt: -1, cursor: "pointer", color: "#000000" }} onClick={() => navigate(-1)} />
                                                                </Grid>

                                                                <Grid xs={8} md={8} sm={8} align="right" p={0.5} >
                                                                    <TypographyMD variant='paragraph' label={t("User Details")} color="#424242" marginTop={-1} fontFamily="Nunito Sans" fontSize="16px" fontWeight={750} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label={t("User ID")} color="#1F1F1E" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={650} align="left" />
                                                                </Grid>

                                                                <Grid xs={7} md={7} align="right" pb={1}>
                                                                    <TypographyMD variant='h2' label={`# ${userId?.user_id}`} color="#60646B" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={550} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label="User Name" color="#1F1F1E" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={650} align="left" />
                                                                </Grid>

                                                                <Grid xs={7} md={7} align="right" pb={0.5} >
                                                                    <TypographyMD variant='h2' label={`${userId?.username}`} color="#60646B" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={550} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label="Email Address" color="#1F1F1E" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={650} align="left" />
                                                                </Grid>

                                                                <Grid xs={7} md={7} align="right" pb={0.5} >
                                                                    <TypographyMD variant='h2' label={`${userId?.email}`} color="#60646B" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={550} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label="Phone No" color="#1F1F1E" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={650} align="left" />
                                                                </Grid>

                                                                <Grid xs={7} md={7} align="right" pb={0.5} >
                                                                    <TypographyMD variant='h2' label={`${userId?.phoneno}`} color="#60646B" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={550} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label="Country" color="#1F1F1E" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={650} align="left" />
                                                                </Grid>

                                                                <Grid xs={7} md={7} align="right" pb={0.5} >
                                                                    <TypographyMD variant='h2' label={`${userId?.country?.country_name}`} color="#60646B" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={550} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label="Joining Date " color="#1F1F1E" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={650} align="left" />
                                                                </Grid>

                                                                <Grid xs={7} md={7} align="right" pb={0.5} >
                                                                    <TypographyMD variant='h2' label={<>
                                                                        {new Date(userId?.created_at).toLocaleString("en-US", {
                                                                            day: "2-digit",
                                                                            month: "long",
                                                                            year: "numeric",
                                                                            hour: "numeric",
                                                                            minute: "2-digit",
                                                                            second: "2-digit",
                                                                            hour12: true,
                                                                        })}
                                                                    </>} color="#60646B" fontFamily="Nunito Sans" marginLeft={0} fontSize="14px" fontWeight={550} align="right" />
                                                                </Grid>

                                                                <Grid xs={5} md={5} align="center" pb={1}>
                                                                    <TypographyMD variant='h2' label="Account Status" color="#1F1F1E" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={650} align="left" />
                                                                </Grid>

                                                                <Grid item xs={7} md={7} display="flex" justifyContent="flex-end" pb={0.5}>
                                                                    <Box
                                                                        sx={{
                                                                            backgroundColor: userId.block ? "#FF5858" : "#00C342",
                                                                            width: "fit-content",
                                                                            borderRadius: '5px',
                                                                            borderColor: 'inherit',
                                                                            boxShadow: "none",
                                                                            color: 'white',
                                                                            px: "20px",
                                                                            py: "10px",
                                                                            fontFamily: "Nunito Sans",
                                                                            letterSpacing: ".5px",
                                                                            textTransform: "capitalize",
                                                                            '&:hover': {
                                                                                backgroundColor: userId.block ? "#FF5858" : "#00C342",
                                                                                boxShadow: "none",
                                                                            },
                                                                        }}
                                                                    >
                                                                        {userId.block ? "Inactive" : "Active"}
                                                                    </Box>
                                                                </Grid>

                                                            </Grid>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Right Section - Graphs (6 columns) */}
                                    <Grid item xs={12} md={8} p={0.5}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={3} align="center">
                                                <UserCard
                                                    icon={<img src={sales} alt="..." style={{ width: "50px", height: "50px" }} />}
                                                    heading="Sales"
                                                    value={allSales ? allSales?.length : 0}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={3} align="center">
                                                <UserCard
                                                    icon={<img src={purchase} alt="..." style={{ width: "50px", height: "50px" }} />}
                                                    heading="Purchase"
                                                    value={allPurchases ? allPurchases?.length : 0}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={3} align="center">
                                                <UserCard
                                                    icon={<img src={wallet_amount} alt="..." style={{ width: "50px", height: "50px" }} />}
                                                    heading="Wallet Amount"
                                                    value={`$ ${userId?.available_balance}`}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={3} align="center">
                                                <UserCard
                                                    icon={<img src={products} alt="..." style={{ width: "50px", height: "50px" }} />}
                                                    heading="Products"
                                                    value={allproducts ? allproducts?.length : 0}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={3} align="center">
                                                <UserCard
                                                    icon={<img src={followers} alt="..." style={{ width: "50px", height: "50px" }} />}
                                                    heading="Followers"
                                                    value={userId?.followers_count}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={3} align="center">
                                                <UserCard
                                                    icon={<img src={followings} alt="..." style={{ width: "50px", height: "50px" }} />}
                                                    heading="Followings"
                                                    value={userId?.followings_count}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6} align="center">
                                                <UserCard
                                                    icon={<img src={average_rating} alt="..." style={{ width: "50px", height: "50px" }} />}
                                                    heading="Average Rating"
                                                    value={userId?.average_rating}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                </Grid>

                                <Box sx={{ pt: 1.5, paddingLeft: 2.5, paddingRight: 2.5, display: 'flex', gap: '10px', marginBottom: 1.5 }}>
                                    <div
                                        onClick={() => setActiveTab('products')}
                                        style={{
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === 'products' ? '#2152CD' : '#fff',
                                            color: activeTab === 'products' ? 'white' : 'black',
                                            border: activeTab === 'products' ? '1px solid transparent' : '1px solid lightgray',
                                            borderRadius: '8px',
                                            fontSize: "13px",
                                            fontWeight: 550
                                        }}
                                    >
                                        Products
                                    </div>
                                    <div
                                        onClick={() => setActiveTab('sales')}
                                        style={{
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === 'sales' ? '#2152CD' : '#fff',
                                            color: activeTab === 'sales' ? 'white' : 'black',
                                            border: activeTab === 'sales' ? '1px solid transparent' : '1px solid lightgray',
                                            borderRadius: '8px',
                                            fontSize: "13px",
                                            fontWeight: 550
                                        }}
                                    >
                                        Sales
                                    </div>
                                    <div
                                        onClick={() => setActiveTab('purchases')}
                                        style={{
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === 'purchases' ? '#2152CD' : '#fff',
                                            color: activeTab === 'purchases' ? 'white' : 'black',
                                            border: activeTab === 'purchases' ? '1px solid transparent' : '1px solid lightgray',
                                            borderRadius: '8px',
                                            fontSize: "13px",
                                            fontWeight: 550
                                        }}
                                    >
                                        Purchases
                                    </div>
                                    <div
                                        onClick={() => setActiveTab('followers')}
                                        style={{
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === 'followers' ? '#2152CD' : '#fff',
                                            color: activeTab === 'followers' ? 'white' : 'black',
                                            border: activeTab === 'followers' ? '1px solid transparent' : '1px solid lightgray',
                                            borderRadius: '8px',
                                            fontSize: "13px",
                                            fontWeight: 550
                                        }}
                                    >
                                        Followers
                                    </div>
                                    <div
                                        onClick={() => setActiveTab('followings')}
                                        style={{
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === 'followings' ? '#2152CD' : '#fff',
                                            color: activeTab === 'followings' ? 'white' : 'black',
                                            border: activeTab === 'followings' ? '1px solid transparent' : '1px solid lightgray',
                                            borderRadius: '8px',
                                            fontSize: "13px",
                                            fontWeight: 550
                                        }}
                                    >
                                        Followings
                                    </div>
                                    <div
                                        onClick={() => setActiveTab('wallet_history')}
                                        style={{
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                            backgroundColor: activeTab === 'wallet_history' ? '#2152CD' : '#fff',
                                            color: activeTab === 'wallet_history' ? 'white' : 'black',
                                            border: activeTab === 'wallet_history' ? '1px solid transparent' : '1px solid lightgray',
                                            borderRadius: '8px',
                                            fontSize: "13px",
                                            fontWeight: 550
                                        }}
                                    >
                                        Wallet History
                                    </div>
                                </Box>

                                {activeTab === 'products' &&
                                    <Box sx={{ backgroundColor: "white", borderRadius: "14px", mt: 2, ml: 2, mr: 2 }}>
                                        <Grid container spacing={0}  >
                                            <Grid xs={6} md={6} align="center" p={1}>
                                                <TypographyMD variant='h2' label="Products" color="#424242" fontFamily="Nunito Sans" marginLeft={0} fontSize="25px" fontWeight={550} align="left" />
                                            </Grid>

                                            <Grid xs={6} md={6} align="right" p={1}>
                                                <div style={{ display: "flex", justifyContent: "right", alignContent: "right", gap: "10px" }}>

                                                    <div>
                                                        <Box sx={{ mt: { xs: 1, md: .5 }, backgroundColor: "#F4F6FA", border: "1px solid white", borderRadius: "50px", width: "230px" }}>
                                                            <OutlinedInput
                                                             autoComplete="off"
                                                                placeholder={t('Search here')}
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

                                                    <div>
                                                        <Button onClick={handleClick} variant="contained"
                                                            sx={{
                                                                backgroundColor: "transparent",
                                                                width: "150px",
                                                                border: "1px solid lightgrey",
                                                                color: "gray",
                                                                borderRadius: "5px",
                                                                boxShadow: "none",
                                                                textTransform: "capitalize",
                                                                fontFamily: "Nunito Sans",
                                                                "&:hover": {
                                                                    backgroundColor: "transparent",
                                                                    boxShadow: "none",
                                                                },
                                                            }}>
                                                            <FilterAlt />&nbsp;&nbsp;&nbsp; {activeFilter}
                                                        </Button>
                                                    </div>

                                                </div>

                                                <div>

                                                    <Menu
                                                        PaperProps={{
                                                            sx: {
                                                                mt: 3,
                                                                overflow: 'visible',
                                                                width: 150,
                                                                mt: 1.5,
                                                                '& .MuiAvatar-root': {
                                                                    width: 46,
                                                                    height: 32,
                                                                    ml: -0.5,
                                                                    mr: 1,
                                                                },
                                                                '&:before': {
                                                                    content: '""',
                                                                    display: 'block',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    right: 14,
                                                                    width: 10,
                                                                    height: 10,
                                                                    bgcolor: 'background.paper',
                                                                    transform: 'translateY(-50%) rotate(45deg)',
                                                                    zIndex: 0,
                                                                },
                                                            },
                                                        }}
                                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                                        anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                                                        <MenuItem
                                                            onClick={() => handleFilterSelect('A-Z')}
                                                            style={{ fontFamily: "Nunito Sans", color: activeFilter === 'A-Z' ? '#193870' : 'inherit' }}
                                                        >
                                                            A-Z
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={() => handleFilterSelect('Newest')}
                                                            style={{ fontFamily: "Nunito Sans", color: activeFilter === 'Newest' ? '#193870' : 'inherit' }}
                                                        >
                                                            Newest
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={() => handleFilterSelect('Oldest')}
                                                            style={{ fontFamily: "Nunito Sans", color: activeFilter === 'Oldest' ? '#193870' : 'inherit' }}
                                                        >
                                                            Oldest
                                                        </MenuItem>
                                                        <MenuItem
                                                            onClick={() => handleFilterSelect('Z-A')}
                                                            style={{ fontFamily: "Nunito Sans", color: activeFilter === 'Z-A' ? '#193870' : 'inherit' }}
                                                        >
                                                            Z-A
                                                        </MenuItem>
                                                    </Menu>
                                                </div>
                                            </Grid>

                                            <Grid xs={12} md={12} mb={6}>
                                                {displayedRows?.length == 0 || undefined || null ?
                                                    <Grid container spacing={0} pt={10} pb={10}>
                                                        <Grid xs={12} md={12} lg={12} align="center"  >
                                                            <Stack direction="column">
                                                                <Error sx={{ fontSize: "5vh", color: "#A5ADB0", opacity: 0.5, alignSelf: "center" }} />
                                                                <TypographyMD variant='h2' label={t("Data Not Found")} color="#A5ADB0" fontFamily="Nunito Sans" marginLeft={0} fontSize="13px" fontWeight={450} align="center" />
                                                            </Stack>
                                                        </Grid>
                                                    </Grid>
                                                    :
                                                    <TableContainer
                                                        sx={{
                                                            backgroundColor: "white",
                                                            borderRadius: "30px",
                                                            boxShadow: "none",
                                                            pl: 1, pr: 1
                                                        }} >

                                                        <Table sx={{ minWidth: { xs: "100px", md: '250px' } }} aria-label="simple table">
                                                            <TableHead style={{ backgroundColor: '#F4F6FA' }}>
                                                                <TableRow  >
                                                                    {/* <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> PRODUCT ID </TableCell> */}
                                                                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> Name </TableCell>
                                                                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> PRICE </TableCell>
                                                                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> WEIGHT </TableCell>
                                                                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> CATEGORY </TableCell>
                                                                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> COUNTRY</TableCell>
                                                                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> DATE - TIME </TableCell>
                                                                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> QUANTITY </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {displayedRows?.map((item) => (
                                                                    <TableRow>
                                                                        {/* <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }}>
                                                                        # {highlightMatch((item?.product?.product_id || '').toString(), searchTerm)}
                                                                    </TableCell> */}

                                                                        <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                                            <div style={{ display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center", gap: 10 }}>
                                                                                <Avatar src={item?.product?.images[0]} />
                                                                                {highlightMatch((item?.product?.product_name || '').toString(), searchTerm)}
                                                                                {/* {item.product?.product_name} */}
                                                                            </div>
                                                                        </TableCell>

                                                                        <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >$ {item?.product?.price}</TableCell>
                                                                        <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >{item?.product?.weight_unit}</TableCell>
                                                                        <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >{item?.category?.category_name}</TableCell>
                                                                        <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} > {item?.country?.country_name ? item?.country?.country_name : "-"}</TableCell>
                                                                        <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                                            <>
                                                                                {new Date(item?.product?.created_at).toLocaleString("en-US", {
                                                                                    day: "2-digit",
                                                                                    month: "long",
                                                                                    year: "numeric",
                                                                                    hour: "numeric",
                                                                                    minute: "2-digit",
                                                                                    second: "2-digit",
                                                                                    hour12: true,
                                                                                })}
                                                                            </>
                                                                        </TableCell>
                                                                        <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >{item?.product?.quantity}</TableCell>

                                                                    </TableRow>
                                                                ))}

                                                            </TableBody>
                                                        </Table>

                                                        <div style={{ display: "flex", justifyContent: "right", alignContent: "right" }}>

                                                            <div>
                                                                <ArrowBackIos onClick={handlePrevPage} disabled={currentPage === 1}
                                                                    sx={{ color: "#444", fontSize: "15px" }} />

                                                                {pageNumbers.map((page) => (
                                                                    <button
                                                                        key={page}
                                                                        onClick={() => handlePageChange(page)}
                                                                        style={{
                                                                            backgroundColor: currentPage === page ? '#193870' : 'white',
                                                                            color: currentPage === page ? 'white' : 'black',
                                                                            border: currentPage === page ? 'none' : '1px solid lightgrey',
                                                                            padding: '5px 10px',
                                                                            margin: '5px',
                                                                            borderRadius: "5px",
                                                                            cursor: 'pointer',
                                                                        }}
                                                                    >
                                                                        {page}
                                                                    </button>
                                                                ))}

                                                                <ArrowForwardIos onClick={handleNextPage} disabled={currentPage === totalPages}
                                                                    sx={{ color: "#444", fontSize: "15px" }} />

                                                            </div>
                                                        </div>

                                                    </TableContainer>
                                                }
                                            </Grid>
                                        </Grid>
                                    </Box>}

                                {activeTab === 'sales' && <UserSales user_id={user_id} />}
                                {activeTab === 'purchases' && <UserPurchases user_id={user_id} />}
                                {activeTab === 'followers' && <UserFollowers user_id={user_id} />}
                                {activeTab === 'followings' && <UserFollowing user_id={user_id} />}
                                {activeTab === 'wallet_history' && <WalletHistory user_id={user_id} />}   

                            </>
                        )}

                    </Box >
                }
            />

            {/* view */}
            < ModalAdd
                open={openmodalview}
                onClose={() => setOpenmodalview(false)}
                title="Order Details"
                data={
                    <>
                        <Grid container spacing={0} p={3}>

                            <Grid xs={4} md={4} align="center" >
                                <TypographyMD variant='h2' label="Order ID" color="#A5ADB0" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" >
                                <TypographyMD variant='h2' label={`# ${orderDetails?.product?.product_id}`} color="#424242" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            <Grid xs={12} md={12} align="" pt={1} pb={1}>
                                <Divider sx={{ color: "gray", backgroundColor: "gray" }} />
                            </Grid>

                            <Grid xs={4} md={4} align="center" >
                                <TypographyMD variant='h2' label="Buyer" color="#A5ADB0" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" >
                                <TypographyMD variant='h2' label={<div style={{ display: "flex", justifyContent: "right", alignContent: "right", alignItems: "center", gap: 10 }}><Avatar src={orderDetails?.user?.profile_image} /> {orderDetails?.user?.username}</div>} color="#424242" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            <Grid xs={12} md={12} align="" pt={1} pb={1}>
                                <Divider sx={{ color: "gray", backgroundColor: "gray" }} />
                            </Grid>

                            <Grid xs={4} md={4} align="center" >
                                <TypographyMD variant='h2' label="No. Of Products" color="#A5ADB0" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" >
                                <TypographyMD variant='h2' label={orderDetails?.cart_products?.length} color="#424242" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            <Grid xs={12} md={12} align="" pt={1} pb={1}>
                                <Divider sx={{ color: "gray", backgroundColor: "gray" }} />
                            </Grid>

                            <Grid xs={4} md={4} align="center" >
                                <TypographyMD variant='h2' label="Payable Amount" color="#A5ADB0" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" >
                                <TypographyMD variant='h2' label={`$ ${orderDetails?.total_amount}`} color="#424242" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            <Grid xs={12} md={12} align="" pt={1} pb={1}>
                                <Divider sx={{ color: "gray", backgroundColor: "gray" }} />
                            </Grid>

                            <Grid xs={4} md={4} align="center" >
                                <TypographyMD variant='h2' label="Order Status" color="#A5ADB0" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" >
                                <TypographyMD variant='h2' label={<Box
                                    sx={{
                                        display: "inline-block",
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: "bold",
                                        color: "#fff",
                                        textTransform: "capitalize",
                                        bgcolor:
                                            orderDetails?.order_status === "completed"
                                                ? "#00b894"
                                                : orderDetails?.order_status === "order_placed"
                                                    ? "#e67e22"
                                                    : orderDetails?.order_status === "processing"
                                                        ? "#6c5ce7"
                                                        : orderDetails?.order_status === "cancelled"
                                                            ? "#ff6b6b"
                                                            : "#b2bec3"
                                    }}
                                >
                                    {orderDetails?.order_status?.replace("_", " ")}
                                </Box>} color="#424242" fontFamily="Nunito Sans" marginLeft={0} marginTop={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            {/* buy products */}

                            <Grid xs={12} md={12} align="" pt={1} pb={1}>
                                <Divider sx={{ color: "gray", backgroundColor: "gray" }} />
                            </Grid>

                            <Grid xs={12} md={12} align="left" pt={2} pb={1}>
                                <TypographyMD
                                    variant='h2'
                                    label="Buy Products"
                                    color="#424242"
                                    fontFamily="Nunito Sans"
                                    fontSize="16px"
                                    fontWeight={550}
                                    align="left"
                                />
                            </Grid>

                            <Box sx={{ maxHeight: "300px", overflowY: "auto", pr: 1 }}>
                                {orderDetails?.cart_products?.map((item) => (
                                    <Grid item xs={12} key={item.cart_product_id}>
                                        <Box
                                            sx={{
                                                position: "relative",
                                                border: "1px solid #ccc",
                                                borderRadius: 2,
                                                p: 2,
                                                mb: 2,
                                                backgroundColor: "#f9f9f9",
                                            }}
                                        >
                                            {/* 🔵 Order Status Badge */}
                                            <Box sx={{ position: "absolute", top: 16, right: 16 }}>
                                                <Chip
                                                    label={item.product_order_status}
                                                    color={
                                                        item.product_order_status === "completed"
                                                            ? "success"
                                                            : item.product_order_status === "order_placed"
                                                                ? "info"
                                                                : item.product_order_status === "processing"
                                                                    ? "warning"
                                                                    : "error"
                                                    }
                                                    variant="outlined"
                                                />
                                            </Box>

                                            <Grid container spacing={2} alignItems="center">
                                                {/* 👤 Seller Info */}
                                                <Grid item xs={12}>
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight="bold"
                                                        fontSize="17px"
                                                        color="primary"
                                                    >
                                                        Seller: {item.seller?.username}
                                                    </Typography>
                                                    <Typography variant="body2">Email: {item.seller?.email}</Typography>
                                                </Grid>

                                                {/* 🧾 Product Details */}
                                                <Grid item xs={12} md={6}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                        <Avatar
                                                            src={item.product?.images?.[0]}
                                                            variant="rounded"
                                                            sx={{ width: 56, height: 56 }}
                                                        />
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                {item.product?.name}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {item.quantity} x ${item.price} = ${item.sub_total}
                                                            </Typography>

                                                            {/* 🚚 Estimated Delivery Days */}
                                                            {(item.product_order_status === "processing" ||
                                                                item.product_order_status === "cancelled") && (
                                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                                        <strong>Estimated Delivery:</strong>{" "}
                                                                        {item.estimated_delivery_days}
                                                                    </Typography>
                                                                )}

                                                            {/* ❌ Cancellation Reason */}
                                                            {item.product_order_status === "cancelled" &&
                                                                item.cancelled_reason && (
                                                                    <Typography variant="body2" sx={{ mt: 0.5 }} color="error">
                                                                        <strong>Cancellation Reason:</strong>{" "}
                                                                        {item.cancelled_reason}
                                                                    </Typography>
                                                                )}
                                                        </Box>
                                                    </Box>
                                                </Grid>

                                                {/* 📂 Category Info */}
                                                <Grid item xs={12} md={6}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Avatar
                                                            src={item.category?.image}
                                                            variant="rounded"
                                                            sx={{ width: 40, height: 40 }}
                                                        />
                                                        <Typography variant="body1" fontWeight={500}>
                                                            Category: {item.category?.name}
                                                        </Typography>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} align="right">
                                                    {/* 🔁 Change Status Button */}
                                                    {item.product_order_status === "processing" && (
                                                        <Button onClick={() =>
                                                            handleChangeStatus(item) // 👈 Replace with your own handler
                                                        } variant="contained"
                                                            sx={{
                                                                backgroundColor: "transparent",
                                                                width: "fit-content",
                                                                border: "1px solid #2462d1",
                                                                color: "#2462d1",
                                                                fontWeight: "650",
                                                                fontSize: "15px",
                                                                borderRadius: "5px",
                                                                boxShadow: "none",
                                                                textTransform: "capitalize",
                                                                fontFamily: "Nunito Sans",
                                                                "&:hover": {
                                                                    backgroundColor: "transparent",
                                                                    boxShadow: "none",
                                                                },
                                                            }}>
                                                            Change Status To Completed
                                                        </Button>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                ))}
                            </Box>

                        </Grid>
                    </>
                }
            />

        </>
    )
}

export default UserDetails;