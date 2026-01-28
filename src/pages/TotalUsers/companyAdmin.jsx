import React, { useEffect, useMemo, useRef, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import SearchableDropdown from "../../components/SearchableCountryDropdown";
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    OutlinedInput,
    Pagination,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
    FormControl,
    Select,
} from "@mui/material";
import { exportTable } from "../../helper_functions/ExportData";
import TypographyMD from "../../components/items/Typography";
import nousers from "../../Assets/no-user.png";
import exportIcon from "../../Assets/export_icon.png";
import addIcon from "../../Assets/add_icon.png";
import menu_icon from "../../Assets/menu_icon.png";
import confirmation_icon from "../../Assets/confirmation_icon.png";
import csvIcon from "../../Assets/csvIcon.png";
import pdfIcon from "../../Assets/pdfIcon.png";
import Topbar from "../../components/topbar/Topbar";
import LocationHelperModal from "../../components/Locationhelper";
import { useFormik, FastField } from "formik";
import debounce from "lodash.debounce";
import {
    ArrowBackIos,
    ArrowForwardIos,
    status,
    Error,
    Filter,
    FilterAlt,
    Search,
    Star,
    StarBorder,
    StarHalf,
    Visibility,
    CheckCircleOutline,
    Block,
    Email,
    AddCircle,
    Close,
    AttachFile,
    Save,
    KeyboardArrowDown,
    ArrowDownward,
    ArrowUpward,
    CloudSync,
    FilterList,
    Close as CloseIcon,
} from "@mui/icons-material";
import ModalAdd from "../../components/items/Modal";
import ButtonMD from "../../components/items/ButtonMD";
import ModalSuccess from "../../components/items/ModalSuccess";
import url from "../../url";

// import { useFormik } from "formik";
import * as yup from "yup";
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    BlobProvider,
    Image,
    pdf,
} from "@react-pdf/renderer";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LocationPicker from "../../components/LocationPicker";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "../../App.css";
import "leaflet/dist/leaflet.css";
import Inputfield from "../../components/items/Inputfield";
import SelectField from "../../components/items/Selectfield";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Countryfield from "../../components/items/Countryfield";
import { useTranslation } from "react-i18next";
import StatusFilter from "../../components/StatusFilter";
import ExportMenuButton from "../../components/ExportMenuButton";
import ImageCropper from "../../components/ImageCropper";
import DummyStatusMenuButton from "../../components/DummyStatusMenuButton";
import { useSelector } from "react-redux";
import AccountStatusDropdown from "../../components/AccountStatusDropdown";
import VerificationStatusDropdown from "../../components/VerificationStatusDropdown";
import ModalConfirmation from "../../components/items/ModalConfirmation";

import FormatDate from "../../components/FormatDate";

const date = new Date();

const SortIcons = ({ column, sortBy, sortOrder }) => (
    <>
        {sortBy === column && sortOrder === "ASC" ? (
            <ArrowUpward sx={{ fontSize: "17px" }} />
        ) : (
            <ArrowDownward sx={{ fontSize: "17px" }} />
        )}
    </>
);

function CompanyAdmin() {
    const { token, tokenExpiry } = useSelector((state) => state.auth);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [initialLoader, setInitialLoader] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [allusers, setAllusers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(7); // default 10 records per page
    const isSortingRef = useRef(false);
    const [sortingLoader, setSortingLoader] = useState(false);
    const [sortBy, setSortBy] = useState("registered"); // Default sort by registration date
    const [sortOrder, setSortOrder] = useState("DSC"); // Default show newest first

    // localized fallback helpers
    const isEmptyValue = (value) => {
        return (
            value === null ||
            value === undefined ||
            (typeof value === "string" && value.trim() === "") ||
            value === "null" ||
            value === "undefined"
        );
    };

    const displayValue = (value) => (isEmptyValue(value) ? t("N/A") : value);

    //my code for implementing empty icons
    const [noData, setNoData] = useState(false);
    //==

    const getallusers = async (
        page = 1,
        search = "",
        status = "all",
        sort_by = sortBy,
        sort_order = sortOrder,
        statusFilter,
        isSorting = false,
        date_from = "",
        date_to = ""
    ) => {
        if (isSorting) {
            setSortingLoader(true);
        } else {
            setInitialLoader(true);
        }

        let statusParam = status !== "all" ? `&status=${status}` : "";
        let sortParams = sort_by
            ? `&sort_by=${sort_by}&sort_order=${sort_order}`
            : "";
        let dateFromParam = date_from ? `&start_date=${date_from}` : "";
        let dateToParam = date_to ? `&end_date=${date_to}` : "";

        const InsertAPIURL = `${url}company-admins?page=${page}&limit=${limit}&search=${search}${statusParam}${sortParams}${dateFromParam}${dateToParam}`;

        // const InsertAPIURL = ``;

        try {
            const response = await fetch(InsertAPIURL, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            setAllusers(data?.data?.company_admins);

            const companyData = data?.data?.company_admins;
            setTotalPages(data?.data?.pagination?.pages || 1);

            if (!data || data.error || !Array.isArray(companyData)) {
                setAllusers([]); // reset users
                setTotalPages(1); // fallback
                setNoData(true); // you can use this to conditionally render "No Data Found" UI
                return;
            }

            setAllusers(companyData);
            setTotalPages(data?.data?.pagination?.pages || 1);
            setNoData(false);
        } catch (error) {
            toast.error("Something went wrong! Please try again.");
            setAllusers([]);
            setNoData(true);
        } finally {
            if (isSorting) {
                setSortingLoader(false);
            } else {
                setInitialLoader(false);
            }
        }
    };

    const handleSort = (column) => {
        const newSortOrder =
            sortBy === column && sortOrder === "ASC" ? "DSC" : "ASC";

        isSortingRef.current = true; // Mark sorting in progress

        setSortBy(column);
        setSortOrder(newSortOrder);
        setCurrentPage(1); // Reset to page 1 when sorting

        // You no longer need to call getallusers here directly — let the useEffect handle it
    };

    const [statusFilter, setStatusFilter] = useState("all");

    // Filter modal states
    const [openModalFilter, setOpenModalFilter] = useState(false);
    const [draftStatus, setDraftStatus] = useState("all");
    const [draftStartDate, setDraftStartDate] = useState("");
    const [draftEndDate, setDraftEndDate] = useState("");

    // Active filter states
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // pagination or status same k liye ye do function use hon gy, handleStatusChange,
    // const handleStatusChange = (event) => {
    //   const status = event.target.value;
    //   setStatusFilter(status);
    //   getallusers(1, "", status); // Call with status filter
    // };

    const handleStatusChange = (event) => {
        const status = event.target.value;
        setStatusFilter(status);
        setCurrentPage(1); // ✅ reset to first page when filter changes
        getallusers(1, searchTerm, status, sortBy, sortOrder);
    };

    // Check if any filters are active
    const isFilterActive = () => {
        return (
            statusFilter !== "all" ||
            dateFrom !== "" ||
            dateTo !== ""
        );
    };

    // Clear all filters
    const clearFilters = () => {
        setStatusFilter("all");
        setDateFrom("");
        setDateTo("");
        setDraftStatus("all");
        setDraftStartDate("");
        setDraftEndDate("");

        // Reset to default state
        getallusers(1, searchTerm, "all", sortBy, sortOrder, "all", false, "", "");
    };

    // Handle filter submit
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const statusParam = draftStatus.toLowerCase() !== "all" ? draftStatus.toLowerCase() : "all";

        // Call API immediately with selected filters
        getallusers(
            1,                 // page
            searchTerm,        // search
            statusParam,       // status
            sortBy,
            sortOrder,
            statusParam,       // statusFilter
            false,             // isSorting
            draftStartDate,    // date_from
            draftEndDate       // date_to
        );

        // Update active states for modal inputs
        setStatusFilter(statusParam);
        setDateFrom(draftStartDate);
        setDateTo(draftEndDate);

        setOpenModalFilter(false);
        setLoading(false);
    };

    // const handlePageChange = (event, value) => {
    //   setCurrentPage(value);
    //   getallusers(value, searchTerm);
    // };

    const handlePageChange = (event, page) => {
        setCurrentPage(page); // update state
        getallusers(
            page,
            searchTerm,
            statusFilter, // ✅ pass current filter value
            sortBy,
            sortOrder,
            isSortingRef.current
        );
    };
    //yhan sy ooper
    const [openModalAdd, setOpenModalAdd] = useState(false);

    // image
    const [isDragging, setIsDragging] = useState(false);
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
        setPreviewUrl("");
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Effect for handling search and pagination changes
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            getallusers(
                currentPage,
                searchTerm,
                statusFilter,
                sortBy,
                sortOrder,
                statusFilter,
                false, // Not sorting when triggered by search/pagination
                dateFrom,
                dateTo
            );
        }, 200);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, currentPage, statusFilter, dateFrom, dateTo]);

    // logo
    const [isDraggingLogo, setIsDraggingLogo] = useState(false);
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [previewLogo, setPreviewLogo] = useState(null);

    // crop functionality
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(null);

    const handleLogoChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Create image URL for cropping
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setCropModalOpen(true);

            // Clear the input
            if (event.target) event.target.value = "";
        }
    };

    const handleRemoveLogo = () => {
        setSelectedLogo(null);
        setPreviewLogo("");
        setLogoUrl(null);
    };

    const handleDragOverLogo = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingLogo(true);
    };

    const handleDragLeaveLogo = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingLogo(false);
    };

    const handleDropLogo = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingLogo(false);

        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedLogo(file);
            setPreviewLogo(URL.createObjectURL(file));
        }
    };
    // Admin Document
    const [isDraggingAdminDoc, setIsDraggingAdminDoc] = useState(false);
    const [selectedAdminDoc, setSelectedAdminDoc] = useState(null);
    const [previewAdminDoc, setPreviewAdminDoc] = useState(null);
    const [adminDocFileName, setAdminDocFileName] = useState("");

    const handleAdminDocChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedAdminDoc(file);
            setPreviewAdminDoc(URL.createObjectURL(file));
            setAdminDocFileName(file.name);

            try {
                const uploadedUrl = await uploadAdminDocToServer(file);
                formik.setFieldValue("admin_document_url", uploadedUrl);
                toast.success("Administrator document uploaded successfully");
            } catch (error) {
                toast.error("Failed to upload administrator document");
                setSelectedAdminDoc(null);
                setPreviewAdminDoc(null);
                setAdminDocFileName("");
                formik.setFieldValue("admin_document_url", "");
            }
        }
    };

    const handleRemoveAdminDoc = () => {
        setSelectedAdminDoc(null);
        setPreviewAdminDoc(null);
        setAdminDocFileName("");
        formik.setFieldValue("admin_document_url", "");
    };

    const handleDragOverAdminDoc = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingAdminDoc(true);
    };

    const handleDragLeaveAdminDoc = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingAdminDoc(false);
    };

    const handleDropAdminDoc = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingAdminDoc(false);

        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedAdminDoc(file);
            setPreviewAdminDoc(URL.createObjectURL(file));
            setAdminDocFileName(file.name);

            try {
                const uploadedUrl = await uploadAdminDocToServer(file);
                formik.setFieldValue("admin_document_url", uploadedUrl);
                toast.success("Administrator document uploaded successfully");
            } catch (error) {
                toast.error("Failed to upload administrator document");
                setSelectedAdminDoc(null);
                setPreviewAdminDoc(null);
                setAdminDocFileName("");
                formik.setFieldValue("admin_document_url", "");
            }
        }
    };

    // Company Document
    const [isDraggingCompanyDoc, setIsDraggingCompanyDoc] = useState(false);
    const [selectedCompanyDoc, setSelectedCompanyDoc] = useState(null);
    const [previewCompanyDoc, setPreviewCompanyDoc] = useState(null);
    const [companyDocFileName, setCompanyDocFileName] = useState("");

    // Map-related states
    const [manualAddress, setManualAddress] = useState(false);
    const [countriesData, setCountriesData] = useState([]);
    const [manualCountries, setManualCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [selectedCity, setSelectedCity] = useState("");
    const [loadingManualCountries, setLoadingManualCountries] = useState(false);
    const [loadingStates, setLoadingStates] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [updatingMap, setUpdatingMap] = useState(false);
    const [mapKey, setMapKey] = useState(0); // Force map re-render
    const [mapPosition, setMapPosition] = useState(null); // Track map position

    const handleCompanyDocChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedCompanyDoc(file);
            setPreviewCompanyDoc(URL.createObjectURL(file));
            setCompanyDocFileName(file.name);

            try {
                const uploadedUrl = await uploadCompanyDocToServer(file);
                formik.setFieldValue("company_document_url", uploadedUrl);
                toast.success("Company document uploaded successfully");
            } catch (error) {
                toast.error("Failed to upload company document");
                setSelectedCompanyDoc(null);
                setPreviewCompanyDoc(null);
                setCompanyDocFileName("");
                formik.setFieldValue("company_document_url", "");
            }
        }
    };

    const handleRemoveCompanyDoc = () => {
        setSelectedCompanyDoc(null);
        setPreviewCompanyDoc(null);
        setCompanyDocFileName("");
        formik.setFieldValue("company_document_url", "");
    };

    const handleDragOverCompanyDoc = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingCompanyDoc(true);
    };

    const handleDragLeaveCompanyDoc = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingCompanyDoc(false);
    };

    const handleDropCompanyDoc = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDraggingCompanyDoc(false);

        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedCompanyDoc(file);
            setPreviewCompanyDoc(URL.createObjectURL(file));
            setCompanyDocFileName(file.name);

            try {
                const uploadedUrl = await uploadCompanyDocToServer(file);
                formik.setFieldValue("company_document_url", uploadedUrl);
                toast.success("Company document uploaded successfully");
            } catch (error) {
                toast.error("Failed to upload company document");
                setSelectedCompanyDoc(null);
                setPreviewCompanyDoc(null);
                setCompanyDocFileName("");
                formik.setFieldValue("company_document_url", "");
            }
        }
    };

    // Upload functions for document files
    const uploadAdminDocToServer = async (file) => {
        const form = new FormData();
        form.append("pdf", file);
        const res = await fetch(`${url}upload/pdf`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Upload failed");
        return data?.data?.url || data?.url || data?.path || "";
    };

    const uploadCompanyDocToServer = async (file) => {
        const form = new FormData();
        form.append("pdf", file);
        const res = await fetch(`${url}upload/pdf`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Upload failed");
        return data?.data?.url || data?.url || data?.path || "";
    };

    // Crop utility functions
    const getCroppedImg = (imageSrc, croppedAreaPixels) => {
        return new Promise((resolve, reject) => {
            const image = new window.Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = croppedAreaPixels.width;
                canvas.height = croppedAreaPixels.height;

                ctx.drawImage(
                    image,
                    croppedAreaPixels.x,
                    croppedAreaPixels.y,
                    croppedAreaPixels.width,
                    croppedAreaPixels.height,
                    0,
                    0,
                    croppedAreaPixels.width,
                    croppedAreaPixels.height
                );

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
                    resolve(file);
                }, 'image/jpeg', 0.9);
            };
            image.onerror = () => reject(new Error('Failed to load image'));
            image.src = imageSrc;
        });
    };

    const uploadImageToServer = async (file) => {
        const form = new FormData();
        form.append("image", file);
        const res = await fetch(`${url}upload/image`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Upload failed");
        return data?.data?.url || data?.url || data?.path || "";
    };

    const handleCropComplete = async (croppedImageFile) => {
        if (!croppedImageFile) {
            toast.error("Please select a crop area");
            return;
        }

        try {
            setUploading(true);

            // Use the exact same file that was shown in the preview
            const url = await uploadImageToServer(croppedImageFile);
            setLogoUrl(url);
            setPreviewLogo(url);
            toast.success("Business logo uploaded and cropped");
            setCropModalOpen(false);
            setSelectedImage(null);
        } catch (err) {
            console.error('Upload error:', err);
            toast.error("Failed to upload business logo");
        } finally {
            setUploading(false);
        }
    };

    // Manual address functions
    const getManualCountries = async () => {
        setLoadingManualCountries(true);
        try {
            const response = await fetch("https://countriesnow.space/api/v0.1/countries/states");
            const data = await response.json();
            const countriesList = Array.isArray(data?.data) ? data.data : [];
            setCountriesData(countriesList);
            setManualCountries(countriesList.map((c) => c.name).sort());
        } catch (error) {
            console.error("Error fetching countries:", error);
            toast.error("Failed to load countries");
        } finally {
            setLoadingManualCountries(false);
        }
    };

    const handleCountryChange = (value) => {
        setSelectedCountry(value);
        setSelectedState("");
        setSelectedCity("");
        setCities([]);
        const match = countriesData.find((c) => c.name === value);
        const nextStates = (match?.states || []).map((s) => s.name).sort();
        setStates(nextStates);
        formik.setFieldValue("country", value);
    };

    const handleStateChange = async (value) => {
        setSelectedState(value);
        setSelectedCity("");
        setCities([]);
        formik.setFieldValue("province", value);
        if (!selectedCountry) return;
        try {
            setLoadingCities(true);
            const response = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ country: selectedCountry, state: value }),
            });
            const data = await response.json();
            const citiesList = Array.isArray(data?.data) ? data.data : [];
            setCities(citiesList.sort());
        } catch (error) {
            console.error("Error fetching cities:", error);
            toast.error("Failed to load cities");
        } finally {
            setLoadingCities(false);
        }
    };

    const handleCityChange = (value) => {
        setSelectedCity(value);
        formik.setFieldValue("city", value);

        // Update map position when city is selected
        if (selectedCountry && selectedState && value) {
            geocodeManualAddress(selectedCountry, selectedState, value);
        }
    };

    // Geocode manual address selection to update map
    const geocodeManualAddress = async (country, state, city) => {
        setUpdatingMap(true);
        try {
            const query = [city, state, country].filter(Boolean).join(", ");

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`,
                {
                    headers: { "User-Agent": "yourapp/1.0 (contact@example.com)" }
                }
            );

            const data = await response.json();

            if (Array.isArray(data) && data.length > 0) {
                const result = data[0];
                const coords = {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon)
                };

                // Update formik values with coordinates
                formik.setFieldValue("latitude", coords.lat);
                formik.setFieldValue("longitude", coords.lng);

                // Set map position for direct control
                setMapPosition(coords);

                // Note: We don't auto-fill address fields - user will write their own address

                // Force map re-render by updating the key
                setMapKey(prev => prev + 1);
            }
        } catch (error) {
            // Silent error handling
        } finally {
            setUpdatingMap(false);
        }
    };

    // Load manual countries when manual address is enabled
    useEffect(() => {
        if (manualAddress) {
            getManualCountries();
        } else {
            // Reset manual address when unchecked
            setSelectedCountry("");
            setSelectedState("");
            setSelectedCity("");
            setStates([]);
            setCities([]);
            setMapPosition(null);
            setMapKey(prev => prev + 1);
        }
    }, [manualAddress]);

    // Trigger geocoding when all manual address fields are selected
    useEffect(() => {
        if (manualAddress && selectedCountry && selectedState && selectedCity) {
            geocodeManualAddress(selectedCountry, selectedState, selectedCity);
        }
    }, [selectedCountry, selectedState, selectedCity, manualAddress]);


    const fieldCommonSx = {
        height: "35px",
        borderRadius: "6px",
        border: "2px solid rgba(9, 30, 66, 0.14)",
        backgroundColor: "#fff",
        fontSize: { xs: "14px", md: "15px" },
        "&:hover": {
            borderColor: "#006EC2", // ✅ unified hover
        },
        "&.Mui-focused": {
            borderColor: "#006EC2", // ✅ unified focus
        },
        color: "rgba(27, 27, 27, 0.67)",
    };

    const [accountExecutives, setAccountExecutives] = useState([]);
    const getAllExecutives = async () => {
        const InsertAPIURL = `${url}super-admin/public/account-executives`;
        try {
            const response = await fetch(InsertAPIURL, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            setAccountExecutives(data.data.account_executives);
        } catch (error) {
            //  toast.error("Something went wrong! Please try again.");
        } finally {
            setInitialLoader(false);
        }
    };

    const validationSchema = yup.object({
        first_name: yup.string().required(t("First name is required")),
        middle_name: yup.string().nullable(),
        last_name: yup.string().required(t("Last name is required")),
        dob: yup
            .date()
            .required(t("Date of Birth is required"))
            .test(
                "min-age",
                t("You must be at least 18 years old"),
                function (value) {
                    if (!value) return false;
                    const today = new Date();
                    const birthDate = new Date(value);
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    return age >= 18;
                }
            ),
        administrator_type: yup.string().required(t("Administrator type is required")),
        admin_document_url: yup.string().required(t("Administrator document is required")),
        email: yup
            .string()
            .email(t("Enter a valid email"))
            .required(t("Email is required")),
        phone_number: yup.string().required(t("Phone number is required")),
        legal_name: yup.string().required(t("Legal name is required")),
        trade_name: yup.string().nullable(),
        business_sector: yup.string().required(t("Business sector is required")),
        company_registration_number: yup.string().nullable(),
        business_email: yup
            .string()
            .email(t("Enter a valid business email"))
            .required(t("Business email is required")),
        business_phone_number: yup
            .string()
            .required(t("Business phone number is required")),
        business_type: yup.string().nullable(),
        business_activity: yup.string().nullable(),
        business_color: yup.string().nullable(),
        primary_color: yup.string().nullable(),
        secondary_color: yup.string().nullable(),
        business_address: yup.string().nullable(),
        company_document_url: yup.string().nullable(),
        region: yup.string().required(t("Region is required")),
        country: yup.string().nullable(),
        province: yup.string().nullable(),
        postal_code: yup.string().nullable(),
        latitude: yup.number().nullable(),
        longitude: yup.number().nullable(),
        community: yup.string().nullable(),
        city: yup.string().nullable(),
        street: yup.string().nullable(),
        account_executives: yup
            .string()
            .required(t("Account executive is required")),
        subscription_type: yup
            .string()
            .required(t("Subscription type is required")),
        territory_zone: yup.array().nullable(),
    });

    const formik = useFormik({
        initialValues: {
            first_name: "",
            middle_name: "",
            last_name: "",
            dob: "",
            administrator_type: "",
            admin_document_url: "",
            email: "",
            phone_number: "",
            legal_name: "",
            trade_name: "",
            business_sector: "",
            company_registration_number: "",
            business_email: "",
            business_phone_number: "",
            business_type: "",
            business_activity: "",
            business_color: "#1976d2",
            primary_color: "#006EC2",
            secondary_color: "#2C384C",
            business_address: "",
            company_document_url: "",
            region: "",
            country: "",
            province: "",
            postal_code: "",
            community: "",
            city: "",
            street: "",
            account_executives: "",
            subscription_type: "",
            territory_zone: [],
            latitude: null,
            longitude: null,
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { resetForm }) => {
            console.log("Form submitted with values:", values);
            console.log("Form validation errors:", formik.errors);

            const safeValue = (val) =>
                val !== null && val !== undefined && String(val).trim() !== ""
                    ? String(val).trim()
                    : "-";

            // Check if required fields are filled
            if (!values.first_name || !values.last_name || !values.email) {
                toast.error("Please fill in all required fields");
                return;
            }

            // Check if address fields are filled (from LocationPicker)
            if (!values.country) {
                toast.error("Please select a location on the map to capture address details");
                return;
            }

            if (!values.city && !values.province && !values.street) {
                toast.error("Location detected but address details are incomplete. Please try selecting a different location on the map.");
                return;
            }

            console.log("✅ All validations passed, proceeding with form submission");
            console.log("📍 Address data being sent:", {
                country: values.country,
                city: values.city,
                province: values.province,
                postal_code: values.postal_code,
                street: values.street,
                latitude: values.latitude,
                longitude: values.longitude
            });

            // Small delay to ensure formik values are properly set
            await new Promise(resolve => setTimeout(resolve, 100));

            setLoading(true);

            try {
                // Helper function to upload an image and return URL
                const uploadImage = async (file, type) => {
                    if (!file) {
                        return "";
                    }

                    const formData = new FormData();
                    formData.append("image", file);
                    const response = await fetch(`${url}upload/image`, {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                    });
                    const result = await response.json();

                    if (!result.error) return result.data.url;
                    throw new Error(`${type} upload failed`);
                };

                // Upload files once
                const profileImageUrl = await uploadImage(
                    selectedImage,
                    "profile image"
                );
                // Use the already uploaded logoUrl from crop functionality
                const finalLogoUrl = logoUrl || (selectedLogo ? await uploadImage(selectedLogo, "logo") : "");

                // Prepare main form data
                const InsertAPIURL = `${url}company-admins`;
                const formData = new FormData();

                // Debug: Log all form values
                console.log("All form values:", values);
                console.log("Primary color:", values.primary_color);
                console.log("Secondary color:", values.secondary_color);
                console.log("Business address:", values.business_address);

                Object.entries(values).forEach(([key, val]) => {
                    // Handle arrays that need to be JSON stringified
                    if (key === 'territory_zone' && Array.isArray(val)) {
                        formData.append(key, JSON.stringify(val));
                    }
                    // Handle latitude and longitude - send as is (null or number)
                    else if (key === 'latitude' || key === 'longitude') {
                        formData.append(key, val !== null && val !== undefined ? val : "");
                    }
                    else {
                        const valueToAppend = safeValue(val);
                        formData.append(key, valueToAppend);
                        // Debug: Log specific fields
                        if (key === 'primary_color' || key === 'secondary_color' || key === 'business_address') {
                            console.log(`Appending ${key}:`, valueToAppend);
                        }
                    }
                });

                const execValue = values.account_executives
                    ? parseInt(values.account_executives, 10)
                    : "-";
                console.log(execValue)
                formData.append(
                    "account_executive_association",
                    isNaN(execValue) ? "-" : execValue
                );

                if (profileImageUrl)
                    formData.append("profile_picture_url", profileImageUrl);
                if (finalLogoUrl) formData.append("company_logo_url", finalLogoUrl);

                const response = await fetch(InsertAPIURL, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (!response.ok)
                    throw new Error(`Server error: ${response.status}`);
                const data = await response.json();

                setLoading(false);

                if (data.error) {
                    toast.error(data.message || t("An error occurred"));
                } else {
                    toast.success(data.message || t("Company Admin added successfully"));
                    getallusers(
                        1,
                        searchTerm || "",
                        statusFilter || "all",
                        "created_at",
                        "DSC"
                    );
                    setOpenModalAdd(false);
                    resetForm();
                    // Reset image states
                    setSelectedImage(null);
                    setPreviewUrl(null);
                    setSelectedLogo(null);
                    setPreviewLogo(null);
                }
            } catch (error) {
                setLoading(false);
                toast.error(error.message || "Something went wrong! Please try again.");
            }
        },
    });

    const [selectAll, setSelectAll] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);

    // Handle modal close and form reset
    const handleModalClose = () => {
        setOpenModalAdd(false);
        formik.resetForm();

        // Reset image states
        setSelectedImage(null);
        setPreviewUrl(null);
        setSelectedLogo(null);
        setPreviewLogo(null);

        // Reset document states
        setSelectedAdminDoc(null);
        setPreviewAdminDoc(null);
        setAdminDocFileName("");
        setSelectedCompanyDoc(null);
        setPreviewCompanyDoc(null);
        setCompanyDocFileName("");

        // Reset manual address states
        setManualAddress(false);
        setSelectedCountry("");
        setSelectedState("");
        setSelectedCity("");
        setStates([]);
        setCities([]);
        setMapPosition(null);
        setMapKey(prev => prev + 1);

        // Reset to current location (get user's current location)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setMapPosition(coords);
                    formik.setFieldValue("latitude", coords.lat);
                    formik.setFieldValue("longitude", coords.lng);
                },
                (error) => {
                    // If geolocation fails, set default location
                    const defaultCoords = { lat: 33.6844, lng: 73.0479 };
                    setMapPosition(defaultCoords);
                    formik.setFieldValue("latitude", defaultCoords.lat);
                    formik.setFieldValue("longitude", defaultCoords.lng);
                }
            );
        } else {
            // Fallback to default location
            const defaultCoords = { lat: 33.6844, lng: 73.0479 };
            setMapPosition(defaultCoords);
            formik.setFieldValue("latitude", defaultCoords.lat);
            formik.setFieldValue("longitude", defaultCoords.lng);
        }
    };

    const handleCheckboxChange = (event, target) => {
        const checked = event.target.checked;

        if (target === "selectAll") {
            setSelectAll(checked);
            if (checked) {
                // Select all on the current page
                const allIds = allusers.map((item) => item.id);
                setSelectedRows(allIds);
            } else {
                // Deselect all
                setSelectedRows([]);
            }
        } else {
            if (checked) {
                setSelectedRows((prev) => [...prev, target]);
            } else {
                setSelectedRows((prev) => prev.filter((id) => id !== target));
            }
        }
    };

    const [countries, setCountries] = useState([]);
    const getCountries = async () => {
        fetch("https://restcountries.com/v3.1/all?fields=name,cca2,flags")
            .then((res) => res.json())
            .then((data) => {
                setCountries(data);
            })
            .catch((error) => {
                toast.error("Something went wrong! Please try again.");
            });
    };

    // account Status
    const [selectedItem, setSelectedItem] = useState(null);
    const [statusToChange, setStatusToChange] = useState(null);

    const [openModalStatusChange, setOpenModalStatusChange] = useState(false);
    const handleOpenModalStatusChange = (item, newStatus) => {
        setOpenModalStatusChange(true);
        setSelectedItem(item.id);
        setStatusToChange(newStatus);
    };
    const confirmStatusChange = () => {
        setLoading(true);
        setTimeout(() => {
            var InsertAPIURL = `${url}company-admins/status`;

            var Data = {
                company_admin_ids: [selectedItem],
                status: statusToChange,
                // "verification_status": "verified"
            };

            fetch(InsertAPIURL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json", // ✅ Required
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(Data),
            })
                .then((response) => response.json())
                .then((response) => {
                    setLoading(false);
                    if (response.error) {
                        toast.error(response.message || t("An error occurred"));
                    } else {
                        toast.success(response.message || t("Status updated successfully"));
                        setStatusToChange(null);
                        setOpenModalStatusChange(false);

                        getallusers();
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    toast.error(t("Something went wrong! Please try again."));
                });
        }, 1000);
    };

    // Verification Status
    const [selectedVerificationItem, setSelectedVerificationItem] =
        useState(null);
    const [verificationStatusToChange, setVerificationStatusToChange] =
        useState(null);
    const [anchorElVerificationStatus, setAnchorElVerificationStatus] =
        useState(null);
    const [
        openModalVerificationStatusChange,
        setOpenModalVerificationStatusChange,
    ] = useState(false);

    const handleOpenVerificationStatusMenu = (event, item) => {
        setSelectedVerificationItem(item.id);
        setAnchorElVerificationStatus(event.currentTarget);
    };

    const handleCloseVerificationStatusMenu = () => {
        setAnchorElVerificationStatus(null);
    };

    const handleOpenVerificationStatusModal = (status) => {
        setVerificationStatusToChange(status);
        setOpenModalVerificationStatusChange(true);
        handleCloseVerificationStatusMenu();
    };

    // const confirmVerificationStatusChange = () => {
    //   if (selectedVerificationItem && verificationStatusToChange) {
    //    toast.success("Verification status updated successfully");

    //     setLoading(true);
    //     setTimeout(() => {
    //       var InsertAPIURL = `${url}company-admins/status`;

    //       var Data = {
    //         company_admin_ids: [selectedVerificationItem],
    //         // "status": statusToChange,
    //         verification_status: verificationStatusToChange,
    //       };

    //       fetch(InsertAPIURL, {
    //         method: "PUT",
    //         headers: {
    //           "Content-Type": "application/json", // ✅ Required
    //           Authorization: `Bearer ${token}`,
    //         },
    //         body: JSON.stringify(Data),
    //       })
    //         .then((response) => response.json())
    //         .then((response) => {

    //           setLoading(false);
    //           if (response.error) {
    //             toast.error(response.message || "An error occurred");
    //           } else {
    //             toast.success(
    //               response.message || "Verification status updated successfully"
    //             );
    //             setOpenModalVerificationStatusChange(false);
    //             setVerificationStatusToChange(null);
    //             getallusers();
    //           }
    //         })
    //         .catch((error) => {
    //           setLoading(false);
    //          toast.error("Something went wrong! Please try again." )
    //         });
    //     }, 1000);
    //   }
    // };

    const confirmVerificationStatusChange = () => {
        if (selectedVerificationItem && verificationStatusToChange) {
            setLoading(true);

            setTimeout(() => {
                var InsertAPIURL = `${url}company-admins/status`;

                var Data = {
                    company_admin_ids: [selectedVerificationItem],
                    verification_status: verificationStatusToChange.trim().toLowerCase(), // important!
                };

                fetch(InsertAPIURL, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(Data),
                })
                    .then((res) => res.json())
                    .then((response) => {
                        setLoading(false);
                        if (response.error) {
                            toast.error(response.message || "An error occurred");
                        } else {
                            toast.success(
                                response.message || "Verification status updated successfully"
                            );
                            setOpenModalVerificationStatusChange(false);
                            setVerificationStatusToChange(null);
                            getallusers();
                        }
                    })
                    .catch(() => {
                        setLoading(false);
                        toast.error("Something went wrong! Please try again.");
                    });
            }, 1000);
        }
    };

    ////////////
    const [bulkLoading, setBulkLoading] = useState(null); // can be: "active", "inactive", "blocked", "verified", or null

    const handleBulkStatusChange = (status) => {
        // toast.success("Status updated successfully");

        setBulkLoading(status); // mark which button is clicked
        setTimeout(() => {
            var InsertAPIURL = `${url}company-admins/status`;

            var Data = {
                company_admin_ids: selectedRows,
                status: status,
            };

            fetch(InsertAPIURL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json", // ✅ Required
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(Data),
            })
                .then((response) => response.json())
                .then((response) => {
                    setBulkLoading(null);
                    if (response.error) {
                        toast.error(response.message || "An error occurred");
                    } else {
                        toast.success(response.message || "Status updated successfully");
                        setStatusToChange(null);
                        setOpenModalStatusChange(false);

                        getallusers();
                    }
                })
                .catch((error) => {
                    setBulkLoading(null);
                    toast.error("Something went wrong! Please try again.");
                });
        }, 1000);
    };

    const handleBulkVerificationStatusChange = (verification_status) => {
        // toast.success("Verification status updated successfully");

        setBulkLoading("verified");
        setTimeout(() => {
            var InsertAPIURL = `${url}company-admins/status`;

            var Data = {
                company_admin_ids: selectedRows,
                verification_status: "verified",
            };

            fetch(InsertAPIURL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json", // ✅ Required
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(Data),
            })
                .then((response) => response.json())
                .then((response) => {
                    setBulkLoading(null);
                    if (response.error) {
                        toast.error(response.message || "An error occurred");
                    } else {
                        toast.success(
                            response.message || "Verification status updated successfully"
                        );
                        setOpenModalVerificationStatusChange(false);
                        setVerificationStatusToChange(null);
                        getallusers();
                    }
                })
                .catch((error) => {
                    setBulkLoading(null);
                    toast.error("Something went wrong! Please try again.");
                });
        }, 1000);
    };

    // Effect for handling sort changes
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            getallusers(
                1, // Reset to page 1 when sorting
                searchTerm,
                statusFilter,
                sortBy,
                sortOrder,
                statusFilter,
                isSortingRef.current,
                dateFrom,
                dateTo
            );

            isSortingRef.current = false; // Reset the flag after fetch
        }, 200);

        return () => clearTimeout(delayDebounce);
    }, [sortBy, sortOrder]);

    useEffect(() => {
        if (selectedRows.length !== allusers.length) {
            setSelectAll(false);
        }
    }, [selectedRows]);

    useEffect(() => {
        getCountries();
        getallusers();
        getAllExecutives();
    }, []);

    // Debug useEffect to monitor formik values
    useEffect(() => {
        console.log("📍 Company Admin Formik values:", {
            country: formik.values.country,
            city: formik.values.city,
            province: formik.values.province,
            postal_code: formik.values.postal_code,
            street: formik.values.street,
            community: formik.values.community
        });
    }, [formik.values.country, formik.values.city, formik.values.province, formik.values.postal_code, formik.values.street, formik.values.community]);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


    const fetchAllCompanyAdminsForExport = async () => {
        const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
        const sortParams = sortBy ? `&sort_by=${sortBy}&sort_order=${sortOrder}` : "";
        const searchParam = searchTerm ? `&search=${searchTerm}` : "";
        const dateFromParam = dateFrom ? `&start_date=${dateFrom}` : "";
        const dateToParam = dateTo ? `&end_date=${dateTo}` : "";

        const apiUrl = `${url}company-admins?no_pagination=true${statusParam}${sortParams}${searchParam}${dateFromParam}${dateToParam}`;

        try {
            const response = await fetch(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            return data?.data?.company_admins || [];
        } catch (err) {
            console.error("Export fetch failed", err);
            return [];
        }
    };







    const [exportingAdmins, setExportingAdmins] = useState(false);
    const handleExportData = async (format) => {
        setExportingAdmins(true);
        console.log("Export started for format:", format);

        try {
            const allData = await fetchAllCompanyAdminsForExport();
            console.log("Raw fetched data:", allData);

            if (!allData.length) {
                toast.error("No data available for export.");
                console.warn("No data returned from fetchAllCompanyAdminsForExport");
                return;
            }

            // Skip images, long fields, and internal IDs
            const skipColumns = [
                "profile_picture",
                "profile_picture_url",
                "company_logo",
                "company_logo_url",
                "id"
            ];
            console.log("Columns to skip:", skipColumns);

            // Flatten all fields: convert objects to string, skip unwanted columns
            const flattenedData = allData.map((item, index) => {
                const flatItem = {};
                Object.keys(item).forEach((key) => {
                    if (skipColumns.includes(key)) return; // skip this field
                    const value = item[key];
                    // If the value is an object or array, convert to JSON string
                    if (value && typeof value === "object") {
                        flatItem[key] = JSON.stringify(value);
                    } else if (typeof value === "string" && value.length > 100) {
                        // Optionally truncate very long text to avoid Excel/PDF issues
                        flatItem[key] = value.substring(0, 100) + "...";
                    } else {
                        flatItem[key] = (value === null || value === undefined || (typeof value === "string" && value.trim() === "") || value === "null" || value === "undefined") ? t("N/A") : value;
                    }
                });
                console.log(`Flattened row ${index}:`, flatItem);
                return flatItem;
            });

            console.log("Flattened data ready for export:", flattenedData);

            if (format.toLowerCase() === "pdf") {
                await exportTable(flattenedData, "Company Admins", "pdf", { skipColumns: [] });
                console.log("PDF export successful");
            } else if (format.toLowerCase() === "excel") {
                await exportTable(flattenedData, "Company Admins", "xlsx", { skipColumns: [] });
                console.log("Excel export successful");
            } else {
                console.error("Unsupported export format:", format);
            }
        } catch (err) {
            console.error("Export failed:", err);
            toast.error("Failed to export. Please try again.");
        } finally {
            setExportingAdmins(false);
            console.log("Export process finished");
        }
    };



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
                                xs: "calc(100vh - 70px)", // extra-small screens (mobile)
                                sm: "calc(100vh - 80px)", // small screens (tablets)
                                md: "calc(100vh - 85px)", // medium screens (laptops)
                                lg: "calc(100vh - 85px)", // large screens (desktops)
                                xl: "calc(100vh - 110px)", // extra-large screens (big monitors)
                            },
                        }}
                    >
                        <Box sx={{
                            mt: 1, mb: 2, pr: 2, pl: 2,

                        }}>

                        </Box>
                        <Grid container spacing={0} sx={{ pl: 2, pr: 2 }} pt={0}>
                            <Grid xs={12} md={12} align="">
                                <Box
                                    sx={{
                                        backgroundColor: "white",
                                        border: "2px solid rgba(9, 30, 66, 0.14)",
                                        borderRadius: "12px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: { xs: "column", lg: "row" },
                                            gap: { xs: 2, lg: 0 },
                                            p: 2,
                                            pb: 1,
                                            alignItems: { xs: "stretch", lg: "center" },
                                        }}
                                    >
                                        {/* Title */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                height: "35px",
                                                width: { xs: "100%", lg: "auto" },
                                                flex: { lg: "0 0 25%" },
                                                minWidth: { lg: "200px" },
                                            }}
                                        >
                                            <TypographyMD
                                                variant="paragraph"
                                                label={t("Manage Company Admins")}
                                                color="#003149"
                                                fontFamily="Poppins, sans-serif"
                                                fontSize={{ xs: "16px", lg: "18px" }}
                                                fontWeight={600}
                                            />
                                            {sortingLoader && (
                                                <CircularProgress
                                                    size={14}
                                                    sx={{ ml: 1 }}
                                                />
                                            )}
                                        </Box>

                                        {/* Search */}
                                        <Box
                                            sx={{
                                                width: { xs: "100%", lg: "auto" },
                                                flex: { lg: "0 0 30%" },
                                                minWidth: { lg: "250px" },
                                            }}
                                        >
                                            <OutlinedInput
                                                autoComplete="off"
                                                placeholder={t("Search companies...")}
                                                sx={{
                                                    ...fieldCommonSx,
                                                    width: "100%",
                                                    "& fieldset": { border: "none" },
                                                }}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton edge="end" size="small">
                                                            <Search
                                                                sx={{ fontSize: "16px", color: "#222" }}
                                                            />
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </Box>

                                        {/* Actions */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: { xs: "column", lg: "row" },
                                                justifyContent: {
                                                    xs: "flex-start",
                                                    lg: "flex-end",
                                                },
                                                alignItems: { xs: "stretch", lg: "center" },
                                                gap: { xs: 1.2, lg: 1 },
                                                width: { xs: "100%", lg: "auto" },
                                                flex: { lg: "0 0 45%" },
                                                minWidth: { lg: "400px" },
                                            }}
                                        >
                                            {selectedRows.length > 0 ? (
                                                <>
                                                    {/* Bulk Action Buttons */}
                                                    <Button
                                                        onClick={() => handleBulkStatusChange("active")}
                                                        disabled={bulkLoading === "active"}
                                                        startIcon={bulkLoading === "active" ? <CircularProgress size={16} /> : <CheckCircleOutline />}
                                                        sx={{
                                                            height: "35px",
                                                            px: 2,
                                                            width: { xs: "100%", lg: "auto" },
                                                            backgroundColor: "#4BCE97",
                                                            color: "#fff",
                                                            borderRadius: "6px",
                                                            boxShadow: "none",
                                                            fontFamily: "Poppins, sans-serif",
                                                            fontSize: "13px",
                                                            textTransform: "capitalize",
                                                            "&:hover": { backgroundColor: "#3db87f" },
                                                        }}
                                                    >
                                                        {t("Active")}
                                                    </Button>

                                                    <Button
                                                        onClick={() => handleBulkStatusChange("inactive")}
                                                        disabled={bulkLoading === "inactive"}
                                                        startIcon={bulkLoading === "inactive" ? <CircularProgress size={16} /> : <Block />}
                                                        sx={{
                                                            height: "35px",
                                                            px: 2,
                                                            width: { xs: "100%", lg: "auto" },
                                                            backgroundColor: "#F87168",
                                                            color: "#fff",
                                                            borderRadius: "6px",
                                                            boxShadow: "none",
                                                            fontFamily: "Poppins, sans-serif",
                                                            fontSize: "13px",
                                                            textTransform: "capitalize",
                                                            "&:hover": { backgroundColor: "#e65850" },
                                                        }}
                                                    >
                                                        {t("Inactive")}
                                                    </Button>

                                                    <Button
                                                        onClick={() => handleBulkVerificationStatusChange("verified")}
                                                        disabled={bulkLoading === "verified"}
                                                        startIcon={bulkLoading === "verified" ? <CircularProgress size={16} /> : <CheckCircleOutline />}
                                                        sx={{
                                                            height: "35px",
                                                            px: 2,
                                                            width: { xs: "100%", lg: "auto" },
                                                            backgroundColor: "#579DFF",
                                                            color: "#fff",
                                                            borderRadius: "6px",
                                                            boxShadow: "none",
                                                            fontFamily: "Poppins, sans-serif",
                                                            fontSize: "13px",
                                                            textTransform: "capitalize",
                                                            "&:hover": { backgroundColor: "#4589e8" },
                                                        }}
                                                    >
                                                        {t("Verify")}
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Filter button */}
                                                    <Box sx={{ position: "relative", display: "inline-flex" }}>
                                                        <IconButton
                                                            onClick={() => {
                                                                // Set draft values to current active values when opening modal
                                                                setDraftStatus(statusFilter);
                                                                setDraftStartDate(dateFrom);
                                                                setDraftEndDate(dateTo);
                                                                setOpenModalFilter(true);
                                                            }}
                                                            sx={{
                                                                border: "1px solid #E0E0E0",
                                                                borderRadius: "8px",
                                                                bgcolor: isFilterActive() ? "#1976d2" : "#fff",
                                                                color: isFilterActive() ? "#fff" : "#44546F",
                                                            }}
                                                        >
                                                            <FilterList />
                                                        </IconButton>

                                                        {isFilterActive() && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    clearFilters();
                                                                }}
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: -6,
                                                                    right: -6,
                                                                    bgcolor: "#fff",
                                                                    border: "1px solid #ccc",
                                                                    p: 0.3,
                                                                }}
                                                            >
                                                                <CloseIcon sx={{ fontSize: 14, color: "#444" }} />
                                                            </IconButton>
                                                        )}
                                                    </Box>


                                                    <ExportMenuButton
                                                        onExport={handleExportData}
                                                        icon={
                                                            exportingAdmins ? (
                                                                <CircularProgress size={15} />
                                                            ) : (
                                                                <img src={exportIcon} alt="Export" style={{ width: 20 }} />
                                                            )
                                                        }
                                                        options={[
                                                            { label: "PDF", icon: pdfIcon },
                                                            { label: "Excel", icon: csvIcon },
                                                        ]}
                                                        disabled={exportingAdmins}
                                                        sx={{
                                                            ...fieldCommonSx,
                                                            px: 2,
                                                            textTransform: "capitalize",
                                                            width: { xs: "100%", lg: "auto" },
                                                            borderStyle: "solid",
                                                            "&:hover": {
                                                                borderColor: "#006EC2",
                                                                backgroundColor: "#fff",
                                                                borderWidth: "2px",
                                                            },
                                                            fontFamily: "Poppins, sans-serif",
                                                            fontSize: "15px",
                                                            fontWeight: 500,
                                                        }}
                                                    />


                                                </>
                                            )}
                                        </Box>
                                    </Box>

                                    {initialLoader ? (
                                        <div
                                            style={{
                                                height: "30vh",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <CircularProgress
                                                size={20}
                                                thickness={3}
                                                color="primary"
                                            />
                                        </div>
                                    ) : (
                                        <Box
                                            sx={{
                                                width: {
                                                    xs: "100%",
                                                    md: "78vw",
                                                },
                                            }}
                                        >
                                            {allusers?.length == 0 || undefined || null ? (
                                                <Box
                                                    display={"flex"}
                                                    flexDirection={"column"}
                                                    alignItems={"center"}
                                                    justifyContent="center"
                                                    py={10}
                                                >
                                                    <img src={nousers} alt="" height={200} />
                                                    <TypographyMD
                                                        variant="h2"
                                                        label={t("No Company Admins Found!")}
                                                        color="#A5ADB0"
                                                        fontFamily="Roboto"
                                                        fontSize="15px"
                                                        fontWeight={450}
                                                        align="center"
                                                    />
                                                </Box>
                                            ) : (
                                                <>
                                                    <TableContainer
                                                        sx={{
                                                            // borderRadius: { xs: "5px", md: "50px" },
                                                            boxShadow: "none",
                                                            overflowX: "auto",

                                                            pt: 1,
                                                        }}
                                                    >
                                                        <Table
                                                            sx={{
                                                                minWidth: { xs: "100px", md: "250px" },
                                                                "& .MuiTableCell-root": {
                                                                    // padding: "5px",
                                                                    whiteSpace: "nowrap", // Prevent wrapping
                                                                },
                                                                "& .MuiTableRow-root": {
                                                                    height: "25px",
                                                                },
                                                                whiteSpace: "nowrap !important",
                                                            }}
                                                            aria-label="simple table"
                                                        >
                                                            <TableHead
                                                                style={{
                                                                    fontSize: "13px",
                                                                    // backgroundColor: "#F4F6FA",
                                                                }}
                                                            >
                                                                <TableRow>
                                                                    <TableCell padding="checkbox">
                                                                        <Checkbox
                                                                            sx={{ color: "rgba(9, 30, 66, 0.14)" }}
                                                                            checked={selectAll}
                                                                            indeterminate={false}
                                                                            onChange={(e) =>
                                                                                handleCheckboxChange(e, "selectAll")
                                                                            }
                                                                        />
                                                                    </TableCell>

                                                                    {/* Admin Name */}
                                                                    <TableCell
                                                                        onClick={() => handleSort("full_name")}
                                                                        align="center"
                                                                        sx={{
                                                                            cursor: "pointer",
                                                                            fontWeight: "bold",
                                                                            color: "#44546F",
                                                                            fontFamily: "Poppins, sans-serif",
                                                                            fontSize: "14px",
                                                                        }}
                                                                    >
                                                                        {t("Admin Name")}
                                                                        <SortIcons
                                                                            column="full_name"
                                                                            sortBy={sortBy}
                                                                            sortOrder={sortOrder}
                                                                        />
                                                                    </TableCell>

                                                                    {/* Admin Email */}
                                                                    <TableCell
                                                                        onClick={() => handleSort("email")}
                                                                        align="center"
                                                                        sx={{
                                                                            cursor: "pointer",
                                                                            fontWeight: "bold",
                                                                            color: "#44546F",
                                                                            fontFamily: "Poppins, sans-serif",
                                                                            fontSize: "14px",
                                                                        }}
                                                                    >
                                                                        {t("Admin Email")}
                                                                        <SortIcons
                                                                            column="email"
                                                                            sortBy={sortBy}
                                                                            sortOrder={sortOrder}
                                                                        />
                                                                    </TableCell>

                                                                    {/* Company Name */}
                                                                    <TableCell
                                                                        onClick={() => handleSort("company_name")}
                                                                        align="center"
                                                                        sx={{
                                                                            cursor: "pointer",
                                                                            fontWeight: "bold",
                                                                            color: "#44546F",
                                                                            fontFamily: "Poppins, sans-serif",
                                                                            fontSize: "14px",
                                                                        }}
                                                                    >
                                                                        {t("Company Name")}
                                                                        <SortIcons
                                                                            column="company_name"
                                                                            sortBy={sortBy}
                                                                            sortOrder={sortOrder}
                                                                        />
                                                                    </TableCell>

                                                                    {/* Country */}
                                                                    <TableCell
                                                                        onClick={() => handleSort("country")}
                                                                        align="center"
                                                                        sx={{
                                                                            cursor: "pointer",
                                                                            fontWeight: "bold",
                                                                            color: "#44546F",
                                                                            fontFamily: "Poppins, sans-serif",
                                                                            fontSize: "14px",
                                                                        }}
                                                                    >
                                                                        {t("Country")}
                                                                        <SortIcons
                                                                            column="country"
                                                                            sortBy={sortBy}
                                                                            sortOrder={sortOrder}
                                                                        />
                                                                    </TableCell>

                                                                    {/* Account Status */}
                                                                    <TableCell
                                                                        onClick={() => handleSort("status")}
                                                                        align="center"
                                                                        sx={{
                                                                            cursor: "pointer",
                                                                            fontWeight: "bold",
                                                                            color: "#44546F",
                                                                            fontFamily: "Poppins, sans-serif",
                                                                            fontSize: "14px",
                                                                        }}
                                                                    >
                                                                        {t("Account Status")}
                                                                        <SortIcons
                                                                            column="status"
                                                                            sortBy={sortBy}
                                                                            sortOrder={sortOrder}
                                                                        />
                                                                    </TableCell>

                                                                    {/* Verification Status */}
                                                                    <TableCell
                                                                        onClick={() =>
                                                                            handleSort("verification_status")
                                                                        }
                                                                        align="center"
                                                                        sx={{
                                                                            cursor: "pointer",
                                                                            fontWeight: "bold",
                                                                            color: "#44546F",
                                                                            fontFamily: "Poppins, sans-serif",
                                                                            fontSize: "14px",
                                                                        }}
                                                                    >
                                                                        {t("Verification Status")}
                                                                        <SortIcons
                                                                            column="verification_status"
                                                                            sortBy={sortBy}
                                                                            sortOrder={sortOrder}
                                                                        />
                                                                    </TableCell>

                                                                    {/* Registered */}
                                                                    <TableCell
                                                                        onClick={() => handleSort("registered")}
                                                                        align="center"
                                                                        sx={{
                                                                            cursor: "pointer",
                                                                            fontWeight: "bold",
                                                                            color: "#44546F",
                                                                            fontFamily: "Poppins, sans-serif",
                                                                            fontSize: "14px",
                                                                        }}
                                                                    >
                                                                        {t("Registered")}
                                                                        <SortIcons
                                                                            column="registered"
                                                                            sortBy={sortBy}
                                                                            sortOrder={sortOrder}
                                                                        />
                                                                    </TableCell>

                                                                    <TableCell
                                                                        align="center"
                                                                        sx={{
                                                                            fontWeight: "bold",
                                                                            color: "#44546F",
                                                                            fontFamily: "Poppins, sans-serif",
                                                                            fontSize: "14px",
                                                                        }}
                                                                    >
                                                                        {t("Action")}
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {allusers.map((item) => (
                                                                    <TableRow
                                                                        hover
                                                                    >
                                                                        <TableCell
                                                                            padding="checkbox"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                            }}
                                                                        >
                                                                            <Checkbox
                                                                                sx={{
                                                                                    color: "rgba(9, 30, 66, 0.14)",
                                                                                }}
                                                                                checked={selectedRows.includes(
                                                                                    item.id
                                                                                )}
                                                                                onChange={(e) =>
                                                                                    handleCheckboxChange(e, item.id)
                                                                                }
                                                                            />
                                                                        </TableCell>

                                                                        {/* <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                                                                        {item.id}
                                                                    </TableCell> */}

                                                                        <TableCell
                                                                            align="center"
                                                                            sx={{
                                                                                fontWeight: 400,
                                                                                color: "#172B4D",
                                                                                fontFamily: "Poppins, sans-serif",
                                                                                fontSize: "14px",
                                                                                maxWidth: "150px",
                                                                                whiteSpace: "nowrap",
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                            }}
                                                                        >
                                                                            {displayValue(item.full_name)}
                                                                        </TableCell>

                                                                        <TableCell
                                                                            align="center"
                                                                            sx={{
                                                                                fontWeight: 400,
                                                                                color: "#172B4D",
                                                                                fontFamily: "Poppins, sans-serif",
                                                                                fontSize: "14px",
                                                                                maxWidth: "150px",
                                                                                whiteSpace: "nowrap",
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                            }}
                                                                        >
                                                                            {displayValue(item.email)}
                                                                        </TableCell>

                                                                        <TableCell
                                                                            align="center"
                                                                            sx={{
                                                                                fontWeight: 400,
                                                                                color: "#172B4D",
                                                                                fontFamily: "Poppins, sans-serif",
                                                                                fontSize: "14px",
                                                                                maxWidth: "200px",
                                                                                whiteSpace: "nowrap",
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                            }}
                                                                        >
                                                                            {displayValue(item.company_name)}
                                                                        </TableCell>

                                                                        <TableCell
                                                                            align="center"
                                                                            sx={{
                                                                                fontWeight: 400,
                                                                                color: "#172B4D",
                                                                                fontFamily: "Poppins, sans-serif",
                                                                                fontSize: "14px",
                                                                                maxWidth: "150px",
                                                                                whiteSpace: "nowrap",
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                            }}
                                                                        >
                                                                            {displayValue(item.country)}
                                                                        </TableCell>

                                                                        <TableCell
                                                                            align="center"
                                                                            sx={{
                                                                                fontWeight: 400,
                                                                                color: "#172B4D",
                                                                                fontFamily: "Poppins, sans-serif",
                                                                                fontSize: "14px",
                                                                                maxWidth: "150px",
                                                                                whiteSpace: "nowrap",
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    display: "flex",
                                                                                    justifyContent: "center",
                                                                                    alignContent: "center",
                                                                                    gap: "10px",
                                                                                }}
                                                                            >
                                                                                <DummyStatusMenuButton
                                                                                    status={item.status}
                                                                                    statusOptions={[
                                                                                        {
                                                                                            value: "active",
                                                                                            label: t("Active"),
                                                                                            color: "#4BCE97",
                                                                                            icon: (
                                                                                                <CheckCircleOutline
                                                                                                    fontSize="17px"
                                                                                                    sx={{ mr: 1 }}
                                                                                                />
                                                                                            ),
                                                                                        },
                                                                                        {
                                                                                            value: "inactive",
                                                                                            label: t("Inactive"),
                                                                                            color: "#F87168",
                                                                                            icon: (
                                                                                                <Block
                                                                                                    fontSize="17px"
                                                                                                    sx={{ mr: 1 }}
                                                                                                />
                                                                                            ),
                                                                                        },
                                                                                        {
                                                                                            value: "invited",
                                                                                            label: t("Invited"),
                                                                                            color: "#579DFF",
                                                                                            icon: (
                                                                                                <Email
                                                                                                    fontSize="17px"
                                                                                                    sx={{ mr: 1 }}
                                                                                                />
                                                                                            ),
                                                                                        },
                                                                                        {
                                                                                            value: "requested",
                                                                                            label: t("Requested"),
                                                                                            color: "#ebc634",
                                                                                            icon: (
                                                                                                <CloudSync
                                                                                                    fontSize="17px"
                                                                                                    sx={{ mr: 1 }}
                                                                                                />
                                                                                            ),
                                                                                        },
                                                                                    ]}
                                                                                    onChange={(newStatus) =>
                                                                                        handleOpenModalStatusChange(
                                                                                            item,
                                                                                            newStatus
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </TableCell>

                                                                        <TableCell
                                                                            align="center"
                                                                            sx={{
                                                                                fontWeight: 400,
                                                                                color: "#172B4D",
                                                                                fontFamily: "Poppins, sans-serif",
                                                                                fontSize: "14px",
                                                                                maxWidth: "150px",
                                                                                whiteSpace: "nowrap",
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    display: "flex",
                                                                                    justifyContent: "center",
                                                                                    alignContent: "center",
                                                                                    gap: "10px",
                                                                                }}
                                                                            >
                                                                                <VerificationStatusDropdown
                                                                                    item={item}
                                                                                    anchorEl={
                                                                                        anchorElVerificationStatus
                                                                                    }
                                                                                    onOpen={
                                                                                        handleOpenVerificationStatusMenu
                                                                                    }
                                                                                    onClose={
                                                                                        handleCloseVerificationStatusMenu
                                                                                    }
                                                                                    onStatusSelect={
                                                                                        handleOpenVerificationStatusModal
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </TableCell>

                                                                        <TableCell
                                                                            align="center"
                                                                            sx={{
                                                                                fontWeight: 400,
                                                                                color: "#172B4D",
                                                                                fontFamily: "Poppins, sans-serif",
                                                                                fontSize: "14px",
                                                                                maxWidth: "200px",
                                                                                whiteSpace: "nowrap",
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                            }}
                                                                        >
                                                                            {isEmptyValue(item?.registered) ? (
                                                                                t("N/A")
                                                                            ) : (
                                                                                <FormatDate inputDate={item?.registered} />
                                                                            )}
                                                                        </TableCell>

                                                                        <TableCell
                                                                            align="center"
                                                                            sx={{
                                                                                fontWeight: 400,
                                                                                color: "#172B4D",
                                                                                fontFamily: "Poppins, sans-serif",
                                                                                fontSize: "14px",
                                                                                maxWidth: "150px",
                                                                                whiteSpace: "nowrap",
                                                                                overflow: "hidden",
                                                                                textOverflow: "ellipsis",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    display: "flex",
                                                                                    justifyContent: "center",
                                                                                    alignContent: "cenetr",
                                                                                    gap: "10px",
                                                                                }}
                                                                            >
                                                                                <Tooltip title="View">
                                                                                    <Visibility
                                                                                        sx={{
                                                                                            cursor: "pointer",
                                                                                            color: "#579DFF",
                                                                                        }}
                                                                                        onClick={() => {
                                                                                            navigate(
                                                                                                `/company-admin-details?id=${item?.id}&name=${item?.full_name}`,
                                                                                                {
                                                                                                    state: {
                                                                                                        from: "/company-admin",
                                                                                                    },
                                                                                                }
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                </Tooltip>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>

                                                        <div
                                                            style={{
                                                                marginTop: "10px",
                                                                marginBottom: "10px",
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignContent: "center",
                                                            }}
                                                        ></div>
                                                    </TableContainer>
                                                    <Box mt={2} display="flex" justifyContent="center">
                                                        <Pagination
                                                            count={totalPages}
                                                            page={currentPage}
                                                            onChange={(_, p) => handlePageChange(_, p)}
                                                            shape="rounded"
                                                            color="primary"
                                                            size="small"
                                                            sx={{
                                                                "& .MuiPaginationItem-root": {
                                                                    fontFamily: "Poppins, sans-serif",
                                                                    fontSize: 13,
                                                                    fontWeight: 500,
                                                                },
                                                                "& .Mui-selected": {
                                                                    backgroundColor: "#E9F3FF",
                                                                    color: "#006EC2",
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                </>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>

                    </Box>
                }
            />

            {/* Add modal */}
            <ModalAdd
                open={openModalAdd}
                onClose={handleModalClose}
                title={t("Add Company Admins")}
                data={
                    <form
                        style={{
                            backgroundColor: "#fff",
                            margin: window.innerWidth < 600 ? 8 : 13
                        }}
                        onSubmit={formik.handleSubmit}
                    >
                        <Box
                            sx={{
                                height: { xs: "calc(100vh - 120px)", sm: "91vh", md: "91vh" }, // control how tall the modal body can grow
                                overflowY: "auto", // enable vertical scroll if content overflows
                                px: { xs: 0.5, sm: 1 },
                                pb: { xs: 2, sm: 3 }, // padding left & right
                            }}
                        >
                            <Grid container spacing={0}>
                                <Grid xs={12} align="left">
                                    <div>
                                        <Box
                                            sx={{
                                                marginTop: { xs: "10px", sm: "15px" },
                                                marginBottom: { xs: "20px", sm: "30px" },
                                                px: { xs: 1, sm: 0 }
                                            }}
                                            width="100%"
                                        >
                                            {/* --- Admin Details --- */}
                                            <TypographyMD
                                                variant="paragraph"
                                                label={t("Admin Details")}
                                                color="#000000"
                                                fontFamily="Roboto"
                                                fontSize="15px"
                                                fontWeight={750}
                                                align="left"
                                            />

                                            <div style={{ marginBottom: { xs: "10px", sm: "15px" }, marginTop: { xs: "5px", sm: "10px" } }}>
                                                <Box
                                                    display="flex"
                                                    flexDirection={{ xs: "column", md: "row" }}
                                                    gap={{ xs: 1.5, md: 2 }}
                                                >
                                                    <Box width="100%">
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={
                                                                <span>
                                                                    {t("First Name")}
                                                                    {formik.values.first_name === "" && (
                                                                        <span
                                                                            style={{ color: "red", marginLeft: 4 }}
                                                                        >
                                                                            *
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            }
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="14px"
                                                            fontWeight={450}
                                                            align="left"
                                                        />
                                                        <Inputfield
                                                            autoFocus={false}
                                                            value={formik.values.first_name}
                                                            onChngeterm={(e) =>
                                                                formik.setFieldValue(
                                                                    "first_name",
                                                                    e.target.value
                                                                )
                                                            }
                                                            error={
                                                                formik.touched.first_name &&
                                                                Boolean(formik.errors.first_name)
                                                            }
                                                            helperText={
                                                                formik.touched.first_name &&
                                                                formik.errors.first_name
                                                            }
                                                            type="text"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                    <Box width="100%">
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Middle Name")}
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="14px"
                                                            fontWeight={450}
                                                            align="left"
                                                        />
                                                        <Inputfield
                                                            autoFocus={false}
                                                            value={formik.values.middle_name}
                                                            onChngeterm={(e) =>
                                                                formik.setFieldValue(
                                                                    "middle_name",
                                                                    e.target.value
                                                                )
                                                            }
                                                            error={
                                                                formik.touched.middle_name &&
                                                                Boolean(formik.errors.middle_name)
                                                            }
                                                            helperText={
                                                                formik.touched.middle_name &&
                                                                formik.errors.middle_name
                                                            }
                                                            type="text"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                    <Box width="100%">
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={
                                                                <span>
                                                                    {t("Last Name")}
                                                                    {formik.values.last_name === "" && (
                                                                        <span
                                                                            style={{ color: "red", marginLeft: 4 }}
                                                                        >
                                                                            *
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            }
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="14px"
                                                            fontWeight={450}
                                                            align="left"
                                                        />
                                                        <Inputfield
                                                            autoFocus={false}
                                                            value={formik.values.last_name}
                                                            onChngeterm={(e) =>
                                                                formik.setFieldValue(
                                                                    "last_name",
                                                                    e.target.value
                                                                )
                                                            }
                                                            error={
                                                                formik.touched.last_name &&
                                                                Boolean(formik.errors.last_name)
                                                            }
                                                            helperText={
                                                                formik.touched.last_name &&
                                                                formik.errors.last_name
                                                            }
                                                            type="text"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                </Box>

                                                <Box
                                                    display="flex"
                                                    flexDirection={{ xs: "column", md: "row" }}
                                                    gap={{ xs: 1.5, md: 2 }}
                                                >
                                                    <Box width="100%">
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={
                                                                <span>
                                                                    {t("Date of Birth")}
                                                                    <span style={{ color: "red", marginLeft: 4 }}>
                                                                        *
                                                                    </span>
                                                                </span>
                                                            }
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="14px"
                                                            fontWeight={450}
                                                            align="left"
                                                        />
                                                        <Inputfield
                                                            autoFocus={false}
                                                            value={formik.values.dob}
                                                            onChngeterm={(e) =>
                                                                formik.setFieldValue("dob", e.target.value)
                                                            }
                                                            onBlur={() => formik.setFieldTouched("dob", true)}
                                                            error={
                                                                formik.touched.dob &&
                                                                Boolean(formik.errors.dob)
                                                            }
                                                            helperText={
                                                                formik.touched.dob && formik.errors.dob
                                                            }
                                                            type="date"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                    <Box width="100%">
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={
                                                                <span>
                                                                    {t("Administrator Type")}
                                                                    {formik.values.administrator_type === "" && (
                                                                        <span
                                                                            style={{ color: "red", marginLeft: 4 }}
                                                                        >
                                                                            *
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            }
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="14px"
                                                            fontWeight={450}
                                                            align="left"
                                                        />
                                                        <SelectField
                                                            value={formik.values.administrator_type}
                                                            onChangeTerm={(e) =>
                                                                formik.setFieldValue(
                                                                    "administrator_type",
                                                                    e.target.value
                                                                )
                                                            }
                                                            options={[
                                                                { value: "individual", label: t("Individual") },
                                                                { value: "legal_entity", label: t("Legal Entity") },
                                                            ]}
                                                            error={
                                                                formik.touched.administrator_type &&
                                                                Boolean(formik.errors.administrator_type)
                                                            }
                                                            helperText={
                                                                formik.touched.administrator_type &&
                                                                formik.errors.administrator_type
                                                            }
                                                        />
                                                    </Box>
                                                </Box>

                                                <Box
                                                    display="flex"
                                                    flexDirection={{ xs: "column", md: "row" }}
                                                    gap={{ xs: 1.5, md: 2 }}
                                                >
                                                    <Box width="100%">
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={
                                                                <span>
                                                                    {t("Email")}
                                                                    {formik.values.email === "" && (
                                                                        <span
                                                                            style={{ color: "red", marginLeft: 4 }}
                                                                        >
                                                                            *
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            }
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="14px"
                                                            fontWeight={450}
                                                            align="left"
                                                        />
                                                        <Inputfield
                                                            autoFocus={false}
                                                            value={formik.values.email}
                                                            onChngeterm={(e) =>
                                                                formik.setFieldValue("email", e.target.value)
                                                            }
                                                            error={
                                                                formik.touched.email &&
                                                                Boolean(formik.errors.email)
                                                            }
                                                            helperText={
                                                                formik.touched.email && formik.errors.email
                                                            }
                                                            type="text"
                                                            variant="outlined"
                                                        />
                                                    </Box>
                                                    <Box width="100%">
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={
                                                                <span>
                                                                    {t("Phone No.")}
                                                                    {formik.values.phone_number === "" && (
                                                                        <span
                                                                            style={{ color: "red", marginLeft: 4 }}
                                                                        >
                                                                            *
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            }
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="14px"
                                                            fontWeight={450}
                                                            align="left"
                                                        />
                                                        <Countryfield
                                                            value={formik.values.phone_number}
                                                            onChangeTerm={(phone) =>
                                                                formik.setFieldValue("phone_number", phone)
                                                            }
                                                            error={
                                                                formik.touched.phone_number &&
                                                                Boolean(formik.errors.phone_number)
                                                            }
                                                            helperText={
                                                                formik.touched.phone_number && formik.errors.phone_number
                                                            }
                                                        />
                                                    </Box>
                                                </Box>

                                                {/* image */}
                                                <TypographyMD
                                                    variant="paragraph"
                                                    label={
                                                        <span>
                                                            {t("Image")}{" "}
                                                            <span style={{ color: "red", marginLeft: 4 }}>
                                                                *
                                                            </span>
                                                        </span>
                                                    }
                                                    color="#626F86"
                                                    marginBottom={1}
                                                    fontFamily="Roboto"
                                                    fontSize="14px"
                                                    fontWeight={450}
                                                    align="left"
                                                />

                                                <Box
                                                    sx={{
                                                        width: "100%",
                                                        height: { xs: "20vh", sm: "25vh" },
                                                        border: isDragging
                                                            ? "2px dashed #3f51b5"
                                                            : "2px dashed rgba(9, 30, 66, 0.14)",
                                                        borderRadius: "8px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        backgroundColor: isDragging ? "#e3f2fd" : "#F6F8FB",
                                                        position: "relative",
                                                        cursor: "pointer",
                                                        overflow: "hidden",
                                                        transition: "all 0.2s ease-in-out",
                                                    }}
                                                    onClick={() =>
                                                        document
                                                            .getElementById("image-upload-input")
                                                            .click()
                                                    }
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={handleDrop}
                                                >
                                                    <input
                                                        id="image-upload-input"
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: "none" }}
                                                        onChange={handleImageChange}
                                                    />

                                                    {!previewUrl ? (
                                                        <div style={{ display: "flex", gap: 5 }}>
                                                            <AttachFile
                                                                sx={{ color: "#626F86", fontSize: 17 }}
                                                            />
                                                            <TypographyMD
                                                                variant="paragraph"
                                                                label={
                                                                    <>
                                                                        {t("Drag file here or click to")}{" "}
                                                                        <span style={{ color: "#006EC2" }}>
                                                                            {t("browse")}
                                                                        </span>
                                                                    </>
                                                                }
                                                                color="#626F86"
                                                                fontFamily="Roboto"
                                                                fontSize="12px"
                                                                fontWeight={450}
                                                                align="left"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <img
                                                                src={previewUrl}
                                                                alt="preview"
                                                                style={{
                                                                    maxWidth: "100%",
                                                                    maxHeight: "100%",
                                                                    objectFit: "contain",
                                                                    borderRadius: "8px",
                                                                }}
                                                            />
                                                            <IconButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveImage();
                                                                }}
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: 2,
                                                                    right: 2,
                                                                    backgroundColor: "#fff",
                                                                    border: "1px solid #ccc",
                                                                    padding: "2px",
                                                                    zIndex: 10,
                                                                }}
                                                                size="small"
                                                            >
                                                                <Close fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </Box>

                                                {/* Administrator Document */}
                                                <TypographyMD
                                                    variant="paragraph"
                                                    label={
                                                        <span>
                                                            {t("Administrator Legal Document")}
                                                            <span style={{ color: "red", marginLeft: 4 }}>
                                                                *
                                                            </span>
                                                        </span>
                                                    }
                                                    color="#626F86"
                                                    marginBottom={1}
                                                    fontFamily="Roboto"
                                                    fontSize="14px"
                                                    fontWeight={450}
                                                    align="left"
                                                />

                                                <Box
                                                    sx={{
                                                        width: "100%",
                                                        height: { xs: "15vh", sm: "20vh" },
                                                        border: isDraggingAdminDoc
                                                            ? "2px dashed #3f51b5"
                                                            : "2px dashed rgba(9, 30, 66, 0.14)",
                                                        borderRadius: "8px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        backgroundColor: isDraggingAdminDoc
                                                            ? "#e3f2fd"
                                                            : "#F6F8FB",
                                                        position: "relative",
                                                        cursor: "pointer",
                                                        overflow: "hidden",
                                                        transition: "all 0.2s ease-in-out",
                                                    }}
                                                    onClick={() =>
                                                        document
                                                            .getElementById("admin-doc-upload-input")
                                                            .click()
                                                    }
                                                    onDragOver={handleDragOverAdminDoc}
                                                    onDragLeave={handleDragLeaveAdminDoc}
                                                    onDrop={handleDropAdminDoc}
                                                >
                                                    <input
                                                        id="admin-doc-upload-input"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        style={{ display: "none" }}
                                                        onChange={handleAdminDocChange}
                                                    />

                                                    {!previewAdminDoc ? (
                                                        <div style={{ display: "flex", gap: 5 }}>
                                                            <AttachFile
                                                                sx={{ color: "#626F86", fontSize: 17 }}
                                                            />
                                                            <TypographyMD
                                                                variant="paragraph"
                                                                label={
                                                                    <>
                                                                        {t("Drag file here or click to")}{" "}
                                                                        <span style={{ color: "#006EC2" }}>
                                                                            {t("browse")}
                                                                        </span>
                                                                    </>
                                                                }
                                                                color="#626F86"
                                                                fontFamily="Roboto"
                                                                fontSize="12px"
                                                                fontWeight={450}
                                                                align="left"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <TypographyMD
                                                                variant="paragraph"
                                                                label={adminDocFileName || t("Document uploaded")}
                                                                color="#626F86"
                                                                fontFamily="Roboto"
                                                                fontSize="12px"
                                                                fontWeight={450}
                                                                align="left"
                                                            />
                                                            <IconButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveAdminDoc();
                                                                }}
                                                                sx={{
                                                                    position: "absolute",
                                                                    top: 2,
                                                                    right: 2,
                                                                    backgroundColor: "#fff",
                                                                    border: "1px solid #ccc",
                                                                    padding: "2px",
                                                                    zIndex: 10,
                                                                }}
                                                                size="small"
                                                            >
                                                                <Close fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </Box>
                                            </div>

                                            {/* --- Company Details --- */}
                                            {formik.values.administrator_type && (
                                                <>
                                                    <TypographyMD
                                                        variant="paragraph"
                                                        label={t("Company Details")}
                                                        color="#000000"
                                                        fontFamily="Roboto"
                                                        fontSize="15px"
                                                        fontWeight={750}
                                                        align="left"
                                                    />

                                                    <div style={{ marginBottom: { xs: "8px", sm: "10px" }, marginTop: { xs: "10px", sm: "15px" } }}>
                                                        <Box
                                                            display="flex"
                                                            flexDirection={{ xs: "column", md: "row" }}
                                                            gap={{ xs: 1.5, md: 2 }}
                                                        >
                                                            <Box width="100%">
                                                                <TypographyMD
                                                                    variant="paragraph"
                                                                    label={
                                                                        <span>
                                                                            {formik.values.administrator_type === 'individual'
                                                                                ? t("Business Name")
                                                                                : t("Company Legal Name")}
                                                                            {formik.values.legal_name === "" && (
                                                                                <span
                                                                                    style={{ color: "red", marginLeft: 4 }}
                                                                                >
                                                                                    *
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    }
                                                                    color="#626F86"
                                                                    fontFamily="Roboto"
                                                                    fontSize="14px"
                                                                    fontWeight={450}
                                                                    align="left"
                                                                />
                                                                <Inputfield
                                                                    autoFocus={false}
                                                                    value={formik.values.legal_name}
                                                                    onChngeterm={(e) =>
                                                                        formik.setFieldValue(
                                                                            "legal_name",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    error={
                                                                        formik.touched.legal_name &&
                                                                        Boolean(formik.errors.legal_name)
                                                                    }
                                                                    helperText={
                                                                        formik.touched.legal_name &&
                                                                        formik.errors.legal_name
                                                                    }
                                                                    type="text"
                                                                    variant="outlined"
                                                                />
                                                            </Box>

                                                            {formik.values.administrator_type === 'legal_entity' && (
                                                                <Box width="100%">
                                                                    <TypographyMD
                                                                        variant="paragraph"
                                                                        label={t("Company Business Name")}
                                                                        color="#626F86"
                                                                        fontFamily="Roboto"
                                                                        fontSize="14px"
                                                                        fontWeight={450}
                                                                        align="left"
                                                                    />
                                                                    <Inputfield
                                                                        autoFocus={false}
                                                                        value={formik.values.trade_name}
                                                                        onChngeterm={(e) =>
                                                                            formik.setFieldValue(
                                                                                "trade_name",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        error={
                                                                            formik.touched.trade_name &&
                                                                            Boolean(formik.errors.trade_name)
                                                                        }
                                                                        helperText={
                                                                            formik.touched.trade_name &&
                                                                            formik.errors.trade_name
                                                                        }
                                                                        type="text"
                                                                        variant="outlined"
                                                                    />
                                                                </Box>
                                                            )}
                                                        </Box>

                                                        <Box
                                                            display="flex"
                                                            flexDirection={{ xs: "column", md: "row" }}
                                                            gap={{ xs: 1.5, md: 2 }}
                                                        >
                                                            <Box width="100%">
                                                                <TypographyMD
                                                                    variant="paragraph"
                                                                    label={
                                                                        <span>
                                                                            {t("Business Sector/Industry")}
                                                                            {formik.values.business_sector === "" && (
                                                                                <span
                                                                                    style={{ color: "red", marginLeft: 4 }}
                                                                                >
                                                                                    *
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    }
                                                                    color="#626F86"
                                                                    fontFamily="Roboto"
                                                                    fontSize="14px"
                                                                    fontWeight={450}
                                                                    align="left"
                                                                />
                                                                <SelectField
                                                                    value={formik.values.business_sector}
                                                                    onChangeTerm={(e) =>
                                                                        formik.setFieldValue(
                                                                            "business_sector",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    options={[
                                                                        {
                                                                            value: "field_services",
                                                                            label: t("Field Services"),
                                                                        },
                                                                        {
                                                                            value: "construction",
                                                                            label: t("Construction"),
                                                                        },
                                                                        {
                                                                            value: "delivery_logistics",
                                                                            label: t("Delivery & Logistics"),
                                                                        },
                                                                        { value: "retail", label: t("Retail") },
                                                                        {
                                                                            value: "healthcare_homecare",
                                                                            label: t("Healthcare & Home Care"),
                                                                        },
                                                                        {
                                                                            value: "security_services",
                                                                            label: t("Security Services"),
                                                                        },
                                                                        {
                                                                            value: "it_services_support",
                                                                            label: t("IT Services & Support"),
                                                                        },
                                                                        {
                                                                            value: "corporate_office",
                                                                            label: t("Corporate / Office Work"),
                                                                        },
                                                                        {
                                                                            value: "hospitality",
                                                                            label: t("Hospitality"),
                                                                        },
                                                                        {
                                                                            value: "education_training",
                                                                            label: t("Education & Training"),
                                                                        },
                                                                        {
                                                                            value: "government_public",
                                                                            label: t("Government & Public Services"),
                                                                        },
                                                                        { value: "other", label: t("Other") },
                                                                    ]}
                                                                    error={
                                                                        formik.touched.business_sector &&
                                                                        Boolean(formik.errors.business_sector)
                                                                    }
                                                                    helperText={
                                                                        formik.touched.business_sector &&
                                                                        formik.errors.business_sector
                                                                    }
                                                                />
                                                            </Box>

                                                            {formik.values.administrator_type === 'legal_entity' && (
                                                                <Box width="100%">
                                                                    <TypographyMD
                                                                        variant="paragraph"
                                                                        label={t("Company Registration No.")}
                                                                        color="#626F86"
                                                                        fontFamily="Roboto"
                                                                        fontSize="14px"
                                                                        fontWeight={450}
                                                                        align="left"
                                                                    />
                                                                    <Inputfield
                                                                        autoFocus={false}
                                                                        value={formik.values.company_registration_number}
                                                                        onChngeterm={(e) =>
                                                                            formik.setFieldValue(
                                                                                "company_registration_number",
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                        error={
                                                                            formik.touched.company_registration_number &&
                                                                            Boolean(formik.errors.company_registration_number)
                                                                        }
                                                                        helperText={
                                                                            formik.touched.company_registration_number &&
                                                                            formik.errors.company_registration_number
                                                                        }
                                                                        type="text"
                                                                        variant="outlined"
                                                                    />
                                                                </Box>
                                                            )}
                                                        </Box>

                                                        <Box
                                                            display="flex"
                                                            flexDirection={{ xs: "column", md: "row" }}
                                                            gap={{ xs: 1.5, md: 2 }}
                                                        >
                                                            <Box width="100%">
                                                                <TypographyMD
                                                                    variant="paragraph"
                                                                    label={
                                                                        <span>
                                                                            {t("Business Email")}
                                                                            {formik.values.business_email === "" && (
                                                                                <span
                                                                                    style={{ color: "red", marginLeft: 4 }}
                                                                                >
                                                                                    *
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    }
                                                                    color="#626F86"
                                                                    fontFamily="Roboto"
                                                                    fontSize="14px"
                                                                    fontWeight={450}
                                                                    align="left"
                                                                />
                                                                <Inputfield
                                                                    autoFocus={false}
                                                                    value={formik.values.business_email}
                                                                    onChngeterm={(e) =>
                                                                        formik.setFieldValue(
                                                                            "business_email",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    error={
                                                                        formik.touched.business_email &&
                                                                        Boolean(formik.errors.business_email)
                                                                    }
                                                                    helperText={
                                                                        formik.touched.business_email &&
                                                                        formik.errors.business_email
                                                                    }
                                                                    type="text"
                                                                    variant="outlined"
                                                                />
                                                            </Box>

                                                            <Box width="100%">
                                                                <TypographyMD
                                                                    variant="paragraph"
                                                                    label={
                                                                        <span>
                                                                            {t("Business Phone No.")}
                                                                            {formik.values.business_phone_number === "" && (
                                                                                <span
                                                                                    style={{ color: "red", marginLeft: 4 }}
                                                                                >
                                                                                    *
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    }
                                                                    color="#626F86"
                                                                    fontFamily="Roboto"
                                                                    fontSize="14px"
                                                                    fontWeight={450}
                                                                    align="left"
                                                                />
                                                                <Countryfield
                                                                    value={formik.values.business_phone_number}
                                                                    onChangeTerm={(business_phone_number) =>
                                                                        formik.setFieldValue(
                                                                            "business_phone_number",
                                                                            business_phone_number
                                                                        )
                                                                    }
                                                                    onBlur={() =>
                                                                        formik.setFieldTouched(
                                                                            "business_phone_number",
                                                                            true
                                                                        )
                                                                    }
                                                                    error={
                                                                        formik.touched.business_phone_number &&
                                                                        Boolean(formik.errors.business_phone_number)
                                                                    }
                                                                    helperText={
                                                                        formik.touched.business_phone_number &&
                                                                        formik.errors.business_phone_number
                                                                    }
                                                                />
                                                            </Box>
                                                        </Box>

                                                        <Box
                                                            display="flex"
                                                            flexDirection={{ xs: "column", md: "row" }}
                                                            gap={{ xs: 1.5, md: 2 }}
                                                        >
                                                            <Box width="100%">
                                                                <TypographyMD
                                                                    variant="paragraph"
                                                                    label={
                                                                        <span>
                                                                            {t("Business Type")}
                                                                            {formik.values.business_type === "" && (
                                                                                <span
                                                                                    style={{ color: "red", marginLeft: 4 }}
                                                                                >
                                                                                    *
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    }
                                                                    color="#626F86"
                                                                    fontFamily="Roboto"
                                                                    fontSize="14px"
                                                                    fontWeight={450}
                                                                    align="left"
                                                                />
                                                                <SelectField
                                                                    value={formik.values.business_type}
                                                                    onChangeTerm={(e) =>
                                                                        formik.setFieldValue(
                                                                            "business_type",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    options={[
                                                                        { value: "llc", label: t("LLC") },
                                                                        {
                                                                            value: "corporation",
                                                                            label: t("Corporation"),
                                                                        },
                                                                        {
                                                                            value: "partnership",
                                                                            label: t("Partnership"),
                                                                        },
                                                                        {
                                                                            value: "sole_proprietorship",
                                                                            label: t("Sole Proprietorship"),
                                                                        },
                                                                        {
                                                                            value: "cooperative",
                                                                            label: t("Cooperative"),
                                                                        },
                                                                        { value: "non_profit", label: t("Non-Profit") },
                                                                        { value: "other", label: t("Other") },
                                                                    ]}
                                                                    error={
                                                                        formik.touched.business_type &&
                                                                        Boolean(formik.errors.business_type)
                                                                    }
                                                                    helperText={
                                                                        formik.touched.business_type &&
                                                                        formik.errors.business_type
                                                                    }
                                                                />
                                                            </Box>
                                                        </Box>

                                                        <Box
                                                            display="flex"
                                                            flexDirection="column"
                                                            gap={1.5}
                                                        >
                                                            <Box width="100%">
                                                                <TypographyMD
                                                                    variant="paragraph"
                                                                    label={t("Business Activity")}
                                                                    color="#626F86"
                                                                    fontFamily="Roboto"
                                                                    fontSize="14px"
                                                                    fontWeight={450}
                                                                    align="left"
                                                                />
                                                                <Box
                                                                    component="div"
                                                                    contentEditable
                                                                    suppressContentEditableWarning={true}
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: formik.values.business_activity || ''
                                                                    }}
                                                                    onInput={(e) => {
                                                                        formik.setFieldValue("business_activity", e.target.innerHTML);
                                                                    }}
                                                                    onBlur={() => {
                                                                        formik.setFieldTouched("business_activity", true);
                                                                    }}
                                                                    sx={{
                                                                        minHeight: "120px",
                                                                        maxHeight: "200px",
                                                                        overflowY: "auto",
                                                                        p: 2,
                                                                        outline: "none",
                                                                        fontSize: "14px",
                                                                        fontFamily: "Roboto, sans-serif",
                                                                        lineHeight: 1.5,
                                                                        border: formik.touched.business_activity && formik.errors.business_activity
                                                                            ? "1px solid #d32f2f"
                                                                            : "1px solid #c4c4c4",
                                                                        borderRadius: "4px",
                                                                        backgroundColor: "#fff",
                                                                        "&:hover": {
                                                                            borderColor: formik.touched.business_activity && formik.errors.business_activity
                                                                                ? "#d32f2f"
                                                                                : "#1976d2",
                                                                        },
                                                                        "&:focus": {
                                                                            borderColor: formik.touched.business_activity && formik.errors.business_activity
                                                                                ? "#d32f2f"
                                                                                : "#1976d2",
                                                                            borderWidth: "2px",
                                                                        },
                                                                        "&:empty:before": {
                                                                            content: '"Enter business activity description..."',
                                                                            color: "#999",
                                                                            fontStyle: "italic",
                                                                        },
                                                                        "& p": {
                                                                            margin: "0 0 8px 0",
                                                                        },
                                                                        "& ul, & ol": {
                                                                            margin: "0 0 8px 0",
                                                                            paddingLeft: "20px",
                                                                        },
                                                                        "& li": {
                                                                            margin: "0 0 4px 0",
                                                                        },
                                                                    }}
                                                                />

                                                                {/* Error Message */}
                                                                {formik.touched.business_activity && formik.errors.business_activity && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="error"
                                                                        sx={{ mt: 0.5, ml: 1.5, display: "block" }}
                                                                    >
                                                                        {formik.errors.business_activity}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                            <Box width="100%">
                                                                <TypographyMD
                                                                    variant="paragraph"
                                                                    label={t("Business primary color")}
                                                                    color="#626F86"
                                                                    fontFamily="Roboto"
                                                                    fontSize="14px"
                                                                    fontWeight={450}
                                                                    align="left"
                                                                />
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <input
                                                                        type="color"
                                                                        value={formik.values.primary_color || '#1976d2'}
                                                                        onChange={(e) =>
                                                                            formik.setFieldValue("primary_color", e.target.value)
                                                                        }
                                                                        style={{
                                                                            width: "60px",
                                                                            height: "40px",
                                                                            border: "none",
                                                                            borderRadius: "4px",
                                                                            cursor: "pointer"
                                                                        }}
                                                                    />
                                                                    <Inputfield
                                                                        autoFocus={false}
                                                                        value={formik.values.primary_color || '#1976d2'}
                                                                        onChngeterm={(e) =>
                                                                            formik.setFieldValue("primary_color", e.target.value)
                                                                        }
                                                                        error={
                                                                            formik.touched.primary_color &&
                                                                            Boolean(formik.errors.primary_color)
                                                                        }
                                                                        helperText={
                                                                            formik.touched.primary_color &&
                                                                            formik.errors.primary_color
                                                                        }
                                                                        type="text"
                                                                        variant="outlined"
                                                                        style={{ flex: 1 }}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                            <Box width="100%">
                                                                <TypographyMD
                                                                    variant="paragraph"
                                                                    label={t("Business Secondary color")}
                                                                    color="#626F86"
                                                                    fontFamily="Roboto"
                                                                    fontSize="14px"
                                                                    fontWeight={450}
                                                                    align="left"
                                                                />
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <input
                                                                        type="color"
                                                                        value={formik.values.secondary_color || '#ff9800'}
                                                                        onChange={(e) =>
                                                                            formik.setFieldValue("secondary_color", e.target.value)
                                                                        }
                                                                        style={{
                                                                            width: "60px",
                                                                            height: "40px",
                                                                            border: "none",
                                                                            borderRadius: "4px",
                                                                            cursor: "pointer"
                                                                        }}
                                                                    />
                                                                    <Inputfield
                                                                        autoFocus={false}
                                                                        value={formik.values.secondary_color || '#ff9800'}
                                                                        onChngeterm={(e) =>
                                                                            formik.setFieldValue("secondary_color", e.target.value)
                                                                        }
                                                                        error={
                                                                            formik.touched.secondary_color &&
                                                                            Boolean(formik.errors.secondary_color)
                                                                        }
                                                                        helperText={
                                                                            formik.touched.secondary_color &&
                                                                            formik.errors.secondary_color
                                                                        }
                                                                        type="text"
                                                                        variant="outlined"
                                                                        style={{ flex: 1 }}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                        </Box>

                                                        {/* Business Address (for both individual and legal entities) */}


                                                        {/* logo */}
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={
                                                                <span>
                                                                    {t("Logo")}{" "}
                                                                    <span style={{ color: "red", marginLeft: 4 }}>
                                                                        *
                                                                    </span>
                                                                </span>
                                                            }
                                                            color="#626F86"
                                                            marginBottom={1}
                                                            fontFamily="Roboto"
                                                            fontSize="14px"
                                                            fontWeight={450}
                                                            align="left"
                                                        />

                                                        <Box
                                                            sx={{
                                                                width: "100%",
                                                                height: { xs: "20vh", sm: "25vh" },
                                                                border: isDraggingLogo
                                                                    ? "2px dashed #3f51b5"
                                                                    : "2px dashed rgba(9, 30, 66, 0.14)",
                                                                borderRadius: "8px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                backgroundColor: isDraggingLogo
                                                                    ? "#e3f2fd"
                                                                    : "#F6F8FB",
                                                                position: "relative",
                                                                cursor: uploading ? "not-allowed" : "pointer",
                                                                overflow: "hidden",
                                                                transition: "all 0.2s ease-in-out",
                                                            }}
                                                            onClick={() => !uploading && document.getElementById("logo-upload-input").click()}
                                                            onDragOver={handleDragOverLogo}
                                                            onDragLeave={handleDragLeaveLogo}
                                                            onDrop={handleDropLogo}
                                                        >
                                                            <input
                                                                id="logo-upload-input"
                                                                type="file"
                                                                accept="image/*"
                                                                style={{ display: "none" }}
                                                                onChange={handleLogoChange}
                                                            />

                                                            {!previewLogo ? (
                                                                <div style={{ display: "flex", gap: 5 }}>
                                                                    <AttachFile
                                                                        sx={{ color: "#626F86", fontSize: 17 }}
                                                                    />
                                                                    <TypographyMD
                                                                        variant="paragraph"
                                                                        label={
                                                                            <>
                                                                                {t("Drag file here or click to")}{" "}
                                                                                <span style={{ color: "#006EC2" }}>
                                                                                    {t("browse")}
                                                                                </span>
                                                                            </>
                                                                        }
                                                                        color="#626F86"
                                                                        fontFamily="Roboto"
                                                                        fontSize="12px"
                                                                        fontWeight={450}
                                                                        align="left"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <img
                                                                        crossOrigin="anonymous"
                                                                        src={previewLogo}
                                                                        alt="preview"
                                                                        style={{
                                                                            maxWidth: "100%",
                                                                            maxHeight: "100%",
                                                                            objectFit: "contain",
                                                                            borderRadius: "8px",
                                                                        }}
                                                                    />
                                                                    <IconButton
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRemoveLogo();
                                                                        }}
                                                                        sx={{
                                                                            position: "absolute",
                                                                            top: 2,
                                                                            right: 2,
                                                                            backgroundColor: "#fff",
                                                                            border: "1px solid #ccc",
                                                                            padding: "2px",
                                                                            zIndex: 10,
                                                                        }}
                                                                        size="small"
                                                                    >
                                                                        <Close fontSize="small" />
                                                                    </IconButton>
                                                                </>
                                                            )}

                                                            {uploading && (
                                                                <Box sx={{
                                                                    position: "absolute",
                                                                    inset: 0,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                                                                    borderRadius: "8px"
                                                                }}>
                                                                    <CircularProgress size={28} />
                                                                </Box>
                                                            )}
                                                        </Box>

                                                        {/* Company Document (only for legal entities) */}
                                                        {formik.values.administrator_type === 'legal_entity' && (
                                                            <>
                                                                <TypographyMD
                                                                    variant="paragraph"
                                                                    label={
                                                                        <span>
                                                                            {t("Company Legal Document")}
                                                                            <span style={{ color: "red", marginLeft: 4 }}>
                                                                                *
                                                                            </span>
                                                                        </span>
                                                                    }
                                                                    color="#626F86"
                                                                    marginBottom={1}
                                                                    fontFamily="Roboto"
                                                                    fontSize="14px"
                                                                    fontWeight={450}
                                                                    align="left"
                                                                />

                                                                <Box
                                                                    sx={{
                                                                        width: "100%",
                                                                        height: { xs: "15vh", sm: "20vh" },
                                                                        border: isDraggingCompanyDoc
                                                                            ? "2px dashed #3f51b5"
                                                                            : "2px dashed rgba(9, 30, 66, 0.14)",
                                                                        borderRadius: "8px",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        backgroundColor: isDraggingCompanyDoc
                                                                            ? "#e3f2fd"
                                                                            : "#F6F8FB",
                                                                        position: "relative",
                                                                        cursor: "pointer",
                                                                        overflow: "hidden",
                                                                        transition: "all 0.2s ease-in-out",
                                                                    }}
                                                                    onClick={() =>
                                                                        document
                                                                            .getElementById("company-doc-upload-input")
                                                                            .click()
                                                                    }
                                                                    onDragOver={handleDragOverCompanyDoc}
                                                                    onDragLeave={handleDragLeaveCompanyDoc}
                                                                    onDrop={handleDropCompanyDoc}
                                                                >
                                                                    <input
                                                                        id="company-doc-upload-input"
                                                                        type="file"
                                                                        accept=".pdf,.doc,.docx"
                                                                        style={{ display: "none" }}
                                                                        onChange={handleCompanyDocChange}
                                                                    />

                                                                    {!previewCompanyDoc ? (
                                                                        <div style={{ display: "flex", gap: 5 }}>
                                                                            <AttachFile
                                                                                sx={{ color: "#626F86", fontSize: 17 }}
                                                                            />
                                                                            <TypographyMD
                                                                                variant="paragraph"
                                                                                label={
                                                                                    <>
                                                                                        {t("Drag file here or click to")}{" "}
                                                                                        <span style={{ color: "#006EC2" }}>
                                                                                            {t("browse")}
                                                                                        </span>
                                                                                    </>
                                                                                }
                                                                                color="#626F86"
                                                                                fontFamily="Roboto"
                                                                                fontSize="12px"
                                                                                fontWeight={450}
                                                                                align="left"
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <TypographyMD
                                                                                variant="paragraph"
                                                                                label={companyDocFileName || t("Document uploaded")}
                                                                                color="#626F86"
                                                                                fontFamily="Roboto"
                                                                                fontSize="12px"
                                                                                fontWeight={450}
                                                                                align="left"
                                                                            />
                                                                            <IconButton
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleRemoveCompanyDoc();
                                                                                }}
                                                                                sx={{
                                                                                    position: "absolute",
                                                                                    top: 2,
                                                                                    right: 2,
                                                                                    backgroundColor: "#fff",
                                                                                    border: "1px solid #ccc",
                                                                                    padding: "2px",
                                                                                    zIndex: 10,
                                                                                }}
                                                                                size="small"
                                                                            >
                                                                                <Close fontSize="small" />
                                                                            </IconButton>
                                                                        </>
                                                                    )}
                                                                </Box>
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {/* --- Address Details --- */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: { xs: 8, sm: 12 },
                                                }}
                                            >
                                                {/* Header with title and checkbox */}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <div
                                                        style={{ display: "flex", flexDirection: "column" }}
                                                    >
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Address Details")}
                                                            color="#000000"
                                                            fontFamily="Roboto"
                                                            fontSize="15px"
                                                            fontWeight={750}
                                                            align="left"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Map component - only show when manual address is false */}
                                                {!manualAddress && (
                                                    <Box sx={{ position: "relative" }}>
                                                        <LocationPicker
                                                            formik={formik}
                                                            height="300px"
                                                            width="100%"
                                                        />
                                                    </Box>
                                                )}

                                                {/* Manual Address Checkbox */}
                                                <Box sx={{ mt: 3, mb: 2 }}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <input
                                                            type="checkbox"
                                                            id="manualAddress"
                                                            checked={manualAddress}
                                                            onChange={(e) => {
                                                                const isChecked = e.target.checked;
                                                                setManualAddress(isChecked);

                                                                // Clear form fields when manual address is enabled
                                                                if (isChecked) {
                                                                    formik.setFieldValue("country", "");
                                                                    formik.setFieldValue("province", "");
                                                                    formik.setFieldValue("city", "");
                                                                    formik.setFieldValue("street", "");
                                                                    formik.setFieldValue("postal_code", "");
                                                                    formik.setFieldValue("community", "");
                                                                    formik.setFieldValue("latitude", null);
                                                                    formik.setFieldValue("longitude", null);

                                                                    // Reset manual address dropdowns
                                                                    setSelectedCountry("");
                                                                    setSelectedState("");
                                                                    setSelectedCity("");
                                                                    setStates([]);
                                                                    setCities([]);
                                                                    setMapPosition(null);
                                                                    setMapKey(prev => prev + 1);
                                                                } else {
                                                                    // Reset to current location when unchecked
                                                                    if (navigator.geolocation) {
                                                                        navigator.geolocation.getCurrentPosition(
                                                                            (position) => {
                                                                                const coords = {
                                                                                    lat: position.coords.latitude,
                                                                                    lng: position.coords.longitude
                                                                                };
                                                                                setMapPosition(coords);
                                                                                formik.setFieldValue("latitude", coords.lat);
                                                                                formik.setFieldValue("longitude", coords.lng);
                                                                            },
                                                                            (error) => {
                                                                                // If geolocation fails, set default location
                                                                                const defaultCoords = { lat: 33.6844, lng: 73.0479 };
                                                                                setMapPosition(defaultCoords);
                                                                                formik.setFieldValue("latitude", defaultCoords.lat);
                                                                                formik.setFieldValue("longitude", defaultCoords.lng);
                                                                            }
                                                                        );
                                                                    } else {
                                                                        // Fallback to default location
                                                                        const defaultCoords = { lat: 33.6844, lng: 73.0479 };
                                                                        setMapPosition(defaultCoords);
                                                                        formik.setFieldValue("latitude", defaultCoords.lat);
                                                                        formik.setFieldValue("longitude", defaultCoords.lng);
                                                                    }
                                                                }
                                                            }}
                                                            style={{ width: 18, height: 18 }}
                                                        />
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Manual Address")}
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="14px"
                                                            fontWeight={450}
                                                            align="left"
                                                        />
                                                    </Box>
                                                </Box>

                                                {/* Manual Address Dropdowns */}
                                                {manualAddress && (
                                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Manual Address Selection")}
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="16px"
                                                            fontWeight={600}
                                                            align="left"
                                                        />

                                                        {/* Country Dropdown */}
                                                        <Box>
                                                            <TypographyMD
                                                                variant="paragraph"
                                                                label={
                                                                    <span>
                                                                        {t("Country")}
                                                                        <span style={{ color: "red", marginLeft: 4 }}>*</span>
                                                                    </span>
                                                                }
                                                                color="#626F86"
                                                                fontFamily="Roboto"
                                                                fontSize="14px"
                                                                fontWeight={450}
                                                                align="left"
                                                            />
                                                            <FormControl fullWidth size="small">
                                                                <Select
                                                                    value={selectedCountry}
                                                                    onChange={(e) => handleCountryChange(e.target.value)}
                                                                    disabled={loadingManualCountries}
                                                                    displayEmpty
                                                                    input={<OutlinedInput />}
                                                                >
                                                                    <MenuItem value="" disabled>
                                                                        {loadingManualCountries ? "Loading countries..." : "Select Country"}
                                                                    </MenuItem>
                                                                    {manualCountries.map((country) => (
                                                                        <MenuItem key={country} value={country}>
                                                                            {country}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </Box>

                                                        {/* State/Province Dropdown */}
                                                        <Box>
                                                            <TypographyMD
                                                                variant="paragraph"
                                                                label={
                                                                    <span>
                                                                        {t("Province/State")}
                                                                        <span style={{ color: "red", marginLeft: 4 }}>*</span>
                                                                    </span>
                                                                }
                                                                color="#626F86"
                                                                fontFamily="Roboto"
                                                                fontSize="14px"
                                                                fontWeight={450}
                                                                align="left"
                                                            />
                                                            <FormControl fullWidth size="small">
                                                                <Select
                                                                    value={selectedState}
                                                                    onChange={(e) => handleStateChange(e.target.value)}
                                                                    disabled={!selectedCountry || loadingStates}
                                                                    displayEmpty
                                                                    input={<OutlinedInput />}
                                                                >
                                                                    <MenuItem value="" disabled>
                                                                        {!selectedCountry ? "Select Country First" :
                                                                            loadingStates ? "Loading states..." : "Select Province/State"}
                                                                    </MenuItem>
                                                                    {states.map((state) => (
                                                                        <MenuItem key={state} value={state}>
                                                                            {state}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </Box>

                                                        {/* City Dropdown */}
                                                        <Box>
                                                            <TypographyMD
                                                                variant="paragraph"
                                                                label={
                                                                    <span>
                                                                        {t("City")}
                                                                        <span style={{ color: "red", marginLeft: 4 }}>*</span>
                                                                    </span>
                                                                }
                                                                color="#626F86"
                                                                fontFamily="Roboto"
                                                                fontSize="14px"
                                                                fontWeight={450}
                                                                align="left"
                                                            />
                                                            <FormControl fullWidth size="small">
                                                                <Select
                                                                    value={selectedCity}
                                                                    onChange={(e) => handleCityChange(e.target.value)}
                                                                    disabled={!selectedState || loadingCities}
                                                                    displayEmpty
                                                                    input={<OutlinedInput />}
                                                                >
                                                                    <MenuItem value="" disabled>
                                                                        {!selectedState ? "Select Province/State First" :
                                                                            loadingCities ? "Loading cities..." : "Select City"}
                                                                    </MenuItem>
                                                                    {cities.map((city) => (
                                                                        <MenuItem key={city} value={city}>
                                                                            {city}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </Box>

                                                        {/* Business Address Field */}
                                                        <Box>
                                                            <TypographyMD
                                                                variant="paragraph"
                                                                label={t("Business Address")}
                                                                color="#626F86"
                                                                fontFamily="Roboto"
                                                                fontSize="14px"
                                                                fontWeight={450}
                                                                align="left"
                                                            />
                                                            <Inputfield
                                                                autoFocus={false}
                                                                value={formik.values.business_address}
                                                                onChngeterm={(e) =>
                                                                    formik.setFieldValue("business_address", e.target.value)
                                                                }
                                                                error={
                                                                    formik.touched.business_address &&
                                                                    Boolean(formik.errors.business_address)
                                                                }
                                                                helperText={
                                                                    formik.touched.business_address && formik.errors.business_address
                                                                }
                                                                type="text"
                                                                variant="outlined"
                                                            // multiline
                                                            // rows={3}

                                                            />
                                                        </Box>

                                                        {/* Current Address Display */}
                                                        {/* {selectedCountry && selectedState && selectedCity && (
                              <Box sx={{ 
                                mt: 2, 
                                p: 2, 
                                backgroundColor: "#f5f5f5", 
                                borderRadius: 1,
                                border: "1px solid #e0e0e0"
                              }}>
                                <TypographyMD
                                  variant="paragraph"
                                  label="📍 Selected Address:"
                                  color="#626F86"
                                  fontFamily="Roboto"
                                  fontSize="14px"
                                  fontWeight={600}
                                  align="left"
                                />
                                <TypographyMD
                                  variant="paragraph"
                                  label={`${selectedCity}, ${selectedState}, ${selectedCountry}`}
                                  color="#333"
                                  fontFamily="Roboto"
                                  fontSize="14px"
                                  fontWeight={400}
                                  align="left"
                                  sx={{ mt: 0.5 }}
                                />
                                {formik.values.latitude && formik.values.longitude && (
                                  <TypographyMD
                                    variant="paragraph"
                                    label={`Coordinates: ${formik.values.latitude.toFixed(6)}, ${formik.values.longitude.toFixed(6)}`}
                                    color="#666"
                                    fontFamily="Roboto"
                                    fontSize="12px"
                                    fontWeight={400}
                                    align="left"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            )} */}
                                                    </Box>
                                                )}

                                                {/* Optional: display selected fields */}
                                            </div>

                                            {/* <div style={{ marginBottom: "5px", marginTop: "10px" }}>
                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", md: "row" }}
                          gap={{ xs: 1.5, md: 2 }}
                        >
                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("Country")}
                                  {formik.values.country === "" && (
                                    <span
                                      style={{ color: "red", marginLeft: 4 }}
                                    >
                                      *
                                    </span>
                                  )}
                                </span>
                              }
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="14px"
                              fontWeight={450}
                              align="left"
                            />
                            <SelectField
                              country // 👈 enables the search bar
                              value={formik.values.country}
                              onChangeTerm={(e) =>
                                formik.setFieldValue("country", e.target.value)
                              }
                              options={countries.map((country) => ({
                                value: country.cca2,
                                label: t(country.name.common),
                                flag: country.flags?.png, // safely access flag
                              }))}
                              error={
                                formik.touched.country &&
                                Boolean(formik.errors.country)
                              }
                              helperText={
                                formik.touched.country && formik.errors.country
                              }
                            />
                          </Box>

                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("Province")}
                                  {formik.values.province === "" && (
                                    <span
                                      style={{ color: "red", marginLeft: 4 }}
                                    >
                                      *
                                    </span>
                                  )}
                                </span>
                              }
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="14px"
                              fontWeight={450}
                              align="left"
                            />
                            <Inputfield
                              autoFocus={false}
                              value={formik.values.province}
                              onChngeterm={(e) =>
                                formik.setFieldValue("province", e.target.value)
                              }
                              error={
                                formik.touched.province &&
                                Boolean(formik.errors.province)
                              }
                              helperText={
                                formik.touched.province &&
                                formik.errors.province
                              }
                              type="text"
                              variant="outlined"
                            />
                          </Box>
                        </Box>

                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", md: "row" }}
                          gap={{ xs: 1.5, md: 2 }}
                        >
                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("Postal Code")}
                                  {formik.values.postal_code === "" && (
                                    <span
                                      style={{ color: "red", marginLeft: 4 }}
                                    >
                                      *
                                    </span>
                                  )}
                                </span>
                              }
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="14px"
                              fontWeight={450}
                              align="left"
                            />
                            <SelectField
                              value={formik.values.postal_code}
                              onChangeTerm={(e) =>
                                formik.setFieldValue(
                                  "postal_code",
                                  e.target.value
                                )
                              }
                              options={[
                                { value: "1000", label: "1000" },
                                { value: "2000", label: "2000" },
                                { value: "3000", label: "3000" },
                                { value: "4000", label: "4000" },
                              ]}
                              error={
                                formik.touched.postal_code &&
                                Boolean(formik.errors.postal_code)
                              }
                              helperText={
                                formik.touched.postal_code &&
                                formik.errors.postal_code
                              }
                            />
                          </Box>

                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={t("Community")}
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="14px"
                              fontWeight={450}
                              align="left"
                            />
                            <Inputfield
                              autoFocus={false}
                              value={formik.values.community}
                              onChngeterm={(e) =>
                                formik.setFieldValue(
                                  "community",
                                  e.target.value
                                )
                              }
                              error={
                                formik.touched.community &&
                                Boolean(formik.errors.community)
                              }
                              helperText={
                                formik.touched.community &&
                                formik.errors.community
                              }
                              type="text"
                              variant="outlined"
                            />
                          </Box>
                        </Box>

                        <Box
                          display="flex"
                          flexDirection={{ xs: "column", md: "row" }}
                          gap={{ xs: 1.5, md: 2 }}
                        >
                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={
                                <span>
                                  {t("City")}
                                  {formik.values.city === "" && (
                                    <span
                                      style={{ color: "red", marginLeft: 4 }}
                                    >
                                      *
                                    </span>
                                  )}
                                </span>
                              }
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="14px"
                              fontWeight={450}
                              align="left"
                            />
                            <Inputfield
                              autoFocus={false}
                              value={formik.values.city}
                              onChngeterm={(e) =>
                                formik.setFieldValue("city", e.target.value)
                              }
                              error={
                                formik.touched.city &&
                                Boolean(formik.errors.city)
                              }
                              helperText={
                                formik.touched.city && formik.errors.city
                              }
                              type="text"
                              variant="outlined"
                            />
                          </Box>

                          <Box width="100%">
                            <TypographyMD
                              variant="paragraph"
                              label={t("Street Address")}
                              color="#626F86"
                              fontFamily="Roboto"
                              fontSize="14px"
                              fontWeight={450}
                              align="left"
                            />
                            <Inputfield
                              autoFocus={false}
                              value={formik.values.street}
                              onChngeterm={(e) =>
                                formik.setFieldValue("street", e.target.value)
                              }
                              error={
                                formik.touched.street &&
                                Boolean(formik.errors.street)
                              }
                              helperText={
                                formik.touched.street && formik.errors.street
                              }
                              type="text"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </div> */}

                                            {/* --- Additional Details --- */}
                                            <TypographyMD
                                                variant="paragraph"
                                                label={t("Additional Details")}
                                                color="#000000"
                                                fontFamily="Roboto"
                                                fontSize="15px"
                                                fontWeight={750}
                                                align="left"
                                            />

                                            <div style={{ marginBottom: { xs: "3px", sm: "5px" }, marginTop: { xs: "8px", sm: "10px" } }}>
                                                <TypographyMD
                                                    variant="paragraph"
                                                    label={
                                                        <span>
                                                            {t("Region Code / Zone")}
                                                            {formik.values.region === "" && (
                                                                <span style={{ color: "red", marginLeft: 4 }}>
                                                                    *
                                                                </span>
                                                            )}
                                                        </span>
                                                    }
                                                    color="#626F86"
                                                    fontFamily="Roboto"
                                                    fontSize="14px"
                                                    fontWeight={450}
                                                    align="left"
                                                />
                                                <SelectField
                                                    value={formik.values.region}
                                                    onChangeTerm={(e) =>
                                                        formik.setFieldValue("region", e.target.value)
                                                    }
                                                    options={[
                                                        { value: "north", label: t("North Zone") },
                                                        { value: "south", label: t("South Zone") },
                                                        { value: "east", label: t("East Zone") },
                                                        { value: "west", label: t("West Zone") },
                                                        { value: "central", label: t("Central Zone") },
                                                        {
                                                            value: "north_east",
                                                            label: t("North-East Zone"),
                                                        },
                                                        {
                                                            value: "north_west",
                                                            label: t("North-West Zone"),
                                                        },
                                                        {
                                                            value: "south_east",
                                                            label: t("South-East Zone"),
                                                        },
                                                        {
                                                            value: "south_west",
                                                            label: t("South-West Zone"),
                                                        },
                                                        { value: "islands", label: t("Islands Zone") },
                                                        {
                                                            value: "middle_east",
                                                            label: t("Middle-East Zone"),
                                                        },
                                                        { value: "caribbean", label: t("Caribbean Zone") },
                                                    ]}
                                                    error={
                                                        formik.touched.region &&
                                                        Boolean(formik.errors.region)
                                                    }
                                                    helperText={
                                                        formik.touched.region && formik.errors.region
                                                    }
                                                />

                                                <TypographyMD
                                                    variant="paragraph"
                                                    label={
                                                        <span>
                                                            {t("Account Executive Association")}
                                                            {formik.values.account_executives === "" && (
                                                                <span style={{ color: "red", marginLeft: 4 }}>
                                                                    *
                                                                </span>
                                                            )}
                                                        </span>
                                                    }
                                                    color="#626F86"
                                                    fontFamily="Roboto"
                                                    fontSize="14px"
                                                    fontWeight={450}
                                                    align="left"
                                                />
                                                <SearchableDropdown
                                                    value={formik.values.account_executives}
                                                    onChange={(val) => {
                                                        formik.setFieldValue("account_executives", val);
                                                    }}
                                                    options={accountExecutives
                                                        .slice()
                                                        .sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""))
                                                        .map((executive) => ({
                                                            id: executive.id,
                                                            name: `${executive.full_name} (${executive.email})`,
                                                        }))}
                                                    placeholder={t("Select Account Executive")}
                                                    disabled={accountExecutives.length === 0}
                                                />
                                                {formik.touched.account_executives && formik.errors.account_executives && (
                                                    <Box sx={{ mt: 0.5, fontSize: 12, color: "#d32f2f" }}>
                                                        {formik.errors.account_executives}
                                                    </Box>
                                                )}
                                                {/* is ko api hasil kar rhe hy removeka mam sy pochna */}
                                                <TypographyMD
                                                    variant="paragraph"
                                                    label={
                                                        <span>
                                                            {t("Subscription Type")}
                                                            {formik.values.subscription_type === "" && (
                                                                <span style={{ color: "red", marginLeft: 4 }}>
                                                                    *
                                                                </span>
                                                            )}
                                                        </span>
                                                    }
                                                    color="#626F86"
                                                    fontFamily="Roboto"
                                                    fontSize="14px"
                                                    fontWeight={450}
                                                    align="left"
                                                />
                                                <SelectField
                                                    value={formik.values.subscription_type}
                                                    onChangeTerm={(e) =>
                                                        formik.setFieldValue(
                                                            "subscription_type",
                                                            e.target.value
                                                        )
                                                    }
                                                    options={[
                                                        { value: "free", label: t("Free") },
                                                        { value: "trial", label: t("Trial") },
                                                        { value: "basic", label: t("Basic") },
                                                        { value: "premium", label: t("Premium") },
                                                        { value: "enterprise", label: t("Enterprise") },
                                                    ]}
                                                    error={
                                                        formik.touched.subscription_type &&
                                                        Boolean(formik.errors.subscription_type)
                                                    }
                                                    helperText={
                                                        formik.touched.subscription_type &&
                                                        formik.errors.subscription_type
                                                    }
                                                />
                                            </div>
                                        </Box>
                                    </div>
                                </Grid>
                            </Grid>
                        </Box>

                        <Box
                            sx={{
                                position: "sticky",
                                bottom: 0,
                                backgroundColor: "#fff",
                                py: { xs: 1.5, sm: 1 },
                                px: { xs: 2, sm: 1 },
                                zIndex: 1,
                            }}
                        >
                            {/* Test button */}


                            <ButtonMD
                                variant="contained"
                                title={t("Save & Send Invite")}
                                startIcon={<CheckCircleOutline />}
                                width={{ xs: "100%", sm: "fit-content" }}
                                type="submit"
                                borderColor="orange"
                                backgroundColor="orange"
                                borderRadius="5px"
                                disabled={loading}
                                onClickTerm={(e) => {
                                    console.log("Save button clicked");
                                    console.log("Form is valid:", formik.isValid);
                                    console.log("Form errors:", formik.errors);
                                    console.log("Form values:", formik.values);
                                    console.log("Form touched:", formik.touched);

                                    // Don't manually call formik.handleSubmit() since type="submit" will handle it
                                    // Just validate and show errors if invalid
                                    if (!formik.isValid) {
                                        console.log("Form is invalid, showing validation errors");
                                        // Touch all fields to show validation errors
                                        formik.setTouched({
                                            first_name: true,
                                            last_name: true,
                                            email: true,
                                            phone_number: true,
                                            legal_name: true,
                                            business_sector: true,
                                            business_email: true,
                                            business_phone_number: true,
                                            region: true,
                                            account_executives: true,
                                            subscription_type: true,
                                        });
                                    }
                                }}
                            />
                        </Box>
                    </form>
                }
            />

            <ModalConfirmation
                open={openModalStatusChange}
                onClose={() => setOpenModalStatusChange(false)}
                title="Update Status"
                data={
                    <>
                        <div style={{ backgroundColor: "#fff", margin: 13 }}>
                            <Grid container spacing={0} p={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                                <Grid xs={12} align="center">
                                    <Stack align="center" direction="column" spacing={2} pb={3}>
                                        <img
                                            src={confirmation_icon}
                                            alt="..."
                                            style={{ alignSelf: "center", width: "100px" }}
                                        />
                                        <TypographyMD
                                            variant="paragraph"
                                            label={
                                                statusToChange === "active"
                                                    ? "Are you sure you want to active this company?"
                                                    : statusToChange === "inactive"
                                                        ? "Are you sure you want to inactive this company?"
                                                        : statusToChange === "invited"
                                                            ? "Are you sure you want to invite this company?"
                                                            : statusToChange === "requested"
                                                                ? "Are you sure you want to send request this company?"
                                                                : "Are you sure you want to perform this action?"
                                            }
                                            color="#181818"
                                            marginLeft={0}
                                            fontSize="13px"
                                            fontWeight={650}
                                            align="center"
                                        />
                                    </Stack>
                                </Grid>

                                <Grid xs={12} align="center">
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignContent: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <ButtonMD
                                            variant="outlined"
                                            title="Cancel"
                                            width="fit-content"
                                            type="submit"
                                            borderColor="borderColor"
                                            backgroundColor="orange"
                                            borderRadius="5px"
                                            onClickTerm={() => setOpenModalStatusChange(false)}
                                        />

                                        <ButtonMD
                                            variant="contained"
                                            title={
                                                statusToChange === "active"
                                                    ? "Active"
                                                    : statusToChange === "inactive"
                                                        ? "Inactive"
                                                        : statusToChange === "invited"
                                                            ? "Invited"
                                                            : "Request"
                                            }
                                            width="fit-content"
                                            type="submit"
                                            borderColor="orange"
                                            backgroundColor="orange"
                                            borderRadius="5px"
                                            disabled={loading}
                                            onClickTerm={() => confirmStatusChange()}
                                        />
                                    </div>
                                </Grid>
                            </Grid>
                        </div>
                    </>
                }
            />

            {/* verification modal confirmation */}
            <ModalConfirmation
                open={openModalVerificationStatusChange}
                onClose={() => setOpenModalVerificationStatusChange(false)}
                title="Update Verification Status"
                data={
                    <div style={{ backgroundColor: "#fff", margin: 13 }}>
                        <Grid container spacing={0} p={{ xs: 2, md: 3, lg: 3, xl: 3 }}>
                            <Grid xs={12} align="center">
                                <Stack align="center" direction="column" spacing={2} pb={3}>
                                    <img
                                        src={confirmation_icon}
                                        alt="..."
                                        style={{ alignSelf: "center", width: "100px" }}
                                    />
                                    <TypographyMD
                                        variant="paragraph"
                                        label={t(
                                            "Are you sure you want to mark this user as {{status}}?",
                                            {
                                                status: t(verificationStatusToChange),
                                            }
                                        )}
                                        color="#181818"
                                        marginLeft={0}
                                        fontSize="13px"
                                        fontWeight={650}
                                        align="center"
                                    />
                                </Stack>
                            </Grid>

                            <Grid xs={12} align="center">
                                <div
                                    style={{ display: "flex", justifyContent: "center", gap: 10 }}
                                >
                                    <ButtonMD
                                        variant="outlined"
                                        title="Cancel"
                                        width="fit-content"
                                        type="submit"
                                        borderColor="borderColor"
                                        backgroundColor="orange"
                                        borderRadius="5px"
                                        onClickTerm={() =>
                                            setOpenModalVerificationStatusChange(false)
                                        }
                                    />
                                    <ButtonMD
                                        variant="contained"
                                        title={verificationStatusToChange}
                                        width="fit-content"
                                        type="submit"
                                        borderColor="orange"
                                        backgroundColor="orange"
                                        borderRadius="5px"
                                        disabled={loading}
                                        onClickTerm={confirmVerificationStatusChange}
                                    />
                                </div>
                            </Grid>
                        </Grid>
                    </div>
                }
            />
            <LocationHelperModal
                open={open}
                onClose={() => setOpen(false)}
                onRefresh={() => {
                    window.location.reload();
                }}
                onManual={() => {
                    // your manual flow here
                    setOpen(false);
                }}
            />

            {/* Filter Modal */}
            <ModalAdd
                open={openModalFilter}
                onClose={() => setOpenModalFilter(false)}
                title={t("Filter")}
                data={
                    <form
                        style={{ backgroundColor: "#fff", margin: 13 }}
                        onSubmit={handleFilterSubmit}
                    >
                        <Box
                            sx={{
                                maxHeight: { xs: "100dvh", md: "91vh" },
                                overflowY: "auto",
                                px: 1,
                                pb: 3,
                            }}
                        >
                            <Grid container spacing={0}>
                                <Grid xs={12} align="left">
                                    <div>
                                        <Box
                                            sx={{ marginTop: "15px", marginBottom: "30px" }}
                                            width={{ xs: "97%", md: "100%" }}
                                        >
                                            {/* --- Status --- */}
                                            <TypographyMD
                                                variant="paragraph"
                                                label={t("Status")}
                                                color="#000000"
                                                fontFamily="Roboto"
                                                fontSize="15px"
                                                fontWeight={750}
                                                align="left"
                                            />

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: { xs: 1, sm: 1.5, md: 1 },
                                                    marginBottom: "15px",
                                                    marginTop: "10px",
                                                }}
                                            >
                                                {["All", "Active", "Inactive", "Invited", "Requested"].map((status) => (
                                                    <Box
                                                        key={status}
                                                        onClick={() => setDraftStatus(status.toLowerCase())}
                                                        sx={{
                                                            display: "flex",
                                                            padding: { xs: "6px 10px", sm: "5px 11px", md: "4px 12px" },
                                                            borderRadius: "5px",
                                                            border: `2px solid ${draftStatus === status.toLowerCase() ? "#006EC2" : "#ccc"
                                                                }`,
                                                            backgroundColor: "transparent",
                                                            cursor: "pointer",
                                                            width: "fit-content",
                                                            transition: "all 0.3s ease",
                                                            minWidth: { xs: "auto", sm: "auto" },
                                                            flex: { xs: "0 0 auto", sm: "0 0 auto" },
                                                            "&:hover": {
                                                                borderColor: "#006EC2",
                                                                backgroundColor: "rgba(0, 110, 194, 0.05)",
                                                            },
                                                        }}
                                                    >
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t(status)}
                                                            color={
                                                                draftStatus === status.toLowerCase() ? "#006EC2" : "#363333"
                                                            }
                                                            fontFamily="Roboto"
                                                            fontSize={{ xs: "11px", sm: "12px", md: "12px" }}
                                                            fontWeight={500}
                                                            align="center"
                                                        />
                                                    </Box>
                                                ))}
                                            </Box>

                                            {/* --- Date Range --- */}
                                            <TypographyMD
                                                variant="paragraph"
                                                label={t("Date Range")}
                                                color="#000000"
                                                fontFamily="Roboto"
                                                fontSize="15px"
                                                fontWeight={750}
                                                align="left"
                                            />

                                            <div style={{ marginBottom: "5px", marginTop: "10px" }}>
                                                <Box
                                                    display="flex"
                                                    flexDirection={{ xs: "column", md: "row" }}
                                                    gap={2}
                                                >
                                                    <Box
                                                        width={{ xs: "100%", md: "50%" }}
                                                        display={"flex"}
                                                        flexDirection={"column"}
                                                    >
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("Start Date")}
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="13px"
                                                            fontWeight={450}
                                                            align="left"
                                                        />
                                                        <input
                                                            autoFocus={false}
                                                            type="date"
                                                            value={draftStartDate}
                                                            onChange={(e) => setDraftStartDate(e.target.value)}
                                                            style={{
                                                                height: "35px",
                                                                borderRadius: "6px",
                                                                border: "2px solid rgba(9, 30, 66, 0.14)",
                                                                backgroundColor: "#fff",
                                                                fontSize: "14px",
                                                                color: "rgba(27, 27, 27, 0.67)",
                                                                padding: "0 8px",
                                                                boxSizing: "border-box",
                                                            }}
                                                            onFocus={(e) => (e.target.style.borderColor = "#006EC2")}
                                                            onBlur={(e) => (e.target.style.borderColor = "rgba(9, 30, 66, 0.14)")}
                                                            onMouseOver={(e) => (e.target.style.borderColor = "#006EC2")}
                                                            onMouseOut={(e) => (e.target.style.borderColor = "rgba(9, 30, 66, 0.14)")}
                                                        />
                                                    </Box>

                                                    <Box
                                                        width={{ xs: "100%", md: "50%" }}
                                                        display={"flex"}
                                                        flexDirection={"column"}
                                                    >
                                                        <TypographyMD
                                                            variant="paragraph"
                                                            label={t("End Date")}
                                                            color="#626F86"
                                                            fontFamily="Roboto"
                                                            fontSize="13px"
                                                            fontWeight={450}
                                                            align="left"
                                                        />
                                                        <input
                                                            autoFocus={false}
                                                            type="date"
                                                            value={draftEndDate}
                                                            onChange={(e) => setDraftEndDate(e.target.value)}
                                                            style={{
                                                                height: "35px",
                                                                borderRadius: "6px",
                                                                border: "2px solid rgba(9, 30, 66, 0.14)",
                                                                backgroundColor: "#fff",
                                                                fontSize: "14px",
                                                                color: "rgba(27, 27, 27, 0.67)",
                                                                padding: "0 8px",
                                                                boxSizing: "border-box",
                                                            }}
                                                            onFocus={(e) => (e.target.style.borderColor = "#006EC2")}
                                                            onBlur={(e) => (e.target.style.borderColor = "rgba(9, 30, 66, 0.14)")}
                                                            onMouseOver={(e) => (e.target.style.borderColor = "#006EC2")}
                                                            onMouseOut={(e) => (e.target.style.borderColor = "rgba(9, 30, 66, 0.14)")}
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
                                position: "sticky",
                                bottom: 0,
                                backgroundColor: "#fff",
                                py: 2,
                                px: 1,
                                mt: { xs: 0, md: -5 },
                                zIndex: 1,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <ButtonMD
                                variant="contained"
                                title={t("Apply Filter")}
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

            {/* Image Cropper Modal */}
            {cropModalOpen && (
                <ImageCropper
                    onCropComplete={handleCropComplete}
                    selectedImage={selectedImage}
                    onClose={() => {
                        setCropModalOpen(false);
                        setSelectedImage(null);
                    }}
                />
            )}
        </>
    );
}

export default CompanyAdmin;
