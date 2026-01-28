import React, { useState } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  Box,
  Typography,
  FormHelperText,
  OutlinedInput,
} from "@mui/material";
import { Close, KeyboardArrowDown } from "@mui/icons-material";
import { getCountriesByRegion } from "../../helper_functions/regionHelper";

const REGIONS = [
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Africa",
  "Oceania",
];

const MultiRegionSelector = ({ value = [], onChangeTerm, error, helperText }) => {
  const [open, setOpen] = useState(false);

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    const newSelected = typeof selectedValue === "string" ? selectedValue.split(",") : selectedValue;

    const countriesByRegion = {};
    newSelected.forEach((region) => {
      countriesByRegion[region] = getCountriesByRegion(region);
    });

    onChangeTerm?.({ target: { value: newSelected, countriesByRegion } });
  };

  const handleRemoveRegion = (regionToRemove) => {
    const newSelected = value.filter((region) => region !== regionToRemove);
    const countriesByRegion = {};
    newSelected.forEach((region) => {
      countriesByRegion[region] = getCountriesByRegion(region);
    });
    onChangeTerm?.({ target: { value: newSelected, countriesByRegion } });
  };

  const renderValue = (selected) => {
    if (selected.length === 0) return <em>Select Region</em>;
    return `${selected.length} region${selected.length > 1 ? "s" : ""} selected`;
  };

  return (
    <Box>
      <FormControl fullWidth error={error} sx={{ mb: 1 }}>
      <Select
  multiple
  value={value}
  onChange={handleChange}
  input={<OutlinedInput />}
  renderValue={renderValue}
  open={open}
  onOpen={() => setOpen(true)}
  onClose={() => setOpen(false)}
  IconComponent={KeyboardArrowDown}
  displayEmpty
  MenuProps={{
    PaperProps: {
      sx: {
        maxHeight: 200, // limit height, enable scroll
      },
    },
  }}
  sx={{
    height: "43px", // slightly smaller
    border: "2px solid #dcdfe4",
    borderRadius: "4px",
    outline: "none",
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "&:hover": { border: "2px solid #dcdfe4" },
    "&.Mui-focused": { border: "2px solid #006EC2" },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      gap: .5, // reduce space between checkbox and text
      padding: "6px 10px", // smaller padding
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: "14px",
      fontFamily: "Roboto",
    },
    "& .MuiMenuItem-root": {
      padding: "4px 10px", // smaller padding
      minHeight: "32px", // make items compact
    },
  }}
>
  {REGIONS.map((region) => (
    <MenuItem key={region} value={region}>
      <Checkbox
        checked={value.includes(region)}
        sx={{
          color: "rgba(9, 30, 66, 0.4)",
          "&.Mui-checked": { color: "#006EC2" },
          padding: 0, // remove extra padding
          marginRight: 2, // space between checkbox and text
        }}
      />
      <ListItemText
        primary={region}
        sx={{
          "& .MuiListItemText-primary": {
            fontSize: "14px",
           fontWeight:"500",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
        }}
      />
    </MenuItem>
  ))}
</Select>

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>

      {value.length > 0 && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              color: "#626F86",
              fontSize: "14px",
              fontFamily: "Roboto",
              fontWeight: 500,
            }}
          >
            Selected Regions:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {value.map((region) => (
              <Chip
                key={region}
                label={region}
                onDelete={() => handleRemoveRegion(region)}
                deleteIcon={<Close aria-label={`Remove ${region}`} />}
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  backgroundColor: "#579DFF",
                  borderColor: "#579DFF",
                  color: "#0D1A26",
                  fontSize: "12px",
                  fontFamily: "Poppins",
                  "& .MuiChip-deleteIcon": {
                    color: "#0D1A26",
                    fontSize: "16px",
                    "&:hover": { color: "#0D1A26" },
                  },
                  
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MultiRegionSelector;
