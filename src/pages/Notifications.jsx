import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  Pagination,
  CircularProgress,
  Typography,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import Search from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SidebarNew from "../components/sidebar/SidebarNew";
import CustomText, { textStyles } from "../components/CustomText";
import nodata from "../Assets/nodata.png"
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import url from "../url"
import { showToast } from "../helper_functions/messageHandler";  // your path
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
function Notifications() {
  const { t } = useTranslation();
  const { token,  } = useSelector((state) => state.auth);
const location = useLocation();
const navigate = useNavigate();

const isFromTopbar = location.state?.fromTopbar === true;
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 5;
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
const NOTIFICATION_ROUTE_MAP = {
  worker_registration: "/workers",
  ae_registration: "/account-executive",
  ca_registration: "/company-admin",
};
  // ---------------------- Fetch Notifications ---------------------
const fetchNotifications = async (pageNum = 1) => {
  setLoading(true);
  try {
    const response = await fetch(
      `${url}notifications/superadmin?page=${pageNum}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok && !data.error) {
      setNotifications(data.data.notifications);
      setTotalPages(data.data.pagination.pages);
    }
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

const handleNotificationClick = (notification) => {
  const routeMap = {
    worker_registration: "/workers",
    ae_registration: "/account-executive",
    ca_registration: "/company-admin",
  };

  const route = routeMap[notification.type];

  if (route) {
    navigate(route, {
      state: {
        fromDashboard: true,
      },
    });
  }
};


  // ---------------------- Mark All As Read -------------------------
  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${url}notifications/superadmin/mark-all-read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && !data.error) {
      showToast(toast.success, data, "Marked as read successfully");
       fetchNotifications(page);
      } else {
      showToast(toast.error, data, "Failed to mark as read");
      }
    } catch (error) {
    showToast(toast.error, null, "Something went wrong");
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const filteredData = notifications.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarNew
      componentTitle={t("Admin")}
      componentData={
        <Box
          sx={{
            width: "100%",
            overflowX: "hidden",
            height: "calc(100vh - 80px)",
            px: 2,
            pt: 2,
          }}
        >

                   <Box sx={{ display: "flex", alignItems: "center", gap: 1,mb:2,}}>
  {isFromTopbar && (
    <IconButton
      onClick={() => navigate(-1)}
      sx={{ color: "#003149" }}
    >
   <ArrowBackIcon />
    </IconButton>
  )}

  <CustomText
    sx={{
      ...textStyles.h1,
      fontWeight: 600,
      fontSize: "18px",
      color: "#003149",
    }}
  >
    {t("notifications_title")}
  </CustomText>
</Box>
          {/* ---------------- Header ---------------- */}
          <Box
            sx={{
              backgroundColor: "white",
              border: "2px solid rgba(9,30,66,0.14)",
              borderRadius: "12px",
              py: 2,
              minHeight: "70vh",
            }}
          >

   

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #E0E0E0",
                px: 2,
                pb: 2,
                mb: 2,
              }}
            >
              <CustomText
                sx={{
                  ...textStyles.h1,
                  fontWeight: 600,
                  fontSize: "20px",
                  color: "#003149",
                }}
              >
{t("notifications_title")}              </CustomText>

              <IconButton
                onClick={markAllAsRead}
                sx={{
                  backgroundColor: "#006EC2",
                  color: "white",
                  px: 2,
                  borderRadius: "6px",
                  fontSize: 14,
                  fontFamily: "Poppins, sans-serif",
                  "&:hover": { backgroundColor: "#005bb5" },
                }}
              >
                <MarkEmailReadOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
            {t("notifications_mark_all")}
              </IconButton>
            </Box>

     

            {/* ---------------- Loader ---------------- */}
            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "50vh",
                }}
              >
                <CircularProgress />
              </Box>
            ) : filteredData.length === 0 ? (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 5,
                }}
              >
                <img src={nodata} alt="No Data" style={{ width: 200 }} />
                <Typography sx={{ mt: 2, color: "#003149", fontSize: "16px" }}>
                  {t("No Notifications Found")}
                </Typography>
              </Box>
            ) : (
              <>
                {/* ---------------- Notification List ---------------- */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, px: 2 }}>
                  {filteredData.map((n, i) => (
                    <Box
                      key={i}
                        onClick={() => handleNotificationClick(n)}
                      sx={{
                        backgroundColor: !n.is_read ? "#EAF4FF" : "#fff",
                        border: `2px solid ${!n.is_read ? "#006EC2" : "#DADADA"}`,
                        borderRadius: 2,
                        px: 2,
                        py: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: "16px",
                            color: "#212121",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {n.title}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 14,
                            color: "#555",
                            mt: 0.5,
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {n.message}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#5A6474",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                  {new Date(n.sent_at).toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
})}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* ---------------- Pagination ---------------- */}
                {totalPages > 1 && (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={(e, val) => setPage(val)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      }
    />
  );
}

export default Notifications;
