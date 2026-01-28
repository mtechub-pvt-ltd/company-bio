import React, { useState } from "react";
import {
  Box,
  Paper,
  Checkbox,
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

const MultiSelectDropdown = ({
  label,
  name,
  values = [],
  onChange,
  options = [],
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  // 🔹 Always work with arrays internally (backward-compatible)
  const selectedValues = Array.isArray(values)
    ? values.map((v) => (typeof v === "string" ? v : v?.value ?? ""))
    : values
    ? [typeof values === "string" ? values : values?.value ?? ""]
    : [];

  const handleToggle = (val) => {
    const exists = selectedValues.includes(val);
    const updated = exists
      ? selectedValues.filter((x) => x !== val)
      : [...selectedValues, val];

    // 🔹 Keep the same event shape your app already uses
    onChange?.({ target: { name, value: updated } });
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
          <span style={{ color: selectedValues.length ? "#172B4D" : "#A0A0A0" }}>
          <span style={{ color: "#A0A0A0" }}>
  {t("select")}
</span>
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
                  onClick={() => handleToggle(val)}
                  sx={{
                    gap: 1,
                    px: 1,
                    py: 0.5,
                    fontSize: "15px",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 400,
                    lineHeight: 1.2,
                    minHeight: "unset",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Checkbox
                    checked={selectedValues.includes(val)}
                    size="small"
                    sx={{ p: 0.5 }}
                  />
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
                    onClick={() => handleToggle(val)}
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

export default MultiSelectDropdown;




// import React, { useState } from "react";
// import {
//   Box,
//   Paper,
//   Typography,
//   ClickAwayListener,
//   Checkbox,
//   MenuItem,
//   Chip,
//   IconButton,
// } from "@mui/material";
// import arrow from "../assets/arrow.svg";
// import crossselect from "../assets/crossselect.svg";
// import CustomText, { textStyles } from "./CustomText";
// import { useTranslation } from "react-i18next";

// const MultiSelectDropdown = ({ label, name, values, onChange, options }) => {
//   const [open, setOpen] = useState(false);
//   const { t } = useTranslation();

//   const handleToggle = (option) => {
//     const updated = values.includes(option)
//       ? values.filter((item) => item !== option)
//       : [...values, option];
//     onChange({ target: { name, value: updated } });

//     // OPTIONAL: Uncomment below to close dropdown on selection
//     // setOpen(false);
//   };

//   return (
//     <ClickAwayListener onClickAway={() => setOpen(false)}>
//       <Box sx={{ position: "relative", mb: 0.5 }}>
//         <CustomText
//           sx={{
//             ...textStyles.body5,
//             color: "#6B778C",
//             pt: 1.2,
//             textAlign: "left",
//           }}
//         >
//           {label}
//         </CustomText>

//         <Box
//           onClick={() => setOpen(!open)}
//           sx={{
//             height: 38,
//             border: "2px solid #091E4224",
//             borderRadius: "6px",
//             px: 2,
//             fontSize: 14,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             cursor: "pointer",
//             backgroundColor: "#fff",
//             mt: 0.5,
//           }}
//         >
//           <span style={{ color: values.length ? "#172B4D" : "#A0A0A0" }}>
//             {t("select")}
//           </span>
//           <img src={arrow} alt="arrow" style={{ width: 18 }} />
//         </Box>

//         {open && (
//           <Paper
//             sx={{
//               mt: 1,
//               boxShadow: 1,
//               borderRadius: 1,
//               position: "absolute",
//               zIndex: 10,
//               width: "100%",
//                   maxHeight: "200px",
//       overflowY: "auto",
//               p: 1,
//               backgroundColor: "white",
//             }}
//           >
//             {options.map((opt) => (
//               <MenuItem
//                 key={opt}
//                 onClick={() => handleToggle(opt)} // ✅ Full item clickable
//                 sx={{
//                   gap: 1,
//                   px: 1,
//                   py: 0.5,
//                   fontSize: "15px",
//                   fontFamily: "Poppins, sans-serif",
//                   fontWeight: 400,
//                   lineHeight: 1.2,
//                   minHeight: "unset",
//                   display: "flex",
//                   alignItems: "center",
//                 }}
//               >
//                 <Checkbox
//                   checked={values.includes(opt)}
//                   size="small"
//                   sx={{ p: 0.5 }}
//                 />
//                 {opt}
//               </MenuItem>
//             ))}
//           </Paper>
//         )}

//         {values.length > 0 && (
//           <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.8 }}>
//             {values.map((item) => (
//               <Box
//                 key={item}
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   px: 0.8,
//                   py: 1,
//                   backgroundColor: "#579DFF",
//                   borderRadius: "6px",
//                   fontSize: "14px",
//                   color: "#09326C",
//                   fontWeight: 500,
//                 }}
//               >
//                 {item}
//                 <IconButton
//                   size="small"
//                   onClick={() => handleToggle(item)}
//                   sx={{ ml: 0.3, p: 0 }}
//                 >
//                   <img
//                     src={crossselect}
//                     alt="remove"
//                     style={{ width: 16, height: 16 }}
//                   />
//                 </IconButton>
//               </Box>
//             ))}
//           </Box>
//         )}
//       </Box>
//     </ClickAwayListener>
//   );
// };

// export default MultiSelectDropdown;




