import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import { Box, Button, CircularProgress, Divider, Grid, IconButton, InputAdornment, Menu, MenuItem, Modal, OutlinedInput, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip } from "@mui/material";
import TypographyMD from "../components/items/Typography";
import addIcon from "../Assets/add_icon.png";
import exportIcon from "../Assets/export_icon.png";
import downloadIcon from "../Assets/download_icon.png";
import confirmation_icon from "../Assets/confirmation_icon.png";
import Topbar from "../components/topbar/Topbar";
import { AddCircle, AddCircleOutline, ArrowBackIos, ArrowForwardIos, Block, CancelOutlined, Close, CloudUpload, Delete, Edit, Error, Filter, FilterAlt, Search, Visibility } from "@mui/icons-material"
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

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: '#FFFFFF',
    outline: "none",
    boxShadow: 0,
    // p: 4,
    borderRadius: 3

};

function Countries() {

    const [loading, setLoading] = useState(false);

    const [allusers, setAllusers] = useState([]);
    const getallCountries = async () => {
        var InsertAPIURL = `${url}countries/getAll`
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
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setPreviewUrl('');
    };

    const validationSchema = yup.object({
        country_name: yup.string().required('Country Name is required'),
        primary_color: yup.string().required('Primary Color is required'),
        secondary_color: yup.string().required('Secondary Color is required'),
    });

    const formik = useFormik({
        initialValues: {
            country_name: '',
            primary_color: '', // Default black color
            secondary_color: '', // Default white color
        },
        validationSchema: validationSchema,
        onSubmit: (values, { resetForm }) => {


            if (selectedImage) {
                setLoading(true);

                setTimeout(() => {
                    const InsertAPIURL = `${url}upload`;
                    const headers = {
                        'Accept': 'application/json'
                    };

                    const formData = new FormData();
                    formData.append('image', selectedImage); // assuming `selectedImage` is a File object

                    fetch(InsertAPIURL, {
                        method: 'POST',
                        headers: headers,
                        body: formData,
                    })
                        .then(response => response.json())
                        .then(response => {
                         
                            setLoading(false);
                            if (response.error) {
toast.error("Image upload failed. Please try again.", )
                            } else {

                                var InsertAPIURL = `${url}countries/add`
                                var headers = {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                };
                                var Data = {
                                    "country_name": values.country_name, // "Uganda", "Kenya", "Nigeria", "South Africa", "Ghana"
                                    "primary_color": values.primary_color,
                                    "secondary_color": values.secondary_color,
                                    "flag_image": response.imageUrl
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
                                             toast.success(t("Country added successfully"), )
                                            resetForm();
                                            setSelectedImage(null);
                                            setPreviewUrl(null);
                                            setLoading(false);
                                            getallCountries();
                                            setOpenModalAdd(false);
                                        }
                                    }
                                    )
                                    .catch(error => {
                                        setLoading(false);
                                       toast.error("Something went wrong. Please try again.", )
                                    });

                            }
                        })
                        .catch(error => {
                            setLoading(false);
                         toast.error("Something went wrong. Please try again.", )   
                        });
                }, 1000);
            } else {
                setLoading(true);
                setTimeout(() => {
                    var InsertAPIURL = `${url}countries/add`
                    var headers = {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    };
                    var Data = {
                        "country_name": values.country_name, // "Uganda", "Kenya", "Nigeria", "South Africa", "Ghana"
                        "primary_color": values.primary_color,
                        "secondary_color": values.secondary_color
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
                              toast.success(t("Country added successfully"), )
                                resetForm();
                                setSelectedImage(null);
                                setPreviewUrl(null);
                                setLoading(false);
                                getallCountries();
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

        }
    });

    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [editData, setEditData] = useState(null); // holds the selected country data
    const handleChangeEdit = async (data) => {
        setOpenModalEdit(true);
        setEditData(data);

        // Show existing image
        if (data?.flag_image) {
            setPreviewUrl(data?.flag_image);  // Set existing image URL
            // setSelectedImage(null);         // Reset any previous image file
        } else {
            setPreviewUrl('');
            // setSelectedImage(null);
        }
    }


    const formikedit = useFormik({
        enableReinitialize: true, // Important for updating values on edit
        initialValues: {
            // country_name: editData?.country_name || '',
            primary_color: editData?.primary_color || '',
            secondary_color: editData?.secondary_color || '',
        },
        validationSchema: yup.object({
            // country_name: yup.string().required('Country Name is required'),
            primary_color: yup.string().required('Primary Color is required'),
            secondary_color: yup.string().required('Secondary Color is required'),
        }),
        onSubmit: (values, { resetForm }) => {
           

            setLoading(true);
            setTimeout(async () => {
                let imageUrl = editData?.image || ""; // Use existing image if not changed

                // 1. Upload image if new one selected
                if (selectedImage) {
                    const formData = new FormData();
                    formData.append('image', selectedImage);

                    const imageUploadResponse = await fetch(`${url}upload`, {
                        method: 'POST',
                        body: formData,
                    });

                    const imageResult = await imageUploadResponse.json();
            
                    if (imageResult.error) {
                        setLoading(false);
                   toast.error("Image upload failed. Please try again.", )
                        return;
                    }

                    imageUrl = imageResult.imageUrl; // adjust field name based on your backend
                }

                var InsertAPIURL = `${url}countries/update`
                var headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                };
                var Data = {
                    "country_id": editData?.country_id,
                    "primary_color": values.primary_color,
                    "secondary_color": values.secondary_color,
                    "flag_image": imageUrl
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
                           toast.success(t("Country updated successfully"), )
                            resetForm();
                            setSelectedImage(null);
                            setPreviewUrl(null);
                            setLoading(false);
                            getallCountries();
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
            var InsertAPIURL = `${url}countries/delete?country_id=${editData?.country_id}`
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
toast.success(t("Country deleted successfully"), )
                        setOpenmodalconfirmation(false);
                        // handleOpensuccess();
                        getallCountries();
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

    useEffect(() => {

        getallCountries();

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
            <View style={styles.row} key={item.country_id}>
                {/* Country Name */}
                <View style={[styles.column, { width: '40%' }]}>
                    <Text style={styles.cell}>{item.country_name}</Text>
                </View>

                {/* Primary Color */}
                <View style={[styles.column, { width: '30%' }]}>
                    <Text style={styles.cell}>{item.primary_color}</Text>
                    {/* <View style={[styles.colorBox, { backgroundColor: item.primary_color }]} /> */}
                </View>

                {/* Secondary Color */}
                <View style={[styles.column, { width: '30%' }]}>
                    <Text style={styles.cell}>{item.secondary_color}</Text>
                    {/* <View style={[styles.colorBox, { backgroundColor: item.secondary_color }]} /> */}
                </View>
            </View>
        ));

        return (
            <Document>
                <Page size="A3" style={styles.page}>
                    {/* Header Row */}
                    <View style={styles.row}>
                        <View style={[styles.column, { width: '40%' }]}>
                            <Text style={styles.header}>Country Name</Text>
                        </View>
                        <View style={[styles.column, { width: '30%' }]}>
                            <Text style={styles.header}>Primary Color</Text>
                        </View>
                        <View style={[styles.column, { width: '30%' }]}>
                            <Text style={styles.header}>Secondary Color</Text>
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
        a.download = 'Countries.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up
    };

    const rowsPerPageOptions = [7, 15, 25];

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
            sortedRows.sort((a, b) => (a.country_name || '').localeCompare(b.country_name || ''));
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
            sortedRows.sort((a, b) => (b.country_name || '').localeCompare(a.country_name || ''));
        }

        const filteredData = sortedRows.filter(item =>
            (item.country_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );

    
        setFilteredRows(filteredData);
        handleClose();
    };


    const filteredData = allusers.filter(item =>
        (item.country_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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

    const [userdetails, setUserDetails] = useState("");
    const [openmodalview, setOpenmodalview] = useState(false);
    const handleOpenmodalview = (data) => {
        setUserDetails(data);
        setOpenmodalview(true);
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
                                                <TypographyMD variant='paragraph' label={t("Country Management")} color="#424242" marginLeft={0} fontFamily="Nunito Sans" fontSize="25px" fontWeight={850} align="left" />
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
                                        <Button
                                            onClick={() => setOpenModalAdd(true)}
                                            variant="contained"
                                            startIcon={<img src={addIcon} alt="..." />}
                                            sx={{
                                                width: "130px",
                                                backgroundColor: "#2462d1",
                                                borderRadius: '5px',
                                                borderColor: 'inherit',
                                                boxShadow: "none",
                                                color: 'white',
                                                fontFamily: "Nunito Sans",
                                                letterSpacing: ".5px",
                                                textTransform: "capitalize",
                                                '&:hover': {
                                                    backgroundColor: "#2462d1",
                                                    boxShadow: "none",
                                                },
                                            }}
                                        >
                                            Add
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
                                                <TypographyMD variant='paragraph' label={t("List Of Countries")} color="#424242" marginLeft={1} fontFamily="Nunito Sans" fontSize="25px" fontWeight={850} align="center" />
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
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("COUNTRY ID")} </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("COUNTRY NAME")} </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px", width: "200px" }}> {t("FLAG IMAGE")} </TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("PRIMARY COLOR")}</TableCell>
                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("SECONDARY COLOR")} </TableCell>

                                                            <TableCell align="center" sx={{ fontWeight: "bold", color: "#424242", fontFamily: "Nunito Sans", fontSize: "15px" }}> {t("ACTIONS")} </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {displayedRows.map((item) => (
                                                            <TableRow>
                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                                    # {item.country_id}
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }} >
                                                                    {highlightMatch(item.country_name || '-', searchTerm)}
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px", width: "200px" }} >
                                                                    {item.flag_image ? (
                                                                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                                                            <Box
                                                                                component="img"
                                                                                src={item.flag_image}
                                                                                sx={{ borderRadius: "5px", width: "70px" }}
                                                                            />
                                                                            <Tooltip title="Download">
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={async () => {
                                                                                        try {
                                                                                            const response = await fetch(item.image, {
                                                                                                mode: 'cors' // Adjust based on your server config
                                                                                            });
                                                                                            const blob = await response.blob();
                                                                                            const url = window.URL.createObjectURL(blob);
                                                                                            const link = document.createElement("a");
                                                                                            link.href = url;
                                                                                            link.download = `image_${item?.country_id || 'download'}.jpg`; // adjust extension as needed
                                                                                            document.body.appendChild(link);
                                                                                            link.click();
                                                                                            document.body.removeChild(link);
                                                                                            window.URL.revokeObjectURL(url);
                                                                                        } catch (error) {
                                                                                            toast.error("Failed to download image. Please try again.", )
                                                                                        }
                                                                                    }}
                                                                                    sx={{
                                                                                        position: 'absolute',
                                                                                        top: 5,
                                                                                        right: -35,
                                                                                        backgroundColor: 'white',
                                                                                        borderRadius: '50%',
                                                                                        padding: '2px',
                                                                                    }}
                                                                                >
                                                                                    <img src={downloadIcon} alt="..." style={{ width: "25px" }} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                    ) : (
                                                                        "-"
                                                                    )}

                                                                    {/* {item.flag_image ? <Box component="img" src={item?.flag_image} sx={{ width: "80px", borderRadius: "10px" }} /> : "-"} */}
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }}>
                                                                    {/* Primary Color with color box */}
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <div
                                                                            style={{
                                                                                borderRadius: "5px",
                                                                                width: '20px', // Adjust size of the color box
                                                                                height: '20px',
                                                                                backgroundColor: item.primary_color, // Color of the box
                                                                                marginRight: '5px', // Space between color box and code
                                                                            }}
                                                                        />
                                                                        {item.primary_color}
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px" }}>
                                                                    {/* Secondary Color with color box */}
                                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <div
                                                                            style={{
                                                                                borderRadius: "5px",
                                                                                width: '20px', // Adjust size of the color box
                                                                                height: '20px',
                                                                                backgroundColor: item.secondary_color, // Color of the box
                                                                                marginRight: '5px', // Space between color box and code
                                                                            }}
                                                                        />
                                                                        {item.secondary_color}
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell align="center" sx={{ fontWeight: "normal", color: "#545454", fontFamily: "Nunito Sans", fontSize: "13px", width: "200px" }} >
                                                                    <div style={{ display: "flex", justifyContent: "center", alignContent: "cenetr", gap: "10px" }}>
                                                                        <Tooltip title="Edit">
                                                                            <IconButton>
                                                                                <Edit color="info" sx={{ width: "20px" }} onClick={() => handleChangeEdit(item)} />
                                                                            </IconButton>
                                                                        </Tooltip>

                                                                        <Tooltip title="Delete">
                                                                            <IconButton>
                                                                                <Delete color="error" sx={{ width: "20px" }} onClick={() => handleOpenmodalconfirmation(item)} />
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

            {/* confirmation modal */}
            <ModalAdd
                open={openmodalconfirmation}
                onClose={() => setOpenmodalconfirmation(false)}
                // title="Delete Country"
                data={
                    <>
                        <Grid container spacing={0} p={{ xs: 2, md: 3, lg: 3, xl: 3 }}>

                            <Grid xs={12} align="center"  >
                                <Stack align="center" direction="column" spacing={2} pb={3}>
                                    <img src={confirmation_icon} alt="..." style={{ alignSelf: "center", width: "100px" }} />
                                    <TypographyMD variant='paragraph' label="Are you sure you want to delete the country?" color="#181818" marginLeft={0} fontSize="13px" fontWeight={650} align="center" />
                                </Stack>
                            </Grid>

                            <Grid xs={12} align="center" >
                                <div style={{ display: "flex", justifyContent: "center", alignContent: "center", gap: 10 }}>
                                    <ButtonMD variant="outlined" title="Cancel" width="100px" type="submit" borderColor="orange" backgroundColor="orange" borderRadius="10px" onClickTerm={() => setOpenmodalconfirmation(false)} />

                                    <ButtonMD variant="contained" title="Yes, sure" width="140px" type="submit" borderColor="orange" backgroundColor="orange" borderRadius="10px" disabled={loading} onClickTerm={deleteCall} />
                                </div>
                            </Grid>

                        </Grid>
                    </>
                }
            />

            {/* view */}
            < ModalAdd
                open={openmodalview}
                onClose={() => setOpenmodalview(false)}
                title="User Details"
                data={
                    <>
                        <Grid container spacing={0} p={3}>
                            <Grid xs={4} md={4} align="center" >
                                <TypographyMD variant='h2' label="Username" color="#A5ADB0" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" >
                                <TypographyMD variant='h2' label={`${userdetails.country_name} ${userdetails.last_name}`} color="#424242" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            <Grid xs={12} md={12} align="" pt={1} pb={1}>
                                <Divider sx={{ color: "gray", backgroundColor: "gray" }} />
                            </Grid>

                            <Grid xs={4} md={4} align="center" >
                                <TypographyMD variant='h2' label="Email Address" color="#A5ADB0" fontFamily="Nunito Sans" marginLeft={0} fontSize="15px" fontWeight={500} align="left" />
                            </Grid>

                            <Grid xs={8} md={8} align="right" >
                                <TypographyMD variant='h2' label={userdetails.email} color="#424242" fontFamily="Nunito Sans" marginLeft={0} fontSize="16px" fontWeight={550} align="right" />
                            </Grid>

                            <Grid xs={12} md={12} align="" pt={1} pb={1}>
                                <Divider sx={{ color: "gray", backgroundColor: "gray" }} />
                            </Grid>



                            <Grid xs={12} md={12} align="center" pt={2} pb={2}>
                                <ButtonMD variant="contained" title={userdetails.status} width="90%" type="submit" borderColor="orange" backgroundColor="orange" borderRadius="10px" onClickTerm={handleOpenmodalviewconfirmation} />
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
            <Modal
                open={openModalAdd}
                // onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box width={{ xs: 500, md: 550, lg: 550, xl: 550 }} height="auto" sx={style}>

                    <Box sx={{ backgroundColor: "transparent", borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                        <Grid container spacing={0} p={2}>
                            <Grid xs={6} align="left">
                                <TypographyMD variant='paragraph' label="Add Country" color="#000000" marginLeft={0} fontSize="17px" fontFamily="Nunito Sans" fontWeight={850} align="left" />
                            </Grid>

                            <Grid xs={6} align="right">
                                <CancelOutlined onClick={() => setOpenModalAdd(false)} sx={{ cursor: "pointer", color: "#000000" }} />
                            </Grid>
                        </Grid>
                    </Box>

                    <Grid container spacing={0} sx={{ pl: 3, pr: 3 }}>
                        <Grid xs={12} align="left">
                            <form onSubmit={formik.handleSubmit}>
                                <div>
                                    <Box sx={{ marginTop: "10px", marginBottom: "30px" }} width={{ xs: "97%", md: "100%" }}>
                                        <div style={{ height: "calc(100vh - 200px)", maxHeight: "600px", minHeight: "400px", overflowY: 'auto', marginBottom: "20px" }}>
                                            <div style={{ marginBottom: '15px' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <TypographyMD
                                                        variant="paragraph"
                                                        label="Country Name"
                                                        color="#000000"
                                                        fontFamily="Nunito Sans"
                                                        fontSize="15px"
                                                        fontWeight={750}
                                                        align="left"
                                                    />
                                                </div>

                                                <Inputfield
                                                    autoFocus={false}
                                                    value={formik.values.country_name}
                                                    onChngeterm={(e) => formik.setFieldValue("country_name", e.target.value)}
                                                    error={formik.touched.country_name && Boolean(formik.errors.country_name)}
                                                    helperText={formik.touched.country_name && formik.errors.country_name}
                                                    type="text"
                                                    variant="outlined"
                                                    label=""
                                                    placeholder={t("Add Name")}
                                                />
                                            </div>

                                            <div style={{ marginBottom: '15px' }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: '5px' }}>
                                                    <TypographyMD
                                                        variant="paragraph"
                                                        label="Flag Icon"
                                                        color="#000000"
                                                        fontFamily="Nunito Sans"
                                                        fontSize="15px"
                                                        fontWeight={750}
                                                        align="left"
                                                    />
                                                    <TypographyMD variant='paragraph' label="Upload icon in SVG Format" color="#666666" marginLeft={0} fontFamily="Nunito Sans" fontSize="13px" fontWeight={450} align="left" />
                                                </div>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'start',
                                                        alignItems: 'start',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: "50%",
                                                            height: "25vh",
                                                            // border: '2px dashed #ccc',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: '#F5F6FA',
                                                            position: 'relative',
                                                            cursor: 'pointer',
                                                            overflow: 'hidden'
                                                        }}
                                                        onClick={() => document.getElementById('image-upload-input').click()}
                                                    >
                                                        <input
                                                            id="image-upload-input"
                                                            type="file"
                                                            accept="image/*"
                                                            style={{ display: 'none' }}
                                                            onChange={handleImageChange}
                                                        />

                                                        {!previewUrl ? (
                                                            <AddCircle sx={{ color: '#5E5F60', fontSize: 50 }} />
                                                        ) : (
                                                            <>
                                                                <img
                                                                    src={previewUrl}
                                                                    alt="preview"
                                                                    style={{ width: '70%', objectFit: 'content' }}
                                                                />
                                                                <IconButton
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveImage();
                                                                    }}
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        top: 2,
                                                                        right: 2,
                                                                        backgroundColor: '#fff',
                                                                        border: '1px solid #ccc',
                                                                        padding: '2px',
                                                                        zIndex: 10
                                                                    }}
                                                                    size="small"
                                                                >
                                                                    <CancelOutlined fontSize="small" />
                                                                </IconButton>
                                                            </>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </div>

                                            <div style={{ display: "flex", gap: 10, marginBottom: '15px' }}>
                                                {/* Primary Color Picker */}
                                                <div style={{ width: '100%' }}>
                                                    <div style={{ marginBottom: '5px' }}>
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label="Primary Color"
                                                            color="#000000"
                                                            fontFamily="Nunito Sans"
                                                            fontSize="15px"
                                                            fontWeight={750}
                                                            align="left"
                                                        />
                                                    </div>
                                                    <div style={{ width: '100px' }}> {/* Custom size for container */}
                                                        <ChromePicker
                                                            color={formik.values.primary_color}
                                                            onChangeComplete={(color) => formik.setFieldValue('primary_color', color.hex)}
                                                            style={{ width: '100%', height: '100%' }} // Make sure picker occupies full container width/height
                                                        />
                                                    </div>
                                                    {formik.touched.primary_color && formik.errors.primary_color && (
                                                        <div style={{ color: 'red', fontSize: '12px' }}>
                                                            {formik.errors.primary_color}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Secondary Color Picker */}
                                                <div style={{ width: '100%' }}>
                                                    <div style={{ marginBottom: '5px' }}>
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label="Secondary Color"
                                                            color="#000000"
                                                            fontFamily="Nunito Sans"
                                                            fontSize="15px"
                                                            fontWeight={750}
                                                            align="left"
                                                        />
                                                    </div>
                                                    <div style={{ width: '100px' }}> {/* Custom size for container */}
                                                        <ChromePicker
                                                            color={formik.values.secondary_color}
                                                            onChangeComplete={(color) => formik.setFieldValue('secondary_color', color.hex)}
                                                            style={{ width: '100%', height: '100%' }} // Make sure picker occupies full container width/height
                                                        />
                                                    </div>
                                                    {formik.touched.secondary_color && formik.errors.secondary_color && (
                                                        <div style={{ color: 'red', fontSize: '12px' }}>
                                                            {formik.errors.secondary_color}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
                                            <ButtonMD
                                                variant="contained"
                                                title="Add"
                                                width="40%"
                                                type="submit"
                                                borderColor="orange"
                                                backgroundColor="orange"
                                                borderRadius="10px"
                                                disabled={loading}
                                            />
                                        </div>

                                    </Box>
                                </div>
                            </form>
                        </Grid>
                    </Grid>

                </Box>
            </Modal>

            {/* Edit modal */}
            <Modal
                open={openModalEdit}
                // onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box width={{ xs: 500, md: 550, lg: 550, xl: 550 }} height="auto" sx={style}>

                    <Box sx={{ backgroundColor: "transparent", borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                        <Grid container spacing={0} p={2}>
                            <Grid xs={6} align="left">
                                <TypographyMD variant='paragraph' label="Edit Country" color="#000000" marginLeft={0} fontSize="17px" fontFamily="Nunito Sans" fontWeight={850} align="left" />
                            </Grid>

                            <Grid xs={6} align="right">
                                <CancelOutlined onClick={() => setOpenModalEdit(false)} sx={{ cursor: "pointer", color: "#000000" }} />
                            </Grid>
                        </Grid>
                    </Box>

                    <Grid container spacing={0} sx={{ pl: 3, pr: 3 }}>
                        <Grid xs={12} align="left">
                            <form onSubmit={formikedit.handleSubmit}>
                                <div>
                                    <Box sx={{ marginTop: "10px", marginBottom: "20px" }} width={{ xs: "97%", md: "100%" }}>
                                        {/* <div style={{ marginBottom: '15px' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <TypographyMD variant='paragraph' label="Country Name" color="#666666" marginLeft={0} fontFamily="Nunito Sans" fontSize="13px" fontWeight={450} align="left" />
                                                </div>

                                                <Inputfield
                                                    autoFocus={false}
                                                    value={formikedit.values.country_name}
                                                    onChngeterm={(e) => formikedit.setFieldValue("country_name", e.target.value)}
                                                    error={formikedit.touched.country_name && Boolean(formikedit.errors.country_name)}
                                                    helperText={formikedit.touched.country_name && formikedit.errors.country_name}
                                                    type="text"
                                                    variant="outlined"
                                                    label=""
                                                />
                                            </div> */}

                                        <div style={{ marginBottom: '15px' }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: '5px' }}>
                                                <TypographyMD
                                                    variant="paragraph"
                                                    label="Flag Icon"
                                                    color="#000000"
                                                    fontFamily="Nunito Sans"
                                                    fontSize="15px"
                                                    fontWeight={750}
                                                    align="left"
                                                />
                                                <TypographyMD variant='paragraph' label="Upload icon in SVG Format" color="#666666" marginLeft={0} fontFamily="Nunito Sans" fontSize="13px" fontWeight={450} align="left" />
                                            </div>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'start',
                                                    alignItems: 'start',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: "50%",
                                                        height: "25vh",
                                                        // border: '2px dashed #ccc',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: '#F5F6FA',
                                                        position: 'relative',
                                                        cursor: 'pointer',
                                                        overflow: 'hidden'
                                                    }}
                                                    onClick={() => document.getElementById('image-upload-input').click()}
                                                >
                                                    <input
                                                        id="image-upload-input"
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={handleImageChange}
                                                    />

                                                    {!previewUrl ? (
                                                        <AddCircle sx={{ color: '#5E5F60', fontSize: 50 }} />
                                                    ) : (
                                                        <>
                                                            <img
                                                                src={previewUrl}
                                                                alt="preview"
                                                                style={{ width: '70%', objectFit: 'content' }}
                                                            />
                                                            <IconButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveImage();
                                                                }}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 2,
                                                                    right: 2,
                                                                    backgroundColor: '#fff',
                                                                    border: '1px solid #ccc',
                                                                    padding: '2px',
                                                                    zIndex: 10
                                                                }}
                                                                size="small"
                                                            >
                                                                <CancelOutlined fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        </div>

                                        <div style={{ display: "flex", gap: 10, marginBottom: '20px' }}>
                                            {/* Primary Color Picker */}
                                            <div style={{ width: '100%' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <TypographyMD
                                                        variant="paragraph"
                                                        label="Primary Color"
                                                        color="#000000"
                                                        fontFamily="Nunito Sans"
                                                        fontSize="15px"
                                                        fontWeight={750}
                                                        align="left"
                                                    />
                                                </div>
                                                <div style={{ width: '100px' }}> {/* Custom size for container */}
                                                    <ChromePicker
                                                        color={formikedit.values.primary_color}
                                                        onChangeComplete={(color) => formikedit.setFieldValue('primary_color', color.hex)}
                                                        style={{ width: '100%', height: '100%' }} // Make sure picker occupies full container width/height
                                                    />
                                                </div>
                                                {formikedit.touched.primary_color && formikedit.errors.primary_color && (
                                                    <div style={{ color: 'red', fontSize: '12px' }}>
                                                        {formikedit.errors.primary_color}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Secondary Color Picker */}
                                            <div style={{ width: '100%' }}>
                                                <div style={{ marginBottom: '5px' }}>
                                                    <TypographyMD
                                                        variant="paragraph"
                                                        label="Secondary Color"
                                                        color="#000000"
                                                        fontFamily="Nunito Sans"
                                                        fontSize="15px"
                                                        fontWeight={750}
                                                        align="left"
                                                    />
                                                </div>
                                                <div style={{ width: '100px' }}> {/* Custom size for container */}
                                                    <ChromePicker
                                                        color={formikedit.values.secondary_color}
                                                        onChangeComplete={(color) => formikedit.setFieldValue('secondary_color', color.hex)}
                                                        style={{ width: '100%', height: '100%' }} // Make sure picker occupies full container width/height
                                                    />
                                                </div>
                                                {formikedit.touched.secondary_color && formikedit.errors.secondary_color && (
                                                    <div style={{ color: 'red', fontSize: '12px' }}>
                                                        {formikedit.errors.secondary_color}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
                                            <ButtonMD
                                                variant="contained"
                                                title="Edit"
                                                width="40%"
                                                type="submit"
                                                borderColor="orange"
                                                backgroundColor="orange"
                                                borderRadius="10px"
                                                disabled={loading}
                                            />
                                        </div>
                                    </Box>
                                </div>
                            </form>
                        </Grid>
                    </Grid>

                </Box>
            </Modal>

  

        </>
    )
}

export default Countries;