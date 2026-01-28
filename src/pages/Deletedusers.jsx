import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import { Box, Button, CircularProgress, Divider, Grid, IconButton, InputAdornment, Menu, MenuItem, OutlinedInput, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip } from "@mui/material";
import TypographyMD from "../components/items/Typography";
import exportIcon from "../Assets/export_icon.png";
import Topbar from "../components/topbar/Topbar";
import { ArrowBackIos, ArrowForwardIos, Block, Error, Filter, FilterAlt, Search, Visibility } from "@mui/icons-material"
import ModalAdd from "../components/items/Modal";
import ButtonMD from "../components/items/ButtonMD";
import ModalSuccess from "../components/items/ModalSuccess";
import url from "../url";
import { Page, Text, View, Document, StyleSheet, BlobProvider, Image, pdf } from '@react-pdf/renderer';
import toast from "react-hot-toast";


function DeletedUsers() {

    const [allusers, setAllusers] = useState([]);
    const getallDeletedUsers = async () => {
        var InsertAPIURL = `${url}user/getAllDeleted`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {

         

                const filteredResult = response.data.filter(item => item.role !== "admin");
                setAllusers(filteredResult);
                setFilteredRows([...filteredResult]);

            }
            )
            .catch(error => {

             toast.error("Something went wrong. Please try again.", )
            });
    }

    const [userDetails, setUserDetails] = useState("");
    const [openmodalview, setOpenmodalview] = useState(false);
    const handleOpenmodalview = (data) => {
        setOpenmodalview(true);
       
        setUserDetails(data);
    };

    useEffect(() => {

        getallDeletedUsers();

    }, []);

    const generatePDF = (rows) => {
        const styles = StyleSheet.create({
            page: {
                flexDirection: 'column',
                backgroundColor: 'white',
            },
            header: {
                fontSize: 14,
                fontWeight: 'bold',
                textAlign: 'center',
                padding: 5,
            },
            cell: {
                fontSize: 12,
                textAlign: 'center',
                padding: 5,
            },
            row: {
                flexDirection: 'row',
                borderBottom: 1,
            },
            columnImage: { width: '35%', borderRight: 1 },
            columnId: { width: '35%', borderRight: 1 },
            columnName: { width: '35%', borderRight: 1 },
            columnEmail: { width: '55%', borderRight: 1 },
            columnDaysLeft: { width: '35%', borderRight: 1 },
            columnDeletedDate: { width: '60%', borderRight: 1 },
            columnStatus: { width: '35%' },
            image: {
                width: 30,
                height: 30,
                borderRadius: 15,
                alignSelf: 'center',
            },
        });
        const tableHeader = (
            <View style={styles.row}>
                <Text style={[styles.header, styles.columnImage]}>Profile</Text>
                <Text style={[styles.header, styles.columnId]}>User ID</Text>
                <Text style={[styles.header, styles.columnName]}>Username</Text>
                <Text style={[styles.header, styles.columnEmail]}>Email</Text>
                <Text style={[styles.header, styles.columnDaysLeft]}>Days Left</Text>
                <Text style={[styles.header, styles.columnDeletedDate]}>Deleted At</Text>
                <Text style={[styles.header, styles.columnStatus]}>Active Status</Text>
            </View>
        );

        const tableRows = allusers.map((item) => (
            <View style={styles.row} key={item.user_id}>
                <View style={styles.columnImage}>
                    {item.profile_image ? (
                        <Image src={item.profile_image} style={styles.image} />
                    ) : (
                        <Text style={styles.cell}>-</Text>
                    )}
                </View>
                <Text style={[styles.cell, styles.columnId]}>{item.user_id}</Text>
                <Text style={[styles.cell, styles.columnName]}>{item.username}</Text>
                <Text style={[styles.cell, styles.columnEmail]}>{item.email}</Text>
                <Text style={[styles.cell, styles.columnDaysLeft]}>{item.daysLeft}</Text>
                <Text style={[styles.cell, styles.columnDeletedDate]}> {new Date(item?.deleted_date).toLocaleString("en-US", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                })}</Text>
                <Text style={[styles.cell, styles.columnStatus]}>{item.block ? t("Inactive") : t("Active")}</Text>
            </View>
        ));

        return (
            <Document>
                <Page size="A3" style={styles.page}>
                    {tableHeader}
                    {tableRows}
                </Page>
            </Document>
        );
    };

    const handleExport = async () => {
        const doc = generatePDF(allusers);
        const blob = await pdf(doc).toBlob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'Deleted Accounts.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up
    };

    const rowsPerPageOptions = [5, 10, 25];

    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the total number of pages
    const totalPages = Math.ceil(allusers.length / rowsPerPage);

    // Calculate the index range for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeFilter, setActiveFilter] = useState('A-Z');
    const [filteredRows, setFilteredRows] = useState([]);

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
            sortedRows.sort((a, b) => (a.username || '').localeCompare(b.username || ''));
        } else if (filter === 'Newest') {
            sortedRows.sort((a, b) => {
                const dateB = new Date(b.created_at.slice(0, 10));
                const dateA = new Date(a.created_at.slice(0, 10));
                return dateB - dateA;
            });
        } else if (filter === 'Oldest') {
            sortedRows.sort((a, b) => {
                const dateA = new Date(a.created_at.slice(0, 10));
                const dateB = new Date(b.created_at.slice(0, 10));
                return dateA - dateB;
            });
        } else if (filter === 'Z-A') {
            sortedRows.sort((a, b) => (b.username || '').localeCompare(a.username || ''));
        }

        const filteredData = sortedRows.filter(item =>
            (item.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (item.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );

   
        setFilteredRows(filteredData);
        handleClose();
    };

    const filteredData = allusers.filter(item =>
        (item.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (item.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
    const displayedRows = searchTerm ? filteredData.slice(startIndex, endIndex) : filteredRows.slice(startIndex, endIndex);

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
        // Scroll to the top when the component mounts
        window.scrollTo(0, 0);
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
            <Sidebar
                componentData={
                    <Box sx={{ width: "100%", overflowX: "hidden" }} height="100vh">
                        <Grid container spacing={0}>

                            <Grid xs={12} md={12} align="" >
                                <Box sx={{ borderBottom: "1px solid rgb(16, 16, 16, 0.1)", backgroundColor: "#ffffff" }}>
                                    <Grid container spacing={0}>
                                        <Grid xs={12} md={4} align="" >
                                            <Stack sx={{ mt: { xs: 1.5, md: .5 } }} p={2.5} pb={0}>
                                                <TypographyMD variant='paragraph' label={t("Deleted Accounts")} color="#424242" marginLeft={0} fontFamily="Nunito Sans" fontSize="25px" fontWeight={850} align="left" />
                                            </Stack>
                                        </Grid>

                                        <Grid xs={12} md={8} align="" >
                                            <Stack p={2.5}>
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
                                                        <Topbar />
                                                    </div>
                                                </div>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>

                            <Grid xs={12} sm={12} align="right" p={2}>
                                <div style={{ display: "flex", justifyContent: "right", alignContent: "right", gap: "10px" }}>

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

                                    <div>
                                        <Button onClick={handleExport}
                                            variant="contained"
                                            endIcon={<img src={exportIcon} alt="..." style={{ width: "15px" }} />}
                                            sx={{
                                                width: "130px",
                                                backgroundColor: "#fff",
                                                borderRadius: '5px',
                                                border: '1px solid #D1D3D9',
                                                boxShadow: "none",
                                                color: '#000000',
                                                fontFamily: "Nunito Sans",
                                                letterSpacing: ".5px",
                                                textTransform: "capitalize",
                                                '&:hover': {
                                                    backgroundColor: "#fff",
                                                    border: '1px solid #D1D3D9',
                                                    boxShadow: "none",
                                                },
                                            }}
                                        >
                                            Export
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
                                height: "50vh",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>

                                <CircularProgress size={20} thickness={3} color="primary" />

                            </div>
                        ) : (
                            <Grid container spacing={0} sx={{ pl: 2, pr: 2 }} pt={0}>
                                <Grid xs={12} md={12} align="">
                                    {filteredData?.length == 0 || undefined || null ?
                                        <Grid container spacing={0} pt={10} pb={10}>
                                            <Grid xs={10} md={12} lg={12} align="center"  >
                                                <Stack direction="column">
                                                    <Error sx={{ fontSize: "5vh", color: "#A5ADB0", opacity: 0.5, alignSelf: "center" }} />
                                                    <TypographyMD variant='h2' label={t("Data Not Found")} color="#A5ADB0" fontFamily="Nunito Sans" marginLeft={0} fontSize="13px" fontWeight={450} align="center" />
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                        :
                                        <Box sx={{ backgroundColor: "white", borderRadius: "14px" }}>

                                            <Grid xs={12} sm={6} align="" p={2} pb={1}>
                                                <TypographyMD variant='paragraph' label={t("Deleted Accounts")} color="#424242" marginLeft={1} fontFamily="Nunito Sans" fontSize="25px" fontWeight={850} align="center" />
                                            </Grid>

                                            <TableContainer
                                                sx={{
                                                    // backgroundColor: "white",
                                                    borderRadius: "50px",
                                                    boxShadow: "none",
                                                    pl: 2, pr: 2, pt: 1
                                                }} >

                                                <Table sx={{ minWidth: { xs: "100px", md: '250px' } }} aria-label="simple table">
                                                    <TableHead style={{ backgroundColor: '#F4F6FA' }}>
                                                        <TableRow>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px", width: "200px" }}> {t("PROFILE IMAGE")} </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("USER NAME")} </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("EMAIL ADDRESS")}</TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("DELETED AT")} </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("DAYS REMAINING")} </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("ACTION")} </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {displayedRows.map((item) => (
                                                            <TableRow hover
                                                                onClick={() => handleOpenmodalview(item)}
                                                            // // sx={{ cursor: 'pointer' }}
                                                            >
                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px", width: "200px" }} >
                                                                    {item.profile_image ? <Box component="img" src={item?.profile_image} sx={{ width: "80px", borderRadius: "10px" }} /> : "-"}
                                                                </TableCell>
                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                                    {highlightMatch(item.username || '-', searchTerm)}
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                                    {highlightMatch(item.email || '-', searchTerm)}
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                                    <Text>
                                                                        {new Date(item?.deleted_date).toLocaleString("en-US", {
                                                                            day: "2-digit",
                                                                            month: "long",
                                                                            year: "numeric",
                                                                            hour: "numeric",
                                                                            minute: "2-digit",
                                                                            second: "2-digit",
                                                                            hour12: true,
                                                                        })}
                                                                    </Text>

                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                                    {item?.daysLeft}
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px", width: "200px" }} >
                                                                    <div style={{ display: "flex", justifyContent: "center", alignContent: "cenetr", gap: "10px" }}>
                                                                        <Tooltip title="View">
                                                                            <IconButton>
                                                                                <Visibility color="success" sx={{ width: "20px" }} onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleOpenmodalview(item)
                                                                                }} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </div>
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
                                        </Box>
                                    }

                                </Grid>
                            </Grid>
                        )}

                    </Box >
                }
            />

            {/* view */}
            < ModalAdd
                open={openmodalview}
                onClose={() => setOpenmodalview(false)}
                title="Deleted Account Details"
                data={
                    <>
                        <Grid container spacing={0} p={3}>

                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant='h2' label="User Name" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant='h2' label={`# ${userDetails?.username}`} color="#5E5F60" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant='h2' label="Email" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant='h2' label={userDetails?.email} color="#5E5F60" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant='h2' label="Days Remaining" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant='h2' label={`${userDetails?.daysLeft} `} color="#5E5F60" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant='h2' label="Date - Time" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant='h2' label={
                                    <>
                                        {new Date(userDetails?.deleted_date).toLocaleString("en-US", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: true,
                                        })}
                                    </>
                                } color="#5E5F60" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                        </Grid>
                    </>
                }
            />

         

        </>
    )
}

export default DeletedUsers;