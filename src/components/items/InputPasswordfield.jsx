import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FormControl, FormHelperText, IconButton, InputAdornment, TextField } from "@mui/material";
import React from "react";
import { useState } from "react";

function InputPasswordfield({ autoFocus, icon, type, placeholder, label, value, onChngeterm, error, helperText, disabled }) {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const [isFocused, setIsFocused] = useState(false);
    const handleFocus = () => {
        setIsFocused(true);
    };

    return (
        <>
            <FormControl variant="standard" fullWidth>
                <TextField
                    InputLabelProps={{
                        style: {
                            color: isFocused ? '#000000' : '#000000',
                            fontSize: { xs: "16px", sm: "15px", md: "15px" }
                        },
                    }}
                    sx={{
                        width: "100%",
                        '& .MuiOutlinedInput-root': {
                            borderRadius: "2px",
                            '& fieldset': {
                                border: error ? '2px solid #d32f2f' : '2px solid rgba(9, 30, 66, 0.14)',
                            },
                            '&:hover fieldset': {
                                border: error ? '2px solid #d32f2f' : '2px solid rgba(9, 30, 66, 0.14)',
                            },
                            '&.Mui-focused fieldset': {
                                border: error ? '2px solid #d32f2f' : '2px solid #006EC2', // <- red border when error, blue when focused
                            },
                            '&.Mui-error fieldset': {
                                border: '2px solid #d32f2f',
                            },
                            '& input::placeholder': {
                                color: '#000000',
                                fontWeight: 650,
                                opacity: 1,
                            },
                        },
                    }}
                    onFocus={handleFocus}

                    style={{ borderRadius: "6px", height: '45px', width: '100%' }}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    value={value}
                    type={showPassword ? 'text' : 'password'}
                    disabled={disabled}
                    onChange={onChngeterm}
                    startAdornment={<InputAdornment position="start" >{icon}</InputAdornment>}
                    InputProps={{
                        style: {
                            color: isFocused ? '#000000' : '#000000',
                            fontSize: { xs: "16px", sm: "15px", md: "13px" },
                            borderRadius: "6px",
                            backgroundColor: "#fff",
                            height: "42px",
                            alignItems: "center",
                            
                        },
                        // startAdornment: (
                        //     <InputAdornment position="start">
                        //         {icon}
                        //     </InputAdornment>
                        // ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff sx={{ fontSize: "20px", color: "#626F86" }} /> : <Visibility sx={{ fontSize: "20px", color: "#626F86" }} />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    error={error}
                    label={label}
                />
                {error && helperText && (
                    <FormHelperText style={{ 
                        fontSize: "12px", 
                        color: '#d32f2f',
                        marginTop: '4px',
                        fontFamily: "'Poppins', sans-serif"
                    }}>
                        {helperText}
                    </FormHelperText>
                )}
            </FormControl>
        </>
    )
}

export default InputPasswordfield;