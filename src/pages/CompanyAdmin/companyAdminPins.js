import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import url from "../../url";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Fit map bounds dynamically
const FitBounds = ({ locations }) => {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);
  return null;
};
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// const redIcon = new L.Icon({
//   iconUrl:
//     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });
const grayIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const yellowIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const orangeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const greyIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const purpleIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const CompanyAdminPins = ({statusFilter,
    resetKey,
  dateFrom,
  dateTo,
  assignmentType,
  country,
  search,
  accountExecutiveFilter,
  verificationStatusFilter,
  stateFilter,
  cityFilter,
   subscriptionStatusFilter,
  trialStartDate,
  trialEndDate,
  subscriptionStartDate,
  subscriptionEndDate,
    selectedMapAdminId,
  onClearSelection,
}) => {
  const [admins, setAdmins] = useState([]);
  const { token } = useSelector((state) => state.auth);
const [isFullMap, setIsFullMap] = useState(false);
const [loading, setLoading] = useState(false);
const {t}=useTranslation()
console.log("🟦 Pins received filters:", {
  statusFilter,
  dateFrom,
  dateTo,
  assignmentType,
  country,
  search,
  accountExecutiveFilter,
  verificationStatusFilter,
  stateFilter,
  cityFilter,
  selectedMapAdminId,
  onClearSelection,
});
 useEffect(() => {
  const fetchAllCompanyAdmins = async () => {
    setLoading(true); // 🔵 START LOADING

    try {
      const statusParam =
        statusFilter && statusFilter !== "all" ? `&status=${statusFilter}` : "";

      const dateFromParam = dateFrom ? `&start_date=${dateFrom}` : "";
      const dateToParam = dateTo ? `&end_date=${dateTo}` : "";

      const assignmentTypeParam =
        assignmentType && assignmentType !== "all"
          ? `&assignment_type=${assignmentType}`
          : "";

      const countryParam = country ? `&country=${encodeURIComponent(country)}` : "";
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const accountExecutiveParam = accountExecutiveFilter && accountExecutiveFilter !== "all" ? `&account_executive_id=${accountExecutiveFilter}` : "";
      const verificationStatusParam = verificationStatusFilter && verificationStatusFilter !== "all" ? `&verification_status=${verificationStatusFilter}` : "";
      const stateParam = stateFilter ? `&state=${encodeURIComponent(stateFilter)}` : "";
      const cityParam = cityFilter ? `&city=${encodeURIComponent(cityFilter)}` : "";
      const subscriptionStatusParam =
  subscriptionStatusFilter && subscriptionStatusFilter !== "all"
    ? `&subscription_status=${subscriptionStatusFilter}`
    : "";

const trialStartParam = trialStartDate
  ? `&trial_start_date_from=${trialStartDate}`
  : "";

const trialEndParam = trialEndDate
  ? `&trial_end_date_to=${trialEndDate}`
  : "";

const subscriptionStartParam = subscriptionStartDate
  ? `&subscription_start_date_from=${subscriptionStartDate}`
  : "";

const subscriptionEndParam = subscriptionEndDate
  ? `&subscription_start_date_to=${subscriptionEndDate}`
  : "";


      const response = await fetch(
        `${url}company-admins?sort_by=registered&sort_order=ASC&no_pagination=true`
          + statusParam
          + dateFromParam
          + dateToParam
          + assignmentTypeParam
          + countryParam
          + searchParam
          + accountExecutiveParam
          + verificationStatusParam
          + stateParam
          + cityParam
           + subscriptionStatusParam
    + trialStartParam
    + trialEndParam
    + subscriptionStartParam
    + subscriptionEndParam,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      const data =
        result.data?.company_admins
          ?.map((admin) => ({
            id: admin.id,
            name: admin.full_name,
            email: admin.email,
             status: admin.status,
            lat: parseFloat(admin.latitude || admin.company_latitude),
            lng: parseFloat(admin.longitude || admin.company_longitude),
          }))
          .filter((e) => !isNaN(e.lat) && !isNaN(e.lng)) || [];

      setAdmins(data);
    } catch (error) {
      console.error("Error fetching company admins:", error);
    } finally {
      setLoading(false); // 🔵 STOP LOADING
    }
  };

  if (token) fetchAllCompanyAdmins();
}, [
  token,
  statusFilter,
  dateFrom,
  dateTo,
  assignmentType,
  country,
  search,
  resetKey,
  accountExecutiveFilter,
  verificationStatusFilter,
  stateFilter,
  cityFilter,
    subscriptionStatusFilter,
  trialStartDate,
  trialEndDate,
  subscriptionStartDate,
  subscriptionEndDate,
]);

const displayedAdmins = selectedMapAdminId 
  ? admins.filter(a => a.id === selectedMapAdminId)
  : admins;

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return greenIcon;
    case "inactive":
      return grayIcon;
    case "invited":
      return blueIcon;
    case "pending":
      return orangeIcon;
    case "requested":
      return purpleIcon;
    case "rejected":
      return greyIcon;
    case "verified":
      return greenIcon;
    default:
      return greenIcon;
  }
};
const MapView = (
  <MapContainer
    center={[30.3753, 69.3451]}
    zoom={5}
    style={{ height: "100%", width: "100%", borderRadius: "10px" }}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    {admins.map((admin) => (
      <Marker key={admin.id} position={[admin.lat, admin.lng]}
       icon={getStatusIcon(admin.status)}>
        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "6px 10px",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
              textAlign: "center",
              minWidth: "150px",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "14px", color: "#333" }}>
              {admin.name}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {admin.email}
            </div>
          </div>
        </Tooltip>

        <Popup>
          <strong>{admin.name}</strong>
          <br />
          {admin.email}
        </Popup>
      </Marker>
    ))}

    <FitBounds
      locations={displayedAdmins.map((a) => ({
        latitude: a.lat,
        longitude: a.lng,
      }))}
    />
  </MapContainer>
);

  return (
    <div style={{ height: "70vh", position: "relative", width: "100%", marginTop: "10px", borderRadius: "10px",backgroundColor:'white',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column' }}>
     
     {loading && (
  <Box
    sx={{
      position: "absolute",
      inset: 0,
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.6)",
      // backdropFilter: "blur(2px)",
    }}
  >
    <CircularProgress size={50} />
  </Box>
)}
     
      <MapContainer
        center={[30.3753, 69.3451]} // Pakistan center
        zoom={5}
        style={{ height: "100%", width: "100%", borderRadius: "10px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {displayedAdmins.map((admin) => (
          <Marker key={admin.id} position={[admin.lat, admin.lng]}
           icon={getStatusIcon(admin.status)}>
            {/* Hover Tooltip */}
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                  textAlign: "center",
                  minWidth: "150px",
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "14px", color: "#333" }}>
                  {admin.name}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>{admin.email}</div>
              </div>
            </Tooltip>

            {/* Optional click popup */}
            <Popup>
              <strong>{admin.name}</strong>
              <br />
              {admin.email}
            </Popup>
          </Marker>
        ))}

        <FitBounds
          locations={displayedAdmins.map((a) => ({
            latitude: a.lat,
            longitude: a.lng,
          }))}
        />
      </MapContainer>
        <Box
    onClick={() => setIsFullMap(true)}
    sx={{
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 1000,
      backgroundColor: "#006EC2",
      color:"white",
      borderRadius: "6px",
      px: 1.5,
      py: 0.5,
      cursor: "pointer",
      // boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
      fontSize: "14px",
      fontWeight: 500,
    }}
  >
    {t("fullMap")}
  </Box>


   {selectedMapAdminId &&  (
    <Box
    onClick={() => onClearSelection()}

    sx={{
      position: "absolute",
      top: 15,
      right: 15,
      zIndex: 3000,
      backgroundColor: "#fff",
      borderRadius: "50%",
      width: 36,
      height: 36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
      fontSize: "18px",
      fontWeight: 700,
    }}
  >
    ✕
  </Box>
    )}


  {isFullMap && (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      zIndex: 2000,
      backgroundColor: "#fff",
    }}
  >
    <Box
      onClick={() => setIsFullMap(false)}
      sx={{
        position: "absolute",
        top: 15,
        right: 15,
        zIndex: 3000,
        backgroundColor: "#fff",
        borderRadius: "50%",
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
        fontSize: "18px",
        fontWeight: 700,
      }}
    >
      ✕
    </Box>

    <Box sx={{ height: "100vh", width: "100vw" }}>
      {MapView}
    </Box>
  </Box>
)}

 <Typography variant="h6" sx={{ mt: 2,mb:2 }}>
          {t("Only records with valid Latitude/Longitude are shown")}
        </Typography>
    </div>
  );
};

export default CompanyAdminPins;
