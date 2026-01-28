import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Box, Typography } from "@mui/material";
import url from "../../url";
import { useSelector } from "react-redux";
import LocationFilter from "../../components/LocationFilter";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const grayIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
const yellowIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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

const AccountExecutivePins = (
  {
    statusFilter,
  dateFrom,
  dateTo,
  country,
  state,
  city,
  search,  
      verificationStatusFilter,

  resetKey,
    selectedMapExecutiveId,
  onClearSelection,
  }
) => {
  const [executives, setExecutives] = useState([]);
  const [filteredExecutives, setFilteredExecutives] = useState([]);
  const [filterApplied, setFilterApplied] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const [isFullMap, setIsFullMap] = useState(false);
const [loading, setLoading] = useState(false);
console.log("🟦 AE Pins props received:", {
  statusFilter,
  dateFrom,
  dateTo,
  country,
  state, 
  city,
  countryType: typeof country,
  search,
  resetKey,
});

const {t}=useTranslation()
useEffect(() => {
  const fetchExecutives = async () => {
    setLoading(true);

    const statusParam =
      statusFilter && statusFilter !== "all" ? `&status=${statusFilter}` : "";

    const dateFromParam = dateFrom ? `&date_from=${dateFrom}` : "";
    const dateToParam = dateTo ? `&date_to=${dateTo}` : "";

    const countryParam = country
      ? `&country=${encodeURIComponent(country)}`
      : "";
      
    const stateParam = state
      ? `&province=${encodeURIComponent(state)}`
      : "";

    const cityParam = city
      ? `&city=${encodeURIComponent(city)}`
      : "";

    const searchParam = search
      ? `&search=${encodeURIComponent(search)}`
      : "";
 const verificationStatusParam = verificationStatusFilter && verificationStatusFilter !== "all"
      ? `&verification_status=${verificationStatusFilter}`
      : "";
        const apiUrl =
      `${url}super-admin/account-executives?sort_by=registered&sort_order=ASC&no_pagination=true`
      + statusParam
      + dateFromParam
      + dateToParam
      + countryParam
      + stateParam
      + cityParam
     + searchParam  
      + verificationStatusParam;

    console.log("🟩 AE Pins API URL:", apiUrl);

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result.error && result.data?.account_executives) {
        const data = result.data.account_executives
          .map((exec) => ({
            id: exec.id,
            name: exec.full_name,
            email: exec.email,
            status: exec.status,
            country: exec.country,
            date: exec.registered,
            lat: parseFloat(exec.latitude || exec.location_latitude),
            lng: parseFloat(exec.longitude || exec.location_longitude),
          }))
          .filter((e) => !isNaN(e.lat) && !isNaN(e.lng));

        setExecutives(data);
      } else {
        setExecutives([]);
      }
    } catch (err) {
      console.error("Error fetching AE pins:", err);
      setExecutives([]);
    } finally {
      setLoading(false);
    }
  };

  if (token) fetchExecutives();
}, [
  token,
  statusFilter,
  dateFrom,
  dateTo,
  country,
  state,
  city,
   search,  
  verificationStatusFilter,
  resetKey, // 🔑 clear filter trigger
]);


const displayedExecutives = selectedMapExecutiveId 
  ? executives.filter(e => e.id === selectedMapExecutiveId)
  : executives;
const getStatusIcon = (status) => {
  switch (status) {
    case "active":
      return greenIcon;
    case "inactive":
      return grayIcon;
    case "invited":
      return blueIcon;
    case "pending":
      return yellowIcon;
    case "requested":
      return purpleIcon;
    default:
      return greenIcon;
  }
};
  const MapView = (
  <MapContainer
    center={[30.3753, 69.3451]}
    zoom={5}
    style={{ height: "100%", width: "100%" }}
  >
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    {displayedExecutives.map((exec) => (
      <Marker key={exec.id} position={[exec.lat, exec.lng]}
       icon={getStatusIcon(exec.status)}>
        {/* tooltip + popup (unchanged) */}
      </Marker>
    ))}

    <FitBounds
      locations={displayedExecutives.map((e) => ({
        latitude: e.lat,
        longitude: e.lng,
      }))}
    />
  </MapContainer>
);

  return (
    <Box sx={{ mt: 2 }} bgcolor={"white"}>
 

      {/* Map Container */}
      <div style={{ height: "70vh", width: "100%", marginTop: "10px", borderRadius: "10px" , position: "relative",backgroundColor:"white",display:"flex",justifyContent:"center",alignItems:"center" ,flexDirection:'column'}}>
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

          {displayedExecutives.map((exec) => (
          <Marker key={exec.id} position={[exec.lat, exec.lng]}
           icon={getStatusIcon(exec.status)}>
            {/* Hover Tooltip - styled card */}
      <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
  <div
    style={{
      backgroundColor: "white",
      borderRadius: "8px",
      padding: "8px 12px",
      boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
      minWidth: "180px",
    }}
  >
    {/* Name */}
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontWeight: 600, fontSize: "12px", color: "#444" }}>
      {t("tooltip.name")}:
      </span>
      <span style={{ fontSize: "12px", color: "#333" }}>
        {exec.name || "--"}
      </span>
    </div>

    {/* Email */}
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontWeight: 600, fontSize: "12px", color: "#444" }}>
       {t("tooltip.email")}:
      </span>
      <span style={{ fontSize: "12px", color: "#333" }}>
        {exec.email || "--"}
      </span>
    </div>

    {/* Status */}
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontWeight: 600, fontSize: "12px", color: "#444" }}>
       {t("tooltip.status")}:
      </span>
      <span style={{ fontSize: "12px", color: "#333" }}>
        {exec.status || "--"}
      </span>
    </div>

    {/* Country */}
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontWeight: 600, fontSize: "12px", color: "#444" }}>
          {t("tooltip.country")}:
      </span>
      <span style={{ fontSize: "12px", color: "#333" }}>
        {exec.country || "--"}
      </span>
    </div>

    {/* Registered Date */}
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontWeight: 600, fontSize: "12px", color: "#444" }}>
           {t("tooltip.registered")}:
      </span>
      <span style={{ fontSize: "12px", color: "#333" }}>
        {exec.date
          ? new Date(exec.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "--"}
      </span>
    </div>
  </div>
</Tooltip>


            {/* Optional click popup */}
            <Popup>
              <strong>{exec.name}</strong>
              <br />
              {exec.email}<br />
              {exec.country}<br />
               {exec.status}
            </Popup>
          </Marker>
        ))}

          <FitBounds
            locations={displayedExecutives.map((e) => ({
              latitude: e.lat,
              longitude: e.lng,
            }))}
          />
        </MapContainer>


           {selectedMapExecutiveId && (
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
  {isFullMap && (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      zIndex: 2000,
      backgroundColor: "#fff",
    }}
  >
    {/* Close button */}
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
    </Box>
  );
};

export default AccountExecutivePins;
