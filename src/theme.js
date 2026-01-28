// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({

Typography:{
    fontFamily: "'Poppins', sans-serif",
},

  typography: {
    // Global font fallback
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "500",
      lineHeight: '170%',
 
    h1: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '18px',
      fontWeight: 700,
        lineHeight: '110%',
      color: '#172B4D',
    
    },
    h2: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '18px',
      fontWeight: 700,
      lineHeight: '110%',
      color: '#172B4D',
    
    },
    h3: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '18px',
      fontWeight: 700,
      lineHeight: '110%',
      color: 'rgb(23, 43, 77)',
    
    },
    body1: {
      fontFamily: "'Poppins', sans-serif",
         margin: '0px',
    lineHeight: "170%",
    letterSpacing: '0.00938em',
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: "'Poppins', sans-serif",
    color: '#5E5C5C',
    
    },
    body2: {
      fontFamily: "'Poppins', sans-serif",
      fontSize: '15px',
      fontWeight: 500,
      lineHeight: '170%',
      color: '#5E5C5C',
      
    },
  },
});

export default theme;
