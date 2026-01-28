import { FormControl, FormHelperText, InputAdornment, TextField } from "@mui/material";
import React from "react";
import { useState } from "react";

function FormatDate({ inputDate }) {

    const date = new Date(inputDate);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export default FormatDate; 