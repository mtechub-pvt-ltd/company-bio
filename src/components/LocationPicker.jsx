

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { IconButton } from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import toast from "react-hot-toast";
import LocationHelperModal from "./Locationhelper";
import { useTranslation } from "react-i18next";

// Fix marker image issue in React builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEFAULT_COORDS = [33.6844, 73.0479]; // fallback Islamabad

// Helper function to fetch with CORS handling
// NOTE: For production, set up a backend proxy endpoint to avoid CORS issues
// Example: Create /api/geocode endpoint that proxies requests to Nominatim
const fetchWithCors = async (url, options = {}) => {
  // Try direct fetch first (same approach as Location.js)
  // This might work if your backend has CORS headers configured
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'LocationPickerApp/1.0 (contact@example.com)',
        'Accept': 'application/json',
        ...options.headers,
      }
    });
    
    if (response.ok) {
      return response;
    }
  } catch (directError) {
    // CORS error - will try proxy
    console.log("Direct fetch blocked, trying proxy...");
  }

  // Fallback: Try multiple proxy services
  const proxyServices = [
    {
      name: 'allorigins',
      url: `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      parser: async (res) => {
        const data = await res.json();
        if (data.contents) {
          return JSON.parse(data.contents);
        }
        throw new Error("Invalid proxy response");
      }
    },
    {
      name: 'codetabs',
      url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      parser: async (res) => await res.json()
    }
  ];

  // Try each proxy service
  for (const proxy of proxyServices) {
    try {
      const proxyResponse = await fetch(proxy.url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (proxyResponse.ok) {
        const data = await proxy.parser(proxyResponse);
        
        // Return mock Response object
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => data,
          text: async () => JSON.stringify(data),
          headers: new Headers(),
          clone: function() { return this; }
        };
      }
    } catch (proxyError) {
      console.log(`Proxy ${proxy.name} failed, trying next...`);
      continue;
    }
  }

  // All methods failed
  throw new Error("CORS_BLOCKED");
};

const LocationPicker = ({ formik, height = "400px", width = "100%" }) => {
  const inlineMapRef = useRef(null);
  const inlineMarkerRef = useRef(null);
  const fullMapRef = useRef(null);
  const fullMarkerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const searchInputRef = useRef(null);
  const { t } = useTranslation();

  // Add CSS for spinner animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [address, setAddress] = useState("");
  const [showFullMap, setShowFullMap] = useState(false);
  // Prevent accidental form submit when opening fullscreen map
  const handleOpenFullMap = (e) => {
    if (e) e.preventDefault();
    setShowFullMap(true);
  };
  const [isProcessingLocation, setIsProcessingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Monitor formik values to ensure they're being set
  useEffect(() => {
    if (formik?.values) {
      console.log("📍 LocationPicker - Formik values updated:", {
        country: formik.values.country,
        city: formik.values.city,
        province: formik.values.province
      });
    }
  }, [formik?.values?.country, formik?.values?.city, formik?.values?.province]);

  // Reverse geocode & update formik + address state
  const fetchAddress = async ({ lat, lng }) => {
    setIsProcessingLocation(true);
    try {
      console.log("🌍 Fetching address for:", lat, lng);
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      
      const res = await fetchWithCors(url, {
        headers: {
          "User-Agent": "LocationPickerApp/1.0 (contact@example.com)",
          "Accept-Language": "en"
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      // Check for API errors
      if (data.error) {
        console.error("Nominatim API error:", data.error);
        setAddress("Address not found");
        setIsProcessingLocation(false);
        return;
      }

      const fullAddress = data?.display_name || "Address not found";
      
      console.log("📍 Reverse geocoded address:", fullAddress);
      console.log("📍 Address components:", data.address);
      setAddress(fullAddress);

      if (formik?.setFieldValue) {
        const streetOnly = data?.address?.road ||
          data?.address?.neighbourhood ||
          data?.address?.suburb ||
          data?.address?.hamlet ||
          "";

        const detectedCity = data?.address?.city ||
          data?.address?.town ||
          data?.address?.village ||
          data?.address?.municipality ||
          data?.address?.county ||
          data?.address?.state_district ||
          data?.address?.suburb ||
          "";

        console.log("📝 Setting formik values:", {
          country: data?.address?.country || "",
          province: data?.address?.state || "",
          city: detectedCity,
          community: data?.address?.suburb || data?.address?.neighbourhood || "",
          postalCode: data?.address?.postcode || "",
          street: streetOnly,
          latitude: lat,
          longitude: lng
        });

        formik.setFieldValue("country", data?.address?.country || "");
        formik.setFieldValue("province", data?.address?.state || "");
        formik.setFieldValue("city", detectedCity);
        formik.setFieldValue("community", data?.address?.suburb || data?.address?.neighbourhood || "");
        formik.setFieldValue("postal_code", data?.address?.postcode || "");
        formik.setFieldValue("street_address", streetOnly);
        formik.setFieldValue("latitude", lat);
        formik.setFieldValue("longitude", lng);

        // Trigger formik validation
        formik.setFieldTouched("country", true);
        formik.setFieldTouched("city", true);
        
        console.log("✅ Location data successfully set in formik");
      } else {
        console.log("❌ Formik not available for setting values");
      }
    } catch (err) {
      console.error("❌ Reverse geocoding failed:", err);
      
      // Always set coordinates in formik even if reverse geocoding fails
      // This ensures the form can still be submitted with coordinates
      if (formik?.setFieldValue) {
        formik.setFieldValue("latitude", lat);
        formik.setFieldValue("longitude", lng);
        // Set empty strings for address fields so user can fill manually
        formik.setFieldValue("country", formik.values.country || "");
        formik.setFieldValue("province", formik.values.province || "");
        formik.setFieldValue("city", formik.values.city || "");
        formik.setFieldValue("street_address", formik.values.street_address || "");
      }
      
      // Show coordinates as fallback
      setAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)} - Please fill address manually`);
      
      // Log warning (don't spam user with toasts)
      if (err.message === "CORS_BLOCKED" || err.message?.includes('CORS') || err.message?.includes('Failed to fetch')) {
        console.warn("⚠️ Address lookup blocked by CORS. Coordinates saved. Set up backend proxy for production.");
      } else {
        console.warn("⚠️ Address lookup failed. Coordinates saved.");
      }
    } finally {
      setIsProcessingLocation(false);
    }
  };

  

// ✅ Safe updatePosition
const updatePosition = (lat, lon, { setView = true } = {}) => {
  const hasInline = inlineMapRef.current && inlineMarkerRef.current;
  const hasFull = fullMapRef.current && fullMarkerRef.current;

  // ⛔ If no markers exist yet, skip instead of crashing
  if (!hasInline && !hasFull) return;

  if (hasInline) {
    inlineMarkerRef.current.setLatLng([lat, lon]);
    if (setView) inlineMapRef.current.setView([lat, lon], 15);
  }

  if (hasFull) {
    fullMarkerRef.current.setLatLng([lat, lon]);
    if (setView) fullMapRef.current.setView([lat, lon], 15);
  }

  fetchAddress({ lat, lng: lon });
};



useEffect(() => {
  if (inlineMapRef.current) return;

  const map = L.map("map-inline", {
    center: DEFAULT_COORDS,
    zoom: 13,
  });
  inlineMapRef.current = map;

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const marker = L.marker(DEFAULT_COORDS, { draggable: true }).addTo(map);
  inlineMarkerRef.current = marker;

  map.on("click", (e) => updatePosition(e.latlng.lat, e.latlng.lng));
  marker.on("dragend", (e) => {
    const { lat, lng } = e.target.getLatLng();
    updatePosition(lat, lng);
  });

  // ✅ Only try geolocation after marker exists
  if (navigator.geolocation) {
    console.log("🌍 Attempting to get current position...");
    setIsProcessingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("📍 Current position obtained:", pos.coords);
        if (inlineMarkerRef.current) {
          updatePosition(pos.coords.latitude, pos.coords.longitude);
        }
        setIsProcessingLocation(false);
      },
      (err) => {
        console.log("❌ Geolocation error:", err);
        setIsProcessingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          console.log("📍 Location permission denied, using default coordinates");
          setOpen(true);
          updatePosition(DEFAULT_COORDS[0], DEFAULT_COORDS[1]);
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          console.log("📍 Location unavailable, using default coordinates");
          updatePosition(DEFAULT_COORDS[0], DEFAULT_COORDS[1]);
        } else if (err.code === err.TIMEOUT) {
          console.log("📍 Location request timeout, using default coordinates");
          updatePosition(DEFAULT_COORDS[0], DEFAULT_COORDS[1]);
        } else {
          console.log("📍 Using default coordinates");
          updatePosition(DEFAULT_COORDS[0], DEFAULT_COORDS[1]);
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 60000 // Cache for 1 minute
      }
    );
  } else {
    console.log("📍 Geolocation not supported, using default coordinates");
    updatePosition(DEFAULT_COORDS[0], DEFAULT_COORDS[1]);
  }

  return () => {
    map.remove();
    inlineMapRef.current = null;
    inlineMarkerRef.current = null;
  };
}, []);

  // Create/destroy full map
  useEffect(() => {
    if (!showFullMap) {
      if (fullMapRef.current) {
        fullMapRef.current.remove();
        fullMapRef.current = null;
        fullMarkerRef.current = null;
      }
      return;
    }

    const inlineCenter =
      inlineMarkerRef.current?.getLatLng() ||
      inlineMapRef.current?.getCenter() || {
        lat: DEFAULT_COORDS[0],
        lng: DEFAULT_COORDS[1],
      };

    const map2 = L.map("map-full", {
      center: [inlineCenter.lat, inlineCenter.lng],
      zoom: 13,
    });
    fullMapRef.current = map2;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map2);

    const m2 = L.marker([inlineCenter.lat, inlineCenter.lng], {
      draggable: true,
    }).addTo(map2);
    fullMarkerRef.current = m2;

    map2.on("click", (e) => updatePosition(e.latlng.lat, e.latlng.lng));
    m2.on("dragend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      updatePosition(lat, lng);
    });

    setTimeout(() => map2.invalidateSize(), 300); // fix map white box

    return () => {
      map2.remove();
      fullMapRef.current = null;
      fullMarkerRef.current = null;
    };
  }, [showFullMap]);

  // Fetch location suggestions with debouncing
  const fetchSuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5`;
      
      const res = await fetchWithCors(url, {
        headers: {
          'User-Agent': 'LocationPickerApp/1.0 (contact@example.com)',
          'Accept-Language': 'en'
        }
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      // Check for rate limiting
      if (data.error) {
        console.error("Nominatim API error:", data.error);
        toast.error("Search rate limit reached. Please wait a moment.");
        setSuggestions([]);
      } else {
        setSuggestions(data || []);
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      // Don't show error toast for every failed request, just log it
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced search handler
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debouncing (500ms delay)
    searchTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 500);
  };

  // Handle search (for Enter key or button click)
  const handleSearch = async () => {
    const q = searchInputRef.current?.value?.trim();
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&limit=1&addressdetails=1`;
      
      const res = await fetchWithCors(url, {
        headers: {
          'User-Agent': 'LocationPickerApp/1.0 (contact@example.com)',
          'Accept-Language': 'en'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const results = await res.json();
      
      if (results.error) {
        toast.error("Search rate limit reached. Please wait a moment.");
        return;
      }

      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        updatePosition(Number(lat), Number(lon));
        setAddress(display_name);
        setShowSuggestions(false);
        setSuggestions([]);
      } else {
        toast.error("No location found.");
      }
    } catch (err) {
      console.error("Search error:", err);
      toast.error("Something went wrong! Please try again.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    const { lat, lon, display_name } = suggestion;
    updatePosition(Number(lat), Number(lon));
    setAddress(display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    if (searchInputRef.current) {
      searchInputRef.current.value = display_name;
    }
  };

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const goToCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsProcessingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("📍 Current position obtained:", pos.coords);
        if (inlineMarkerRef.current) {
          updatePosition(pos.coords.latitude, pos.coords.longitude);
          toast.success(t("Location_updated"));
        }
        setIsProcessingLocation(false);
      },
      (err) => {
        console.error("❌ Geolocation error:", err);
        setIsProcessingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please enable location access.");
          setOpen(true);
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          toast.error("Location information unavailable.");
        } else if (err.code === err.TIMEOUT) {
          toast.error("Location request timed out. Please try again.");
        } else {
          toast.error("Something went wrong getting your location. Please try again.");
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 60000 // Cache for 1 minute
      }
    );
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          flexDirection: window.innerWidth < 600 ? "column" : "row",
          gap: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ position: "relative", flex: 1, width: window.innerWidth < 600 ? "100%" : "auto" }}>
          <input
            ref={searchInputRef}
            id="location-search"
            type="text"
            placeholder={t("Search location...")}
            onKeyDown={onSearchKeyDown}
            onChange={handleSearchInputChange}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow click events
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            style={{
              width: "100%",
              padding: window.innerWidth < 600 ? "8px 12px" : "6px 8px",
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: window.innerWidth < 600 ? 16 : 14,
            }}
          />
          {/* Suggestions Dropdown */}
          {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: 6,
                marginTop: 4,
                maxHeight: "300px",
                overflowY: "auto",
                zIndex: 1000,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
            >
              {isLoadingSuggestions ? (
                <div style={{ padding: "12px", textAlign: "center", color: "#666" }}>
                  Searching...
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: "12px",
                      cursor: "pointer",
                      borderBottom: index < suggestions.length - 1 ? "1px solid #eee" : "none",
                      ":hover": { backgroundColor: "#f5f5f5" },
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "white";
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: "14px", color: "#333" }}>
                      {suggestion.display_name}
                    </div>
                    {suggestion.address && (
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                        {[
                          suggestion.address.city || suggestion.address.town,
                          suggestion.address.state,
                          suggestion.address.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            width: window.innerWidth < 600 ? "100%" : "auto",
            justifyContent: window.innerWidth < 600 ? "space-between" : "flex-start",
          }}
        >
          <IconButton
            onClick={handleSearch}
            style={{
              padding: window.innerWidth < 600 ? "8px 12px" : "6px 10px",
              border: "none",
              background: "#007bff",
              color: "white",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: window.innerWidth < 600 ? 16 : 14,
            }}
          >
            <SearchOutlinedIcon />
          </IconButton>
          <IconButton
            onClick={goToCurrentLocation}
            style={{
              padding: window.innerWidth < 600 ? "8px 12px" : "6px 10px",
              border: "none",
              background: "#007bff",
              color: "white",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: window.innerWidth < 600 ? 16 : 14,
            }}
          >
            <LocationOnOutlinedIcon />
          </IconButton>
        
          <button
            type="button"
            onClick={handleOpenFullMap}
            style={{
              padding: window.innerWidth < 600 ? "8px 16px" : "6px 12px",
              border: "1px solid #007bff",
              background: "white",
              color: "#007bff",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: window.innerWidth < 600 ? 16 : 14,
              fontWeight: 500,
            }}
          >
            {window.innerWidth < 600 ? t("fields.fullMap") : t("fields.fullMap")}
          </button>
        </div>
      </div>

      {/* Inline map */}
      <div
        id="map-inline"
        style={{ width, height, marginBottom: 8, borderRadius: 6 }}
      />

      {/* Address box */}
      <div
        style={{
          minHeight: 50,
          padding: "8px 12px",
          background: "#f5f5f5",
          borderRadius: 6,
          border: "1px solid #ddd",
          fontSize: 14,
          whiteSpace: "normal",
          wordWrap: "break-word",
        }}
      >
        {isProcessingLocation ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ 
              width: "16px", 
              height: "16px", 
              border: "2px solid #ccc", 
              borderTop: "2px solid #006EC2", 
              borderRadius: "50%", 
              animation: "spin 1s linear infinite" 
            }} />
            {t("fields.processingLocation")}
          </div>
        ) : (
          address || t("fields.pickALocation")
        )}
      </div>

      {/* Full map modal */}
      {showFullMap && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "white",
            zIndex: 2000,
            borderRadius: window.innerWidth < 600 ? 0 : 8,
            overflow: "hidden",
            boxShadow: window.innerWidth < 600 ? "none" : "0 6px 30px rgba(0,0,0,0.35)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div 
            style={{ 
              padding: window.innerWidth < 600 ? 12 : 8, 
              textAlign: "right",
              backgroundColor: "#f5f5f5",
              borderBottom: "1px solid #ddd"
            }}
          >
            <IconButton
              onClick={() => setShowFullMap(false)}
              style={{
                color: "black",
                cursor: "pointer",
                fontSize: window.innerWidth < 600 ? 24 : 20,
              }}
            >
              <CloseOutlinedIcon />
            </IconButton>
          </div>
          <div id="map-full" style={{ flex: 1 }} />
        </div>
      )}

      {/* Location permission helper */}
      <LocationHelperModal
        open={open}
        onClose={() => setOpen(false)}
        onRefresh={() => {
          window.location.reload();
        }}
        onManual={() => {
          setOpen(false);
        }}
      />
    </div>
  );
};

export default LocationPicker;
