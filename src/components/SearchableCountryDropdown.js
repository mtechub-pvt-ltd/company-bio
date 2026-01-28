
// import { FormControl, Select, MenuItem, InputBase } from "@mui/material";
// import { useState } from "react";
// import { useTranslation } from "react-i18next";

// const SearchableDropdown = ({
//   value,
//   onChange,
//   options,
//   placeholder = "selectOption",
//   disabled = false,
// }) => {
//   const [search, setSearch] = useState("");
//   const { t } = useTranslation();

//   const filteredOptions = options.filter((opt) =>
// opt.toLowerCase().includes(search.toLowerCase())

//   );

//   return (
//     <FormControl fullWidth size="small"    sx={{
//                   "& .MuiOutlinedInput-root": {
//                     height: 44,
//                     borderRadius: "6px",
//                     fontFamily: "Poppins, sans-serif",
//                     fontSize: "14px",
//                     backgroundColor: "#fff",
//                     "& fieldset": { borderColor: "#DFE1E6", borderWidth: "2px" },
//                     "&:hover fieldset": { borderColor: "#1976d2" },
//                     "&.Mui-focused fieldset": { borderColor: "#1976d2", boxShadow: "0 0 0 2px rgba(25,118,210,0.08)" },
//                   },
//                 }}>
//       <Select
//         value={value}
//         displayEmpty
//         disabled={disabled}
//         renderValue={() => {
//           if (!value) return t(placeholder);
//           return typeof value === 'object' && value.name ? value.name : value;
//         }}
//         onChange={(e) => {
//           onChange(e.target.value);
//           setSearch("");
//         }}
//         MenuProps={{
//           disableAutoFocusItem: true,
//           PaperProps: { style: { maxHeight: 300, paddingTop: 0 } },
//         }}
//       >
//         {/* SEARCH INPUT */}
//         <MenuItem
//           disableRipple
//           disableTouchRipple
//           onKeyDown={(e) => e.stopPropagation()}
//           sx={{
//             backgroundColor: "transparent !important",
//             "&:hover": { backgroundColor: "transparent !important" },
//             p: 1,
//           }}
//         >
//           <InputBase
//             autoFocus
//             placeholder={t("searchPlaceholder")}
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             onClick={(e) => e.stopPropagation()}
//             sx={{
//               width: "100%",
//               backgroundColor: "#fff !important",
//               border: "1px solid #ccc",
//               borderRadius: "6px",
//               px: 1,
//               py: 0.7,
//               fontSize: "14px",
//               fontFamily: "Poppins, sans-serif",
//               "&:focus": {
//                 borderColor: "#1976d2",
//                 boxShadow: "0 0 0 2px rgba(25,118,210,0.2)",
//               },
//             }}
//           />
//         </MenuItem>

//         {/* FILTERED OPTIONS */}
//         {filteredOptions.length > 0 ? (
//           filteredOptions.map((item) => (
//             <MenuItem
//               key={item}
//               value={item}
//               sx={{ fontSize: "14px", fontFamily: "Poppins, sans-serif" }}
//             >
//               {item}
//             </MenuItem>
//           ))
//         ) : (
//           <MenuItem disabled sx={{fontSize:"12px", fontFamily: 'Poppins, sans-serif',}}>{t("noResults")}</MenuItem>
//         )}
//       </Select>
//     </FormControl>
//   );
// };

// export default SearchableDropdown;







import { FormControl, Select, MenuItem, InputBase } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const SearchableDropdown = ({
  value,
  onChange,
  options,
  placeholder = "selectOption",
  disabled = false,
}) => {
  const [search, setSearch] = useState("");
  const { t } = useTranslation();

  // Safe filtering
  const filteredOptions = options.filter((opt) => {
    let label;
    if (typeof opt === "object" && opt !== null && opt.name) {
      label = opt.name;
    } else if (typeof opt === "string" || typeof opt === "number") {
      label = String(opt);
    } else {
      return false;
    }
    return label.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <FormControl
      fullWidth
      size="small"
      sx={{
        "& .MuiOutlinedInput-root": {
          height: 44,
          borderRadius: "6px",
          fontFamily: "Poppins, sans-serif",
          fontSize: "14px",
          backgroundColor: "#fff",
          "& fieldset": { borderColor: "#DFE1E6", borderWidth: "2px" },
          "&:hover fieldset": { borderColor: "#1976d2" },
          "&.Mui-focused fieldset": {
            borderColor: "#1976d2",
            boxShadow: "0 0 0 2px rgba(25,118,210,0.08)",
          },
        },
      }}
    >
      <Select
        value={value}
        displayEmpty
        disabled={disabled}
        renderValue={() => {
          if (!value) return t(placeholder);
          // If value is an object with name
          if (typeof value === "object" && value !== null && value.name) return value.name;

          // Find the selected option label if options are objects
          const selectedObj = options.find(
            (opt) => typeof opt === "object" && opt !== null && opt.id === value
          );
          return selectedObj ? selectedObj.name : String(value);
        }}
        onChange={(e) => {
          onChange(e.target.value);
          setSearch("");
        }}
        MenuProps={{
          disableAutoFocusItem: true,
          PaperProps: { style: { maxHeight: 300, paddingTop: 0 } },
        }}
      >
        {/* SEARCH INPUT */}
        <MenuItem
          disableRipple
          disableTouchRipple
          onKeyDown={(e) => e.stopPropagation()}
          sx={{
            backgroundColor: "transparent !important",
            "&:hover": { backgroundColor: "transparent !important" },
            p: 1,
          }}
        >
          <InputBase
            autoFocus
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: "100%",
              backgroundColor: "#fff !important",
              border: "1px solid #ccc",
              borderRadius: "6px",
              px: 1,
              py: 0.7,
              fontSize: "14px",
              fontFamily: "Poppins, sans-serif",
              "&:focus": {
                borderColor: "#1976d2",
                boxShadow: "0 0 0 2px rgba(25,118,210,0.2)",
              },
            }}
          />
        </MenuItem>

        {/* FILTERED OPTIONS */}
        {filteredOptions.length > 0 ? (
          filteredOptions.map((item) => {
            let label, key, val;
            if (typeof item === "object" && item !== null) {
              label = item.name;
              key = item.id;
              val = item.id;
            } else {
              label = String(item);
              key = label;
              val = item;
            }
            return (
              <MenuItem key={key} value={val} sx={{ fontSize: "14px", fontFamily: "Poppins, sans-serif" }}>
                {label}
              </MenuItem>
            );
          })
        ) : (
          <MenuItem
            disabled
            sx={{ fontSize: "12px", fontFamily: "Poppins, sans-serif" }}
          >
            {t("noResults")}
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default SearchableDropdown;
