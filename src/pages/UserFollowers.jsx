import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom"; 
import { Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Grid, IconButton, InputAdornment, Menu, MenuItem, Modal, OutlinedInput, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { Add, ArrowBack, ArrowBackIos, ArrowForwardIos, Block, Close, Code, Delete, Download, Edit, Error, FilterAlt, FoodBank, Group, GroupAdd, Groups, KeyboardArrowLeft, MoreVert, PendingActions, Report, RequestedPage, Restaurant, Search, Star, StarBorder, StarHalf, TwoWheeler, Visibility } from "@mui/icons-material";
import TypographyMD from "../components/items/Typography";

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
import { useTranslation } from "react-i18next";
function UserFollowers({ user_id }) {

    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeFilter, setActiveFilter] = useState('A-Z');
    const [filteredRows, setFilteredRows] = useState([]);
    const [allFollowers, setAllFollowers] = useState([]);
    const {t} =useTranslation()
    const getUserFollowers = async (user_id) => {

        var InsertAPIURL = `${url}follwers/getAll?seller_id=${user_id}`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {

    
                setAllFollowers(response?.data?.followers);
                setFilteredRows([...response?.data?.followers]);

            }
            )
            .catch(error => {
               toast.error("Something went wrong");
            });

    }

    const rowsPerPageOptions = [5, 10, 25];

    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the total number of pages
    const totalPages = Math.ceil(allFollowers?.length / rowsPerPage);

    // Calculate the index range for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;


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
                (a.user_id?.toString() || '').localeCompare(b.user_id?.toString() || '')
            );
        } else if (filter === 'Newest') {
            sortedRows.sort((a, b) => {
                const dateB = new Date(b.created_at?.slice(0, 10));
                const dateA = new Date(a.created_at?.slice(0, 10));
                return dateB - dateA;
            });
        } else if (filter === 'Oldest') {
            sortedRows.sort((a, b) => {
                const dateA = new Date(a.created_at?.slice(0, 10));
                const dateB = new Date(b.created_at?.slice(0, 10));
                return dateA - dateB;
            });
        } else if (filter === 'Z-A') {
            sortedRows.sort((a, b) =>
                (b.user_id?.toString() || '').localeCompare(a.user_id?.toString() || '')
            );
        }

        const filteredData = sortedRows.filter(item =>
            (item?.user_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredRows(filteredData);
        handleClose();
    };

    const filteredData = allFollowers?.filter(item =>
        (item?.user_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
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

    useEffect(() => {

        getUserFollowers(user_id);

    }, []);

    const [initialLoader, setInitialLoader] = useState(true);

    useEffect(() => {
        // Simulate a 2-second loading time
        const timer = setTimeout(() => {
            setInitialLoader(false);
        }, 4000);

        // Cleanup timeout on unmount
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <Box sx={{ backgroundColor: "white", borderRadius: "14px", mt: 2, ml: 2, mr: 2 }}>
                <Grid container spacing={0}  >
                    <Grid xs={6} md={6} align="center" p={1}>
                        <TypographyMD variant='h2' label="Followers" color="#424242" fontFamily="Nunito Sans" marginLeft={0} fontSize="25px" fontWeight={550} align="left" />
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
                </Grid>

                {initialLoader ? (
                    <div style={{
                        height: "20vh",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>

                        <CircularProgress size={20} thickness={3} color="primary" />

                    </div> // Or use a spinner
                ) : (
                    <Grid container spacing={0}>
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
                                                <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> USER ID </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> USER NAME </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> EMAIL </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> PHONE # </TableCell>
                                                <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> DATE - TIME </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {displayedRows?.map((item) => (
                                                <TableRow>

                                                    <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                        # {highlightMatch((item?.user_id || '').toString(), searchTerm)}
                                                    </TableCell>

                                                    <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >{item?.username}</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                        {item?.email}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >{item?.phoneno}</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                        <>
                                                            {new Date(item?.created_at
                                                            ).toLocaleString("en-US", {
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
                )}
            </Box>

        </>
    )
}

export default UserFollowers;