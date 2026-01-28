import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import url from "../url";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Autocomplete,
  Switch,
  CircularProgress,IconButton
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { Country, State, City } from "country-state-city";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useTranslation } from "react-i18next";
import MapDataTable from "./DashboardMapTable";
import OutlinedInput from "@mui/material/OutlinedInput";

// FIX LEAFLET ICON
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


const FitBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const valid = locations.filter(
      (l) =>
        typeof l.latitude === "number" &&
        typeof l.longitude === "number"
    );

    if (valid.length === 0) return;

    if (valid.length === 1) {
      map.setView([valid[0].latitude, valid[0].longitude], 10);
      return;
    }

    const bounds = L.latLngBounds(
      valid.map((l) => [l.latitude, l.longitude])
    );

    if (!bounds.isValid()) return;

    setTimeout(() => {
      try {
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (e) {
        console.warn("Leaflet fitBounds error:", e);
      }
    }, 200);
  }, [locations, map]);

  return null;
};


const AllPinsTabs = ({setPinData}) => {


const fromDateRef = useRef(null);
const toDateRef = useRef(null);
  const appliedFiltersText = () => {
  let list = [];

  if (entityTypes !== "company,executive,worker") {
    if (entityTypes === "company") list.push(t("companyAdmin"));
    if (entityTypes === "executive") list.push(t("accountExecutive"));
    if (entityTypes === "worker") list.push(t("worker"));
  }

  if (active) list.push(t("active"));
  if (inactive) list.push(t("inactive"));
  if (invited) list.push(t("invited"));
  if (requested) list.push(t("requested"));
  if (trial) list.push(t("trial"));

  if (selectedCountry) list.push(`${t("country")}: ${selectedCountry}`);
  if (selectedState) list.push(`${t("state")}: ${selectedState}`);
  if (selectedCity) list.push(`${t("city")}: ${selectedCity}`);

  if (dateFrom) list.push(`${t("fromDate")}: ${dateFrom}`);
  if (dateTo) list.push(`${t("toDate")}: ${dateTo}`);

  if (limit !== 50) list.push(`${t("limit")}: ${limit}`);

  return list.join(", ");
};


  const { token } = useSelector((state) => state.auth);
  const mapRef = useRef(null);
const {t} =useTranslation()
const [mapReady, setMapReady] = useState(false);
  //=============== MAIN STATES ================
  const [filterOpen, setFilterOpen] = useState(false);
  const [combined, setCombined] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
const [selectedCountryIso, setSelectedCountryIso] = useState("");
const [selectedStateIso, setSelectedStateIso] = useState("");
  //=============== FILTER STATES ================
  const [entityTypes, setEntityTypes] = useState("company,executive,worker");

  const [active, setActive] = useState(false);
  const [inactive, setInactive] = useState(false);
  const [invited, setInvited] = useState(false);
  const [requested, setRequested] = useState(false);
  const [trial, setTrial] = useState(false);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  //=============== LOCATION STATES ================
  const [zoneCountries, setZoneCountries] = useState([]);
  const [zoneStates, setZoneStates] = useState([]);
  const [zoneCities, setZoneCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
// const [limit, setLimit] = useState(10); // default 50

// TEMP STATES (only for filter drawer)
const [tempEntityTypes, setTempEntityTypes] = useState("company,executive,worker");

const [tempActive, setTempActive] = useState(false);
const [tempInactive, setTempInactive] = useState(false);
const [tempInvited, setTempInvited] = useState(false);
const [tempRequested, setTempRequested] = useState(false);
const [tempTrial, setTempTrial] = useState(false);

const [tempDateFrom, setTempDateFrom] = useState("");
const [tempDateTo, setTempDateTo] = useState("");

const [tempCountry, setTempCountry] = useState("");
const [tempState, setTempState] = useState("");
const [tempCity, setTempCity] = useState("");

const [limit, setLimit] = useState(50);
const [tempLimit, setTempLimit] = useState(50);

const [tempCountryIso, setTempCountryIso] = useState("");
const [tempStateIso, setTempStateIso] = useState("");

  //=============== MARKER ICONS ================
  const blueIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const orangeIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    shadowUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const greenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  //=============== LOAD MAP DATA ================
  useEffect(() => {
    loadDefault();
  }, [token]);

  const loadDefault = async () => {
    setLoading(true);

    const res = await fetch(`${url}maps/all`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const json = await res.json();

    if (!json.error) {
      setTotalCount(json.data?.pagination?.total || 0);

const data = json.data.markers.map(item => ({
  ...item,
  latitude: item.position?.lat ?? null,
  longitude: item.position?.lng ?? null,
}));


      setCombined(data);
      setPinData(data);  
    }

    setLoading(false);
  };

  //=============== LOCATION API CALLS (Countries, States, Cities) ================
const fetchCountriesAndStates = () => {
  setLoadingCountries(true);

  try {
    const all = Country.getAllCountries();

    const list = all.map(c => ({
      name: c.name,
      isoCode: c.isoCode
    }));

    setZoneCountries(list);
  } catch (err) {
    console.error("Country load error:", err);
  } finally {
    setLoadingCountries(false);
  }
};

const loadStates = (countryIso) => {
  setLoadingStates(true);

  try {
    const states = State.getStatesOfCountry(countryIso);

    const formatted = states.map(s => ({
      name: s.name,
      isoCode: s.isoCode
    }));

    setZoneStates(formatted);
  } catch (err) {
    console.error("State load error:", err);
  } finally {
    setLoadingStates(false);
  }
};

const loadCities = (countryIso, stateIso) => {
  setLoadingCities(true);

  try {
    const cities = City.getCitiesOfState(countryIso, stateIso);

    const names = cities.map(c => c.name);
    setZoneCities(names);
  } catch (err) {
    console.error("City load error:", err);
    setZoneCities([]);
  } finally {
    setLoadingCities(false);
  }
};

  const fetchCities = async (country, state) => {
    if (!country || !state) return;

    setLoadingCities(true);

    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, state }),
      });

      const data = await res.json();

      if (data.error === false) {
        setZoneCities(data.data);
      } else {
        setZoneCities([]);
      }
    } catch (error) {
      console.error("City load error:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    if (filterOpen) fetchCountriesAndStates();
  }, [filterOpen]);
const [applying, setApplying] = useState(false);

const applyFilters = async () => {
  setApplying(true);

  // COPY TEMP → REAL (UI purpose only)
  setEntityTypes(tempEntityTypes);
  setActive(tempActive);
  setInactive(tempInactive);
  setInvited(tempInvited);
  setRequested(tempRequested);
  setTrial(tempTrial);

  setDateFrom(tempDateFrom);
  setDateTo(tempDateTo);

  setSelectedCountry(tempCountry);
  setSelectedCountryIso(tempCountryIso);

  setSelectedState(tempState);
  setSelectedStateIso(tempStateIso);

  setSelectedCity(tempCity);
  setLimit(tempLimit);

  // USE TEMP VALUES FOR API CALL (important)
  const params = new URLSearchParams({
    entity_types: tempEntityTypes,
    active: tempActive,
    inactive: tempInactive,
    invited: tempInvited,
    requested: tempRequested,
    trial: tempTrial,
    date_from: tempDateFrom,
    date_to: tempDateTo,
    country: tempCountry,
    state: tempState,
    city: tempCity,
    limit: tempLimit,
    page: 1
  });

  const res = await fetch(`${url}maps/all?${params.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!json.error) {
    setTotalCount(json.data?.pagination?.total || 0);

    const filtered = json.data.markers.map(item => ({
  ...item, // keep full original object
  latitude: item.position?.lat ?? null,
  longitude: item.position?.lng ?? null,
}));

    setCombined(filtered);
    setPinData(filtered);  
  }

  setApplying(false);
  setFilterOpen(false);
};


  const isFilterApplied =
  entityTypes !== "company,executive,worker" ||
  active ||
  inactive ||
  invited ||
  requested ||
  trial ||
  dateFrom ||
  dateTo ||
  selectedCountry ||
  selectedState ||
  selectedCity ||
  limit !== 50;
const resetFilters = () => {
  // REAL filters
  setEntityTypes("company,executive,worker");
  setActive(false);
  setInactive(false);
  setInvited(false);
  setRequested(false);
  setTrial(false);

  setDateFrom("");
  setDateTo("");

  setSelectedCountry("");
  setSelectedState("");
  setSelectedCity("");

  setSelectedCountryIso("");
  setSelectedStateIso("");

  setLimit(50);

  // TEMP filters (THIS WAS MISSING)
  resetTempFilters();

  loadDefault();
};

// const resetFilters = () => {
//   setEntityTypes("company,executive,worker");

//   setActive(false);
//   setInactive(false);
//   setInvited(false);
//   setRequested(false);
//   setTrial(false);

//   setDateFrom("");
//   setDateTo("");

//   setSelectedCountry("");
//   setSelectedState("");
//   setSelectedCity("");

//   setZoneStates([]);
//   setZoneCities([]);

//   setLimit(50);

//   loadDefault();
// };

  if (loading) {
    return (
      <Box sx={{ height: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
const resetTempFilters = () => {
  setTempEntityTypes("company,executive,worker");

  setTempActive(false);
  setTempInactive(false);
  setTempInvited(false);
  setTempRequested(false);
  setTempTrial(false);

  setTempDateFrom("");
  setTempDateTo("");

  setTempCountry("");
  setTempCountryIso("");

  setTempState("");
  setTempStateIso("");

  setTempCity("");

  setTempLimit(50);

  setZoneStates([]);
  setZoneCities([]);
};

  return (
    <Box sx={{ mt: 2 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography sx={{ fontSize: "18px", fontWeight: 500 }}>
         {t("allPins")} 
        </Typography>

    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "orange" }} />
        <Typography sx={{ fontSize: 12 }}>{t("companyAdmin")}</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "blue" }} />
        <Typography sx={{ fontSize: 12 }}>{t("accountExecutive")}</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "green" }} />
        <Typography sx={{ fontSize: 12 }}>{t("worker")}</Typography>
      </Box>
    </Box>

{isFilterApplied ? (
  <Box
    sx={{
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 34,
      height: 34,
      borderRadius: 1,
      bgcolor: "#006EC2",
      cursor: "pointer",
    }}
    // onClick={() => setFilterOpen(true)}
    onClick={() => {
  // Copy real → temp
  setTempEntityTypes(entityTypes);

  setTempActive(active);
  setTempInactive(inactive);
  setTempInvited(invited);
  setTempRequested(requested);
  setTempTrial(trial);

  setTempDateFrom(dateFrom);
  setTempDateTo(dateTo);

  setTempCountry(selectedCountry);
  setTempCountryIso(selectedCountryIso);

  setTempState(selectedState);
  setTempStateIso(selectedStateIso);

  setTempCity(selectedCity);

  setTempLimit(limit);

  setFilterOpen(true);
}}

  >
    <FilterAltIcon sx={{ color: "#fff", fontSize: 20 }} />

    {/* Reset Filter Button */}
    <IconButton
      size="small"
      onClick={(e) => {
        e.stopPropagation(); // prevent opening modal
        resetFilters();
      }}
      sx={{
        position: "absolute",
        top: -6,
        right: -6,
        bgcolor: "#fff",
        width: 18,
        height: 18,
        border: "1px solid #C4C4C4",
        padding: 0,
      }}
    >
      <CloseRoundedIcon sx={{ fontSize: 14, color: "#006EC2" }} />
    </IconButton>
  </Box>
) : (
  <IconButton
    onClick={() => setFilterOpen(true)}
    sx={{
      border: "1px solid #C4C4C4",
      width: 34,
      height: 34,
      borderRadius: 1,
      bgcolor: "white",
      color: "#5E5C5C",
    }}
  >
    <FilterAltIcon />
  </IconButton>
)}      </Box>
{isFilterApplied && (
  <Typography sx={{ fontSize: 13,mb:0.5 }}>
    {t("appliedFilters")}: {appliedFiltersText()}
  </Typography>
)}

      {/* MAP */}
      <div style={{ height: "70vh", width: "100%",display:"flex",justifyContent:"center",alignItems:"center" ,flexDirection:'column'}}>
        <MapContainer
          ref={mapRef}
            whenReady={() => setMapReady(true)}

          center={[30.3753, 69.3451]}
          zoom={5}
          style={{ height: "100%", width: "100%", borderRadius: "8px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {combined.map((item) =>
            item.latitude && item.longitude ? (
              <Marker
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={
                  item.type === "executive"
                    ? blueIcon
                    : item.type === "company"
                      ? orangeIcon
                      : greenIcon
                }
              >
   <Tooltip direction="top" offset={[0, -10]}>
  <div style={{ padding: "8px 10px", minWidth: "180px" }}>

    {item.legalName && (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{t("name")}:</span>
        <span>{item.legalName}</span>
      </div>
    )}

    {item.businessEmail && (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{t("email")}:</span>
        <span>{item.businessEmail}</span>
      </div>
    )}

    {item.region?.country && (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{t("country")}:</span>
        <span>{item.region.country}</span>
      </div>
    )}

    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{t("status_label")}:</span>
      <span>{item.companyStatus || item.status}</span>
    </div>

    {item.adminName && (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{t("admin")}:</span>
        <span>{item.adminName}</span>
      </div>
    )}

    {item.adminEmail && (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{t("admin_email")}:</span>
        <span>{item.adminEmail}</span>
      </div>
    )}

    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{t("workers")}:</span>
      <span>{item.workerCount}</span>
    </div>

  </div>
</Tooltip>


                <Popup>
                  <strong>{item.title}</strong>
                  <br />
                  {item.region?.address}
                </Popup>
              </Marker>
            ) : null
          )}
          <FitBounds locations={combined} mapReady={mapReady} />
        </MapContainer>
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t("Only records with valid Latitude/Longitude are shown")}
        </Typography>
      </div>
        

<Dialog open={filterOpen}   onClose={() => {
    resetTempFilters();
    setFilterOpen(false);
  }} maxWidth="sm" fullWidth>
  <DialogTitle
  sx={{
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    zIndex: 2,
    borderBottom: "1px solid #E0E0E0",
    mb:2,
  }}
>
  {t("filtersData")}
</DialogTitle>
<DialogContent
  sx={{
    display: "flex",
    flexDirection: "column",
    gap: 2,
    pt:5,        // 👈 pushes content below header
    overflowY: "auto",
  }}
>

    {/* ENTITY TYPE */}
 
<FormControl
  fullWidth
  size="small"
  variant="outlined"
  sx={{
    mt: 1,
    "& .MuiInputLabel-root": {
      transform: "translate(14px, 10px) scale(1)", // normal
    },
    "& .MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)", // floating
      backgroundColor: "#fff",
      padding: "0 6px",
    },
  }}
>
  <InputLabel id="entity-type-label">
    {t("entityType")}
  </InputLabel>

  <Select
    labelId="entity-type-label"
    id="entity-type"
    value={tempEntityTypes}
    label={t("entityType")}
    onChange={(e) => setTempEntityTypes(e.target.value)}
  >
    <MenuItem value="company,executive,worker">
      {t("all")}
    </MenuItem>
      <MenuItem value="executive">{t("accountExecutive")}</MenuItem>
    <MenuItem value="company">{t("companyAdmin")}</MenuItem>
  
    <MenuItem value="worker">{t("worker")}</MenuItem>
  </Select>
</FormControl>

    {/* SWITCHES */}
    {[
      { label: t("active"), state: tempActive, setter: setTempActive },
      { label: t("inactive"), state: tempInactive, setter: setTempInactive },
      { label: t("invited"), state: tempInvited, setter: setTempInvited },
      { label: t("requested"), state: tempRequested, setter: setTempRequested },
      { label: t("trial"), state: tempTrial, setter: setTempTrial },
    ].map((item, i) => (
      <Box sx={{ display: "flex", justifyContent: "space-between" }} key={i}>
        <Typography>{item.label}</Typography>
        <Switch checked={item.state} onChange={() => item.setter(!item.state)} />
      </Box>
    ))}

    {/* DATE PICKERS */}
<TextField
  inputRef={toDateRef}
  type="date"
  fullWidth
  label={t("toDate")}
  InputLabelProps={{ shrink: true }}
  value={tempDateTo}
  onClick={() => {
    toDateRef.current?.showPicker?.();
  }}
  onChange={(e) => {
    const value = e.target.value;

    // expected format: YYYY-MM-DD
    if (value) {
      const year = value.split("-")[0];
      if (year.length > 4) return;
    }

    setTempDateTo(value);
  }}
/>

  <TextField
  inputRef={fromDateRef}
  type="date"
  fullWidth
  label={t("fromDate")}
  InputLabelProps={{ shrink: true }}
  value={tempDateFrom}
  onClick={() => {
    fromDateRef.current?.showPicker?.();
  }}
  onChange={(e) => {
    const value = e.target.value;

    // expected format: YYYY-MM-DD
    if (value) {
      const year = value.split("-")[0];
      if (year.length > 4) return;
    }

    setTempDateFrom(value);
  }}
/>

    {/* COUNTRY */}
    <Autocomplete
      options={zoneCountries}
      getOptionLabel={(opt) => opt.name}
      loading={loadingCountries}
      value={zoneCountries.find(c => c.name === tempCountry) || null}
      onChange={(e, val) => {
        const name = val?.name || "";
        const iso = val?.isoCode || "";

        setTempCountry(name);
        setTempCountryIso(iso);

        setTempState("");
        setTempStateIso("");
        setTempCity("");

        setZoneStates([]);
        setZoneCities([]);

        if (iso) loadStates(iso);
      }}
      renderInput={(params) => (
        <TextField {...params} label={t("country")} size="small" fullWidth />
      )}
    />

    {/* STATE */}
    <Autocomplete
      options={zoneStates}
      getOptionLabel={(opt) => opt.name}
      loading={loadingStates}
      value={zoneStates.find(s => s.name === tempState) || null}
      disabled={!tempCountry}
      onChange={(e, val) => {
        const name = val?.name || "";
        const iso = val?.isoCode || "";

        setTempState(name);
        setTempStateIso(iso);

        setTempCity("");
        setZoneCities([]);

        if (tempCountryIso && iso) loadCities(tempCountryIso, iso);
      }}
      renderInput={(params) => (
        <TextField {...params} label={t("state")} size="small" fullWidth />
      )}
    />

    {/* CITY */}
    <Autocomplete
      options={zoneCities}
      getOptionLabel={(opt) => opt}
      loading={loadingCities}
      value={tempCity || null}
      disabled={!tempState}
      onChange={(e, val) => setTempCity(val || "")}
      renderInput={(params) => (
        <TextField {...params} label={t("city")} size="small" fullWidth />
      )}
    />

    {/* LIMIT */}
    <TextField
      label={t("limit")}
      type="number"
      fullWidth
      size="small"
      value={tempLimit}
      onChange={(e) => {
        const val = e.target.value;

        if (val === "") return setTempLimit("");

        const num = Number(val);
        if (num >= 1 && num <= 50000) setTempLimit(num);
      }}
      InputProps={{
        inputProps: { min: 1, max: 50000 }
      }}
    />
  </DialogContent>

  <DialogActions>
    <Button   onClick={() => {
    resetTempFilters();
    setFilterOpen(false);
  }}>
      {t("cancel")}
    </Button>

    <Button
      variant="contained"
      onClick={applyFilters}
      disabled={applying}
    >
      {applying ? (
        <CircularProgress size={22} sx={{ color: "#fff" }} />
      ) : (
        t("apply")
      )}
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default AllPinsTabs;













