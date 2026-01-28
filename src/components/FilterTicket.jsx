import React from 'react';
import { Drawer, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FilterSidebar = ({ open, onClose }) => {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box width={350} p={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Filter Tickets</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        {/* Filter inputs will go here */}
      </Box>
    </Drawer>
  );
};

export default FilterSidebar;
