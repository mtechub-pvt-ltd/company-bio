import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import logo_spanish from "../../Assets/logo_spanish.png";
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import absence from "../../Assets/absence.svg"
import { Category, Dashboard, ExpandLess, ExpandMore, GroupRemove, Groups, HeadsetMic, Policy, PrivacyTip, Public, RestaurantMenu, } from '@mui/icons-material';
import { NavLink, useNavigate } from 'react-router-dom';
import "../../App.css"
import { Grid, Typography } from '@mui/material';
// import "./Sidebar.css" 

import TypographyMD from '../items/Typography';

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

function Sidebar({ componentData }) {
    const navigate = useNavigate();

    const theme = useTheme();
    const [open, setOpen] = React.useState(true);

    const handleDrawerClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.innerWidth > 620) {
                setOpen(true);
            } else {
                setOpen(false);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const [openSupport, setOpenSupport] = useState(false);

    const handleSupportClick = () => {
        setOpenSupport(!openSupport);
    };

    return (
        <>
            <Box sx={{ backgroundColor: "#F4F6FA", height: "auto", display: 'flex' }}>
                <CssBaseline />

                <Drawer variant="permanent" open={open}>
                    {window.innerWidth < 620 ?
                        <></>
                        :
                        <>
                            <DrawerHeader sx={{ backgroundColor: "transparent" }}>
                                <Grid container spacing={0} pt={2}>
                                    <Grid xs={12} align="center" pt={3}>
                                        <div style={{ display: "flex", justifyContent: "center", alignContent: "center", alignItems: "center", gap: 10 }}>
                                            <Box component="img" src={logo_spanish} sx={{ width: "60px" }} />

                                            <TypographyMD variant='paragraph' label="E Commerce" color="#000000" fontFamily="Nunito Sans" marginTop={2} marginLeft={0} fontSize="17px" fontWeight={850} align="center" />
                                        </div>
                                    </Grid>

                                </Grid>

                            </DrawerHeader>
                        </>
                    }

                    <List sx={{ backgroundColor: "transparent", height: "100vh", pt: { xs: 5, md: 0 } }}>
                        <ul className='navbar'>

                            <li>
                                <NavLink
                                    to={`/dashboard`}
                                    className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                                >
                                    <ListItem disablePadding sx={{ display: 'block' }}>
                                        <ListItemButton
                                            sx={{
                                                minHeight: 0,
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2,
                                                pb: 0.8,
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: open ? 3 : 'auto',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Dashboard sx={{ fontSize: '25px' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography className='text' sx={{ fontFamily: "Nunito Sans", color: "#5E5C5C", fontWeight: 400 }}>
                                                        Dashboard
                                                    </Typography>
                                                }
                                                sx={{ opacity: open ? 1 : 0 }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to={`/account-executive`}
                                    className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                                >
                                    <ListItem disablePadding sx={{ display: 'block' }}>
                                        <ListItemButton
                                            sx={{
                                                minHeight: 0,
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2,
                                                pb: 0.8,
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: open ? 3 : 'auto',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Groups sx={{ fontSize: '25px' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography className='text' sx={{ fontFamily: "Nunito Sans", color: "#5E5C5C", fontWeight: 400 }}>
                                                        Account Executive
                                                    </Typography>
                                                }
                                                sx={{ opacity: open ? 1 : 0 }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to={`/deleted-users`}
                                    className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                                >
                                    <ListItem disablePadding sx={{ display: 'block' }}>
                                        <ListItemButton
                                            sx={{
                                                minHeight: 0,
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2,
                                                pb: 0.8,
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: open ? 3 : 'auto',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <GroupRemove sx={{ fontSize: '25px' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography className='text' sx={{ fontFamily: "Nunito Sans" }}>
                                                        Deleted Accounts
                                                    </Typography>
                                                }
                                                sx={{ opacity: open ? 1 : 0 }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to={`/orders`}
                                    className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                                >
                                    <ListItem disablePadding sx={{ display: 'block' }}>
                                        <ListItemButton
                                            sx={{
                                                minHeight: 0,
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2,
                                                pb: 0.8,
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: open ? 3 : 'auto',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <RestaurantMenu sx={{ fontSize: '25px' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography className='text' sx={{ fontFamily: "Nunito Sans" }}>
                                                        Order Management
                                                    </Typography>
                                                }
                                                sx={{ opacity: open ? 1 : 0 }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to={`/countries`}
                                    className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                                >
                                    <ListItem disablePadding sx={{ display: 'block' }}>
                                        <ListItemButton
                                            sx={{
                                                minHeight: 0,
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2,
                                                pb: 0.8,
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: open ? 3 : 'auto',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Public sx={{ fontSize: '25px' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography className='text' sx={{ fontFamily: "Nunito Sans" }}>
                                                        Country Management
                                                    </Typography>
                                                }
                                                sx={{ opacity: open ? 1 : 0 }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to={`/categories`}
                                    className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                                >
                                    <ListItem disablePadding sx={{ display: 'block' }}>
                                        <ListItemButton
                                            sx={{
                                                minHeight: 0,
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2,
                                                pb: 0.8,
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: open ? 3 : 'auto',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Category sx={{ fontSize: '25px' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography className='text' sx={{ fontFamily: "Nunito Sans" }}>
                                                        Category Management
                                                    </Typography>
                                                }
                                                sx={{ opacity: open ? 1 : 0 }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </NavLink>
                            </li>

                            <li>
                                <ListItem disablePadding sx={{ display: 'block' }} onClick={handleSupportClick}>
                                    <ListItemButton
                                        sx={{
                                            minHeight: 0,
                                            justifyContent: open ? 'initial' : 'center',
                                            px: 2,
                                            pb: 0.8,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                mr: open ? 3 : 'auto',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <HeadsetMic sx={{ fontSize: '25px', color: openSupport ? 'blue' : 'gray' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Typography sx={{ fontFamily: "Nunito Sans", color: openSupport ? 'blue' : 'gray' }}>
                                                    Customer Support
                                                </Typography>
                                            }
                                            sx={{ opacity: open ? 1 : 0 }}
                                        />
                                        <Box sx={{ minWidth: 24, display: 'flex', justifyContent: 'center' }}>
                                            {openSupport ? <ExpandLess /> : <ExpandMore />}
                                        </Box>
                                    </ListItemButton>
                                </ListItem>

                                {/* Submenu */}
                                {openSupport && (
                                    <List component="div" disablePadding sx={{ pl: 3 }}>
                                        <NavLink to={`/faqs`} className="navbar-link">
                                            <ListItemButton>
                                                <ListItemText
                                                    primary={<Typography sx={{ fontFamily: "Nunito Sans" }}>FAQs</Typography>}
                                                />
                                            </ListItemButton>
                                        </NavLink>
                                        <NavLink to={`/feedbacks`} className="navbar-link">
                                            <ListItemButton>
                                                <ListItemText
                                                    primary={<Typography sx={{ fontFamily: "Nunito Sans" }}>Feedbacks</Typography>}
                                                />
                                            </ListItemButton>
                                        </NavLink>
                                        <NavLink to={`/chatsupport`} className="navbar-link">
                                            <ListItemButton>
                                                <ListItemText
                                                    primary={<Typography sx={{ fontFamily: "Nunito Sans" }}>Chat Support</Typography>}
                                                />
                                            </ListItemButton>
                                        </NavLink>
                                    </List>
                                )}
                            </li>

                            <li>
                                <NavLink
                                    to={`/privacypolicy`}
                                    className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                                >
                                    <ListItem disablePadding sx={{ display: 'block' }}>
                                        <ListItemButton
                                            sx={{
                                                minHeight: 0,
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2,
                                                pb: 0.8,
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: open ? 3 : 'auto',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <PrivacyTip sx={{ fontSize: '25px' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography className='text' sx={{ fontFamily: "Nunito Sans" }}>
                                                        Privacy Policy
                                                    </Typography>
                                                }
                                                sx={{ opacity: open ? 1 : 0 }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </NavLink>
                            </li>

                            <li>
                                <NavLink
                                    to={`/termsconditions`}
                                    className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                                >
                                    <ListItem disablePadding sx={{ display: 'block' }}>
                                        <ListItemButton
                                            sx={{
                                                minHeight: 0,
                                                justifyContent: open ? 'initial' : 'center',
                                                px: 2,
                                                pb: 0.8,
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    minWidth: 0,
                                                    mr: open ? 3 : 'auto',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Policy sx={{ fontSize: '25px' }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography className='text' sx={{ fontFamily: "Nunito Sans" }}>
                                                        Terms & Conditions
                                                    </Typography>
                                                }
                                                sx={{ opacity: open ? 1 : 0 }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </NavLink>
                            </li>

                        </ul>
                    </List>

                </Drawer>

                <Box component="main" sx={{ width: { xs: "50%", md: "100%" }, flexGrow: 1 }}>

                    {componentData}

                </Box>
            </Box>
        </>
    )
}

export default Sidebar