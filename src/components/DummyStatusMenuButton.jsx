// import React, { useState } from "react";
// import { Button, Menu, MenuItem } from "@mui/material";
// import { KeyboardArrowDown } from "@mui/icons-material";

// const DummyStatusMenuButton = ({
//   status = "Active", // can be "Active" / "Inactive" or boolean-based
//   onChange,
//   statusOptions = [],
// }) => {
//   const [anchorEl, setAnchorEl] = useState(null);

//   const handleOpen = (e) => setAnchorEl(e.currentTarget);
//   const handleClose = () => setAnchorEl(null);
//   const handleSelect = (value) => {
//     onChange?.(value);
//     handleClose();
//   };

//   // Find the current status object
//  const currentOption =
//   statusOptions.find(
//     (opt) => (opt?.value || "").toLowerCase() === (status || "").toLowerCase()
//   ) || {
//     label: status || "N/A",
//     color: "#E0E0E0",
//   };

//   return (
//     <>
//       <Button
//         onClick={(e) => {
//           e.stopPropagation();
//           handleOpen(e);
//         }}
//         variant="contained"
//         sx={{
//           backgroundColor: currentOption.color,
//           width: "120px",
//           padding: "1px",
//           color: "#172B4D",
//           borderRadius: "5px",
//           boxShadow: "none",
//           fontFamily: "Roboto",
//           letterSpacing: ".5px",
//           textTransform: "capitalize",
//           "&:hover": {
//             backgroundColor: currentOption.color,
//             boxShadow: "none",
//           },
//         }}
//       >
//         {currentOption.icon}
//         {currentOption.label}
//         <KeyboardArrowDown fontSize="17px" sx={{ ml: 1 }} />
//       </Button>

//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleClose}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//         transformOrigin={{ vertical: "top", horizontal: "center" }}
//         onClick={(e) => e.stopPropagation()}
//         PaperProps={{
//           elevation: 0,
//           sx: {
//             boxShadow: "none",
//             border: "1px solid #e0e0e0",
//           },
//         }}
//       >
//       {statusOptions
//   .filter(
//     (opt) => (opt?.value || "").toLowerCase() !== (status || "").toLowerCase()
//   )
//   .map((option) => (
//     <MenuItem
//       key={option.value}
//       onClick={(e) => {
//         e.stopPropagation();
//         handleSelect(option.value);
//       }}
//     >
//       {option.icon}
//       {option.label}
//     </MenuItem>
// ))}
//       </Menu> 

//     </>
//   );
// };

// export default DummyStatusMenuButton;







import React, { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";

const DummyStatusMenuButton = ({
  status = "active",
  onChange,
  statusOptions = [],
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (value) => {
    onChange?.(value);
    handleClose();
  };

  const currentStatus = (status || "").toLowerCase();

  // ✅ BUTTON STATUS (always correct color & label)
  const currentOption =
    statusOptions.find(
      (opt) => opt.value.toLowerCase() === currentStatus
    ) || {
      label: status,
      color: "#E0E0E0",
    };

  // ✅ DROPDOWN OPTIONS (RULE-BASED)
  const dropdownOptions = statusOptions.filter((opt) => {
    const value = opt.value.toLowerCase();

    if (currentStatus === "active") {
      return value === "inactive";
    }

    if (currentStatus === "inactive") {
      return value === "active";
    }

    // invited / requested / others
    return value === "active" || value === "inactive";
  });

  return (
    <>
      {/* BUTTON */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleOpen(e);
        }}
        variant="contained"
        sx={{
          backgroundColor: currentOption.color,
          width: "120px",
          padding: "1px",
          color: "#172B4D",
          borderRadius: "5px",
          boxShadow: "none",
          fontFamily: "Roboto",
          letterSpacing: ".5px",
          textTransform: "capitalize",
          "&:hover": {
            backgroundColor: currentOption.color,
          },
        }}
      >
        {currentOption.icon}
        {currentOption.label}
        <KeyboardArrowDown fontSize="17px" sx={{ ml: 1 }} />
      </Button>

      {/* DROPDOWN */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        {dropdownOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
          >
            {option.icon}
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default DummyStatusMenuButton;

