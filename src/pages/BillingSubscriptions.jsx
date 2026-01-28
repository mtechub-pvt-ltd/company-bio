import React, { useEffect, useMemo, useRef, useState } from "react";
import SidebarNew from "../components/sidebar/SidebarNew";
import deletemodel from "../Assets/deletemodel.svg"
import { useTranslation } from "react-i18next";
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
  Radio,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
  FormControl,
  Select,
  Chip,
} from "@mui/material";
import TypographyMD from "../components/items/Typography";
import exportIcon from "../Assets/export_icon.png";
import addIcon from "../Assets/add_icon.png";
import menu_icon from "../Assets/menu_icon.png";
import csvIcon from "../Assets/csvIcon.png";
import pdfIcon from "../Assets/pdfIcon.png";
import confirmation_icon from "../Assets/confirmation_icon.png";
import Topbar from "../components/topbar/Topbar";
import nodata from "../Assets/nodata.png";
import { getApiMessage, showToast } from "../helper_functions/messageHandler";
import warn from "../Assets/warn.png";

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
  PendingOutlined,
  AccessTimeOutlined,
  KeyboardArrowDown,
  Check,
  ArrowDownward,
  ArrowUpward,
  Edit,
  Delete,
  Downloading,
} from "@mui/icons-material";
import ModalAdd from "../components/items/Modal";
import ButtonMD from "../components/items/ButtonMD";
import ModalSuccess from "../components/items/ModalSuccess";
import url from "../url";
import { useFormik } from "formik";
import { exportTable } from "../helper_functions/ExportData";
// import {exportFromApi }from '../helper_functions/ExportData'
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
import { useLocation, useNavigate } from "react-router-dom";

import Inputfield from "../components/items/Inputfield";
import SelectField from "../components/items/Selectfield";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Countryfield from "../components/items/Countryfield";
import axios from "axios";

import ExportMenuButton from "../components/ExportMenuButton";
import DummyStatusMenuButton from "../components/DummyStatusMenuButton";
// import ToastAlert from "../components/items/Alert";
import { useSelector } from "react-redux";
import StatusFilter from "../components/StatusFilter";
import ModalConfirmation from "../components/items/ModalConfirmation";
import FormatDate from "../components/FormatDate";
import ViewSubscriptionModel from "../components/subscriptionsModel/ViewSubscriptionModel";
import {
  getCurrencySymbol,
  formatAmount,
} from "../helper_functions/CurrencyFormate";
const SortIcons = ({ column, sortBy, sortOrder }) => (
  <>
    {sortBy === column && sortOrder === "asc" ? (
      <ArrowUpward sx={{ fontSize: "17px" }} />
    ) : (
      <ArrowDownward sx={{ fontSize: "17px" }} />
    )}
  </>
);

function BillingSubscriptions() {
  //my code for showing row detail
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState(null);

  const [selectedBillingDetails, setSelectedBillingDetails] = useState(null);
  const [openBillingModal, setOpenBillingModal] = useState(false);
const formatLabel = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

  //=============================
  const formatDates = (startDate) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1); // or adjust logic as needed

    const format = (d) =>
      d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

    return `${format(start)} – ${format(end)}`;
  };

  //my code for model is above
  const { token, tokenExpiry } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [btn, setbtn] = useState(false);
  const [initialLoader, setInitialLoader] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [allSubscriptionPlans, setAllSubscriptionPlans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(7); // default 10 records per page
  const isSortingRef = useRef(false);
  const [sortingLoader, setSortingLoader] = useState(false);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

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

  const getallSubscriptionPlans = async (
    page = 1,
    search = "",
    status = "all",
    sort_by = sortBy,
    sort_order = sortOrder,
    isSorting = false
  ) => {
    if (isSorting) {
      setSortingLoader(true);
    } else {
      setInitialLoader(true);
    }

    // Convert status to is_active param
    let isActiveParam = "";
    if (status.toLowerCase() === "active") {
      isActiveParam = "&is_active=true";
    } else if (status.toLowerCase() === "inactive") {
      isActiveParam = "&is_active=false";
    }

    const sortParams = sort_by
      ? `&sort_by=${sort_by}&sort_order=${sort_order}`
      : "";

    const InsertAPIURL = `${url}payments/plans?page=${page}&limit=${limit}&search=${search}${sortParams}${isActiveParam}`;

    try {
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setAllSubscriptionPlans(data?.data?.plans);
      // setTotalPages(data?.data?.pagination?.pages || 1);
      // ✅ use backend pages + current page
setCurrentPage(data?.data?.pagination?.page || 1);
setTotalPages(data?.data?.pagination?.pages || 1);
    } catch (error) {
      toast.error(t("Something went wrong! Please try again."));
    } finally {
      isSorting ? setSortingLoader(false) : setInitialLoader(false);
    }
  };

  const handleSort = (column) => {
    const newSortOrder =
      sortBy === column && sortOrder === "asc" ? "desc" : "asc";

    isSortingRef.current = true; // Mark sorting in progress
    isSortingRefSubscriptionLogs.current = true;

    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const [statusFilter, setStatusFilter] = useState("all");

  // const handleStatusChange = (event) => {
  //   const status = event.target.value;
  //   setStatusFilter(status);
  //   getallSubscriptionPlans(1, searchTerm, status); // Preserve current search term
  // };
  const handleStatusChange = (event) => {
  const status = event.target.value;
  setStatusFilter(status);
  setCurrentPage(1);
  getallSubscriptionPlans(1, searchTerm, status, sortBy, sortOrder, false);
};

  // const handlePageChange = (event, value) => {
  //   setCurrentPage(value);
  //   getallSubscriptionPlans(value, searchTerm);
  // };
  const handlePageChange = (event, value) => {
  setCurrentPage(value);
  getallSubscriptionPlans(
    value,
    searchTerm,
    statusFilter,
    sortBy,
    sortOrder,
    false
  );
};

  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  console.log("selectedPlan", selectedPlan);

  // Helper functions for features management
  const addFeature = () => {
    const trimmedFeature = formik.values.tempFeature?.trim();
    if (trimmedFeature && !formik.values.features.includes(trimmedFeature)) {
      const updated = [...formik.values.features, trimmedFeature];
      formik.setFieldValue("features", updated);
      formik.setFieldValue("tempFeature", ""); // clear input
      // toast.success(t("Feature added successfully!"));
    } else if (trimmedFeature && formik.values.features.includes(trimmedFeature)) {
      toast.error(t("This feature already exists!"));
    }
  };

  const removeFeature = (index) => {
    const updated = formik.values.features.filter((_, i) => i !== index);
    formik.setFieldValue("features", updated);
  };

  const clearAllFeatures = () => {
    if (window.confirm(t("Are you sure you want to clear all features?"))) {
      formik.setFieldValue("features", []);
      toast.success(t("All features cleared!"));
    }
  };
const formatExportDate = (date) => {
  if (!date) return "N/A";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";

  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// 2️⃣ Snake_case → Title Case (monthly_free → Monthly Free)
const formatPlanId = (value) => {
  if (!value) return "N/A";

  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};
  const validationSchema = yup.object({
    name: yup.string().required(t("Plan name is required")),
    currency: yup.string().default("USD"), // Fixed to USD
    amount: yup
      .number()
      .typeError(t("Amount must be a number"))
      .required(t("Amount is required")),
    duration_type: yup
      .string()
      .oneOf(["month", "year"])
      .required(t("Duration type is required")),
    max_users: yup
      .number()
      .typeError(t("Max users must be a number"))
      .required(t("Max users is required")),
    trial_period: yup.boolean().default(false),
    trial_days: yup
      .number()
      .typeError(t("Trial days must be a number"))
      .when("trial_period", {
        is: true,
        then: (schema) => schema.required(t("Trial days are required")),
        otherwise: (schema) => schema.notRequired(),
      }),
    billing_cycle: yup.string().when("trial_period", {
      is: true,
      then: () =>
        yup
          .string()
          .required(t("Billing cycle is required"))
          .notOneOf([""], t("Billing cycle is required"))
          .oneOf(
            ["daily", "weekly", "monthly", "yearly"],
            t("Invalid billing cycle")
          ),
      otherwise: () => yup.string().notRequired().nullable(),
    }),
    features: yup.array().of(yup.string()).nullable(),
    description: yup.string().nullable(),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: selectedPlan?.plan || "",
      currency: "USD", // Fixed to USD
      amount: selectedPlan?.amount || "",
      duration_type: selectedPlan?.duration || "",
      duration_days: selectedPlan?.duration_type === "month" ? 30 : 365,
      max_users: selectedPlan?.users || "",
      trial_period: selectedPlan?.trial_period || false,
      trial_days: selectedPlan?.trial_days || 0,
      billing_cycle: selectedPlan?.billing_cycle || "",
      features: selectedPlan?.features || [],
      tempFeature: "",
      description: selectedPlan?.description || "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (selectedPlan) {
        setLoading(true);
        setTimeout(async () => {
          const InsertAPIURL = `${url}payments/super-admin/plans/${selectedPlan?.id}`;

          const Data = {
            name: values.name,
            amount: parseFloat(values.amount),
            currency: "USD", // Fixed to USD
            duration: values.duration_type,
            duration_days: values.duration_type === "month" ? 30 : 365,
            max_users: parseInt(values.max_users),
            trial_period: values.trial_period,
            trial_days: values.trial_period ? parseInt(values.trial_days) : 0,
            features: values.features,
            description: values.description,
          };

          // Conditionally add billing_cycle
          if (values.trial_period) {
            Data.billing_cycle = values.billing_cycle;
          }

          await fetch(InsertAPIURL, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json", // REQUIRED for JSON payloads
            },
            body: JSON.stringify(Data),
          })
            .then((response) => response.json())
            .then((response) => {
              setLoading(false);

              if (response.error) {
                toast.error(t("Something went wrong! Please try again."));
                setLoading(false);
              } else {
                toast.success(t("Plan saved successfully!"));
                getallSubscriptionPlans();
                setLoading(false);
                setOpenModalAdd(false);
                resetForm();
                setSelectedPlan(null); // Clear after submit
              }
            })
            .catch((error) => {
              toast.error(t("Something went wrong! Please try again."));
              setLoading(false);
            });
        }, 1000);
      } else {
        setLoading(true);
        setTimeout(async () => {
          const InsertAPIURL = `${url}payments/super-admin/plans`;

          const Data = {
            name: values.name,
            amount: parseFloat(values.amount),
            currency: "USD", // Fixed to USD
            duration: values.duration_type,
            duration_days: values.duration_type === "month" ? 30 : 365,
            max_users: parseInt(values.max_users),
            trial_period: values.trial_period,
            trial_days: values.trial_period ? parseInt(values.trial_days) : 0,
            features: values.features,
            description: values.description,
          };

          // Conditionally add billing_cycle
          if (values.trial_period) {
            Data.billing_cycle = values.billing_cycle;
          }

          await fetch(InsertAPIURL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json", // REQUIRED for JSON payloads
            },
            body: JSON.stringify(Data),
          })
            .then((response) => response.json())
            .then((response) => {
              setLoading(false);

              if (response.error) {
                   showToast(
      toast.error,
      response,
      t("Something went wrong! Please try again.")
    );
                setLoading(false);
              } else {
                   showToast(
      toast.success,
      response,
      t("Plan saved successfully!")
    );
                getallSubscriptionPlans();
                setLoading(false);
                setOpenModalAdd(false);
                resetForm();
                setSelectedPlan(null); // Clear after submit
              }
            })
            .catch((error) => {
  const message = error.response?.data
    ? getApiMessage(
        error.response.data,
        t("Something went wrong! Please try again.")
      )
    : (error.message || t("Something went wrong! Please try again."));

  toast.error(message);              setLoading(false);
            });
        }, 1000);
      }
    },
  });

  const DeleteCall = async () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const response = await fetch(
          `${url}payments/super-admin/plans/${selectedPlanId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (result.error) {
          toast.error(t("Something went wrong! Please try again."));
          setLoading(false);
          setOpenConfirmModal(false);
          setSelectedPlanId(null);
        } else {
          toast.success(t("Plan deleted successfully!"));
          setLoading(false);
          getallSubscriptionPlans(); // refresh list
          setOpenConfirmModal(false);
          setSelectedPlanId(null);
        }
      } catch (error) {
        toast.error(t("Something went wrong! Please try again."));
      }
    }, 1000);
  };

  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleCheckboxChange = (event, target, item) => {
    const checked = event.target.checked;
    console.log(checked);
    console.log(target);
    console.log(item);

    if (target === "selectAll") {
      setSelectAll(checked);
      setSelectedPlan(null);
      if (checked) {
        // Select all on the current page
        const allIds = allSubscriptionPlans.map((item) => item.plan_id);
        setSelectedRows(allIds);
      } else {
        // Deselect all
        setSelectedRows([]);
      }
    } else {
      setSelectAll(false);
      if (checked) {
        setSelectedRows([target]); // Only allow one selection
        setSelectedPlan(item); // Set the selected plan for editing
      } else {
        setSelectedRows([]);
        setSelectedPlan(null); // Clear selected plan
      }
    }
  };

  const [selectedItem, setSelectedItem] = useState(null);
  const [statusToChange, setStatusToChange] = useState(null);

  const [openModalStatusChange, setOpenModalStatusChange] = useState(false);
  const handleOpenModalStatusChange = (item, newStatus) => {
    setOpenModalStatusChange(true);

    setSelectedItem(item.plan_id);
    setStatusToChange(newStatus);
  };

  const confirmStatusChange = () => {
    setLoading(true);
    setTimeout(() => {
      var InsertAPIURL = `${url}payments/super-admin/plans/${selectedItem}`;

      var Data = {
        is_active: statusToChange === "Inactive" ? false : true,
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
            toast.error(t("Something went wrong! Please try again."));
          } else {
            toast.success(t("Status changed successfully!"));
            setStatusToChange(null);
            setOpenModalStatusChange(false);

            getallSubscriptionPlans();
          }
        })
        .catch((error) => {
          setLoading(false);
          toast.error(t("Something went wrong! Please try again."));
        });
    }, 1000);
  };

  useEffect(() => {
    if (formik.values.duration_type === "month") {
      formik.setFieldValue("duration_days", 30);
    } else if (formik.values.duration_type === "year") {
      formik.setFieldValue("duration_days", 365);
    }
  }, [formik.values.duration_type]);

  // billings/logs
  const [searchTermBilling, setSearchTermBilling] = useState("");
  const [subscriptionLogs, setSubscriptionLogs] = useState([]);

  //my code for implementing empty icons
  const [noData, setNoData] = useState(false);
  //==
  const [currentSubscriptionLogs, setCurrentSubscriptionLogs] = useState(1);
  const [totalPagesSubscriptionLogs, setTotalPagesSubscriptionLogs] =
    useState(1);
  const [limitSubscriptionLogs, setLimitSubscriptionLogs] = useState(7); // default 10 records per page
  const isSortingRefSubscriptionLogs = useRef(false);
  const [sortingLoaderSubscriptionLogs, setSortingLoaderSubscriptionLogs] =
    useState(false);

  const getallSubscriptionLogs = async (
    page = 1,
    search = "",
    status = "all",
    sort_by = sortBy,
    sort_order = sortOrder,
    isSorting = false
  ) => {
    if (isSorting) {
      setSortingLoaderSubscriptionLogs(true);
    } else {
      setInitialLoader(true);
    }

    let statusParam = status !== "all" ? `&status=${status}` : "";
    const sortParams = sort_by
      ? `&sort_by=${sort_by}&sort_order=${sort_order}`
      : "";

    // &company_subscription_status=active_paid
    // const InsertAPIURL = ``;

    const InsertAPIURL = `${url}payments/super-admin/all-payments?page=${page}&limit=${limitSubscriptionLogs}&search=${search}${sortParams}${statusParam}`;

    try {
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const subscriptionData = data?.data?.payments;

      setSubscriptionLogs(data?.data?.payments);
      setTotalPagesSubscriptionLogs(data?.data?.pagination?.page || 1);

      if (!data || data.error || !Array.isArray(subscriptionData)) {
        //  toast.error("Something went wrong! Please try again.");
        setSubscriptionLogs([]); // reset users
        setTotalPages(1); // fallback
        setNoData(true); // you can use this to conditionally render "No Data Found" UI
        return;
      }

      setSubscriptionLogs(subscriptionData);
      // ✅ use backend pages
setCurrentSubscriptionLogs(data?.data?.pagination?.page || 1);
setTotalPagesSubscriptionLogs(data?.data?.pagination?.pages || 1);
      // setTotalPages(data?.data?.pagination?.pages || 1);
      setNoData(false);
    } catch (error) {
      setSubscriptionLogs([]);
      setNoData(true);
    } finally {
      if (isSorting) {
        setSortingLoader(false);
      } else {
        setInitialLoader(false);
      }
    }
  };

  //till here

  const [statusFilterSubscriptionLogs, setStatusFilterSubscriptionLogs] =
    useState("all");

  // const handleStatusChangeSubscriptionLogs = (event) => {
  //   const status = event.target.value;
  //   setStatusFilterSubscriptionLogs(status);
  //   getallSubscriptionLogs(1, searchTermBilling, status); // Preserve current search term
  // };
const handleStatusChangeSubscriptionLogs = (event) => {
  const status = event.target.value;
  setStatusFilterSubscriptionLogs(status);
  setCurrentSubscriptionLogs(1);
  getallSubscriptionLogs(1, searchTermBilling, status, sortBy, sortOrder, false);
};
  // const handlePageChangeBilling = (event, value) => {
  //   setCurrentSubscriptionLogs(value);
  // };
const handlePageChangeBilling = (event, value) => {
  setCurrentSubscriptionLogs(value);
  getallSubscriptionLogs(
    value,
    searchTermBilling,
    statusFilterSubscriptionLogs,
    sortBy,
    sortOrder,
    false
  );
};
  const [selectAllSubscriptionBilling, setSelectAllSubscriptionBilling] =
    useState(false);
  const [selectedSubscriptionBillingRows, setSelectedSubscriptionBillingRows] =
    useState([]);

  const handleSubscriptionBillingCheckboxChange = (event, target) => {
    const checked = event.target.checked;

    if (target === "selectAll") {
      setSelectAllSubscriptionBilling(checked);
      if (checked) {
        // Select all on the current page
        const allIds = subscriptionLogs.map((item) => item.payment_id);
        setSelectedSubscriptionBillingRows(allIds);
      } else {
        // Deselect all
        setSelectedSubscriptionBillingRows([]);
      }
    } else {
      if (checked) {
        setSelectedSubscriptionBillingRows((prev) => [...prev, target]);
      } else {
        setSelectedSubscriptionBillingRows((prev) =>
          prev.filter((id) => id !== target)
        );
      }
    }
  };

  const [currencies, setCurrencies] = useState([]);
  const getCurrencyData = async () => {
    try {
      const response = await fetch(
        "https://restcountries.com/v3.1/all?fields=name,cca2,flags,currencies"
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const allowedCodes = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR"];
      const uniqueCurrencies = {};

      data.forEach((country) => {
        const countryCurrencies = country.currencies;
        if (countryCurrencies) {
          Object.entries(countryCurrencies).forEach(([code, details]) => {
            if (allowedCodes.includes(code) && !uniqueCurrencies[code]) {
              uniqueCurrencies[code] = {
                code,
                name: details.name,
                symbol: details.symbol || "",
              };
            }
          });
        }
      });

      const filteredCurrencies = Object.values(uniqueCurrencies);

      setCurrencies(filteredCurrencies);
    } catch (error) {
      toast.error(t("Something went wrong! Please try again."));
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getallSubscriptionPlans(
        1,
        searchTerm,
        statusFilter,
        sortBy,
        sortOrder,
        isSortingRef.current
      );

      isSortingRef.current = false; // Reset the flag after fetch
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [sortBy, sortOrder, searchTerm]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      getallSubscriptionLogs(
        1,
        searchTermBilling,
        statusFilterSubscriptionLogs,
        sortBy,
        sortOrder,
        isSortingRefSubscriptionLogs.current
      );

      isSortingRefSubscriptionLogs.current = false; // Reset the flag after fetch
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [sortBy, sortOrder, searchTermBilling]);

  useEffect(() => {
    if (selectedRows.length !== allSubscriptionPlans.length) {
      setSelectAll(false);
    }

    if (selectedSubscriptionBillingRows.length !== subscriptionLogs.length) {
      setSelectAllSubscriptionBilling(false);
    }
  }, [selectedRows, selectedSubscriptionBillingRows]);

  useEffect(() => {
    getallSubscriptionPlans();
    getallSubscriptionLogs();
    getCurrencyData();
  }, []);

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const location = useLocation();

  useEffect(() => {
    if (location.state?.from === "/dashboard") {
      setTabIndex(1);
    }
  }, [location.state]); // ✅ Do NOT include tabIndex here

  const [value, setValue] = React.useState(false);



  // Fetch all subscription plans for export
const fetchAllSubscriptionPlansForExport = async () => {
  // Convert status to is_active param
  let isActiveParam = "";
  if (statusFilter.toLowerCase() === "active") {
    isActiveParam = "&is_active=true";
  } else if (statusFilter.toLowerCase() === "inactive") {
    isActiveParam = "&is_active=false";
  }

  const sortParams = sortBy ? `&sort_by=${sortBy}&sort_order=${sortOrder}` : "";
  const searchParam = searchTerm ? `&search=${searchTerm}` : "";

  const apiUrl = `${url}payments/plans?no_pagination=true${searchParam}${sortParams}${isActiveParam}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data?.data?.plans || [];
  } catch (err) {
    console.error("Export fetch failed", err);
    toast.error(t("Failed to fetch subscription plans for export"));
    return [];
  }
};

// Export subscription plans
const [exportingPlans, setExportingPlans] = useState(false);
const [exportingPlansFormat, setExportingPlansFormat] = useState(null);

const handleExportPlans = async (format) => {
  setExportingPlans(true);
  setExportingPlansFormat(format);

  try {
    const rows = await fetchPlansForExport();

   const mapped = rows.map((p) => ({
  "Plan Id": formatPlanId(p.plan_id),
  "Plan Name": p.name || "N/A",
  "Amount": `${p.currency} ${p.amount}`,
  "Duration": p.duration_type,
  "Max Users": p.max_users,
  "Trial Days": p.trial_days ?? "N/A",
  "Billing Cycle": p.billing_cycle
    ? formatPlanId(p.billing_cycle)
    : "N/A",
  "Status": p.is_active ? "Active" : "Inactive",
  "Created At": formatExportDate(p.created_at),
}));

    await exportTable(mapped, "Subscription Plans", format === "pdf" ? "pdf" : "xlsx");
  } catch {
    toast.error("Export failed");
  } finally {
    setExportingPlans(false);
    setExportingPlansFormat(null);
  }
};

const fetchPlansForExport = async () => {
  const api = `${url}payments/plans?no_pagination=true`;
  const res = await fetch(api, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json?.data?.plans || [];
};

const fetchLogsForExport = async () => {
  const api = `${url}payments/super-admin/all-payments?no_pagination=true`;
  const res = await fetch(api, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json?.data?.payments || [];
};

// Fetch all commission logs for export
const fetchAllCommissionLogsForExport = async () => {
  const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
  const sortParams = sortBy ? `&sort_by=${sortBy}&sort_order=${sortOrder}` : "";
  const searchParam = searchTerm ? `&search=${searchTerm}` : "";

  const apiUrl = `${url}commission-logs?no_pagination=true${statusParam}${sortParams}${searchParam}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data?.data?.commission_logs || [];
  } catch (err) {
    console.error("Export fetch failed", err);
    return [];
  }
};

// Handle export of commission logs
const [exportingLogs, setExportingLogs] = useState(false);

const handleExportLogs = async (format) => {
  setExportingLogs(true);
  setExportingLogsFormat(format);

  try {
    const rows = await fetchLogsForExport();

 const mapped = rows.map((r) => ({
  "Payment Id": r.payment_id,
  "Company": r.company || "N/A",
  "Subscription Plan": formatPlanId(r.plan_id),
  "Plan Name": r.plan_name,
  "Amount": `${r.currency} ${r.amount}`,
  "Billing Cycle": formatPlanId(r.billing_cycle),
  "Subscription Payment Date": formatExportDate(r.date),
  "Start Date": formatExportDate(r.subscription_start_date),
  "End Date": formatExportDate(r.subscription_end_date),
  "Raw Status": r.status,
}));

    await exportTable(mapped, "Subscription Logs", format === "pdf" ? "pdf" : "xlsx");
  } catch {
    toast.error("Export failed");
  } finally {
     setExportingLogs(false);
  setExportingLogsFormat(null);
  }
};
// const [exportingLogs, setExportingLogs] = useState(false);
const [exportingLogsFormat, setExportingLogsFormat] = useState(null);





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
            <Grid container spacing={0} sx={{ pl: 2, pr: 2 }} pt={0}>
              <Grid xs={12} md={12} align="">
                <Box
                  sx={{
                    width: { xs: "100%", md: "77vw" },
                    backgroundColor: "white",
                    border: "2px solid rgba(9, 30, 66, 0.14)",
                    borderRadius: "12px",
                  }}
                >
                  <Grid container spacing={0} p={2} pb={1}>
                    <Grid xs={12} sm={12} align="left">
                      <Box
                        sx={{
                          borderBottom: 1,
                          mb: 2,
                          borderColor: "divider",
                          display: "flex",
                          justifyContent: "flex-start",
                          flexWrap: "wrap",
                          width: "100%",
                        }}
                      >
                        <Tabs
                          value={tabIndex}
                          onChange={handleTabChange}
                          variant="fullWidth"
                          textColor="primary"
                          indicatorColor="primary"
                          sx={{
                            width: "100%",
                            "& .MuiTab-root": {
                              fontWeight: 600,
                              fontSize: { xs: "14px", sm: "15px", md: "16px" },
                              textTransform: "none",
                              minWidth: { xs: "50%", sm: "auto" },
                              flex: { xs: 1, sm: "none" },
                              padding: { xs: "8px 4px", sm: "12px 16px" },
                            },
                            "& .Mui-selected": {
                              color: "#1976d2", // Active tab color (blue)
                            },
                            "& .MuiTabs-indicator": {
                              backgroundColor: "#1976d2", // Bottom indicator color
                            },
                            "& .MuiTabs-flexContainer": {
                              width: "100%",
                              justifyContent: { xs: "space-between", sm: "flex-start" },
                            },
                          }}
                        >
                          <Tab
                            label={t("Subscription Plans")}
                            onClick={() => {
                              setbtn(true);
                            }}
                          />
                          <Tab
                            label={t("Subscription Logs")}
                            onClick={() => {
                              setbtn(false);
                            }}
                          />
                        </Tabs>
                      </Box>
                    </Grid>

                    <Grid container spacing={2} alignItems="center">
                      {/* Title */}
                      <Grid item xs={12} md={4}>
                        <TypographyMD
                          variant="paragraph"
                          label={
                            tabIndex === 0
                              ? t("Manage Subscription Plans")
                              : t("Manage Subscription Billings")
                          }
                          color="#003149"
                          fontFamily="Roboto"
                          fontSize={{ xs: "16px", md: "18px" }}
                          fontWeight={600}
                          align="center"
                          sx={{ mb: { xs: 1, md: 0 } }}
                        />
                        {tabIndex === 0 && sortingLoader && (
                          <CircularProgress size={12} sx={{ ml: 0.2 }} />
                        )}
                        {tabIndex !== 0 && sortingLoaderSubscriptionLogs && (
                          <CircularProgress size={12} sx={{ ml: 0.2 }} />
                        )}
                      </Grid>

                      {/* Search Box */}
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        sx={{
                          display: "flex",
                          justifyContent: { xs: "center", md: "flex-start" },
                        }}
                      >
                        <Box
                          sx={{
                            mt: { xs: 1, md: 0 },
                            backgroundColor: "#fff",
                            border: "2px solid rgba(9, 30, 66, 0.14)",
                            borderRadius: "5px",
                            width: { xs: "100%", sm: "240px" },
                          }}
                        >
                          <OutlinedInput
                            autoComplete="off"
                            placeholder={
                              tabIndex === 0
                                ? t("Search plans...")
                                : t("searchByName")
                            }
                            sx={{
                              width: "100%",
                              fontSize: "15px",
                              height: "34px",
                              "& fieldset": { border: "none" },
                            }}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton edge="end">
                                  <Search
                                    sx={{ fontSize: "15px", color: "#222" }}
                                  />
                                </IconButton>
                              </InputAdornment>
                            }
                            value={
                              tabIndex === 0 ? searchTerm : searchTermBilling
                            }
                            onChange={(e) =>
                              tabIndex === 0
                                ? setSearchTerm(e.target.value)
                                : setSearchTermBilling(e.target.value)
                            }
                          />
                        </Box>
                      </Grid>

                      {/* Filters + Buttons */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: { xs: "center", md: "flex-end" },
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <FormControl
                            size="small"
                            sx={{
                              width: { xs: "100%", sm: 140 },
                              "& .MuiOutlinedInput-root": { ...fieldCommonSx },
                              "& fieldset": { border: "none" },
                            }}
                          >
                            <Select
                              value={
                                tabIndex === 0
                                  ? statusFilter
                                  : statusFilterSubscriptionLogs
                              }
                              onChange={
                                tabIndex === 0
                                  ? handleStatusChange
                                  : handleStatusChangeSubscriptionLogs
                              }
                              displayEmpty
                            >
                              {(tabIndex === 0
                                ? [
                                    { value: "all", label: "All" },
                                    { value: "active", label: t("Active") },
                                    { value: "inactive", label: t("Inactive") },
                                  ]
                                : [
                                    { value: "all", label: "All" },
                                    { value: "paid", label: t("Paid") },
                                    { value: "unpaid", label: t("Unpaid") },
                                    { value: "trial", label: t("Trial") },
                                  ]
                              ).map((option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {t(option.label)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          {tabIndex === 0 ? (

<ExportMenuButton
  onExport={handleExportPlans}
  exporting={exportingPlans}
  exportingFormat={exportingPlansFormat}
  options={[
    { label: "PDF", icon: pdfIcon },
    { label: "Excel", icon: csvIcon },
  ]}
/>

                          ) : (
<ExportMenuButton
  onExport={handleExportLogs}
  exporting={exportingLogs}
  exportingFormat={exportingLogsFormat}
  options={[
    { label: "PDF", icon: pdfIcon },
    { label: "Excel", icon: csvIcon },
  ]}
/>


                          )}

                          {tabIndex === 0 && (
                            <Button
                              onClick={() => {
                                if (!selectedPlan) {
                                  formik.resetForm(); // Reset form for new plan
                                }
                                setOpenModalAdd(true);
                              }}
                              variant="contained"
                              startIcon={
                                selectedPlan ? null : (
                                  <img
                                    src={addIcon}
                                    alt="..."
                                    style={{ width: "13px" }}
                                  />
                                )
                              }
                              sx={{
                                width: { xs: "100%", sm: "110px" },
                                height: "35px",
                                backgroundColor: "#006EC2",
                                borderRadius: "5px",
                                boxShadow: "none",
                                color: "#fff",
                                fontFamily: "Poppins, sans-serif",
                                letterSpacing: ".5px",
                                textTransform: "capitalize",
                                "&:hover": {
                                  backgroundColor: "#006EC2",
                                  boxShadow: "none",
                                },
                              }}
                            >
                              {selectedPlan ?  t("Edit") : t("Add")}
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>

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
                    <>
                      {tabIndex === 0 ? (
                        <>
                          {allSubscriptionPlans?.length == 0 ||
                          undefined ||
                          null ? (
                            <Box
                              display={"flex"}
                              alignItems={"center"}
                              justifyContent={"center"}
                              flexDirection={"column"}
                              py={3}
                            >
                              <img
                                src={nodata}
                                width={200}
                                height={200}
                                alt=""
                              />
                              <TypographyMD
                                variant="h2"
                                label={t("Data Not Found")}
                                color="#A5ADB0"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="center"
                              />
                            </Box>
                          ) : (
                            <TableContainer
                              sx={{
                                boxShadow: "none",
                                overflowX: "auto",
                                width: { xs: "100%", md: "77vw" },
                                pt: 1,
                              }}
                            >
                              <Table
                                sx={{
                                  minWidth: { xs: "100px", md: "250px" },
                                  "& .MuiTableCell-root": {
                                    padding: "5px",
                                  },
                                  "& .MuiTableRow-root": {
                                    height: "25px",
                                  },
                                }}
                                aria-label="simple table"
                                whiteSpace="nowrap !important"
                              >
                                <TableHead
                                  style={{
                                    fontSize: "13px",
                                  }}
                                >
                                  <TableRow>
                                    <TableCell padding="checkbox">
                                      <Checkbox
                                        sx={{
                                          color: "rgba(9, 30, 66, 0.14)",
                                          whiteSpace: "nowrap !important",
                                        }}
                                        checked={selectAll}
                                        indeterminate={false} // We no longer show partial state
                                        onChange={(e) =>
                                          handleCheckboxChange(e, "selectAll")
                                        }
                                      />
                                    </TableCell>
                                    <TableCell
                                      onClick={() => handleSort("plan_id")}
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Id")}
                                      <SortIcons
                                        column="plan_id"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("name")}
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Plan Name")}
                                      <SortIcons
                                        column="name"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("trial_days")}
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Trial Period")}
                                      <SortIcons
                                        column="trial_days"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("amount")}
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Amount")}
                                      <SortIcons
                                        column="amount"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("max_users")}
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Max Users")}
                                      <SortIcons
                                        column="max_users"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() =>
                                        handleSort("duration_days")
                                      }
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Duration")}
                                      <SortIcons
                                        column="duration_days"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("created_at")}
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Date")}
                                      <SortIcons
                                        column="created_at"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("is_active")}
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Status")}
                                      <SortIcons
                                        column="is_active"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
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
                                  {allSubscriptionPlans.map((item) => (
                                    <TableRow // from here i cahnged the table row
                                      hover
                                      key={item.plan_id}
                                      onClick={() => {
                                        setSelectedPlanDetails({
                                          id: item.plan_id,
                                          plan: item.name,
                                          trial: item.trial_days,
                                          amount: item.amount,
                                          users: item.max_users,
                                          duration: item.duration_type,
                                          createdAt: item.created_at,
                                          status: item.is_active
                                            ? "Active"
                                            : "Inactive",
                                          currency: item.currency,
                                          features: item.features,
                                          description: item.description,
                                          billing_cycle: item.billing_cycle,
                                        });
                                        setOpenViewModal(true);
                                      }}
                                    >
                                      <TableCell
                                        padding="checkbox"
                                        onClick={(e) => {
                                          e.stopPropagation(); // so checkbox doesn't trigger row click
                                        }}
                                      >
                                        <Checkbox
                                          sx={{
                                            color: "rgba(9, 30, 66, 0.14)",
                                          }}
                                          checked={selectedRows.includes(
                                            item.plan_id
                                          )}
                                          onChange={(e) =>
                                            handleCheckboxChange(
                                              e,
                                              item.plan_id,
                                              item
                                            )
                                          }
                                        />
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
                                        {displayValue(item.plan_id)}
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
                                        {displayValue(item.name)}
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: "normal",
                                          color: "#545454",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "13px",
                                          maxWidth: "250px",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {displayValue(item.trial_days)}
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
                                        {isEmptyValue(item.amount)
                                          ? t("N/A")
                                          : (
                                              <>
                                                {getCurrencySymbol(item.currency)}
                                             
                                                {formatAmount(item.amount)}
                                              </>
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
                                        {displayValue(item.max_users)}
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
                                        {isEmptyValue(item?.duration_type)
                                          ? t("N/A")
                                          : item?.duration_type === "month"
                                          ? t("Per month")
                                          : item?.duration_type === "year"
                                          ? t("Per year")
                                          : t("N/A")}
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
                                        {isEmptyValue(item?.created_at) ? (
                                          t("N/A")
                                        ) : (
                                          <FormatDate inputDate={item?.created_at} />
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
                                            alignItems: "center",
                                            gap: "10px",
                                          }}
                                        >
                                          <Chip
                                            label={
                                              item?.is_active
                                                ? t("Active")
                                                : t("Inactive")
                                            }
                                            icon={
                                              item?.is_active ? (
                                                <CheckCircleOutline
                                                  style={{
                                                    fontSize: 17,
                                                    color: "#1a875aff",
                                                  }}
                                                />
                                              ) : (
                                                <Block
                                                  style={{
                                                    fontSize: 17,
                                                    color: "#c52015ff",
                                                  }}
                                                />
                                              )
                                            }
                                            sx={{
                                              fontWeight: 400,
                                              fontFamily: "Poppins, sans-serif",
                                              fontSize: "14px",
                                              color: item?.is_active
                                                ? "#1a875aff"
                                                : "#c52015ff",
                                              backgroundColor: item?.is_active
                                                ? "#dffff2ff"
                                                : "#ffeae8ff",
                                              borderRadius: "5px",
                                              border: "none",
                                            }}
                                            variant="outlined"
                                          />
                                        </div>
                                      </TableCell>

                                   
                                      <TableCell align="center">
  <Box sx={{ display: "flex", justifyContent: "center", gap: 0}}>

    {/* VIEW */}
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        setSelectedPlanDetails({
          id: item.plan_id,
          plan: item.name,
          trial: item.trial_days,
          amount: item.amount,
          users: item.max_users,
          duration: item.duration_type,
          currency: item.currency,
          features: item.features,
          description: item.description,
          createdAt: item.created_at,
          status: item.is_active ? "Active" : "Inactive",
          billing_cycle: item.billing_cycle,
        });
        setOpenViewModal(true);
      }}
    >
      <Visibility sx={{ color: "#006EC2", fontSize: 20 }} />
    </IconButton>

    {/* EDIT */}
    <IconButton
      onClick={(e) => {
        e.stopPropagation();

        const planForEdit = {
          id: item.plan_id,
          plan: item.name,
          currency: item.currency,
          amount: item.amount,
          duration: item.duration_type,
          duration_type: item.duration_type,
          users: item.max_users,
          trial_period: item.trial_days > 0,
          trial_days: item.trial_days,
          billing_cycle: item.billing_cycle || "",
          features: item.features || [],
          description: item.description || "",
        };

        setSelectedPlan(planForEdit);
        setOpenModalAdd(true);
      }}
    >
      <Edit sx={{ color: "#E59E00", fontSize: 20 }} />
    </IconButton>

    {/* DELETE */}
    <IconButton
      onClick={(e) => {
        e.stopPropagation();

        setSelectedPlanId(item.plan_id);
        setOpenConfirmModal(true);
      }}
    >
      <Delete sx={{ color: "#D32F2F", fontSize: 20 }} />
    </IconButton>

  </Box>
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
                              >
                                {/* <Pagination
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
                                /> */}
                                <Pagination
  count={totalPages}
  page={currentPage}
  onChange={handlePageChange}
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
                              </div>
                            </TableContainer>
                          )}
                        </>
                      ) : (
                        <>
                          {subscriptionLogs?.length == 0 ||
                          undefined ||
                          null ? (
                            <Box
                              display={"flex"}
                              alignItems={"center"}
                              justifyContent={"center"}
                              flexDirection={"column"}
                              py={3}
                            >
                              <img
                                src={nodata}
                                alt=""
                                width={200}
                                height={200}
                              />
                              <TypographyMD
                                variant="h2"
                                label={t("Data Not Found")}
                                color="#A5ADB0"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="center"
                              />
                            </Box>
                          ) : (
                            <TableContainer
                              sx={{
                                boxShadow: "none",

                                pt: 1,
                              }}
                            >
                              <Table
                                sx={{
                                  minWidth: { xs: "100px", md: "250px" },
                                  "& .MuiTableCell-root": {
                                    padding: "5px",
                                  },
                                  "& .MuiTableRow-root": {
                                    height: "25px",
                                  },
                                }}
                                aria-label="simple table"
                              >
                                <TableHead
                                  style={{
                                    fontSize: "13px",
                                  }}
                                >
                                  <TableRow>
                                    <TableCell padding="checkbox">
                                      <Checkbox
                                        sx={{
                                          color: "rgba(9, 30, 66, 0.14)",
                                        }}
                                        checked={selectAllSubscriptionBilling}
                                        indeterminate={false} // We no longer show partial state
                                        onChange={(e) =>
                                          handleSubscriptionBillingCheckboxChange(
                                            e,
                                            "selectAll"
                                          )
                                        }
                                      />
                                    </TableCell>
                                    <TableCell
                                      onClick={() => handleSort("payment_id")}
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Id")}
                                      <SortIcons
                                        column="payment_id"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("company")}
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Company Name")}
                                      <SortIcons
                                        column="company"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("plan_name")}
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Plan Name")}
                                      <SortIcons
                                        column="plan_name"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("amount")}
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Amout")}
                                      <SortIcons
                                        column="amount"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() =>
                                        handleSort("billing_cycle")
                                      }
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Billing Cycle")}
                                      <SortIcons
                                        column="billing_cycle"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() =>
                                        handleSort("subscription_end_date")
                                      }
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Start - End Date")}
                                      <SortIcons
                                        column="subscription_end_date"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    <TableCell
                                      onClick={() => handleSort("status")}
                                      align="center"
                                      sx={{
                                        whiteSpace: "nowrap !important",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        color: "#44546F",
                                        fontFamily: "Poppins, sans-serif",
                                        fontSize: "14px",
                                      }}
                                    >
                                      {t("Payment Status")}
                                      <SortIcons
                                        column="status"
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                      />
                                    </TableCell>

                                    {/* <TableCell onClick={() => handleSort('company_subscription_status')} align="center" sx={{ cursor: "pointer", fontWeight: "bold", color: "#44546F", fontFamily: "Poppins, sans-serif", fontSize: "14px" }}>
                                                                            {t("Subscription Status")}
                                                                            <SortIcons column="company_subscription_status" sortBy={sortBy} sortOrder={sortOrder} />
                                                                        </TableCell> */}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {subscriptionLogs.map((item) => (
                                    <TableRow
                                      hover
                                      key={item.payment_id}
                                      onClick={() => {
                                        setSelectedBillingDetails({
                                          id: item.payment_id,
                                          companyName: item.company, // ✅ Corrected field name
                                          plan: item.plan_name,
                                          amount: item.amount,
                                          duration: item.billing_cycle,
                                          dates: `${new Date(
                                            item.subscription_start_date
                                          ).toLocaleDateString()} - ${new Date(
                                            item.subscription_end_date
                                          ).toLocaleDateString()}`,
                                          status:
                                            item.status === "paid"
                                              ? "Paid"
                                              : "Unpaid", // ✅ Clean label
                                        });
                                        setOpenBillingModal(true);
                                      }}
                                    >
                                      <TableCell
                                        padding="checkbox"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Checkbox
                                          sx={{
                                            color: "rgba(9, 30, 66, 0.14)",
                                          }}
                                          checked={selectedSubscriptionBillingRows.includes(
                                            item.payment_id
                                          )}
                                          onChange={(e) =>
                                            handleSubscriptionBillingCheckboxChange(
                                              e,
                                              item.payment_id
                                            )
                                          }
                                        />
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
                                        {displayValue(item.payment_id)}
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
                                        {displayValue(item.company)}
                                      </TableCell>

                                      <TableCell
                                        align="center"
                                        sx={{
                                          fontWeight: "normal",
                                          color: "#545454",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "13px",
                                          maxWidth: "250px",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                      >
                                        {displayValue(item.plan_name)}
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
                                        {isEmptyValue(item.amount)
                                          ? t("N/A")
                                          : (
                                              <>
                                                {getCurrencySymbol(item.currency)}
                                               
                                                {formatAmount(item.amount)}
                                              </>
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
                                        {displayValue(item.billing_cycle)}
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
                                        {isEmptyValue(item?.subscription_start_date) || isEmptyValue(item?.subscription_end_date)
                                          ? t("N/A")
                                          : (
                                              <>
                                                <FormatDate inputDate={item?.subscription_start_date} /> - <FormatDate inputDate={item?.subscription_end_date} />
                                              </>
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
                                            alignContent: "center",
                                            gap: "10px",
                                          }}
                                        >
                                          <Chip
                                            label={
                                              item?.status === "paid"
                                                ? t("Paid")
                                                : item?.status === "unpaid"
                                                ? t("Unpaid")
                                                : t("Trial")
                                            }
                                            icon={
                                              item?.status === "paid" ? (
                                                <CheckCircleOutline
                                                  style={{
                                                    fontSize: 17,
                                                    color: "#1a875aff",
                                                  }}
                                                />
                                              ) : item?.status === "unpaid" ? (
                                                <Downloading
                                                  style={{
                                                    fontSize: 17,
                                                    color: "#c52015ff",
                                                  }}
                                                />
                                              ) : (
                                                <Email
                                                  style={{
                                                    fontSize: 17,
                                                    color: "#e69500ff",
                                                  }}
                                                />
                                              )
                                            }
                                            sx={{
                                              fontWeight: 400,
                                              fontFamily: "Poppins, sans-serif",
                                              fontSize: "14px",
                                              color:
                                                item?.status === "paid"
                                                  ? "#1a875aff"
                                                  : item?.status === "unpaid"
                                                  ? "#c52015ff"
                                                  : "#e69500ff",
                                              backgroundColor:
                                                item?.status === "paid"
                                                  ? "#dffff2ff"
                                                  : item?.status === "unpaid"
                                                  ? "#ffeae8ff"
                                                  : "#fff5e0ff",
                                              borderRadius: "5px",
                                              border: "none",
                                              px: 1.5,
                                            }}
                                            variant="outlined"
                                          />
                                        </div>
                                      </TableCell>

                                      {/* <TableCell align="center" sx={{ fontWeight: 400, color: "#172B4D", fontFamily: "Poppins, sans-serif", fontSize: "14px", maxWidth: "150px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} >
                                                                                <div style={{ display: "flex", justifyContent: "center", alignContent: "center", gap: "10px" }}>
                                                                                    <DummyStatusMenuButton
                                                                                        status={item.company_subscription_status}
                                                                                        statusOptions={[
                                                                                            { value: "Active", label: "Active", color: "#4BCE97", icon: <CheckCircleOutline fontSize="17px" sx={{ mr: 1 }} /> },
                                                                                            { value: "Inactive", label: "Inactive", color: "#F87168", icon: <Block fontSize="17px" sx={{ mr: 1 }} /> },
                                                                                            { value: "Trial", label: "Trial", color: "#579DFF", icon: <Email fontSize="17px" sx={{ mr: 1 }} /> },
                                                                                        ]}
                                                                                        onChange={(newStatus) => {
                                                                                            setSubscriptionLogs((prev) =>
                                                                                                prev.map((row) =>
                                                                                                    row.payment_id === item.payment_id
                                                                                                        ? { ...row, subscription_status: newStatus }
                                                                                                        : row
                                                                                                )
                                                                                            );
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </TableCell> */}
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
                              >
                                {/* <Pagination
                                  count={totalPagesSubscriptionLogs}
                                  page={currentSubscriptionLogs}
                                  onChange={(_, p) => handlePageChangeBilling(_, p)}
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
                                /> */}
                                <Pagination
  count={totalPagesSubscriptionLogs}
  page={currentSubscriptionLogs}
  onChange={handlePageChangeBilling}
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
                              </div>
                            </TableContainer>
                          )}
                        </>
                      )}
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        }
      />

      {/* this is my code for openning model */}

      {openViewModal && selectedPlanDetails && (
        <ViewSubscriptionModel
          id={selectedPlanDetails.id}
          planDetails={selectedPlanDetails}
          onClose={() => setOpenViewModal(false)}
          onDelete={() => {
            setSelectedPlanId(selectedPlanDetails.id); // Set only the ID for delete
            setOpenViewModal(false);
            setOpenModalAdd(false); // Ensure edit modal is closed
            setOpenConfirmModal(true);
          }}
          onEdit={() => {
            // Map the plan details to the correct structure for editing
            const planForEdit = {
              id: selectedPlanDetails.id,
              plan: selectedPlanDetails.plan,
              currency: selectedPlanDetails.currency,
              amount: selectedPlanDetails.amount,
              duration: selectedPlanDetails.duration,
              duration_type: selectedPlanDetails.duration,
              users: selectedPlanDetails.users,
              trial_period: selectedPlanDetails.trial > 0,
              trial_days: selectedPlanDetails.trial || 0,
              billing_cycle: selectedPlanDetails.billing_cycle || "",
              features: selectedPlanDetails.features || [],
              description: selectedPlanDetails.description || "",
            };
            setSelectedPlan(planForEdit);
            setOpenViewModal(false);
            setOpenConfirmModal(false); // Ensure delete modal is closed
            setOpenModalAdd(true);
          }}
        />
      )}

      {openBillingModal && selectedBillingDetails && (
        <ViewSubscriptionModel
          type="billing"
          id={selectedBillingDetails.id}
          billingDetails={selectedBillingDetails}
          onClose={() => setOpenBillingModal(false)}
        />
      )}

      {/* My code is above */}

      {/* Delete Confirmation Modal */}
      <ModalConfirmation
        open={openConfirmModal}
        onClose={() => {
          setOpenConfirmModal(false);
          setSelectedPlanId(null);
        }}
        title={t("Delete Plan")}
        data={
          <>
            <div style={{ backgroundColor: "#fff", margin: 13 }}>
              <Grid
                container
                spacing={0}
                p={{ xs: 2, md: 3, lg: 3, xl: 3 }}
              >
                <Grid xs={12} align="center">
                  <Stack
                    align="center"
                    direction="column"
                    spacing={2}
                    pb={3}
                  >
                    <img
                      src={deletemodel}
                      alt="..."
                      style={{ alignSelf: "center", width: "100px" }}
                    />

                    <TypographyMD
                      variant="paragraph"
                      label={t("Are you sure you want to delete this plan?")}
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
                      onClickTerm={() => {
                        setOpenConfirmModal(false);
                        setSelectedPlanId(null);
                      }}
                    />

                    <ButtonMD
                      variant="contained"
                      title="Delete"
                      width="fit-content"
                      type="submit"
                      borderColor="orange"
                      backgroundColor="orange"
                      borderRadius="5px"
                      disabled={loading}
                      onClickTerm={DeleteCall}
                    />
                  </div>
                </Grid>
              </Grid>
            </div>
          </>
        }
      />

      {/* Add modal */}

      {openModalAdd && (
        <>
          <ModalAdd
            style={{ maxWidth: "450px" }}
            open={openModalAdd}
            onClose={() => {
              setOpenModalAdd(false);
              setSelectedPlan(null);
            }}
            type={t("subscription_plan")}
            title={
              selectedPlan
                ? t("Edit Subscription Plan")
                : t("Add Subscription Plan")
            }
            data={
              <form
                style={{
                  backgroundColor: "#fff",
                  margin: 13,
                  maxWidth: "450px",
                }}
                onSubmit={formik.handleSubmit}
              >
                <Box
                  sx={{
                    height: {
                      xs: "calc(100dvh - 50px)",
                      sm: "91vh",
                      md: "91vh",
                    }, // control how tall the modal body can grow
                    overflowY: "auto", // enable vertical scroll if content overflows
                    px: 1,
                    pb: 3,
                    maxWidth: "450px !important", // padding left & right
                  }}
                >
                  <Grid container spacing={0}>
                    <Grid xs={12} align="left">
                      <div>
                        <Box
                          sx={{ marginTop: "15px", marginBottom: "30px" }}
                          width={{ xs: "97%", md: "100%" }}
                        >
                          {/* --- Plan Details --- */}
                          <TypographyMD
                            variant="paragraph"
                            label={t("Plan Details")}
                            color="#000000"
                            fontFamily="Roboto"
                            fontSize="15px"
                            fontWeight={750}
                            align="left"
                          />

                          <div
                            style={{ marginBottom: "5px", marginTop: "10px" }}
                          >
                            <Box
                              display="flex"
                              flexDirection={{ xs: "column", md: "row" }}
                              gap={2}
                            >
                              <Box width={{ xs: "100%", md: "50%" }}>
                                <TypographyMD
                                  variant="paragraph"
                                  label={
                                    <span>
                                      {t("Plan Name")}
                                      {formik.values.name === "" && (
                                        <span
                                          style={{
                                            color: "red",
                                            marginLeft: 4,
                                          }}
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
                                  value={formik.values.name}
                                  onChngeterm={(e) =>
                                    formik.setFieldValue("name", e.target.value)
                                  }
                                  error={
                                    formik.touched.name &&
                                    Boolean(formik.errors.name)
                                  }
                                  helperText={
                                    formik.touched.name && formik.errors.name
                                  }
                                  type="text"
                                  variant="outlined"
                                />
                              </Box>

                              <Box width={{ xs: "100%", md: "50%" }}>
                                <TypographyMD
                                  variant="paragraph"
                                  label={t("Currency")}
                                  color="#626F86"
                                  fontFamily="Roboto"
                                  fontSize="14px"
                                  fontWeight={450}
                                  align="left"
                                />
                                <Inputfield
                                  autoFocus={false}
                                  value="USD - Dollar"
                                  disabled={true}
                                  type="text"
                                  variant="outlined"
                                  sx={{
                                    "& .MuiInputBase-input.Mui-disabled": {
                                      WebkitTextFillColor: "#000000",
                                      backgroundColor: "#f5f5f5",
                                    },
                                  }}
                                />
                              </Box>
                            </Box>

                            <Box
                              display="flex"
                              flexDirection={{ xs: "column", md: "row" }}
                              gap={2}
                            >
                              <Box width={{ xs: "100%", md: "33%" }}>
                                <TypographyMD
                                  variant="paragraph"
                                  label={
                                    <span>
                                      {t("Amount")}
                                      {formik.values.amount === "" && (
                                        <span
                                          style={{
                                            color: "red",
                                            marginLeft: 4,
                                          }}
                                        >
                                          *
                                        </span>
                                      )}
                                    </span>
                                  }
                                  color="#626F86"
                                  fontFamily="Roboto"
                                  fontSize="14px"
                                  fontWeight={433}
                                  align="left"
                                />
                                <Inputfield
                                  autoFocus={false}
                                  value={formik.values.amount}
                                  onChngeterm={(e) =>
                                    formik.setFieldValue(
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  error={
                                    formik.touched.amount &&
                                    Boolean(formik.errors.amount)
                                  }
                                  helperText={
                                    formik.touched.amount &&
                                    formik.errors.amount
                                  }
                                  type="number"
                                  variant="outlined"
                                />
                              </Box>
                              <Box width={{ xs: "100%", md: "33%" }}>
                                <TypographyMD
                                  variant="paragraph"
                                  label={
                                    <span>
                                      {t("Duration")}
                                      {formik.values.duration_type === "" && (
                                        <span
                                          style={{
                                            color: "red",
                                            marginLeft: 4,
                                          }}
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
                                  value={formik.values.duration_type}
                                  onChangeTerm={(e) =>
                                    formik.setFieldValue(
                                      "duration_type",
                                      e.target.value
                                    )
                                  }
                                  options={[
                                    { value: "month", label: t("month") },
                                    { value: "year", label: t("year") },
                                  ]}
                                  error={
                                    formik.touched.duration_type &&
                                    Boolean(formik.errors.duration_type)
                                  }
                                  helperText={
                                    formik.touched.duration_type &&
                                    formik.errors.duration_type
                                  }
                                />
                              </Box>
                              <Box width={{ xs: "100%", md: "33%" }}>
                                <TypographyMD
                                  variant="paragraph"
                                  label={
                                    <span>
                                      {t("Max Users")}
                                      {formik.values.max_users === "" && (
                                        <span
                                          style={{
                                            color: "red",
                                            marginLeft: 4,
                                          }}
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
                                  value={formik.values.max_users}
                                  onChngeterm={(e) =>
                                    formik.setFieldValue(
                                      "max_users",
                                      e.target.value
                                    )
                                  }
                                  error={
                                    formik.touched.max_users &&
                                    Boolean(formik.errors.max_users)
                                  }
                                  helperText={
                                    formik.touched.max_users &&
                                    formik.errors.max_users
                                  }
                                  type="number"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>

                            {/* --- Features --- */}

                            <div
                              style={{ marginBottom: "5px", marginTop: "10px" }}
                            >
                              <Box
                                display="flex"
                                flexDirection={{ xs: "column", md: "row" }}
                                gap={2}
                              >
                                <Box width={{ xs: "100%", md: "100%" }}>
                                  <TypographyMD
                                    variant="paragraph"
                                    label={t("Features")}
                                    color="#626F86"
                                    fontFamily="Roboto"
                                    fontSize="13px"
                                    marginBottom={1}
                                    fontWeight={450}
                                    align="left"
                                  />
                                  
                                  {/* Features Input with Add Button */}
                                  <Box
                                    display="flex"
                                    gap={1}
                                    alignItems="flex-start"
                                    mb={2}
                                  >
                                    <Box flex={1}>
                                      <Inputfield
                                        autoFocus={false}
placeholder={t("features.enterFeatureName")}
                                        value={formik.values.tempFeature || ""}
                                        onChngeterm={(e) =>
                                          formik.setFieldValue(
                                            "tempFeature",
                                            e.target.value
                                          )
                                        }
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            formik.values.tempFeature?.trim()
                                          ) {
                                            e.preventDefault();
                                            addFeature();
                                          }
                                        }}
                                        type="text"
                                        variant="outlined"
                                        sx={{
                                          "& .MuiOutlinedInput-root": {
                                            height: "35px",
                                          },
                                        }}
                                        inputProps={{
                                          maxLength: 100, // Limit feature name length
                                        }}
                                      />
                                    </Box>
                                    <Button
                                      variant="contained"
                                      onClick={addFeature}
                                      disabled={!formik.values.tempFeature?.trim()}
                                      sx={{
                                        minWidth: "40px",
                                        height: "35px",
                                        borderRadius: "6px",
                                        backgroundColor: "#006EC2",
                                        "&:hover": {
                                          backgroundColor: "#0056b3",
                                        },
                                        "&:disabled": {
                                          backgroundColor: "#e0e0e0",
                                          color: "#9e9e9e",
                                        },
                                      }}
                                    >
                                      <AddCircle sx={{ fontSize: "20px" }} />
                                    </Button>
                                  </Box>
                                  
                                  {/* Character counter */}
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mt={0.5}
                                  >
                                  
                                  </Box>

                                  {/* Features List */}
                                  {formik.values.features.length > 0 && (
                                    <Box
                                      sx={{
                                        border: "1px solid #e0e0e0",
                                        borderRadius: "6px",
                                        padding: "8px",
                                        backgroundColor: "#fafafa",
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                      }}
                                    >
                                      <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        marginBottom={1}
                                      >
                                        <TypographyMD
                                          variant="paragraph"
                                          label={`${t("Added Features")} (${formik.values.features.length})`}
                                          color="#666"
                                          fontFamily="Roboto"
                                          fontSize="12px"
                                          fontWeight={500}
                                          align="left"
                                        />
                                        {formik.values.features.length > 0 && (
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={clearAllFeatures}
                                            sx={{
                                              fontSize: "11px",
                                              minWidth: "auto",
                                              height: "24px",
                                              padding: "0 8px",
                                              color: "#f44336",
                                              borderColor: "#f44336",
                                              "&:hover": {
                                                backgroundColor: "#ffebee",
                                                borderColor: "#d32f2f",
                                              },
                                            }}
                                          >
                                            {t("Clear All")}
                                          </Button>
                                        )}
                                      </Box>
                                      <Box
                                        display="flex"
                                        flexDirection="column"
                                        gap={1}
                                      >
                                        {formik.values.features.map(
                                          (feature, index) => (
                                            <Box
                                              key={index}
                                              display="flex"
                                              alignItems="center"
                                              justifyContent="space-between"
                                              px={2}
                                              py={1}
                                              border="1px solid #d0d0d0"
                                              borderRadius="4px"
                                              backgroundColor="#fff"
                                              sx={{
                                                "&:hover": {
                                                  backgroundColor: "#f5f5f5",
                                                },
                                              }}
                                            >
                                              <TypographyMD
                                                fontSize="13px"
                                                color="#333"
                                                sx={{
                                                  flex: 1,
                                                  wordBreak: "break-word",
                                                }}
                                              >
                                                {feature}
                                              </TypographyMD>
                                              <IconButton
                                                size="small"
                                                onClick={() => removeFeature(index)}
                                                sx={{
                                                  color: "#f44336",
                                                  "&:hover": {
                                                    backgroundColor: "#ffebee",
                                                  },
                                                }}
                                              >
                                                <Close sx={{ fontSize: "16px" }} />
                                              </IconButton>
                                            </Box>
                                          )
                                        )}
                                      </Box>
                                    </Box>
                                  )}

                                  {/* Empty State */}
                                  {formik.values.features.length === 0 && (
                                    <Box
                                      sx={{
                                        border: "2px dashed #d0d0d0",
                                        borderRadius: "6px",
                                        padding: "20px",
                                        textAlign: "center",
                                        backgroundColor: "#fafafa",
                                      }}
                                    >
                                      <TypographyMD
                                        variant="paragraph"
                                      label={t("features.noFeaturesAdded")}

                                        color="#999"
                                        fontFamily="Roboto"
                                        fontSize="13px"
                                        fontWeight={400}
                                        align="center"
                                      />
                                      <TypographyMD
                                        variant="paragraph"
                                       label={t("features.addUsingInput")}
                                        color="#bbb"
                                        fontFamily="Roboto"
                                        fontSize="11px"
                                        fontWeight={400}
                                        align="center"
                                        marginTop={0.5}
                                      />
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </div>

                            <Box
                              display="flex"
                              flexDirection="column"
                              gap={1}
                              mt={1}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <TypographyMD
                                  variant="paragraph"
                                  label={
                                    <span>
                                      {t("Trial Period")}
                                      {formik.values.trial_unit === "" && (
                                        <span
                                          style={{
                                            color: "red",
                                            marginLeft: 4,
                                          }}
                                        >
                                          *
                                        </span>
                                      )}
                                    </span>
                                  }
                                  color="#626F86"
                                  // marginTop={2}
                                  fontFamily="Roboto"
                                  fontSize="14px"
                                  fontWeight={450}
                                  align="left"
                                />

                                <Box
                                  sx={{
                                    position: "relative",
                                    width: 50,
                                    height: 25,
                                  }}
                                >
                                  <Checkbox
                                    checked={formik.values.trial_period}
                                    onChange={() =>
                                      formik.setFieldValue(
                                        "trial_period",
                                        !formik.values.trial_period
                                      )
                                    }
                                    disableRipple
                                    inputProps={{
                                      "aria-label": "toggle switch",
                                    }}
                                    sx={{
                                      width: 50,
                                      height: 25,
                                      padding: 0,
                                      borderRadius: 20,
                                      backgroundColor: formik.values
                                        .trial_period
                                        ? "#2e7d32"
                                        : "#ddd",
                                      transition: "background-color 0.3s",
                                      "&:hover": {
                                        backgroundColor: formik.values
                                          .trial_period
                                          ? "#2e7d32"
                                          : "#ddd",
                                      },
                                      "& .MuiSvgIcon-root": {
                                        display: "none",
                                      },
                                    }}
                                  />

                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: 2,
                                      left: formik.values.trial_period ? 27 : 2,
                                      width: 21,
                                      height: 21,
                                      backgroundColor: "#fff",
                                      borderRadius: "50%",
                                      transition: "0.3s",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                                    }}
                                  >
                                    {formik.values.trial_period && (
                                      <Check
                                        sx={{ fontSize: 16, color: "#2e7d32" }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </div>

                              {formik.values.trial_period && (
                                <Grid container alignItems="center" spacing={1}>
                                  {/* Text section - takes majority width */}
                                  <Grid item xs={12} md={6}>
                                    <TypographyMD
                                      variant="paragraph"
                                      label={t(
                                        "User can access this plan trial version for the"
                                      )}
                                      color="#6B7280"
                                      fontFamily="Roboto"
                                      fontSize="14px"
                                      fontWeight={400}
                                    />
                                  </Grid>

                                  {/* Number input - compact */}
                                  <Grid item xs={6} md={3}>
                                    <Inputfield
                                      autoFocus={false}
                                      value={formik.values.trial_days}
                                      onChngeterm={(e) =>
                                        formik.setFieldValue(
                                          "trial_days",
                                          e.target.value
                                        )
                                      }
                                      error={
                                        formik.touched.trial_days &&
                                        Boolean(formik.errors.trial_days)
                                      }
                                      helperText={
                                        formik.touched.trial_days &&
                                        formik.errors.trial_days
                                      }
                                      type="number"
                                      variant="outlined"
                                      sx={{ width: "100%" }}
                                    />
                                  </Grid>

                                  {/* Unit selector - compact */}
                                  <Grid item xs={6} md={3}>
                                    <SelectField
                                      value={formik.values.billing_cycle}
                                      onChangeTerm={(e) =>
                                        formik.setFieldValue(
                                          "billing_cycle",
                                          e.target.value
                                        )
                                      }
                                      options={[
                                        { value: "daily", label: t("daily") },
                                        { value: "weekly", label: t("weekly") },
                                        { value: "monthly", label: t("monthly") },
                                        { value: "yearly", label: t("yearly") },
                                      ]}
                                      error={
                                        formik.touched.billing_cycle &&
                                        Boolean(formik.errors.billing_cycle)
                                      }
                                      helperText={
                                        formik.touched.billing_cycle &&
                                        formik.errors.billing_cycle
                                      }
                                      sx={{ width: "100%" }}
                                    />
                                  </Grid>
                                </Grid>
                              )}
                            </Box>

                            <Box display="flex" flexDirection="column" mt={1}>
                              <TypographyMD
                                variant="paragraph"
                                label={t("Description")}
                                color="#626F86"
                                fontFamily="Roboto"
                                fontSize="14px"
                                fontWeight={450}
                                align="left"
                              />

                              <Inputfield
                                autoFocus={false}
                                multiline={true}
                                rows={2}
                                value={formik.values.description}
                                onChngeterm={(e) =>
                                  formik.setFieldValue(
                                    "description",
                                    e.target.value
                                  )
                                }
                                error={
                                  formik.touched.description &&
                                  Boolean(formik.errors.description)
                                }
                                helperText={
                                  formik.touched.description &&
                                  formik.errors.description
                                }
                                type="text"
                                variant="outlined"
                              />
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
                    py: 1,
                    px: 1,
                    zIndex: 1,
                  }}
                >
                  <ButtonMD
                    variant="contained"
                    title={selectedPlan ? t("Update") : t("Save")}
                    startIcon={<CheckCircleOutline />}
                    width="fit-content"
                    type="submit"
                    borderColor="orange"
                    backgroundColor="orange"
                    borderRadius="3px"
                    disabled={loading}
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
                  <Grid
                    container
                    spacing={0}
                    p={{ xs: 2, md: 3, lg: 3, xl: 3 }}
                  >
                    <Grid xs={12} align="center">
                      <Stack
                        align="center"
                        direction="column"
                        spacing={2}
                        pb={3}
                      >
                        <img
                          src={confirmation_icon}
                          alt="..."
                          style={{ alignSelf: "center", width: "100px" }}
                        />

                        <TypographyMD
                          variant="paragraph"
                          label={
                            statusToChange === "Inactive"
                              ? "Are you sure you want to inactive this plan?"
                              : "Are you sure you want to active this plan?"
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
                            statusToChange === "Inactive"
                              ? "Inactive"
                              : "Active"
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
        </>
      )}
    </>
  );
}

export default BillingSubscriptions;
