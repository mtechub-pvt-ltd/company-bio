import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  Autocomplete,
  TextField,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

// Cascading Dropdown Component using CountriesNow API
const CascadingLocationSelect = ({ 
  selectedZone, 
  setSelectedZone, 
  selectedCountry, 
  setSelectedCountry, 
  selectedState, 
  setSelectedState, 
  selectedCity,
  setSelectedCity,
  t 
}) => {
  const [zones, setZones] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allCountriesData, setAllCountriesData] = useState([]);
  const [restCountriesData, setRestCountriesData] = useState([]);

  // Fetch regions from REST Countries API
  const fetchRegions = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,region,subregion');
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setRestCountriesData(data);
        
        // Extract unique regions and sort alphabetically
        const uniqueRegions = [...new Set(data.map(country => country.region).filter(Boolean))].sort();
        const regionOptions = uniqueRegions.map(region => ({
          name: region,
          countries: data.filter(country => country.region === region).map(country => country.name.common).sort()
        }));
        
        setZones(regionOptions);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast.error('Failed to load regions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all countries data on component mount
  const fetchAllCountriesData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/states');
      const data = await response.json();
      
      if (data.error === false && data.data) {
        setAllCountriesData(data.data);
      }
    } catch (error) {
      console.error('Error fetching all countries:', error);
      toast.error('Failed to load countries data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries from CountriesNow API based on selected zone
  const fetchCountries = async (countryNames) => {
    setLoading(true);
    try {
      // Use cached data if available, otherwise fetch from API
      let countriesData = allCountriesData;
      if (countriesData.length === 0) {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states');
        const data = await response.json();
        
        if (data.error === false && data.data) {
          countriesData = data.data;
          setAllCountriesData(data.data);
        }
      }
      
      // Filter countries based on selected zone
      const filteredCountries = countriesData.filter(country => 
        countryNames.includes(country.name)
      );
      setCountries(filteredCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      toast.error('Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  // Fetch states for selected country
  const fetchStates = async (countryName) => {
    if (!countryName) {
      setStates([]);
      return;
    }
    
    setLoading(true);
    try {
      // Use cached data if available, otherwise fetch from API
      let countriesData = allCountriesData;
      if (countriesData.length === 0) {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states');
        const data = await response.json();
        
        if (data.error === false && data.data) {
          countriesData = data.data;
          setAllCountriesData(data.data);
        }
      }
      
      const selectedCountryData = countriesData.find(country => country.name === countryName);
      if (selectedCountryData && selectedCountryData.states) {
        setStates(selectedCountryData.states);
      } else {
        setStates([]);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      toast.error('Failed to load states');
    } finally {
      setLoading(false);
    }
  };

  // Fetch cities for selected state
  const fetchCities = async (countryName, stateName) => {
    if (!countryName || !stateName) {
      setCities([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: countryName,
          state: stateName
        })
      });
      const data = await response.json();
      
      if (data.error === false && data.data && data.data.length > 0) {
        setCities(data.data);
      } else {
        // If no cities found, use the state name as city option
        setCities([stateName]);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast.error('Failed to load cities');
      // Fallback: use state name as city
      setCities([stateName]);
    } finally {
      setLoading(false);
    }
  };

  // Handle zone selection
  const handleZoneChange = (event, newValue) => {
    setSelectedZone(newValue);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    setCountries([]);
    setStates([]);
    setCities([]);
    
    if (newValue) {
      // Use the countries from the selected zone
      fetchCountries(newValue.countries);
    }
  };

  // Handle country selection
  const handleCountryChange = (event, newValue) => {
    setSelectedCountry(newValue);
    setSelectedState(null);
    setSelectedCity(null);
    setStates([]);
    setCities([]);
    
    if (newValue) {
      fetchStates(newValue.name);
    }
  };

  // Handle state selection
  const handleStateChange = (event, newValue) => {
    setSelectedState(newValue);
    setSelectedCity(null);
    setCities([]);
    
    if (newValue && selectedCountry) {
      fetchCities(selectedCountry.name, newValue.name);
    }
  };

  // Handle city selection
  const handleCityChange = (event, newValue) => {
    setSelectedCity(newValue);
  };

  // Reset internal states when parent selections are cleared
  useEffect(() => {
    if (!selectedZone && !selectedCountry && !selectedState && !selectedCity) {
      setCountries([]);
      setStates([]);
      setCities([]);
    }
  }, [selectedZone, selectedCountry, selectedState, selectedCity]);

  // Fetch all countries data and regions on component mount
  useEffect(() => {
    fetchAllCountriesData();
    fetchRegions();
  }, []);

  return (
    <Box sx={{ mb: 2 }}>
      {/* Zone Selection */}
      <Autocomplete
        options={zones}
        getOptionLabel={(option) => option.name}
        value={selectedZone}
        onChange={handleZoneChange}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
      label={t("location.selectRegion")}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            {option.name}
          </Box>
        )}
      />

      {/* Country Selection */}
      <Autocomplete
        options={countries}
        getOptionLabel={(option) => option.name}
        value={selectedCountry}
        onChange={handleCountryChange}
        disabled={!selectedZone}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
         label={t("location.selectCountry")}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            {option.name}
          </Box>
        )}
      />

      {/* State Selection */}
      <Autocomplete
        options={states}
        getOptionLabel={(option) => option.name}
        value={selectedState}
        onChange={handleStateChange}
        disabled={!selectedCountry}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
          label={t("location.selectStateProvince")}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            {option.name}
          </Box>
        )}
      />

      {/* City Selection */}
      <Autocomplete
        options={cities}
        getOptionLabel={(option) => option}
        value={selectedCity}
        onChange={handleCityChange}
        disabled={!selectedState}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
label={t("location.selectCity")}
            variant="outlined"
            fullWidth
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            {option}
          </Box>
        )}
      />
    </Box>
  );
};

// Main LocationFilter Component
const 

LocationFilter = ({ 
  onFilterApply, 
  onFilterClear, 
  filterApplied = false,
title="location.filterByLocation",
  showHeader = true 
}) => {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  
  // Filter states
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const handleFilterClick = () => {
    setModalOpen(true);
  };

  const handleApplyFilter = () => {
    setModalOpen(false);
    
    // Create filter object with selected values
    const filterData = {
      zone: selectedZone,
      country: selectedCountry,
      state: selectedState,
      city: selectedCity,
    };
    
    // Call the callback with filter data
    if (onFilterApply) {
      onFilterApply(filterData);
    }
  };

  const handleClearFilter = () => {
    // Clear all selections
    setSelectedZone(null);
    setSelectedCountry(null);
    setSelectedState(null);
    setSelectedCity(null);
    
    // Close modal if open
    setModalOpen(false);
    
    // Call the callback
    if (onFilterClear) {
      onFilterClear();
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      {/* Filter Button */}
      {showHeader && (
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <IconButton
            onClick={handleFilterClick}
            sx={{
              border: "1px solid #E0E0E0",
              borderRadius: "8px",
              bgcolor: filterApplied ? "#1976d2" : "#fff",
              color: filterApplied ? "#fff" : "#44546F",
            }}
          >
            <FilterListIcon />
          </IconButton>

          {filterApplied && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilter();
              }}
              sx={{
                position: "absolute",
                top: -6,
                right: -6,
                bgcolor: "#fff",
                border: "1px solid #ccc",
                p: 0.3,
              }}
            >
              <CloseIcon sx={{ fontSize: 14, color: "#444" }} />
            </IconButton>
          )}
        </Box>
      )}

      {/* Filter Modal */}
      <Dialog open={modalOpen} onClose={handleModalClose} fullWidth maxWidth="md">
        <DialogTitle>{t(title)}</DialogTitle>
        <DialogContent dividers>
          {/* <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
            {t("Select Location Hierarchy")}
          </Typography> */}
          
          <CascadingLocationSelect
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            t={t}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleModalClose}>
          {t("location.cancel")}
          </Button>
          <Button variant="contained" onClick={handleApplyFilter}>
        {t("location.apply")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LocationFilter;
