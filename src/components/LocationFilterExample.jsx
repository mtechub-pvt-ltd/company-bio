import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import LocationFilter from "./LocationFilter";

// Example component showing how to use LocationFilter anywhere
const LocationFilterExample = () => {
  const [filterApplied, setFilterApplied] = useState(false);
  const [filterData, setFilterData] = useState(null);

  // Handle when filter is applied
  const handleFilterApply = (filter) => {
    console.log("Filter applied:", filter);
    setFilterData(filter);
    setFilterApplied(true);
    
    // You can now use the filter data to:
    // 1. Make API calls with location parameters
    // 2. Filter local data
    // 3. Update your component state
    // 4. Trigger other actions based on location selection
    
    // Example API call:
    // fetchDataWithLocation(filter);
  };

  // Handle when filter is cleared
  const handleFilterClear = () => {
    console.log("Filter cleared");
    setFilterData(null);
    setFilterApplied(false);
    
    // Reset your data to show all results
    // fetchAllData();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Location Filter Usage Example
      </Typography>
      
      {/* Basic usage with header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          With Header (Default)
        </Typography>
        <LocationFilter
          onFilterApply={handleFilterApply}
          onFilterClear={handleFilterClear}
          filterApplied={filterApplied}
          title="Filter by Location"
        />
      </Box>

      {/* Usage without header (for custom layouts) */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Without Header (Custom Layout)
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography>Custom filter button:</Typography>
          <LocationFilter
            onFilterApply={handleFilterApply}
            onFilterClear={handleFilterClear}
            filterApplied={filterApplied}
            showHeader={false}
          />
        </Box>
      </Box>

      {/* Display current filter state */}
      {filterApplied && filterData && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Current Filter:
          </Typography>
          {filterData.zone && (
            <Typography>Zone: {filterData.zone.name}</Typography>
          )}
          {filterData.country && (
            <Typography>Country: {filterData.country.name}</Typography>
          )}
          {filterData.state && (
            <Typography>State: {filterData.state.name}</Typography>
          )}
          {filterData.city && (
            <Typography>City: {filterData.city}</Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default LocationFilterExample;
