import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import { Box, Button, Divider, Grid, IconButton, InputAdornment, Menu, MenuItem, OutlinedInput, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from "@mui/material";
import TypographyMD from "../components/items/Typography";
import Topbar from "../components/topbar/Topbar";
import { ArrowBackIos, ArrowForwardIos, Block, Error, FilterAlt, Search, Visibility } from "@mui/icons-material"
import url from "../url";
import { Page, Text, View, Document, StyleSheet, BlobProvider } from '@react-pdf/renderer';

function Opktest() {

    const [allopktestcount, setAllopktestcount] = useState([]);
    const getuserswithopkcount = async () => {
        var InsertAPIURL = `${url}user/getAllUsersWithOpkCount`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {

               
                setAllopktestcount(response.result);
                setFilteredRows([...response.result]);
            }
            )
            .catch(error => {

               toast.error("Something went wrong. Please try again.", )
            });
    }

    useEffect(() => {

        getuserswithopkcount();

    }, []);

    const [showPDF, setShowPDF] = useState(false);

    const generatePDF = (rows) => {

        const styles = StyleSheet.create({
            page: {
                flexDirection: 'column',
                backgroundColor: 'white',
            },
            section: {
                margin: 10,
                padding: 10,
                flexGrow: 1,
            },
            header: {
                fontSize: 16,
                marginBottom: 10,
                textAlign: 'center',
            },
            table: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                border: 1,
            },
            cell: {
                fontSize: 14,
                marginBottom: 10,
                textAlign: 'center',
            },
        });

        const tableData = allopktestcount.map((item) => (
            <View style={{ flexDirection: 'row', border: 1 }} key={item.id}>
                <View style={{ width: '60%', padding: 5, border: 1 }}>
                    <Text style={styles.cell}>{item.user.first_name} {item.user.last_name}</Text>
                </View>
                <View style={{ width: '100%', padding: 5, border: 1 }}>
                    <Text style={styles.cell}>{item.user.email}</Text>
                </View>
                <View style={{ width: '80%', padding: 5, border: 1 }}>
                    <Text style={styles.cell}>{item.user.date_of_birth}</Text>
                </View>
                <View style={{ width: '50%', padding: 5, border: 1 }}>
                    <Text style={styles.cell}>{item.user.city}</Text>
                </View>
                <View style={{ width: '50%', padding: 5, border: 1 }}>
                    <Text style={styles.cell}>{item.user.country}</Text>
                </View>
                <View style={{ width: '50%', padding: 5, border: 1 }}>
                    <Text style={styles.cell}>{item.opkTestCount}</Text>
                </View>
                <View style={{ width: '50%', padding: 5, border: 1 }}>
                    <Text style={styles.cell}>{item.user.status}</Text>
                </View>
            </View>
        ));

        return (
            <Document>

                <Page size="A3">
                    <View style={{ flexDirection: 'row', border: 1 }} >
                        <View style={{ width: '60%', padding: 5, border: 1 }}>
                            <Text style={styles.header}>Name</Text>
                        </View>

                        <View style={{ width: '100%', padding: 5, border: 1 }}>
                            <Text style={styles.header}>Email</Text>
                        </View>

                        <View style={{ width: '80%', padding: 5, border: 1 }}>
                            <Text style={styles.header}>Date Of Birth</Text>
                        </View>

                        <View style={{ width: '50%', padding: 5, border: 1 }}>
                            <Text style={styles.header}>City</Text>
                        </View>

                        <View style={{ width: '50%', padding: 5, border: 1 }}>
                            <Text style={styles.header}>Country</Text>
                        </View>

                        <View style={{ width: '50%', padding: 5, border: 1 }}>
                            <Text style={styles.header}>OPK Test Taken</Text>
                        </View>

                        <View style={{ width: '50%', padding: 5, border: 1 }}>
                            <Text style={styles.header}>Block Status</Text>
                        </View>

                    </View>
                    {tableData}
                </Page>

            </Document>
        );
    };

    const togglePDF = () => {
        setShowPDF(!showPDF);
    };

    const rowsPerPageOptions = [7, 15, 25];

    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the total number of pages
    const totalPages = Math.ceil(allopktestcount.length / rowsPerPage);

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
            sortedRows.sort((a, b) => a.user.first_name.localeCompare(b.user.first_name));
        } else if (filter === 'Newest') {
            sortedRows.sort((a, b) => {
                const dateB = new Date(b.user.created_at.slice(0, 10));
                const dateA = new Date(a.user.created_at.slice(0, 10));
                return dateB - dateA;
            });
        } else if (filter === 'Oldest') {
            sortedRows.sort((a, b) => {
                const dateA = new Date(a.user.created_at.slice(0, 10));
                const dateB = new Date(b.user.created_at.slice(0, 10));
                return dateA - dateB;
            });
        } else if (filter == 'Z-A') {
            sortedRows.sort((a, b) => b.user.first_name.localeCompare(a.user.first_name));
        }

        const filteredData = sortedRows.filter(item =>
            item.user.first_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      
        setFilteredRows(filteredData);
        handleClose();
    };

    const filteredData = allopktestcount.filter(item =>
        item.user.first_name.toLowerCase().includes(searchTerm.toLowerCase())
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

    return (
        <>
            <Sidebar
                componentData={
                    <Box sx={{ width: "100%", overflowX: "hidden" }} height="auto">
                        <Grid container spacing={0}>

                            <Grid xs={12} md={12} align="" >
                                <Box sx={{ backgroundColor: "#C4B1AB" }}>
                                    <Stack p={2.5}>
                                        <div style={{ display: "flex", justifyContent: "right", alignContent: "right", gap: "10px" }}>

                                            <div>
                                                <Box sx={{ mt: { xs: 1, md: .5 }, backgroundColor: "white", border: "1px solid white", borderRadius: "50px", width: "230px" }}>
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
                                </Box>
                            </Grid>

                            <Grid xs={12} sm={6} align="" p={2} >
                                <TypographyMD variant='paragraph' label="OPK Test" color="#424242" marginLeft={1} fontFamily="Laila" fontSize="25px" fontWeight={550} align="center" />
                            </Grid>

                            <Grid xs={12} sm={6} align="right" p={2}>
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
                                                fontFamily: "Laila",
                                                "&:hover": {
                                                    backgroundColor: "transparent",
                                                    boxShadow: "none",
                                                },
                                            }}>
                                            <FilterAlt />&nbsp;&nbsp;&nbsp; {activeFilter}
                                        </Button>
                                    </div>

                                    <div>
                                        <Button onClick={togglePDF}
                                            variant="contained"
                                            sx={{
                                                width: "150px",
                                                backgroundColor: "#B6BEA9",
                                                borderRadius: '5px',
                                                borderColor: 'inherit',
                                                boxShadow: "none",
                                                color: 'white',
                                                fontFamily: "Laila",
                                                letterSpacing: ".5px",
                                                textTransform: "capitalize",
                                                '&:hover': {
                                                    backgroundColor: "#B6BEA9",
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
                                            style={{ fontFamily: "Laila", color: activeFilter === 'A-Z' ? '#C4B1AB' : 'inherit' }}
                                        >
                                            A-Z
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => handleFilterSelect('Newest')}
                                            style={{ fontFamily: "Laila", color: activeFilter === 'Newest' ? '#C4B1AB' : 'inherit' }}
                                        >
                                            Newest
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => handleFilterSelect('Oldest')}
                                            style={{ fontFamily: "Laila", color: activeFilter === 'Oldest' ? '#C4B1AB' : 'inherit' }}
                                        >
                                            Oldest
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => handleFilterSelect('Z-A')}
                                            style={{ fontFamily: "Laila", color: activeFilter === 'Z-A' ? '#C4B1AB' : 'inherit' }}
                                        >
                                            Z-A
                                        </MenuItem>
                                    </Menu>
                                </div>
                            </Grid>

                        </Grid>

                        <Grid container spacing={0} sx={{ pl: 2, pr: 2 }} pt={0}>
                            <Grid xs={12} md={12} align="">
                                {filteredData?.length == 0 || undefined || null ?
                                    <Grid container spacing={0} pt={10} pb={10}>
                                        <Grid xs={12} md={12} lg={12} align="center"  >
                                            <Stack direction="column">
                                                <Error sx={{ fontSize: "5vh", color: "#A5ADB0", opacity: 0.5, alignSelf: "center" }} />
                                                <TypographyMD variant='h2' label={t("Data Not Found")} color="#A5ADB0" fontFamily="Laila" marginLeft={0} fontSize="13px" fontWeight={450} align="center" />
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                    :
                                    <TableContainer sx={{
                                        borderRadius: "10px",
                                        boxShadow: "none"
                                    }} >

                                        <Table sx={{ width: "100%" }} aria-label="simple table">
                                            <TableHead style={{ backgroundColor: 'rgba(182, 190, 169, 0.35)' }}>
                                                <TableRow  >
                                                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Laila", fontSize: "15px" }}> USER NAME </TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Laila", fontSize: "15px" }}> EMAIL ADDRESS</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Laila", fontSize: "15px" }}> DATE OF BIRTH </TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Laila", fontSize: "15px" }}> OPK TEST TAKEN </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {displayedRows.map((item) => (
                                                    <TableRow>
                                                        <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Laila", fontSize: "13px" }} >{highlightMatch(item.user.first_name, searchTerm)} {item.user.last_name}</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Laila", fontSize: "13px" }} >{item.user.email}</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Laila", fontSize: "13px" }} >{item.user.date_of_birth}</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Laila", fontSize: "13px" }} > {item.opkTestCount} </TableCell>

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
                                                            backgroundColor: currentPage === page ? '#C4B1AB' : 'white',
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

                                {showPDF && (
                                    <BlobProvider key={Math.random()} document={generatePDF(allopktestcount)}>
                                        {({ blob, url, loading, error }) => {
                                            if (loading) {
                                                return 'Loading...';
                                            } else if (blob) {
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = 'User With OPK Count.pdf';
                                                a.click();
                                            } else if (error) {
                                                return 'Error generating PDF';
                                            }
                                        }}
                                    </BlobProvider>
                                )}

                            </Grid>
                        </Grid>
                    </Box>
                }
            />
        </>
    )
}

export default Opktest;