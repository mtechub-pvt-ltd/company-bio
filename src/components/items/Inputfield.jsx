// import { FormControl, FormHelperText, InputAdornment, TextField } from "@mui/material";
// import React from "react";
// import { useState } from "react";
// import { useTranslation } from "react-i18next";

// function Inputfield({ icon, type, label, value, placeholder, multiline, rows, onChngeterm, onKeyDown, error, helperText, disabled, autoFocus }) {

//     const { t } = useTranslation();
//     const [isFocused, setIsFocused] = useState(false);
//     const handleFocus = () => {
//         setIsFocused(true);
//     };

//     return (
//         <>
//             {/* <FormControl variant="outlined" fullWidth> */}
//             <TextField
//                 fullWidth
//                 label={label}
//                 multiline={multiline}
//                 rows={rows}
//                 InputLabelProps={{
//                     style: {
//                         color: isFocused ? '#000000' : '#000000',
//                         fontSize: { xs: "16px", sm: "15px", md: "15px" }
//                     },
//                 }}
//                 InputProps={{
//                     style: {
//                         color: isFocused ? '#000000' : '#000000',
//                         fontSize: { xs: "16px", sm: "15px", md: "13px" },
//                         borderRadius: "2px",
//                         backgroundColor: "#fff",
//                         height: "42px",
//                         alignItems: "center", // Allow height to grow if multiline
//                     },
//                 }}
//                 sx={{
//                     width: "100%",
//                     '& .MuiOutlinedInput-root': {
//                         borderRadius: "2px",
//                         '& fieldset': {
//                             border: error ? '2px solid #d32f2f' : '2px solid rgba(9, 30, 66, 0.14)',
//                         },
//                         '&:hover fieldset': {
//                             border: error ? '2px solid #d32f2f' : '2px solid rgba(9, 30, 66, 0.14)',
//                         },
//                         '&.Mui-focused fieldset': {
//                             border: error ? '2px solid #d32f2f' : '2px solid #006EC2', // <- red border when error, blue when focused
//                         },
//                         '&.Mui-error fieldset': {
//                             border: '2px solid #d32f2f',
//                         },
//                         '& input::placeholder': {
//                             color: '#172B4D',
//                             fontWeight: 450,
//                             opacity: 1,
//                         },
//                     },
//                 }}

//                 placeholder={placeholder}
//                 onFocus={() => setIsFocused(true)}
//                 value={value}
//                 autoFocus={autoFocus}
//                 type={type}
//                 disabled={disabled}
//                 onChange={onChngeterm}
//                 onKeyDown={onKeyDown}
//                 error={error}
//             />
//             {error && helperText && (
//                 <FormHelperText style={{ 
//                     marginLeft: "0px", 
//                     fontSize: "12px", 
//                     color: '#d32f2f',
//                     marginTop: '4px',
//                     fontFamily: "'Poppins', sans-serif"
//                 }}>
//                     {t(helperText)}
//                 </FormHelperText>
//             )}
//             {/* </FormControl> */}
//         </>
//     )
// }

// export default Inputfield;





import { FormControl, FormHelperText, InputAdornment, TextField } from "@mui/material";
import React, { useState, forwardRef } from "react";
import { useTranslation } from "react-i18next";

const Inputfield = forwardRef(
  (
    {
      icon,
      type,
      label,
      value,
      placeholder,
      multiline,
      rows,
      onChngeterm,
      onKeyDown,
      onClick,
      error,
      helperText,
      disabled,
      autoFocus,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const [isFocused, setIsFocused] = useState(false);

    return (
      <>
        <TextField
          fullWidth
          label={label}
          multiline={multiline}
          rows={rows}
          placeholder={placeholder}
          value={value}
          autoFocus={autoFocus}
          type={type}
          disabled={disabled}
          onChange={onChngeterm}
          onKeyDown={onKeyDown}
          onClick={onClick}
          inputRef={ref}   // ⭐ IMPORTANT
          error={error}
          InputLabelProps={{
            style: {
              color: "#000000",
            },
          }}
          InputProps={{
            style: {
              color: "#000000",
              borderRadius: "2px",
              backgroundColor: "#fff",
              height: "42px",
              alignItems: "center",
            },
          }}
          sx={{
            width: "100%",
            "& .MuiOutlinedInput-root": {
              borderRadius: "2px",
              "& fieldset": {
                border: error
                  ? "2px solid #d32f2f"
                  : "2px solid rgba(9, 30, 66, 0.14)",
              },
              "&:hover fieldset": {
                border: error
                  ? "2px solid #d32f2f"
                  : "2px solid rgba(9, 30, 66, 0.14)",
              },
              "&.Mui-focused fieldset": {
                border: error
                  ? "2px solid #d32f2f"
                  : "2px solid #006EC2",
              },
            },
          }}
        />

        {error && helperText && (
          <FormHelperText
            style={{
              marginLeft: "0px",
              fontSize: "12px",
              color: "#d32f2f",
              marginTop: "4px",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {t(helperText)}
          </FormHelperText>
        )}
      </>
    );
  }
);

export default Inputfield;
