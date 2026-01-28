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

// 🌍 Static region list (replace with your REGION_TO_COUNTRY_ISO mapping if needed)
const REGIONS = [
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Africa",
  "Oceania",
  "Middle East",
  "Caribbean",
];

const MultiRegionSelector = ({
  value = [],
  onChangeTerm,
  error,
  helperText,
}) => {
  const [open, setOpen] = useState(false);

  // ✅ Handle selection
  const handleChange = (event) => {
    const selectedValue = event.target.value;
    const newSelected =
      typeof selectedValue === "string"
        ? selectedValue.split(",")
        : selectedValue;

    if (onChangeTerm) {
      onChangeTerm({ target: { value: newSelected } });
    }
  };

  // ✅ Remove badge by cross
  const handleRemoveRegion = (regionToRemove) => {
    const newSelected = value.filter((region) => region !== regionToRemove);
    if (onChangeTerm) {
      onChangeTerm({ target: { value: newSelected } });
    }
  };

  // ✅ Custom render inside input
  const renderValue = (selected) => {
    if (selected.length === 0) {
      return null; // no placeholder, no label
    }
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
  sx={{
    height: "46px",
    borderWidth: "2px",
    borderColor: "rgba(9, 30, 66, 0.14)",
    borderRadius: "2px",
    "& .MuiOutlinedInput-notchedOutline": {
      borderWidth: "2px", // always 2px
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(9, 30, 66, 0.14)", // keep border color same on hover
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(9, 30, 66, 0.14)", // remove black outline on focus
    },
    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
    },
  }}
>

          {REGIONS.map((region) => (
            <MenuItem key={region} value={region}>
              <Checkbox
                checked={value.includes(region)}
                sx={{
                  color: "rgba(9, 30, 66, 0.14)",
                  "&.Mui-checked": {
                    color: "#006EC2",
                  },
                }}
              />
              <ListItemText
                primary={region}
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: "14px",
                    fontFamily: "Roboto",
                  },
                }}
              />
            </MenuItem>
          ))}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>

      {/* ✅ Selected Regions Badges */}
      {value.length > 0 && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography
            variant="body2"
            sx={{
              mb: 1,
              color: "#626F86",
              fontSize: "14px",
              fontFamily: "Roboto",
              fontWeight: 450,
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
                deleteIcon={<Close />}
                variant="outlined"
                sx={{
                  backgroundColor: "#F0F9FF",
                  borderColor: "#006EC2",
                  color: "#006EC2",
                  fontSize: "12px",
                  fontFamily: "Roboto",
                  "& .MuiChip-deleteIcon": {
                    color: "#006EC2",
                    fontSize: "16px",
                    "&:hover": {
                      color: "#004494",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "#E3F2FD",
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
