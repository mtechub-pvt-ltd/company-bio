import React, { useState } from "react";
import {
  Box,
  Paper,
  MenuItem,
  IconButton,
  ClickAwayListener,
} from "@mui/material";
import arrow from "../Assets/arrow.svg";
import crossselect from "../Assets/crossselect.svg";
import CustomText, { textStyles } from "./CustomText";
import { useTranslation } from "react-i18next";

const getOptLabel = (opt) => (typeof opt === "string" ? opt : opt?.label ?? "");
const getOptValue = (opt) => (typeof opt === "string" ? opt : opt?.value ?? "");

const SingleSelectionDropdown = ({
  label,
  name,
  values = [],
  onChange,
  options = [],
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  // always treat internally as array
  const selectedValues = Array.isArray(values)
    ? values.map((v) => (typeof v === "string" ? v : v?.value ?? ""))
    : values
    ? [typeof values === "string" ? values : values?.value ?? ""]
    : [];

  const handleSelect = (val) => {
    // for single select → only keep the new value
    const updated = [val];
    onChange?.({ target: { name, value: updated } });
    setOpen(false); // close dropdown after selection
  };

  const selectedLabels = options
    .filter((opt) => selectedValues.includes(getOptValue(opt)))
    .map(getOptLabel);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "relative", mb: 0.5 }}>
        <CustomText
          sx={{
            ...textStyles.body5,
            color: "#6B778C",
            pt: 1.2,
            textAlign: "left",
          }}
        >
          {label}
        </CustomText>

        {/* Trigger */}
        <Box
          onClick={() => setOpen((v) => !v)}
          sx={{
            height: 38,
            border: "2px solid #091E4224",
            borderRadius: "6px",
            px: 2,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            backgroundColor: "#fff",
            mt: 0.5,
          }}
        >
          <span style={{ color: selectedLabels.length ? "#172B4D" : "#A0A0A0" }}>
            {selectedLabels.length ? selectedLabels.join(", ") : t("select")}
          </span>
          <img src={arrow} alt="arrow" style={{ width: 18 }} />
        </Box>

        {/* List */}
        {open && (
          <Paper
            sx={{
              mt: 1,
              boxShadow: 1,
              borderRadius: 1,
              position: "absolute",
              zIndex: 10,
              width: "100%",
              maxHeight: "200px",
              overflowY: "auto",
              p: 1,
              backgroundColor: "white",
            }}
          >
            {options.map((opt) => {
              const val = getOptValue(opt);
              const labelText = getOptLabel(opt);
              return (
                <MenuItem
                  key={val}
                  onClick={() => handleSelect(val)}
                  sx={{
                    px: 1,
                    py: 0.5,
                    fontSize: "15px",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 400,
                    lineHeight: 1.2,
                    minHeight: "unset",
                  }}
                >
                  {labelText}
                </MenuItem>
              );
            })}
          </Paper>
        )}

        {/* Chips */}
        {selectedValues.length > 0 && (
          <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.8 }}>
            {selectedValues.map((val) => {
              const labelText =
                options.find((o) => getOptValue(o) === val)?.label ?? val;
              return (
                <Box
                  key={val}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 0.8,
                    py: .2,
                    backgroundColor: "#579DFF",
                    borderRadius: "6px",
                    fontSize: "14px",
                    color: "#09326C",
                    fontWeight: 500,
                  }}
                >
                  {labelText}
                  <IconButton
                    size="small"
                    onClick={() =>
                      onChange?.({ target: { name, value: [] } })
                    }
                    sx={{ ml: 0.3, p: 0 }}
                  >
                    <img
                      src={crossselect}
                      alt="remove"
                      style={{ width: 16, height: 16 }}
                    />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default SingleSelectionDropdown;
