// import React, { useState } from "react";
// import { Button, Menu, MenuItem, Box, Typography, Grid } from "@mui/material";
// import { KeyboardArrowDown } from "@mui/icons-material";
// import { useTranslation } from "react-i18next";

// const ExportMenuButton = ({
//   onExport,
//   options,
//   icon,
//   label = "Export",
//     exporting = false,          // ✅ ADD
//   exportingFormat = null, 
//   sx = {},
// }) => {
//   const { t } = useTranslation();
//   const [anchorEl, setAnchorEl] = useState(null);
//   const open = Boolean(anchorEl);

//   const handleClick = (event) => setAnchorEl(event.currentTarget);
//   const handleClose = () => setAnchorEl(null);

//   const handleExport = (format) => {
//     if (onExport) onExport(format);
//     // handleClose();
//   };

//   return (
//     <>
//       <Button
//         variant="contained"
//         onClick={handleClick}
//         sx={{
//           width: "110px",
//           height: "35px",
//           backgroundColor: "rgba(9, 30, 66, 0.06)",
//           borderRadius: "5px",
//           boxShadow: "none",
//           color: "#000000",
//           fontFamily: "Roboto",
//           letterSpacing: ".5px",
//           textTransform: "capitalize",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           px: 1.5,
//           "&:hover": {
//             backgroundColor: "rgba(9, 30, 66, 0.06)",
//             boxShadow: "none",
//           },
//           ...sx,
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//           {/* {icon} */}
//           <span>{t(label)}</span>
//         </Box>
//         <KeyboardArrowDown sx={{ fontSize: "16px", ml: 0.5 }} />
//       </Button>

//       <Menu
//         anchorEl={anchorEl}
//         open={open}
//         onClose={handleClose}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//         transformOrigin={{ vertical: "top", horizontal: "right" }}
//         PaperProps={{
//           sx: {
//             mt: 0.2,
//             overflow: "visible",
//             width: 150,
//           },
//         }}
//       >
//         {options.map((option) => (
//           <MenuItem
//             key={option.label}
//             onClick={() => handleExport(option.label)}
//           >
//             <Grid container spacing={0} alignItems="center" px={0}>
//               <Grid item xs={4}>
//                 <img
//                   src={option.icon}
//                   alt={option.label}
//                   width={18}
//                   height={18}
//                 />
//               </Grid>
//               <Grid item xs={8}>
//                 <span style={{ color: "#363333", font: "bold 13px Arial" }}>
//                   {t(option.label)}
//                 </span>
//               </Grid>
//             </Grid>
//           </MenuItem>
//         ))}
//       </Menu>
//     </>
//   );
// };

// export default ExportMenuButton;

import React, { useState, useEffect } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const ExportMenuButton = ({
  onExport,
  options,
  label = "Export",
  exporting = false,
  exportingFormat = null,
  sx = {},
}) => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if (!exporting) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    if (!exporting) {
      setAnchorEl(null);
    }
  };

  const handleExport = (format) => {
    if (onExport) {
      onExport(format);
    }
  };

  // auto close menu after export finishes
  useEffect(() => {
    if (!exporting) {
      setAnchorEl(null);
    }
  }, [exporting]);

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClick}
        disabled={exporting}
        sx={{
          width: "110px",
          height: "35px",
          backgroundColor: "rgba(9, 30, 66, 0.06)",
          borderRadius: "5px",
          boxShadow: "none",
          color: "#000",
          fontFamily: "Roboto",
          letterSpacing: ".5px",
          textTransform: "capitalize",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          "&:hover": {
            backgroundColor: "rgba(9, 30, 66, 0.06)",
            boxShadow: "none",
          },
          ...sx,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* {exporting ? <CircularProgress size={14} /> : null} */}
          <span>{t(label)}</span>
        </Box>
        <KeyboardArrowDown sx={{ fontSize: "16px" }} />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 0.2,
            width: 150,
          },
        }}
      >
        {options.map((option) => {
          const format = option.label.toLowerCase();
          const isLoading = exporting && exportingFormat === format;

          return (
            <MenuItem
              key={option.label}
              disabled={exporting}
              onClick={() => handleExport(format)}
            >
              <Grid container alignItems="center">
                <Grid item xs={4} sx={{ textAlign: "center" }}>
                  {isLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <img
                      src={option.icon}
                      alt={option.label}
                      width={18}
                      height={18}
                    />
                  )}
                </Grid>

                <Grid item xs={8}>
                  <span
                    style={{
                      color: "#363333",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {t(option.label)}
                  </span>
                </Grid>
              </Grid>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default ExportMenuButton;
