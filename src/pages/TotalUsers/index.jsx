import React, { useEffect, useMemo, useRef, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
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


import FormatDate from "../../components/FormatDate";
import CompanyAdmin from "./companyAdmin";
import AccountExecutive from "./accountExecutive";
import DashboardCards from "./DashboardCard";





const date = new Date();



function TotalUsers() {




    return (
        <>
            <DashboardCards/>
        </>

    );
}

export default TotalUsers;
