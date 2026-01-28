// import React, { useState } from 'react';
// import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';
// import { Box, Typography } from '@mui/material';

// const Countryfield = ({ label, value, onChangeTerm, error, helperText, onBlur, prefilled = false, }) => {
//     const [isFocused, setIsFocused] = useState(false);
// const [internalValue, setInternalValue] = useState(prefilled ? value : "");
// React.useEffect(() => {
//   if (prefilled) {
//     setInternalValue(value || "");
//   }
// }, [value, prefilled]);
//     return (
//         <Box width="100%">
//             <PhoneInput
//                 country={'us'}
//                 countryCodeEditable={false}
//                 // value={value}
//                 // onChange={onChangeTerm}
//                 value={prefilled ? internalValue : value}
// onChange={(val) => {
//   if (prefilled) {
//     setInternalValue(val);
//   }
//   onChangeTerm(val);
// }}
//                 onFocus={() => setIsFocused(true)}
//                 onBlur={(e) => {
//                     setIsFocused(false);
//                     onBlur?.(e);
//                 }}
//                 inputStyle={{
//                     width: '100%',
//                     height: '40px',
//                     fontSize: '16px',
//                     backgroundColor: '#fff',
//                     borderRadius: '2px',
//                     border: 'none',
//                     boxShadow: 'none',
//                     outline: 'none',
//                 }}
//                 buttonStyle={{
//                     borderRadius: '2px',
//                     backgroundColor: '#fff',
//                     border: 'none',
//                     borderRight: error
//                         ? '1px solid red'
//                         : isFocused
//                             ? '1px solid #006EC2' // blue right border on button when focused
//                             : '1px solid rgba(9, 30, 66, 0.14)',
//                 }}
//                 containerStyle={{
//                     width: '100%',
//                     border: error
//                         ? '2px solid red'
//                         : isFocused
//                             ? '2px solid #006EC2' // blue border when focused
//                             : '2px solid rgba(9, 30, 66, 0.14)',
//                     borderRadius: '2px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     backgroundColor: '#fff',
//                 }}
//                 specialLabel=""
//             />
//             {error && helperText && (
//                 <Typography sx={{ color: 'red' }} fontSize={11} mt={0.5}>
//                     {helperText}
//                 </Typography>
//             )}
//         </Box>
//     );
// };

// export default Countryfield;





import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Box, Typography } from "@mui/material";

const Countryfield = ({
  label,
  value,
  onChangeTerm,
  error,
  helperText,
  onBlur,
  prefilled = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState("");

  // 🔴 DEBUG 1
  console.log("Countryfield props:", {
    value,
    prefilled,
    internalValue,
  });

  useEffect(() => {
    // 🔴 DEBUG 2
    console.log("Countryfield useEffect fired", {
      value,
      prefilled,
    });

    if (prefilled) {
      setInternalValue(value || "");
    }
  }, [value, prefilled]);

  const phoneValue = prefilled ? internalValue : value || "";

  // 🔴 DEBUG 3
  console.log("Countryfield phoneValue used:", phoneValue);

  return (
    <Box width="100%">
      <PhoneInput
        country={"us"}
        countryCodeEditable={false}
        value={phoneValue || ""}
        onChange={(val) => {
          // 🔴 DEBUG 4
          console.log("PhoneInput onChange fired:", val);

          if (prefilled) {
            setInternalValue(val);
          }
          onChangeTerm(val);
        }}
        onFocus={() => {
          console.log("PhoneInput focused");
          setIsFocused(true);
        }}
        onBlur={(e) => {
          console.log("PhoneInput blurred");
          setIsFocused(false);
          onBlur?.(e);
        }}
        inputStyle={{
          width: "100%",
          height: "40px",
          fontSize: "16px",
          backgroundColor: "#fff",
          borderRadius: "2px",
          border: "none",
          boxShadow: "none",
          outline: "none",
        }}
        buttonStyle={{
          borderRadius: "2px",
          backgroundColor: "#fff",
          border: "none",
          borderRight: error
            ? "1px solid red"
            : isFocused
            ? "1px solid #006EC2"
            : "1px solid rgba(9, 30, 66, 0.14)",
        }}
        containerStyle={{
          width: "100%",
          border: error
            ? "2px solid red"
            : isFocused
            ? "2px solid #006EC2"
            : "2px solid rgba(9, 30, 66, 0.14)",
          borderRadius: "2px",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
        specialLabel=""
      />

      {error && helperText && (
        <Typography sx={{ color: "red" }} fontSize={11} mt={0.5}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default Countryfield;
