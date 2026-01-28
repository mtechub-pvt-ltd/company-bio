import React, { useState } from "react";
import {
    FormControl,
    FormHelperText,
    InputAdornment,
    MenuItem,
    TextField,
    Checkbox,
    ListItemText,
    Autocomplete,
} from "@mui/material";
import { useTranslation } from "react-i18next";

function SelectField({
    icon,
    label,
    value,
    options = [],
    placeholder,
    onChangeTerm,
    error,
    helperText,
    disabled,
    autoFocus,
    graphfilter,
    filter,
    multiple = false,
    country = false, // NEW: trigger for Autocomplete
}) {
    const { t } = useTranslation();
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => setIsFocused(true);

    const renderFlag = (flag) => {
        if (!flag) return null;
        return typeof flag === "string" && flag.startsWith("http") ? (
            <img src={flag} alt="" style={{ width: 20, height: 14, marginRight: 8, objectFit: "cover" }} />
        ) : (
            <span style={{ marginRight: 8 }}>{flag}</span>
        );
    };

    // ✅ If `country` is true, use Autocomplete instead of TextField select
    if (country) {
        const selectedOption = options.find((opt) => opt.value === value) || null;

        return (
            <FormControl fullWidth variant="outlined">
                <Autocomplete
                    options={options}
                    value={selectedOption}
                    onChange={(e, newVal) =>
                        onChangeTerm({ target: { value: newVal?.value || "" } })
                    }
                    getOptionLabel={(opt) => opt?.label || ""}
                    isOptionEqualToValue={(opt, val) => opt.value === val.value}
                    disableClearable
                    autoHighlight
                    disabled={disabled}
                    renderOption={(props, option) => (
                        <li {...props} key={option.value} style={{ display: "flex", alignItems: "center" }}>
                            {renderFlag(option.flag)}
                            {option.label}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={label}
                            autoFocus={autoFocus}
                            onFocus={handleFocus}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: icon ? (
                                    <InputAdornment position="start">{icon}</InputAdornment>
                                ) : null,
                                style: {
                                    color: graphfilter ? '#5E5F60' : '#000000',
                                    fontSize: { xs: "16px", sm: "15px", md: "13px" },
                                    borderRadius: "2px",
                                    backgroundColor: "#fff",
                                    height: graphfilter || filter ? "30px" : "45px",
                                },
                            }}
                            InputLabelProps={{
                                style: {
                                    color: isFocused ? "gray" : "gray",
                                    fontSize: { xs: "16px", sm: "15px", md: "15px" },
                                },
                            }}
                            error={error}
                        />
                    )}
                />
                <FormHelperText style={{ marginLeft: 0, fontSize: "11px", height: "10px", color: "red" }}>
                    {helperText}
                </FormHelperText>
            </FormControl>
        );
    }

    // ✅ Default select dropdown (your original logic)
    return (
        <FormControl variant="outlined" fullWidth>
            <TextField
                select
                label={label}
               
                value={value}
                onChange={onChangeTerm}
                onFocus={handleFocus}
                autoFocus={autoFocus}
                disabled={disabled}
                SelectProps={{
                    multiple: multiple,
                    displayEmpty: true,
                    renderValue: (selected) => {
                        if (!selected || (Array.isArray(selected) && selected.length === 0)) {
                            return <span style={{ color: '#aaa' }}>{filter ? t("Status") : t("Select")}</span>;
                        }
                        if (!multiple) {
                            const selectedOption = options.find(opt => opt.value === selected);
                            return selectedOption ? (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {renderFlag(selectedOption.flag)}
                                    {selectedOption.label}
                                </div>
                            ) : '';
                        } else if (Array.isArray(selected)) {
                            return (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {selected.map(val => {
                                        const found = options.find(opt => opt.value === val);
                                        return found ? (
                                            <div key={val} style={{ display: 'flex', alignItems: 'center' }}>
                                                {renderFlag(found.flag)}
                                                {found.label},
                                            </div>
                                        ) : val;
                                    })}
                                </div>
                            );
                        }
                        return '';
                    },
                }}
                sx={{
                    minWidth: 80 ,
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "2px",
                        "& fieldset": {
                            border: graphfilter ? "1px solid rgba(9, 30, 66, 0.14)" : "2px solid rgba(9, 30, 66, 0.14)",
                        },
                        "&:hover fieldset": {
                            border: graphfilter ? "1px solid rgba(9, 30, 66, 0.14)" : "2px solid rgba(9, 30, 66, 0.14)",
                        },
                        "&.Mui-focused fieldset": {
                            border: graphfilter ? "1px solid #006EC2" : "2px solid #006EC2",
                        },
                        "& .MuiSelect-select": {
                            fontSize: graphfilter
                                ? { xs: "14px", sm: "13px", md: "14px" }
                                : { xs: "16px", sm: "15px", md: "15px" },
                            color: graphfilter ? '#5E5F60' : '#000000',
                            height: graphfilter || filter ? "30px" : "45px",
                            display: "flex",
                            alignItems: "center",
                        },
                    }
                }}
                InputLabelProps={{
                    style: {
                        color: isFocused ? "gray" : "gray",
                        fontSize: { xs: "16px", sm: "15px", md: "15px" },
                    },
                }}
                InputProps={{
                    startAdornment: icon ? (
                        <InputAdornment position="start">{icon}</InputAdornment>
                    ) : null,
                    style: {
                        color: graphfilter ? '#5E5F60' : '#000000',
                        fontSize: { xs: "16px", sm: "15px", md: "13px" },
                        borderRadius: "2px",
                        backgroundColor: "#fff",
                        height: graphfilter || filter ? "30px" : "45px",
                    },
                }}
                error={error}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value} style={{ display: "flex", alignItems: "center" }}>
                        {multiple && (
                            <Checkbox
                                checked={value.includes(option.value)}
                                style={{ padding: 0, marginRight: 8 }}
                            />
                        )}
                        {renderFlag(option.flag)}
                        <ListItemText primary={option.label} />
                    </MenuItem>
                ))}
            </TextField>

            <FormHelperText style={{ marginLeft: 0, fontSize: "11px", height: "10px", color: "red" }}>
                {helperText}
            </FormHelperText>
        </FormControl>
    );
}

export default SelectField;
