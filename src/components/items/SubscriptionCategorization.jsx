import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Grid,
} from "@mui/material";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ToggleOff from "@mui/icons-material/ToggleOff";
import Block from "@mui/icons-material/Block";
import Email from "@mui/icons-material/Email";
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined";
import TypographyMD from "./Typography";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import url from "../../url";

// Import next icon
import next from "../../Assets/next.png";

const SubscriptionCategorization = () => {

    const { t } = useTranslation();
    const { token } = useSelector((state) => state?.auth || {});
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [accountExecutives, setAccountExecutives] = useState([]);


    // Fetch Account Executives data
    useEffect(() => {
        if (!token) return;

        const fetchAccountExecutives = async () => {
            try {
                const sort_by = "created_at";
                const sort_order = "DESC";
                const apiURL = `${url}super-admin/account-executives?sort_by=${sort_by}&sort_order=${sort_order}&limit=5`;

                const res = await fetch(apiURL, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    console.error("Fetch error:", res.status, res.statusText);
                    setAccountExecutives([]);
                    return;
                }

                const data = await res.json();

                if (!data?.error && Array.isArray(data?.data?.account_executives)) {
                    const sortedExecutives = data.data.account_executives
                        .sort((a, b) => new Date(b.registered || 0) - new Date(a.registered || 0))
                        .slice(0, 5);

                    const formattedData = sortedExecutives.map(executive => ({
                        name: executive?.full_name || 'N/A',
                        status: executive?.status || 'inactive',
                        verification_status: executive?.verification_status || 'pending',
                        id: executive?.id || 0
                    }));

                    setAccountExecutives(formattedData);
                } else {
                    setAccountExecutives([]);
                }
            } catch (err) {
                console.error("Error fetching account executives:", err);
                setAccountExecutives([]);
            }
        };

        fetchAccountExecutives();
    }, [token]);


    // Helper functions for status display
    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase() || '';
        switch (statusLower) {
            case "active": return "#4BCE97";
            case "inactive":
            case "blocked": return "#F87168";
            case "requested": return "#F5CD47";
            case "invited": return "#579DFF";
            default: return "#ccc";
        }
    };

    const getStatusIcon = (status) => {
        const statusLower = status?.toLowerCase() || '';
        const iconProps = { fontSize: "17px", sx: { mr: 1 } };
        
        switch (statusLower) {
            case "active": return <CheckCircleOutline {...iconProps} />;
            case "inactive": return <ToggleOff {...iconProps} />;
            case "blocked": return <Block {...iconProps} />;
            case "requested": return <CloudSyncOutlinedIcon {...iconProps} />;
            case "invited": return <Email {...iconProps} />;
            default: return null;
        }
    };

    // Safe navigation handler
    const handleNavigation = (path, state = null) => {
        try {
            navigate(path, state ? { state } : undefined);
        } catch (error) {
            console.error("Navigation error:", error);
        }
    };

    return (
        <Card sx={{ boxShadow: "none", borderRadius: "10px",border:'2px solid #dcdfe4' }}>
            <CardContent>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height={200}>
                        <CircularProgress size={40} thickness={3} color="primary" />
                    </Box>
                ) : (
                    <>
                        {/* Account Executives Table */}
                        <Box mt={4}>
                            <Grid container spacing={0} sx={{ mb: 4 }}>
                                <Grid item xs={12} md={6}>
                                    <TypographyMD 
                                        variant='paragraph' 
                                        label={t("Account Executive")} 
                                        color="#424242" 
                                        fontFamily="Roboto" 
                                        fontSize="16px" 
                                        fontWeight={600} 
                                        align="left" 
                                    />
                                </Grid>
                                <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "flex-end" }}>
                                    <img
                                        src={next}
                                        alt="Navigate"
                                        style={{ width: "30px", cursor: "pointer" }}
                                        onClick={() => handleNavigation("/account-executive")}
                                    />
                                </Grid>
                            </Grid>
                            <TableContainer component={Paper} sx={{ boxShadow: "none", border: "1px solid #E5E7EB" }}>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: "#F8F9FA" }}>
                                            <TableCell sx={{ fontWeight: 600, color: "#424242" }}>
                                                {t("Executive Name")}
                                            </TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 600, color: "#424242" }}>
                                                {t("Account Status")}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {accountExecutives && accountExecutives.length > 0 ? (
                                            accountExecutives.map((executive, index) => (
                                                <TableRow
                                                    key={executive?.id || index}
                                                    hover
                                                >
                                                    <TableCell sx={{ fontWeight: 400 }}>
                                                        {executive?.name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Box
                                                            sx={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                backgroundColor: getStatusColor(executive?.status),
                                                                color: "#172B4D",
                                                                borderRadius: "5px",
                                                                px: 1.5,
                                                                py: 0.5,
                                                                fontSize: "14px",
                                                                fontWeight: 400,
                                                            }}
                                                        >
                                                            {getStatusIcon(executive?.status)}
                                                           {t(`executiveStatus.${executive?.status || "inactive"}`)}

                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    {t("No data available")}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </>
                )}

            </CardContent>
        </Card>
    );
};

export default SubscriptionCategorization;
