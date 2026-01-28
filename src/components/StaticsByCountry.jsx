
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useMap } from "react-leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import url from "../url";
import "leaflet/dist/leaflet.css";
import LocationFilter from "./LocationFilter";

// Fix default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Chart component
const LocationBasedChart = ({ data, title, t }) => {
  if (!data || data.length === 0)
    return (
      <Box
        sx={{
          p: 3,
          backgroundColor: "white",
          borderRadius: 4,
          mt: 3,
          textAlign: "center",
          color: "#666",
        }}
      >
        {t("No data found")}
      </Box>
    );

  const maxValue = Math.max(...data.map((d) => d.count));
  const getBarWidth = (value) => (value / maxValue) * 100;

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "white",
        borderRadius: 4,
        mt: 3,
        maxHeight: "300px",
        overflowY: "auto",
      }}
    >
      <Typography sx={{ fontWeight: 600, mb: 2, fontSize: 16 }}>
        {title}
      </Typography>

      {data.map((item, idx) => (
        <Box key={idx} sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          {/* Label */}
          <Box
            sx={{
              width: 200,
              fontSize: 14,
              fontWeight: 500,
              color: "#172B4D",
              whiteSpace: "nowrap !important",
            }}
          >
            {t(item.name)}
          </Box>

          {/* Bar */}
          <Box sx={{ flex: 1, position: "relative", height: 40 }}>
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                bgcolor: "#f5f5f5",
                borderRadius: "8px",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                width: `${getBarWidth(item.count)}%`,
                height: "100%",
                bgcolor: "#1976d2",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "80px",
              }}
            >
              <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                {item.count}
              </Typography>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};


const LocationStats = () => {
  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [pins, setPins] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [filterApplied, setFilterApplied] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchInitialCompanies();
  }, [token]);

  // --- APIs ---
  const fetchInitialCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${url}maps/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      const markers = json?.data?.markers || [];
      setPins(markers);
      setChartData(aggregateBy("country", markers));
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };


  // --- Helpers ---
  const aggregateBy = (level, data) => {
    const counts = {};
    data.forEach((p) => {
      const key = p.region?.[level] || "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.keys(counts).map((k) => ({ name: k, count: counts[k] }));
  };

  // Handle filter application
  const handleFilterApply = async (filterData) => {
    setFilterApplied(true);
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        type: "pins",
        user_type: "company_admin",
      });
      
      // Add filters based on selected values
      if (filterData.country) {
        params.append("country", filterData.country.name);
      }
      if (filterData.state) {
        params.append("state", filterData.state.name);
      }
      if (filterData.city) {
        params.append("city", filterData.city);
      }

      const res = await fetch(
        `${url}super-admin/statistics/location-based?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();
      const pinsData = json.data?.pins || [];
      setPins(pinsData);

      // Grouping logic based on selection
      if (filterData.city) {
        setChartData(aggregateBy("city", pinsData));
      } else if (filterData.state) {
        setChartData(aggregateBy("state", pinsData));
      } else if (filterData.country) {
        setChartData(aggregateBy("country", pinsData));
      } else {
        setChartData(aggregateBy("country", pinsData));
      }
    } catch {
      toast.error("Failed to load filtered pins");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterClear = () => {
    setFilterApplied(false);
    fetchInitialCompanies();
  };

  // --- Watchers for cascading (removed legacy watchers) ---

  // --- UI ---
  return (
    <Box sx={{ mt: 2 }} bgcolor={"white"}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, p: 2 }}>
        <Typography fontSize={"18px"} color={"#003149"}>
          {t("companiesByLocation")}
        </Typography>
        <LocationFilter
          onFilterApply={handleFilterApply}
          onFilterClear={handleFilterClear}
          filterApplied={filterApplied}
        title={t("filters.filterCompaniesByLocation")}
        />
      </Box>

      {/* Map Section */}
      <Box sx={{ height: 400, mb: 3 }}>
        {loading ? (
          <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
            <CircularProgress />
          </Box>
        ) : (
        <MapContainer style={{ height: "400px", width: "100%" }} center={[20, 70]} zoom={2}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

  {pins
    .filter((m) => m.position?.lat && m.position?.lng)
    .map((m) => (
      <Marker key={m.id} position={[m.position.lat, m.position.lng]}>
        <Popup>
          <b>{m.infoPreview?.company_name || m.title}</b>
          <br />
          {m.region?.city}, {m.region?.state}, {m.region?.country}
        </Popup>
      </Marker>
    ))}

  {/* Inline FitBounds component */}
  {(() => {
    const FitBoundsInline = () => {
      const map = useMap();
      useEffect(() => {
        const validMarkers = pins.filter((m) => m.position?.lat && m.position?.lng);
        if (validMarkers.length > 0) {
          const bounds = L.latLngBounds(validMarkers.map((m) => [m.position.lat, m.position.lng]));
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }, [map, pins]);
      return null;
    };
    return <FitBoundsInline />;
  })()}
</MapContainer>




        )}
      </Box>

      {/* Chart Section */}
      <LocationBasedChart
        data={chartData}
        title={t("Companies")}
        t={t}
      />

    </Box>
  );
};

export default LocationStats;
