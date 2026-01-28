// Map.jsx
import React, { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    ZoomControl,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";

// ✅ Fix default marker icon issue in React builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// ✅ Function to fetch address details from lat/lng
const getAddressFromLatLng = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();

        return {
            country: data.address?.country || "",
            country_code: data.address?.country_code || "",
            province: data.address?.state || "",
            region: data.address?.region || "",
            city:
                data.address?.city ||
                data.address?.town ||
                data.address?.village ||
                "",
            postal_code: data.address?.postcode || "",
            street_address: data.address?.road || "",
            manual_address: data.display_name || "",
            latitude: lat,
            longitude: lng,
        };
    } catch (error) {
      toast.error("Failed to fetch address details.");
        return null;
    }
};

// ✅ Draggable marker sub-component
const DraggableMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng); // Move marker when user clicks
        },
    });

    return (
        <Marker
            position={position}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const newPos = e.target.getLatLng();
                    setPosition(newPos);
                },
            }}
        >
            <Popup>
                📍 Latitude: {position.lat.toFixed(5)}, Longitude:{" "}
                {position.lng.toFixed(5)}
                <br />
                👉 Drag marker or click map to change location.
            </Popup>
        </Marker>
    );
};

// ✅ Main component
const Map = ({ onLocationChange }) => {
    const [position, setPosition] = useState({ lat: 51.505, lng: -0.09 }); // default London
    const [loaded, setLoaded] = useState(false);

    // Fetch address when position changes
    useEffect(() => {
        if (position?.lat && position?.lng) {
            getAddressFromLatLng(position.lat, position.lng).then((details) => {
                if (details) {
             
                    if (onLocationChange) {
                        onLocationChange(details); // ✅ Pass data to parent
                    }
                }
            });
        }
    }, [position]);

    // Get user's current location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const userPos = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    };
                 
                    setPosition(userPos);
                    setLoaded(true);
                },
                (err) => {
                   toast.error("Something went wrong! Please allow location access.");
                    setLoaded(true); // fallback to default
                }
            );
        } else {
            setLoaded(true);
        }
    }, []);

    return (
        <div style={{ height: "200px", width: "100%", marginTop: "10px" }}>
            {loaded && (
                <MapContainer
                    center={[position.lat, position.lng]}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Marker */}
                    <DraggableMarker position={position} setPosition={setPosition} />

                    {/* Zoom buttons on right side */}
                    <ZoomControl position="topright" />
                </MapContainer>
            )}
        </div>
    );
};

export default Map;
