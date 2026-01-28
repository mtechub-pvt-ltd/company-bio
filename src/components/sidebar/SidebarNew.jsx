import React, { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  Drawer as MuiDrawer,
  CssBaseline,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  useMediaQuery,
  AppBar,
  Toolbar,
  Collapse,
  Avatar,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import {
  AccountBalance,
  AttachMoney,
  BroadcastOnHome,
  Business,
  Chat,
  ContentCopy,
  Dashboard,
  ExpandLess,
  ExpandMore,
  KeyboardArrowDown,
  KeyboardArrowRight,
  KeyboardArrowUp,
  Menu as MenuIcon,
  MonetizationOn,
  Notifications,
  Payment,
  PeopleOutline,
  Person,
  Settings,
  SettingsOverscan,
  DeleteOutline,
  Subscriptions,
  Support,
    ContactMail,        // Contact Us Requests
  Policy,             // Privacy Policy
  Gavel,
  Logout,
} from "@mui/icons-material";
import { NavLink, useLocation } from "react-router-dom";
import logo_spanish from "../../Assets/logo_spanish.png";
import logo_english from "../../Assets/logo_english.png";
import TypographyMD from "../items/Typography";
import Topbar from "../topbar/Topbar";
import "./Sidebar.css";
import ModalConfirmation from "../items/ModalConfirmation";
import ButtonMD from "../items/ButtonMD";
import logoutImg from "../../Assets/logout.png";
import { useEffect } from "react";
import flag_eng from "../../Assets/flag_eng.png";
import flag_spanish from "../../Assets/flag_spanish.png";
import { useTranslation } from "react-i18next";
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import useRoleBasedMessageCounts from "../../hooks/useRoleBasedMessageCounts";
import absence from "../../Assets/absence.svg"
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearAuth } from "../../store/slices/authSlice";
const drawerWidth = 300;

const DrawerHeader = styled("div")(({ theme }) => ({
  ...theme.mixins.toolbar,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

function Sidebar({ componentData, componentTitle }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // <600px
  const [mobileOpen, setMobileOpen] = useState(false);
  const { roleCounts } = useRoleBasedMessageCounts();
  // Get total unread count from Redux for live updates
  const totalUnreadCount = useSelector((state) => state.messageCount?.total || 0);
  const dispatch = useDispatch();
  const [openmodallogout, setOpenmodallogout] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const [openFinance, setOpenFinance] = useState(false);
  const [openMessages, setOpenMessages] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Auto-open the submenu if current path is a subpage
    if (
      location.pathname.includes(`/commission-management`) ||
      location.pathname.includes(`/billing-subscriptions`) ||
      location.pathname.includes(`/payout-logs`)
    ) {
      setOpenFinance(true);
    }
    
    // Auto-open Messages if current path is a subpage
    if (
      location.pathname.includes(`/messages`) ||
      location.pathname.includes(`/account-executive-messages`) ||
      location.pathname.includes(`/company-admin-messages`)
    ) {
      setOpenMessages(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Auto-open the submenu if current path is a subpage
    if (
      location.pathname.includes(`/broadcast-to-Admin`) ||
      location.pathname.includes(`/support-inbox`)
    ) {
      setOpenMessages(true);
    }
  }, [location.pathname]);

  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Initialize from localStorage directly
    const savedLang = localStorage.getItem("lang");
    return savedLang || i18n.language || "en";
  });

  // Sync with localStorage on mount and whenever localStorage changes
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) {
      i18n.changeLanguage(savedLang);
      setCurrentLanguage(savedLang);
    }
  }, []);

  // Listen for language changes from i18n
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLanguage(lng);
      localStorage.setItem("lang", lng); // Ensure localStorage is updated
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    handleClose(); // Close menu after selection
  };

  const getCurrentFlag = () => {
    if (currentLanguage === "en") {
      return {
        src: flag_eng,
        label: "English",
      };
    }
    if (currentLanguage === "es") {
      return {
        src: flag_spanish,
        label: "Español",
      };
    }
    return {
      src: flag_eng,
      label: "English",
    }; // Default to English if language is not recognized
  };

  const currentFlag = getCurrentFlag();
  const currentLang = currentLanguage;
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      dispatch(clearAuth());
      navigate("/");
      setOpenmodallogout(false);
      setLoading(false);
    }, 1000);
  };
  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
      <Box sx={{ pt: 0.1, borderBottom: "2px solid #F4F6FA" }}>
        <DrawerHeader></DrawerHeader>
      </Box>

      <List>
        <NavLink
          to={`/dashboard`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Dashboard />
              </ListItemIcon>
              <ListItemText primary={t("Dashboard")} />
            </ListItemButton>
          </ListItem>
        </NavLink>

        {/* Account Executive - Direct Link */}
        <NavLink
          to={`/account-executive`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PeopleOutline />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Typography sx={{ flexGrow: 1 }}>
                      {t("Account Executive")}
                    </Typography>
                    {/* {roleCounts.account_executive > 0 && (
                      <Box
                        sx={{
                          backgroundColor: "#006ec2",
                          color: "white",
                          borderRadius: "50%",
                          minWidth: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "600",
                          fontFamily: "Poppins, sans-serif",
                          ml: 1,
                        }}
                      >
                        {roleCounts.account_executive}
                      </Box>
                    )} */}
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        </NavLink>

        {/* Company Admin - Direct Link */}
        <NavLink
          to={`/company-admin`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Business />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                    <Typography sx={{ flexGrow: 1 }}>
                      {t("Company Admins")}
                    </Typography>
                    {/* {roleCounts.company_admin > 0 && (
                      <Box
                        sx={{
                          backgroundColor: "#006ec2",
                          color: "white",
                          borderRadius: "50%",
                          minWidth: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "600",
                          fontFamily: "Poppins, sans-serif",
                          ml: 1,
                        }}
                      >
                        {roleCounts.company_admin}
                      </Box>
                    )} */}
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        </NavLink>
        <NavLink
          to={`/workers`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Person />
              </ListItemIcon>
              <ListItemText primary={t("Workers")} />
            </ListItemButton>
          </ListItem>
        </NavLink>

        {/* Total Users - Direct Link */}
        <NavLink
          to={`/total-users`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PeopleOutline />
              </ListItemIcon>
              <ListItemText primary={t("Total Users")} />
            </ListItemButton>
          </ListItem>
        </NavLink>

{/* 
      <NavLink
          to={`/delete-requests`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <DeleteOutline/>
              </ListItemIcon>
              <ListItemText primary={t("deletion_requests")} />
            </ListItemButton>
          </ListItem>
        </NavLink> */}


        {/* Messages parent list item (toggles submenu open/close) */}
        {/* <ListItemButton onClick={() => setOpenMessages(!openMessages)}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Chat />
          </ListItemIcon>
          <ListItemText 
            primary={
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <Typography sx={{ flexGrow: 1 }}>
                  {t("Messages")}
                </Typography>
                {(roleCounts.account_executive > 0 || roleCounts.company_admin > 0) && (
                  <Box
                    sx={{
                      backgroundColor: "#006ec2",
                      color: "white",
                      borderRadius: "50%",
                      minWidth: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "600",
                      fontFamily: "Poppins, sans-serif",
                      ml: 1,
                    }}
                  >
                    {roleCounts.account_executive + roleCounts.company_admin}
                  </Box>
                )}
              </Box>
            }
          />
          {openMessages ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton> */}
              <ListItemButton onClick={() => navigate("/messages")}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Chat />
          </ListItemIcon>
          <ListItemText 
            primary={
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <Typography sx={{ flexGrow: 1 }}>
                  {t("Messages")}
                </Typography>
                {totalUnreadCount > 0 && (
                  <Box
                    sx={{
                      backgroundColor: "#006ec2",
                      color: "white",
                      borderRadius: "50%",
                      minWidth: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: "600",
                      fontFamily: "Poppins, sans-serif",
                      ml: 1,
                    }}
                  >
                    {totalUnreadCount}
                  </Box>
                )}
              </Box>
            }
          />
          {/* {openMessages ? <ExpandLess /> : <ExpandMore />} */}
        </ListItemButton>
{/* 
        <Collapse in={openMessages} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <NavLink
              to={`/messages?role=account_executive`}
              className={({ isActive, location }) => {
                try {
                  const currentRole = location?.search ? new URLSearchParams(location.search).get('role') : null;
                  const isAccountExecutiveActive = isActive && currentRole === 'account_executive';
                  return `navbar-link ${isAccountExecutiveActive ? "active" : ""}`;
                } catch (error) {
                  console.warn("Error parsing URL search params:", error);
                  return `navbar-link ${isActive ? "active" : ""}`;
                }
              }}
            >
              <ListItemButton sx={{ pl: 4, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <KeyboardArrowRight sx={{ width: "15px", marginLeft: 2 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <Typography sx={{ flexGrow: 1 }}>
                        {t("Account Executive")}
                      </Typography>
                      {roleCounts.account_executive > 0 && (
                        <Box
                          sx={{
                            backgroundColor: "#006ec2",
                            color: "white",
                            borderRadius: "50%",
                            minWidth: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: "600",
                            fontFamily: "Poppins, sans-serif",
                            ml: 1,
                          }}
                        >
                          {roleCounts.account_executive}
                        </Box>
                      )}
                    </Box>
                  }
                  sx={{ 
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    textOverflow: "unset"
                  }} 
                />
              </ListItemButton>
            </NavLink>

            <NavLink
              to={`/messages?role=company_admin`}
              className={({ isActive, location }) => {
                try {
                  const currentRole = location?.search ? new URLSearchParams(location.search).get('role') : null;
                  const isCompanyAdminActive = isActive && currentRole === 'company_admin';
                  return `navbar-link ${isCompanyAdminActive ? "active" : ""}`;
                } catch (error) {
                  console.warn("Error parsing URL search params:", error);
                  return `navbar-link ${isActive ? "active" : ""}`;
                }
              }}
            >
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <KeyboardArrowRight sx={{ width: "15px", marginLeft: 2 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <Typography sx={{ flexGrow: 1 }}>
                        {t("Company Admins")}
                      </Typography>
                      {roleCounts.company_admin > 0 && (
                        <Box
                          sx={{
                            backgroundColor: "#006ec2",
                            color: "white",
                            borderRadius: "50%",
                            minWidth: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: "600",
                            fontFamily: "Poppins, sans-serif",
                            ml: 1,
                          }}
                        >
                          {roleCounts.company_admin}
                        </Box>
                      )}
                    </Box>
                  }
                  sx={{ 
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    textOverflow: "unset"
                  }} 
                />
              </ListItemButton>
            </NavLink>

            <NavLink
              to={`/messages?role=worker`}
              className={({ isActive, location }) => {
                try {
                  const currentRole = location?.search ? new URLSearchParams(location.search).get('role') : null;
                  const isWorkerActive = isActive && currentRole === 'worker';
                  return `navbar-link ${isWorkerActive ? "active" : ""}`;
                } catch (error) {
                  console.warn("Error parsing URL search params:", error);
                  return `navbar-link ${isActive ? "active" : ""}`;
                }
              }}
            >
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <KeyboardArrowRight sx={{ width: "15px", marginLeft: 2 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={t("Workers")} 
                  sx={{ 
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    textOverflow: "unset"
                  }} 
                />
              </ListItemButton>
            </NavLink>
          </List>
        </Collapse> */}

        {/* <NavLink
          to={`/workers`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <PeopleOutline />
              </ListItemIcon>
              <ListItemText primary={t("Worker Management")} />
            </ListItemButton>
          </ListItem>
        </NavLink> */}

        {/* // Financial Operations parent list item (toggles submenu open/close) */}
        <ListItemButton onClick={() => setOpenFinance(!openFinance)}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <AttachMoney />
          </ListItemIcon>
          <ListItemText primary={t("Financial Operations")} />
          {openFinance ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openFinance} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <NavLink
              to={`/commission-management`}
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >

              <ListItemButton sx={{ pl: 4,py:1 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <KeyboardArrowRight sx={{ width: "15px", marginLeft: 2 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={t("Commission Management")}
                  sx={{ 
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    textOverflow: "unset"
                  }} 
                />
              </ListItemButton>
            </NavLink>

            <NavLink
              to={`/billing-subscriptions`}
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >

              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <KeyboardArrowRight sx={{ width: "15px", marginLeft: 2 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={t("Billing & Subscriptions")} 
                  sx={{ 
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    textOverflow: "unset"
                  }} 
                />
              </ListItemButton>
            </NavLink>

            <NavLink
              to={`/payout-logs`}
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <KeyboardArrowRight sx={{ width: "15px", marginLeft: 2 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={t("Payout Logs")} 
                  sx={{ 
                    whiteSpace: "nowrap",
                    overflow: "visible",
                    textOverflow: "unset"
                  }} 
                />
              </ListItemButton>
            </NavLink>
          </List>
        </Collapse>

        {/* messages
        <ListItemButton onClick={() => setOpenMessages(!openMessages)}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Chat />
          </ListItemIcon>
          <ListItemText primary={t("Messages")} />
          {openMessages ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openMessages} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <NavLink
              to={`/broadcast-to-Admin`}
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              <ListItem disablePadding sx={{ px: 0.5 }}>
                <ListItemButton>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <KeyboardArrowRight sx={{ width: "15px", marginLeft: 2 }} />
                  </ListItemIcon>
                  <ListItemText primary={t("Broadcast To Admins")} />
                </ListItemButton>
              </ListItem>
            </NavLink>

            <NavLink
              to={`/support-inbox`}
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              <ListItem disablePadding sx={{ px: 0.5 }}>
                <ListItemButton>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <KeyboardArrowRight sx={{ width: "15px", marginLeft: 2 }} />
                  </ListItemIcon>
                  <ListItemText primary={t("Support Inbox")} />
                </ListItemButton>
              </ListItem>
            </NavLink>
          </List>
        </Collapse> */}
{/* 
        <NavLink
          to={`/ticketmanagement`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ConfirmationNumberOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary={t("Ticket Management")} />
            </ListItemButton>
          </ListItem>
        </NavLink> */}

        <NavLink
          to={`/content-management`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ContentCopy />
              </ListItemIcon>
              <ListItemText primary={t("Content Management")} />
            </ListItemButton>
          </ListItem>
        </NavLink>

        <NavLink
          to={`/system-oversight`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <SettingsOverscan />
              </ListItemIcon>
              <ListItemText primary={t("System Oversights")} />
            </ListItemButton>
          </ListItem>
        </NavLink>
    {/* notifications  will come here  */}
        {/* <NavLink
          to={`/notifications`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
       
          {/* <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Notifications />
              </ListItemIcon>
              <ListItemText primary={t("Notifications")} />
            </ListItemButton>
          </ListItem>
        </NavLink>  */}


   <NavLink
          to={`/contact-us-requests`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ContactMail  />
              </ListItemIcon>
              <ListItemText primary={t("contactUsRequests")} />
            </ListItemButton>
          </ListItem>
        </NavLink>

           <NavLink
          to={`/privacy-policy`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Policy  />
              </ListItemIcon>
              <ListItemText primary={t("privacyPolicy")} />
            </ListItemButton>
          </ListItem>
        </NavLink>
           <NavLink
          to={`/terms-conditions`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Gavel  />
              </ListItemIcon>
              <ListItemText primary={t("termsAndConditions")} />
            </ListItemButton>
          </ListItem>
        </NavLink>
        
        <NavLink
          to={`/system_configuration`}
          className={({ isActive }) =>
            `navbar-link ${isActive ? "active" : ""}`
          }
        >
          <ListItem disablePadding sx={{ px: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Settings />
              </ListItemIcon>
              <ListItemText primary={t("System Configuration")} />
            </ListItemButton>
          </ListItem>
        </NavLink>

        {/* Logout */}
        <ListItem disablePadding sx={{ px: 0.5 }}>
          <ListItemButton
            onClick={() => setOpenmodallogout(true)}
            sx={{
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary={t("Logout")} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
  return (
    <>
      <Box sx={{ backgroundColor: "#F4F6FA", height: "auto", display: "flex" }}>
        <CssBaseline />

        {/* AppBar with menu button on mobile */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{ zIndex: theme.zIndex.drawer + 1 }}
        >
          <Toolbar
            sx={{
              display: "grid",
              backgroundColor: "#fff",
              boxShadow: "none",
              gridTemplateColumns: "1fr auto", // Left takes remaining space, right is auto-sized
              alignItems: "center",
            }}
          >
            {/* Left side (logo + title) */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon sx={{ color: "black" }} />
                </IconButton>
              )}

              {currentLang === "es" ? (
                <Box
                  component="img"
                  src={logo_spanish}
                  sx={{
                    display: { xs: "none", sm: "block", md: "block" },
                    width: "170px",
                    mr: 5,
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={logo_english}
                  sx={{
                    display: { xs: "none", sm: "block", md: "block" },
                    width: "170px",
                    mr: 5,
                  }}
                />
              )}

              <Box sx={{ display: { xs: "block", sm: "block", md: "block" } }}>
                <TypographyMD
                  variant="paragraph"
                  label={t(componentTitle)}
                  color="#172B4D"
                  marginLeft={{ xs: -2, md: 1 }}
                  fontFamily="Poppins, sans-serif"
                  fontSize="20px"
                  fontWeight={700}
                  align="center"
                />
              </Box>

              {/* language swithcher on topbar at big screens */}
              <Box
                sx={{
                  display: { xs: "none", sm: "flex ", md: "flex" },
                  alignItems: "center",
                  backgroundColor: "#F4F5F7",
                  borderRadius: "5px",
                  px: 1,
                  py: 1,
                  ml: 2,
                  cursor: "pointer",
                  width: "auto",
                  ml: "auto",
                }}
                onClick={handleClick}
              >
                {/* <Avatar
                                    variant="square"
                                    src={currentFlag.src}
                                    sx={{ width: 24, height: 16, mr: 1 }}
                                /> */}
                <Typography
                  sx={{ color: "#172B4D", fontSize: "13px",  mr: 2 , paddingY:"1px", paddingX:"7px" }}
                >
                  {currentFlag.label}
                </Typography>
                {anchorEl ? (
                  <KeyboardArrowUp
                    sx={{ color: "#6B778C", fontSize: "20px" }}
                  />
                ) : (
                  <KeyboardArrowDown
                    sx={{ color: "#6B778C", fontSize: "20px" }}
                  />
                )}
              </Box>
            </Box>

            {/* Right side (Topbar) */}
            <Box>
              <Topbar />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer */}
        {isMobile ? (
          <MuiDrawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
              },
            }}
          >
            {drawerContent}
          </MuiDrawer>
        ) : (
          // Desktop Drawer (permanent)
          <MuiDrawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                overflowX: "hidden", // Prevent horizontal scroll
                borderRight: "3px solid #F4F6FA",
              },
            }}
            open
          >
            {drawerContent}
          </MuiDrawer>
        )}

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { xs: "50%", md: "100%" },
            mt: isMobile ? "74px" : "84px", // Add top margin if AppBar is shown
          }}
        >
          {componentData}
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ mt: 1 }}
      >
        {["en", "es"].map((lang) => (
          <MenuItem
            key={lang}
            selected={currentLanguage === lang}
            onClick={() => changeLanguage(lang)}
          >
            {/* <Avatar
              variant="square"
              src={lang === "en" ? flag_eng : flag_spanish}
              sx={{ width: 28, height: 16 }}
            /> */}
            <Typography mt={0.5} sx={{ fontSize: "14px", marginLeft: 1 }}>
              {lang === "en" ? "English " : "Español"}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Logout Modal */}
      <ModalConfirmation
        open={openmodallogout}
        onClose={() => setOpenmodallogout(false)}
        title={t("Logout")}
        data={
          <Stack alignItems="center" spacing={2} p={2}>
            <img src={logoutImg} alt="logout" width={100} />
            <TypographyMD
              label={t("Are you sure you want to logout ?")}
              align="center"
              fontSize={13}
              fontWeight={600}
            />
            <Stack direction="row" spacing={1}>
              <ButtonMD
                variant="outlined"
                title={t("Cancel")}
                onClickTerm={() => setOpenmodallogout(false)}
              />
              <ButtonMD
                variant="contained"
                title={t("Logout")}
                onClickTerm={handleLogout}
                disabled={loading}
              />
            </Stack>
          </Stack>
        }
      />
    </>
  );
}

export default Sidebar;










