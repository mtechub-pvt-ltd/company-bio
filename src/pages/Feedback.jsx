import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import { Box, Button, CircularProgress, Divider, Grid, IconButton, InputAdornment, Menu, MenuItem, OutlinedInput, Paper, Popper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip } from "@mui/material";
import TypographyMD from "../components/items/Typography";
import addIcon from "../Assets/add_icon.png";
import exportIcon from "../Assets/export_icon.png";
import downloadIcon from "../Assets/download_icon.png";
import Topbar from "../components/topbar/Topbar";
import { ArrowBackIos, ArrowForwardIos, Block, Close, CloudUpload, Delete, Download, Edit, Error, Filter, FilterAlt, Search, Visibility } from "@mui/icons-material"
import ModalAdd from "../components/items/Modal";
import ButtonMD from "../components/items/ButtonMD";
import ModalSuccess from "../components/items/ModalSuccess";
import url from "../url";
import { Page, Text, View, Document, StyleSheet, BlobProvider, pdf } from '@react-pdf/renderer';
import {toast} from "react-hot-toast";
import { useFormik } from 'formik';
import * as yup from 'yup';
import Inputfield from "../components/items/Inputfield";
import { ChromePicker } from 'react-color';
import SelectField from "../components/items/Selectfield";

function Feedback() {

    const [loading, setLoading] = useState(false);

    const [allusers, setAllusers] = useState([]);
    const getallFeedbacks = async () => {
        var InsertAPIURL = `${url}feedback/fetchAll`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {

               

                setAllusers(response.data);
                setFilteredRows([...response.data]);


            }
            )
            .catch(error => {
toast.error("Something went wrong. Please try again.", )
            });
    }

    const [openModalAdd, setOpenModalAdd] = useState(false);

    const [countries, setCountries] = useState([]);
    const getAllCountries = async () => {

        var InsertAPIURL = `${url}countries/getAll`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {

              

                setCountries(response?.data);


            }
            )
            .catch(error => {

               toast.error("Something went wrong. Please try again.", )
            });

    }

    const validationSchema = yup.object({
        country: yup.string().required('Country is required'),
        question: yup.string().required('Question is required'),
        answer: yup.string().required('Answer is required')
    });

    const formik = useFormik({
        initialValues: {
            country: '',
            question: '',
            answer: ''
        },
        validationSchema: validationSchema,
        onSubmit: (values, { resetForm }) => {
        

            setLoading(true);
            setTimeout(() => {
                var InsertAPIURL = `${url}faq/create`
                var headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                };
                var Data = {
                    "country_id": values?.country,
                    "quest": values?.feedback_idion,
                    "ans": values?.answer
                };
                fetch(InsertAPIURL, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(Data),
                })
                    .then(response => response.json())
                    .then(response => {
                      
                        setLoading(true);
                        
                        if (response.error) {
                            setLoading(false);
                          toast.error("Something went wrong. Please try again.", )
                        } else {
                          toast.success("Feedback added successfully!", )
                            resetForm();
                            setLoading(false);
                            getallFeedbacks();
                            setOpenModalAdd(false);
                        }
                    }
                    )
                    .catch(error => {
                        setLoading(false);
                      toast.error("Something went wrong. Please try again.", )
                    });
            }, 1000)

        }
    });

    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [editData, setEditData] = useState(null); // holds the selected country data
    const handleChangeEdit = async (data) => {
        setEditData(data);
        setOpenModalEdit(true);
    };

    const formikedit = useFormik({
        enableReinitialize: true, // Important for updating values on edit
        initialValues: {
            // category: editData?.feedback_id || '', 
            // country: '',
            question: editData?.feedback_id || '',
            answer: editData?.ans || ''
        },
        validationSchema: yup.object({
            // country: yup.string().required('Country is required'),
            question: yup.string().required('Question is required'),
            answer: yup.string().required('Answer is required')
        }),
        onSubmit: (values, { resetForm }) => {
           

            setLoading(true);
            setTimeout(() => {
                var InsertAPIURL = `${url}faq//update`
                var headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                };
                var Data = {
                    "faq_id": editData?.faq_id,
                    "quest": values?.feedback_idion,
                    "ans": values?.answer
                };
                fetch(InsertAPIURL, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify(Data),
                })
                    .then(response => response.json())
                    .then(response => {
                       
                        setLoading(true);
                      
                        if (response.error) {
                            setLoading(false);
                           toast.error("Something went wrong. Please try again.", )
                        } else {
                           toast.success("Feedback updated successfully!", )
                            resetForm();
                            setLoading(false);
                            getallFeedbacks();
                            setOpenModalEdit(false);
                        }
                    }
                    )
                    .catch(error => {
                        setLoading(false);
                        toast.error("Something went wrong. Please try again.", )
                    });
            }, 1000)


        }
    });

    const [openmodalconfirmation, setOpenmodalconfirmation] = useState(false);
    const handleOpenmodalconfirmation = (data) => {
        setEditData(data);
        setOpenmodalconfirmation(true);
        setOpenmodalview(false);
    };

    const deleteCall = async () => {

        setLoading(true);
        setTimeout(() => {
            var InsertAPIURL = `${url}faq/delete?faq_id=${editData?.faq_id}`
            var headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            };
            fetch(InsertAPIURL, {
                method: 'DELETE',
                headers: headers,
                body: JSON.stringify(),
            })
                .then(response => response.json())
                .then(response => {
                   
                    setLoading(true);
            
                    if (response.error) {
                        setLoading(false);
                      toast.error("Something went wrong. Please try again.", )
                    } else {
                          toast.success("Feedback deleted successfully!", )
                        setOpenmodalconfirmation(false);
                        // handleOpensuccess();
                        getallFeedbacks();
                        setLoading(false);
                    }
                }
                )
                .catch(error => {
                    setLoading(false);
                    alert(error);
                });
        }, 3000)

    }

    const [openmodalview, setOpenmodalview] = useState(false);
    const handleOpenmodalview = (data) => {
        setOpenmodalview(true);
      
        setEditData(data);
    };

    useEffect(() => {

        getallFeedbacks();
        getAllCountries();
    }, []);

    const generatePDF = (rows) => {

        const styles = StyleSheet.create({
            page: {
                flexDirection: 'column',
                backgroundColor: 'white',
            },
            header: {
                fontSize: 16,
                marginBottom: 10,
                textAlign: 'center',
            },
            cell: {
                fontSize: 12,
                marginBottom: 5,
                textAlign: 'center',
            },
            row: {
                flexDirection: 'row',
                border: 1,
            },
            column: {
                padding: 5,
                border: 1,
                justifyContent: 'center',
                alignItems: 'center',
            },
            colorBox: {
                width: 20,
                height: 20,
                marginTop: 5,
            },
        });

        const tableData = rows.map((item) => (
            <View style={styles.row} key={item.feedback_id}>

                <View style={[styles.column, { width: '40%' }]}>
                    <Text style={styles.cell}>{item.feedback_id}</Text>
                </View>

                <View style={[styles.column, { width: '30%' }]}>
                    <Text style={styles.cell}>{item.user_id}</Text>
                </View>

                <View style={[styles.column, { width: '30%' }]}>
                    <Text style={styles.cell}>{item.email}</Text>
                </View>

                <View style={[styles.column, { width: '30%' }]}>
                    <Text style={styles.cell}>{item.message}</Text>
                </View>
            </View>
        ));

        return (
            <Document>
                <Page size="A3" style={styles.page}>
                    {/* Header Row */}
                    <View style={styles.row}>
                        <View style={[styles.column, { width: '40%' }]}>
                            <Text style={styles.header}>Feedback ID</Text>
                        </View>
                        <View style={[styles.column, { width: '30%' }]}>
                            <Text style={styles.header}>User ID</Text>
                        </View>
                        <View style={[styles.column, { width: '30%' }]}>
                            <Text style={styles.header}>Email</Text>
                        </View>
                        <View style={[styles.column, { width: '30%' }]}>
                            <Text style={styles.header}>Feedback</Text>
                        </View>
                    </View>

                    {/* Data Rows */}
                    {tableData}
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
        a.download = 'Feedbacks.pdf';
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
            sortedRows.sort((a, b) => (a.feedback_id || '').localeCompare(b.feedback_id || ''));
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
            sortedRows.sort((a, b) => (b.feedback_id || '').localeCompare(a.feedback_id || ''));
        }

        // Rename variable to avoid conflict
        const finalFilteredData = sortedRows.filter(item =>
            String(item.feedback_id || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

      
        setFilteredRows(finalFilteredData);
        handleClose();
    };

    const filteredData = allusers.filter(item =>
        String(item.feedback_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const highlightMatch = (text, term) => {
        const strText = String(text || '');
        const strTerm = String(term || '');
        const lowerText = strText.toLowerCase();
        const lowerTerm = strTerm.toLowerCase();
        const startIndex = lowerText.indexOf(lowerTerm);

        if (startIndex === -1) {
            return strText; // Always return string, to avoid JSX error
        }

        const beforeMatch = strText.slice(0, startIndex);
        const match = strText.slice(startIndex, startIndex + strTerm.length);
        const afterMatch = strText.slice(startIndex + strTerm.length);

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

    const [userdetails, setUserDetails] = useState("");

    const [opensuccess, setOpensuccess] = useState(false);
    const handleOpensuccess = () => {
        setOpensuccess(true);
        setOpenmodalview(false);
        setTimeout(() => {
            setOpensuccess(false);
        }, 3000);
    };
    const handleClosesuccess = () => setOpensuccess(false);

    const handleOpenmodalviewconfirmation = () => {
        setOpenmodalconfirmation(true);
        setOpenmodalview(false);
    };

    const handleClosemodalconfirmation = () => {
        setOpenmodalconfirmation(false);
    }

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

    const truncateWords = (text, wordLimit) => {
        const words = text.split(' ');
        if (words.length <= wordLimit) return text;
        return words.slice(0, wordLimit).join(' ') + '...';
    };

    const [targetElement, setTargetElement] = useState(null); // Renamed here

    const handleClickAnswer = (event) => {
        if (targetElement) {
            setTargetElement(null); // close if already open
        } else {
            setTargetElement(event.currentTarget); // open on click
        }
    };

    const open = Boolean(targetElement);

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
                                                <TypographyMD variant='paragraph' label={t("Feedbacks")} color="#424242" marginLeft={0} fontFamily="Nunito Sans" fontSize="25px" fontWeight={850} align="left" />
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
                                                <TypographyMD variant='paragraph' label={t("Feedbacks")} color="#424242" marginLeft={1} fontFamily="Nunito Sans" fontSize="25px" fontWeight={850} align="center" />
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
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("FEEDBACK ID")} </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("USER ID")} </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("EMAIL")} </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("FEEDBACK")} </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("DATE - TIME")} </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("ACTIONS")} </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {displayedRows.map((item) => (
                                                            <TableRow hover
                                                                onClick={() => handleOpenmodalview(item)}
                                                                // // sx={{ cursor: 'pointer' }}
>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }}>
                                                                    # {highlightMatch(item.feedback_id || '-', searchTerm)}
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }}>
                                                                    # {item.user_id}
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                                    {item.email}
                                                                </TableCell>

                                                                <TableCell
                                                                    align="center"
                                                                    sx={{
                                                                        fontWeight: "normal",
                                                                        color: "#545454",
                                                                        fontFamily: "Nunito Sans",
                                                                        fontSize: "13px",
                                                                        overflow: "hidden",
                                                                        whiteSpace: "nowrap",
                                                                        maxWidth: "150px",
                                                                        cursor: "pointer",
                                                                        position: 'relative',
                                                                    }}
                                                                >
                                                                    {item.message.split(' ').length > 6 ? (
                                                                        <>
                                                                            <span onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleClickAnswer(e);
                                                                            }}>
                                                                                {truncateWords(item.message, 4)}
                                                                            </span>

                                                                            <Popper
                                                                                open={open}
                                                                                anchorEl={targetElement} // Renamed here
                                                                                placement="top"
                                                                                style={{ zIndex: 1200 }}
                                                                            >
                                                                                <Paper
                                                                                    elevation={3}
                                                                                    sx={{
                                                                                        backgroundColor: "#F5F6FA",
                                                                                        border: "1px solid gray",
                                                                                        padding: "8px 12px",
                                                                                        fontFamily: "Nunito Sans",
                                                                                        fontSize: "13px",
                                                                                        maxWidth: "270px",
                                                                                        whiteSpace: "normal",
                                                                                        wordWrap: "break-word",
                                                                                    }}
                                                                                >
                                                                                    {item.message}
                                                                                </Paper>
                                                                            </Popper>
                                                                        </>
                                                                    ) : (
                                                                        <span>{item.message}</span>
                                                                    )}
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }}>
                                                                    <>
                                                                        {new Date(item?.created_at).toLocaleString("en-US", {
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

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px", width: "200px" }} >
                                                                    <div style={{ display: "flex", justifyContent: "center", alignContent: "cenetr", gap: "10px" }}>
                                                                        <Tooltip title="View">
                                                                            <IconButton>
                                                                                <Visibility color="success" sx={{ width: "20px" }} onClick={() => {
                                                                                    // e.stopPropagation();
                                                                                    handleOpenmodalview(item)
                                                                                }} /> </IconButton>
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

                    </Box >
                }
            />

            {/* confirmation modal */}
            <ModalAdd
                open={openmodalconfirmation}
                onClose={() => setOpenmodalconfirmation(false)}
                title="Delete FAQ"
                data={
                    <>
                        <Grid container spacing={0} p={{ xs: 2, md: 3, lg: 3, xl: 3 }}>

                            <Grid xs={12} align="center"  >
                                <Stack direction="column" spacing={1} pb={3}>
                                    <TypographyMD variant='paragraph' label="Confirmation" color="gray" marginLeft={0} fontSize="20px" fontWeight={550} align="center" />
                                    <TypographyMD variant='paragraph' label="Do you want to delete this FAQ?" color="#000000" marginLeft={0} fontSize="15px" fontWeight={450} align="center" />
                                </Stack>
                            </Grid>

                            <Grid xs={6} align="" onClick={() => setOpenmodalconfirmation(false)}>
                                <ButtonMD variant="outlined" title="Cancel" width="90%" type="submit" borderColor="orange" backgroundColor="orange" borderRadius="10px" />
                            </Grid>

                            <Grid xs={6} align="right" >
                                <ButtonMD variant="contained" title="Yes, sure" width="90%" type="submit" borderColor="orange" backgroundColor="orange" borderRadius="10px" disabled={loading} onClickTerm={deleteCall} />
                            </Grid>

                        </Grid>
                    </>
                }
            />

            {/* view */}
            < ModalAdd
                open={openmodalview}
                onClose={() => setOpenmodalview(false)}
                title="Feedback Details"
                data={
                    <>
                        <Grid container spacing={0} p={3}>

                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant='h2' label="Feedback ID" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant='h2' label={`# ${editData?.feedback_id}`} color="#424242" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant='h2' label="User ID" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant='h2' label={`# ${editData?.user_id} `} color="#5E5F60" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant='h2' label="Email" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant='h2' label={editData?.email} color="#5E5F60" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>


                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant='h2' label="Feedback" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant='h2' label={editData?.message} color="#5E5F60" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            <Grid xs={4} md={4} align="center" pt={1} pb={1}>
                                <TypographyMD variant='h2' label="Date - Time" color="#363333" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" pt={1} pb={1}>
                                <TypographyMD variant='h2' label={
                                    <>
                                        {new Date(editData?.created_at).toLocaleString("en-US", {
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

            {/* user status success */}
            <ModalSuccess
                open={opensuccess}
                onClose={handleClosesuccess}
                title="Success"
                subheading={`User ${userdetails.status == "unblock" ? "block" : "unblock"} Successfully`}
            />

            {/* Add modal */}
            <ModalAdd
                open={openModalAdd}
                onClose={() => setOpenModalAdd(false)}
                title="Add FAQ"
                data={
                    <>
                        <Grid container spacing={0} sx={{ pl: 3, pr: 3 }}>
                            <Grid xs={12} align="left">
                                <form onSubmit={formik.handleSubmit}>
                                    <div>
                                        <Box sx={{ marginTop: "30px", marginBottom: "50px" }} width={{ xs: "97%", md: "100%" }}>
                                            <div style={{ marginBottom: '15px' }}>
                                                <SelectField
                                                    label="Country"
                                                    value={formik.values.country}
                                                    onChangeTerm={(e) => formik.setFieldValue("country", e.target.value)}
                                                    options={countries.map((country) => ({
                                                        value: country.country_id,
                                                        label: country.country_name,
                                                    }))}
                                                    error={formik.touched.country && Boolean(formik.errors.country)}
                                                    helperText={formik.touched.country && formik.errors.country}
                                                />
                                            </div>

                                            <div style={{ marginBottom: '15px' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <TypographyMD variant='paragraph' label="Question" color="#666666" marginLeft={0} fontFamily="Nunito Sans" fontSize="13px" fontWeight={450} align="left" />
                                                </div>

                                                <Inputfield
                                                    autoFocus={false}
                                                    value={formik.values.feedback_idion}
                                                    onChngeterm={(e) => formik.setFieldValue("question", e.target.value)}
                                                    error={formik.touched.feedback_idion && Boolean(formik.errors.feedback_idion)}
                                                    helperText={formik.touched.feedback_idion && formik.errors.feedback_idion}
                                                    type="text"
                                                    variant="outlined"
                                                    label=""
                                                />
                                            </div>

                                            <div style={{ marginBottom: '15px' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <TypographyMD variant='paragraph' label="Answer" color="#666666" marginLeft={0} fontFamily="Nunito Sans" fontSize="13px" fontWeight={450} align="left" />
                                                </div>

                                                <Inputfield
                                                    autoFocus={false}
                                                    value={formik.values.answer}
                                                    onChngeterm={(e) => formik.setFieldValue("answer", e.target.value)}
                                                    error={formik.touched.answer && Boolean(formik.errors.answer)}
                                                    helperText={formik.touched.answer && formik.errors.answer}
                                                    type="text"
                                                    variant="outlined"
                                                    label=""
                                                />
                                            </div>

                                            <ButtonMD
                                                variant="contained"
                                                title="Add FAQ"
                                                width="100%"
                                                type="submit"
                                                borderColor="orange"
                                                backgroundColor="orange"
                                                borderRadius="50px"
                                                disabled={loading}
                                            />
                                        </Box>
                                    </div>
                                </form>
                            </Grid>
                        </Grid>
                    </>
                }
            />

            {/* Edit modal */}
            <ModalAdd
                open={openModalEdit}
                onClose={() => setOpenModalEdit(false)}
                title="Edit FAQ"
                data={
                    <>
                        <Grid container spacing={0} sx={{ pl: 3, pr: 3 }}>
                            <Grid xs={12} align="left">
                                <form onSubmit={formikedit.handleSubmit}>
                                    <div>
                                        <Box sx={{ marginTop: "30px", marginBottom: "50px" }} width={{ xs: "97%", md: "100%" }}>
                                            {/* <div style={{ marginBottom: '15px' }}>
                                                <SelectField
                                                    label="Country"
                                                    value={formikedit.values.country}
                                                    onChangeTerm={(e) => formikedit.setFieldValue("country", e.target.value)}
                                                    options={countries.map((country) => ({
                                                        value: country.country_id,
                                                        label: country.country_name,
                                                    }))}
                                                    error={formikedit.touched.country && Boolean(formikedit.errors.country)}
                                                    helperText={formikedit.touched.country && formikedit.errors.country}
                                                />
                                            </div> */}

                                            <div style={{ marginBottom: '15px' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <TypographyMD variant='paragraph' label="Question" color="#666666" marginLeft={0} fontFamily="Nunito Sans" fontSize="13px" fontWeight={450} align="left" />
                                                </div>

                                                <Inputfield
                                                    autoFocus={false}
                                                    value={formikedit.values.feedback_idion}
                                                    onChngeterm={(e) => formikedit.setFieldValue("question", e.target.value)}
                                                    error={formikedit.touched.feedback_idion && Boolean(formikedit.errors.feedback_idion)}
                                                    helperText={formikedit.touched.feedback_idion && formikedit.errors.feedback_idion}
                                                    type="text"
                                                    variant="outlined"
                                                    label=""
                                                />
                                            </div>

                                            <div style={{ marginBottom: '15px' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <TypographyMD variant='paragraph' label="Answer" color="#666666" marginLeft={0} fontFamily="Nunito Sans" fontSize="13px" fontWeight={450} align="left" />
                                                </div>

                                                <Inputfield
                                                    autoFocus={false}
                                                    value={formikedit.values.answer}
                                                    onChngeterm={(e) => formikedit.setFieldValue("answer", e.target.value)}
                                                    error={formikedit.touched.answer && Boolean(formikedit.errors.answer)}
                                                    helperText={formikedit.touched.answer && formikedit.errors.answer}
                                                    type="text"
                                                    variant="outlined"
                                                    label=""
                                                />
                                            </div>

                                            <ButtonMD
                                                variant="contained"
                                                title="Edit FAQ"
                                                width="100%"
                                                type="submit"
                                                borderColor="orange"
                                                backgroundColor="orange"
                                                borderRadius="50px"
                                                disabled={loading}
                                            />
                                        </Box>
                                    </div>
                                </form>
                            </Grid>
                        </Grid>
                    </>
                }
            />


        </>
    )
}

export default Feedback;