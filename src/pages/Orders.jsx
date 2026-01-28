import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import { Avatar, Box, Button, Chip, CircularProgress, Divider, Grid, IconButton, InputAdornment, Menu, MenuItem, OutlinedInput, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from "@mui/material";
import TypographyMD from "../components/items/Typography";
import exportIcon from "../Assets/export_icon.png";
import Topbar from "../components/topbar/Topbar";
import { ArrowBackIos, ArrowForwardIos, Block, Error, FilterAlt, KeyboardArrowDown, KeyboardArrowUp, Search, Visibility } from "@mui/icons-material"
import url from "../url";
import { Page, Text, View, Document, StyleSheet, BlobProvider, Image, pdf } from '@react-pdf/renderer';
import ModalAdd from "../components/items/Modal";
import toast from "react-hot-toast";

function Opktest() {

    const [allorders, setAllorders] = useState([]);
    const getAllOrders = async () => {
        var InsertAPIURL = `${url}order/getAll`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {

              
                setAllorders(response.data);
                setFilteredRows([...response.data]);
            }
            )
            .catch(error => {

               toast.error("Something went wrong! Please try again.")
            });
    }

    const [openmodalview, setOpenmodalview] = useState(false);
    const [orderDetails, setOrderDetails] = useState("");
    const handleOpenmodalview = (data) => {
        setOpenmodalview(true);
      
        setOrderDetails(data);
    };

    const handleChangeStatus = (data) => {
       toast.success("Status changed successfully!");
        // Your logic to update status here...
    };

    useEffect(() => {

        getAllOrders();

    }, []);

    const generatePDF = (rows) => {
        const styles = StyleSheet.create({
            page: {
                flexDirection: 'column',
                backgroundColor: 'white',
                padding: 10
            },
            headerRow: {
                flexDirection: 'row',
                borderBottom: 1,
                paddingBottom: 5,
                marginBottom: 5,
            },
            headerCell: {
                fontSize: 12,
                fontWeight: 'bold',
                flex: 1,
                textAlign: 'center',
            },
            row: {
                flexDirection: 'row',
                borderBottom: 0.5,
                paddingVertical: 5,
                alignItems: 'center',
            },
            cell: {
                fontSize: 10,
                flex: 1,
                textAlign: 'center',
            },
            image: {
                width: 25,
                height: 25,
                borderRadius: 12,
                marginRight: 5,
            },
            buyerCell: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
            }
        });

        return (
            <Document>
                <Page size="A3" style={styles.page}>
                    {/* Table Headers */}
                    <View style={styles.headerRow}>
                        <Text style={styles.headerCell}>Order ID</Text>
                        <Text style={styles.headerCell}>Buyer</Text>
                        <Text style={styles.headerCell}>No. of Products</Text>
                        <Text style={styles.headerCell}>Payable Amount</Text>
                        <Text style={styles.headerCell}>Order Status</Text>
                    </View>

                    {/* Table Rows */}
                    {rows.map((item, idx) => (
                        <View style={styles.row} key={idx}>
                            <Text style={styles.cell}># {item.order_id}</Text>

                            <View style={styles.buyerCell}>
                                {item?.user?.profile_image && (
                                    <Image src={item.user.profile_image} style={styles.image} />
                                )}
                                <Text style={styles.cell}>{item.user?.username}</Text>
                            </View>

                            <Text style={styles.cell}>{item.cart_products?.length}</Text>
                            <Text style={styles.cell}>$ {item.total_amount}</Text>
                            <Text style={styles.cell}>
                                {item.order_status?.replace("_", " ")}
                            </Text>
                        </View>
                    ))}
                </Page>
            </Document>
        );
    };

    const handleExport = async () => {
        const doc = generatePDF(allorders);
        const blob = await pdf(doc).toBlob();
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'Orders.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up
    };

    const rowsPerPageOptions = [5, 10, 25];

    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the total number of pages
    const totalPages = Math.ceil(allorders.length / rowsPerPage);

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
            sortedRows.sort((a, b) =>
                (a.order_id?.toString() || '').localeCompare(b.order_id?.toString() || '')
            );
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
        } else if (filter == 'Z-A') {
            sortedRows.sort((a, b) =>
                (b.order_id?.toString() || '').localeCompare(a.order_id?.toString() || '')
            );
        }

        const filteredData = sortedRows.filter(item =>
            (item?.order_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredRows(filteredData);
        handleClose();
    };
    
    const filteredData = allorders.filter(item =>
        (item?.order_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
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

    const [initialLoader, setInitialLoader] = useState(true);

    useEffect(() => {
        // Simulate a 2-second loading time
        const timer = setTimeout(() => {
            setInitialLoader(false);
        }, 3000);

        // Cleanup timeout on unmount
        return () => clearTimeout(timer);
    }, []);

    const [showProducts, setShowProducts] = useState(false); // 👈 for toggling product list

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
                                                <TypographyMD variant='paragraph' label={t("Order Management")} color="#5E5F60" marginLeft={0} fontFamily="Nunito Sans" fontSize="25px" fontWeight={850} align="left" />
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
                                    {displayedRows?.length == 0 || undefined || null ?
                                        <Grid container spacing={0} pt={10} pb={10}>
                                            <Grid xs={12} md={12} lg={12} align="center"  >
                                                <Stack direction="column">
                                                    <Error sx={{ fontSize: "5vh", color: "#A5ADB0", opacity: 0.5, alignSelf: "center" }} />
                                                    <TypographyMD variant='h2' label={t("Data Not Found")} color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="13px" fontWeight={450} align="center" />
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                        :
                                        <Box sx={{ backgroundColor: "white", borderRadius: "14px" }}>

                                            <Grid xs={12} sm={6} align="" p={2} pb={1}>
                                                <TypographyMD variant='paragraph' label={t("List Of Orders")} color="#5E5F60" marginLeft={1} fontFamily="Nunito Sans" fontSize="25px" fontWeight={850} align="center" />
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
                                                        <TableRow  >
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> ORDER ID </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> BUYER </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> NO. OF PRODUCTS </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> PAYABLE AMOUNT </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> ORDER STATUS </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> Actions </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {displayedRows.map((item) => (
                                                            <TableRow hover
                                                                onClick={() => {
                                                                    setShowProducts(false)
                                                                    handleOpenmodalview(item)
                                                                }}
                                                                // // sx={{ cursor: 'pointer' }}
>
                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }}>
                                                                    # {highlightMatch((item?.order_id || '').toString(), searchTerm)}
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                                    <div style={{ display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center", gap: 10 }}>
                                                                        <Avatar src={item?.user?.profile_image} />
                                                                        {item.user?.username}
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >{item?.cart_products?.length}</TableCell>
                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >$ {item?.total_amount}</TableCell>
                                                                <TableCell align="center" sx={{ fontWeight: "normal", fontFamily: "Nunito Sans", fontSize: "13px" }}>
                                                                    <Box
                                                                        sx={{
                                                                            display: "inline-block",
                                                                            px: 1.5,
                                                                            py: 0.5,
                                                                            borderRadius: "20px",
                                                                            fontSize: "12px",
                                                                            fontWeight: "bold",
                                                                            color: "#fff",
                                                                            textTransform: "capitalize",
                                                                            bgcolor:
                                                                                item?.order_status === "completed"
                                                                                    ? "#00b894"
                                                                                    : item?.order_status === "order_placed"
                                                                                        ? "#e67e22"
                                                                                        : item?.order_status === "processing"
                                                                                            ? "#6c5ce7"
                                                                                            : item?.order_status === "cancelled"
                                                                                                ? "#ff6b6b"
                                                                                                : "#b2bec3"
                                                                        }}
                                                                    >
                                                                        {item?.order_status.replace("_", " ")}
                                                                    </Box>
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px", width: "200px" }} >
                                                                    <div style={{ display: "flex", justifyContent: "center", alignContent: "cenetr", gap: "10px" }}>
                                                                        <Tooltip title="View">
                                                                            <IconButton>
                                                                                <Visibility color="success" sx={{ width: "20px" }} onClick={() => handleOpenmodalview(item)} />
                                                                            </IconButton>
                                                                        </Tooltip>

                                                                        {/* <Tooltip title="Edit">
                                                                    <IconButton>
                                                                        <Edit color="info" sx={{ width: "20px" }} onClick={() => handleChangeEdit(item)} />
                                                                    </IconButton>
                                                                </Tooltip> */}

                                                                        {/* <Tooltip title="Delete">
                                                                    <IconButton>
                                                                        <Delete color="error" sx={{ width: "20px" }} onClick={() => handleOpenmodalconfirmation(item)} />
                                                                    </IconButton>
                                                                </Tooltip> */}

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

                    </Box>
                }
            />

            {/* view */}
            {/* const [showProducts, setShowProducts] = useState(false); // 👈 for toggling product list */}

            <ModalAdd
                open={openmodalview}
                onClose={() => setOpenmodalview(false)}
                title="Order Details"
                data={
                    <>
                        <Grid container spacing={0} p={3}>
                            {/* Order ID */}
                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant="h2" label="Order ID" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>
                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant="h2" label={`# ${orderDetails?.order_id}`} color="#5E5F60" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={650} align="right" />
                            </Grid>

                            {/* Buyer */}
                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant="h2" label="Buyer" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>
                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant="h2" label={
                                    <div style={{ display: "flex", justifyContent: "right", alignItems: "center", gap: 10 }}>
                                        <Avatar src={orderDetails?.user?.profile_image} /> {orderDetails?.user?.username}
                                    </div>
                                } color="#5E5F60" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={650} align="right" />
                            </Grid>

                            {/* No. of Products with Toggle Button */}
                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant="h2" label="No. Of Products" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>
                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ cursor: "pointer" }} gap={1} onClick={() => setShowProducts(!showProducts)}>
                                    <TypographyMD variant="h2" label={orderDetails?.cart_products?.length} color="#5E5F60" fontFamily="Nunito Sans" fontSize="16px" fontWeight={650} />
                                    <Button sx={{ minWidth: "30px", padding: 0 }}>
                                        {showProducts ? (
                                            <KeyboardArrowUp sx={{ color: "#5E5F60" }} />
                                        ) : (
                                            <KeyboardArrowDown sx={{ color: "#5E5F60" }} />
                                        )}
                                    </Button>
                                </Box>
                            </Grid>

                            {/* Payable Amount */}
                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant="h2" label="Payable Amount" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>
                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant="h2" label={`$ ${orderDetails?.total_amount}`} color="#5E5F60" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={650} align="right" />
                            </Grid>

                            {/* Order Status */}
                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant="h2" label="Order Status" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>
                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant="h2" label={
                                    <Box sx={{
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
                                    }}>
                                        {orderDetails?.order_status?.replace("_", " ")}
                                    </Box>
                                } color="#5E5F60" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={650} align="right" />
                            </Grid>

                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant="h2" label="Date - Time" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>
                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant="h2" label={
                                    <>
                                        {new Date(orderDetails?.created_at).toLocaleString("en-US", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                            hour: "numeric",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: true,
                                        })}
                                    </>
                                } color="#5E5F60" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={650} align="right" />
                            </Grid>

                            {/* Products List */}
                            {showProducts && (
                                <Grid item xs={12} mt={2}>
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
                                                    {/* Status Badge */}
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
                                                        {/* Seller Info */}
                                                        <Grid item xs={12}>
                                                            <Typography variant="h6" fontWeight="bold" fontSize="17px" color="primary">
                                                                Seller: {item.seller?.username}
                                                            </Typography>
                                                            <Typography variant="body2">Email: {item.seller?.email}</Typography>
                                                        </Grid>

                                                        {/* Product Info */}
                                                        <Grid item xs={12} md={6}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                                <Avatar src={item.product?.images?.[0]} variant="rounded" sx={{ width: 56, height: 56 }} />
                                                                <Box>
                                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                                        {item.product?.name}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {item.quantity} x ${item.price} = ${item.sub_total}
                                                                    </Typography>

                                                                    {/* Delivery Days */}
                                                                    {(item.product_order_status === "processing" || item.product_order_status === "cancelled") && (
                                                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                                                            <strong>Estimated Delivery:</strong> {item.estimated_delivery_days}
                                                                        </Typography>
                                                                    )}

                                                                    {/* Cancellation Reason */}
                                                                    {item.product_order_status === "cancelled" && item.cancelled_reason && (
                                                                        <Typography variant="body2" sx={{ mt: 0.5 }} color="error">
                                                                            <strong>Cancellation Reason:</strong> {item.cancelled_reason}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Box>
                                                        </Grid>

                                                        {/* Category Info */}
                                                        <Grid item xs={12} md={6}>
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                <Avatar src={item.category?.image} variant="rounded" sx={{ width: 40, height: 40 }} />
                                                                <Typography variant="body1" fontWeight={500}>
                                                                    Category: {item.category?.name}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>

                                                        {/* Change Status Button */}
                                                        <Grid item xs={12} align="right">
                                                            {item.product_order_status === "processing" && (
                                                                <Button
                                                                    onClick={() => handleChangeStatus(item)}
                                                                    variant="contained"
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
                                                                    }}
                                                                >
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
                            )}
                        </Grid>
                    </>
                }
            />

        </>
    )
}

export default Opktest;