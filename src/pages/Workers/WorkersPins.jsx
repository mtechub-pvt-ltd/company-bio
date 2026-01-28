import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import url from "../../url";
import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import { useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
const greyIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const blueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const yellowIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const WorkersPins = ({statusFilter, dateFrom, dateTo, selectedCompanyId, filterCountry, filterState, filterCity,search, verificationStatusFilter,
    selectedMapWorkerId,
  onClearSelection
}) => {
  const [workers, setWorkers] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const [isFullMap, setIsFullMap] = useState(false);
  const {t}=useTranslation()
  const [loading, setLoading] = useState(false);
const displayedWorkers = selectedMapWorkerId 
  ? workers.filter(w => w.id === selectedMapWorkerId)
  : workers;
useEffect(() => {
  const fetchAllWorkers = async () => {
        setLoading(true); // 🔵 start loader

    try {
      const statusParam =
        statusFilter !== "all" ? `&status=${statusFilter}` : "";
      const dateFromParam = dateFrom ? `&date_from=${dateFrom}` : "";
      const dateToParam = dateTo ? `&date_to=${dateTo}` : "";
      const companyParam = selectedCompanyId
        ? `&company_id=${selectedCompanyId}`
        : "";
      const countryParam = filterCountry ? `&country=${filterCountry}` : "";
      const stateParam = filterState ? `&state=${filterState}` : "";
      const cityParam = filterCity ? `&city=${filterCity}` : "";
      const searchParam = `&search=${search}`
const verificationStatusParam = verificationStatusFilter && verificationStatusFilter !== "all"
        ? `&verification_status=${verificationStatusFilter}`
        : "";
      // const apiUrl = `${url}public/workers?no_pagination=true${statusParam}${dateFromParam}${dateToParam}${companyParam}${countryParam}${stateParam}${cityParam}${searchParam}`;
      const apiUrl = `${url}public/workers?no_pagination=true${statusParam}${dateFromParam}${dateToParam}${companyParam}${countryParam}${stateParam}${cityParam}${searchParam}${verificationStatusParam}`;
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!result?.error && Array.isArray(result?.data?.records)) {
        const data = result.data.records
          .map((worker) => ({
            id: worker.id,
            name: worker.first_name || worker.email,
            email: worker.email,
            status: worker.status,
            lat: parseFloat(worker.latitude),
            lng: parseFloat(worker.longitude),
          }))
          .filter((e) => !isNaN(e.lat) && !isNaN(e.lng));

        setWorkers(data);
      } else {
        setWorkers([]);
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
      setWorkers([]);
    }
    finally {
      setLoading(false); // 🔵 stop loader
    }

  };

  if (token) {
    fetchAllWorkers();
  }
}, [token, statusFilter, dateFrom, dateTo, selectedCompanyId, filterCountry, filterState, filterCity,search,verificationStatusFilter]);
const getStatusIcon = (status) => {
  switch (status) {
    case "active":
      return greenIcon;
    case "inactive":
      return greyIcon;
    case "invited":
      return blueIcon;
    case "pending":
    case "requested":
      return yellowIcon;
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

    {workers.map((worker) => (
      <Marker key={worker.id} position={[worker.lat, worker.lng]}
       icon={getStatusIcon(worker.status)}>
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
              {worker.name}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {worker.email}
            </div>
          </div>
        </Tooltip>

        <Popup>
          <strong>{worker.name}</strong>
          <br />
          {worker.email}
        </Popup>
      </Marker>
    ))}

<FitBounds
  locations={displayedWorkers.map((w) => ({
    latitude: w.lat,
    longitude: w.lng,
  }))}
/>
  </MapContainer>
);


const location = useLocation();

const isFromDashboard = location.state?.fromDashboard === true;
  return (
    <div style={{ height: "70vh", width: "100%",position: "relative",  marginTop: "10px", borderRadius: "10px",backgroundColor:'white',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column' }}>
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

        {/* {workers.map((worker) => ( */}
        {displayedWorkers.map((worker) => (
          <Marker key={worker.id} position={[worker.lat, worker.lng]}
           icon={getStatusIcon(worker.status)}>
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
                  {worker.name}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>{worker.email}</div>
              </div>
            </Tooltip>

            <Popup>
              <strong>{worker.name}</strong>
              <br />
              {worker.email}

            </Popup>
          </Marker>
        ))}

        {/* <FitBounds
          locations={workers.map((w) => ({
            latitude: w.lat,
            longitude: w.lng,
          }))}
        /> */}
        <FitBounds
  locations={displayedWorkers.map((w) => ({
    latitude: w.lat,
    longitude: w.lng,
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
      borderRadius: "6px",
      px: 1.5,
      py: 0.5,
      color:"white",
      cursor: "pointer",
      // boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
      fontSize: "14px",
      fontWeight: 500,
    }}
  >
      {t("fullMap")}
  </Box>
  {selectedMapWorkerId && (
  <Box
  onClick={() => {
    setIsFullMap(false);
    if (selectedMapWorkerId) {
      onClearSelection();
    }
  }}
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

export default  WorkersPins;;
