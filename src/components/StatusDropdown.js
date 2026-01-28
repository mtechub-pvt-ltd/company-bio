
import React, { useState } from 'react';
import { Box, Menu, MenuItem, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import active from '../Assets/Dashboard/active.svg';
import inactive from '../Assets/Dashboard/inactive.svg';
import trial from '../Assets/Dashboard/trial.svg';
import invited from '../Assets/Dashboard/invited.svg';
import request from '../Assets/Dashboard/request.svg';
import process from "../Assets/Dashboard/process.svg";
import overdue from "../Assets/Dashboard/overdue.svg";
import close from "../Assets/Dashboard/close.svg";
import open1 from "../Assets/Dashboard/open1.svg";
import reopen from "../Assets/Dashboard/reopen.svg";
import received from "../Assets/received.svg";
import pending from "../Assets/pending.svg";
import { useTranslation } from "react-i18next";
import badge from "../Assets/Dashboard/badge.svg";
import leave from "../Assets/leave.svg";
import cancel from "../Assets/cancel.svg";
import halfleave from "../Assets/halfleave.svg";
const StatusDropdown = ({ currentStatus, onChange,statusOptions = []  }) => {

  const statusIcons = {
  Active: active,
   paid: active,
  completed:active,
    active_paid: active,
 resolved: active,
    active: active,
  Trial: overdue,
  trial:overdue,
  Invited: invited,
 new: invited,
    invited: invited,
  Inactive: inactive,
  escalated:inactive,
   inactive: inactive,
   CANCELLED: inactive,
  Requested: request,
  requested: request,
  Overdue: overdue,
  Processing: process,
  initiated:process,
  Paid: active,
  APPROVED: active,
 approved: active,

  paid: active,
  Pending: pending,
  pending: pending,
   PENDING: pending,
INFO_REQUESTED:halfleave,


   email_pending: pending,
  Received: active,
    received: active,
   Verified:active,
   verified:active,
   Blocked:inactive,
   revoked:inactive,
   blocked:inactive,
   rejected:inactive,
   REJECTED:inactive,
   success:active,
      in_progress:overdue,
   failed:inactive,
   unclaimed:trial,
    returned:active,
    low:badge,
    medium:badge,
    high:badge,
    urgent:badge,
    critical:badge,
     closed:close,
      open:open1,
       reopened:reopen,
        assigned: leave,
        cancelled:cancel

};
const statusStyles = {
    cancelled: { backgroundColor: '#FEA362', color: '#702E00' },
  CANCELLED: { backgroundColor: '#F59A5A', color: '#682A00' },
  Active: { backgroundColor: '#4BCE97', color: '#164B35' },
    completed: { backgroundColor: '#4BCE97', color: '#164B35' },
   APPROVED: { backgroundColor: '#4BCE97', color: '#164B35' },
  approved: { backgroundColor: '#4BCE97', color: '#164B35' },

      active_paid: { backgroundColor: '#4BCE97', color: '#164B35' },
  resolved: { backgroundColor: '#4BCE97', color: '#164B35' },
   paid: { backgroundColor: '#4BCE97', color: '#164B35' },

    active: { backgroundColor: '#4BCE97', color: '#164B35' },
     success: { backgroundColor: '#4BCE97', color: '#164B35' },
  Trial: { backgroundColor: '#FEA362', color: '#702E00' },
   high: { backgroundColor: '#FEA362', color: '#702E00' },
   in_progress: { backgroundColor: '#FEA362', color: '#702E00' },
  reopened: { backgroundColor: '#57D5FF', color: '#095C6C' },
   closed: { backgroundColor: '#C1F2A0', color: '#215922' },
  low: { backgroundColor: '#BCBFC2', color: '#44546F' },
  Invited: { backgroundColor: '#579DFF', color: '#09326C' },
  new: { backgroundColor: '#579DFF', color:  '#09326C' },
  medium: { backgroundColor: '#579DFF', color: '#09326C' },
    Invited: { backgroundColor: '#579DFF', color: '#09326C' },
        invited: { backgroundColor: '#579DFF', color: '#09326C' },
  Inactive: { backgroundColor: '#DFE1E6', color: "#172B4D",},
  escalated: { backgroundColor: '#F87168', color: '#5D1F1A' },
   critical: { backgroundColor: '#F87168', color: '#5D1F1A' },
      urgent: { backgroundColor: '#F87168', color: '#5D1F1A' },
      revoked: { backgroundColor: '#F87168', color: '#5D1F1A' },
  assigned: { backgroundColor: '#579DFF', color: '#09326C' },
    CANCELLED: { backgroundColor: '#F87168', color: '#5D1F1A' },
    REJECTED: { backgroundColor: '#F87168', color: '#5D1F1A' },

    inactive: { backgroundColor: '#DFE1E6', color: "#172B4D", },
  Requested: {      backgroundColor: "#7E57C2",
  color: "#172B4D",
 },
   INFO_REQUESTED: { backgroundColor: '#F2D060', color: '#5A4609' },

 open: { backgroundColor: '#F5CD47', color: '#533F04' },
    requested: {     backgroundColor: "#7E57C2",
  color: "#172B4D",
 },
  Paid: { backgroundColor: '#4CD08B', color: '#0E563F' },
    paid: { backgroundColor: '#4CD08B', color: '#0E563F' },
  Processing: { backgroundColor: '#FDD35C', color: '#7A4100' },
  Overdue: { backgroundColor: '#FFA26B', color: '#722800' },
  Pending: { backgroundColor: '#F5CD47', color: '#533F04' },
    email_pending: { backgroundColor: '#F5CD47', color: '#533F04' },
PENDING: { backgroundColor: '#F5CD47', color: '#533F04' },

    pending: { backgroundColor: '#F5CD47', color: '#533F04' },
  Received: { backgroundColor: '#4BCE97', color: '#164B35' },
    received: { backgroundColor: '#4BCE97', color: '#164B35' },
 Verified: { backgroundColor: '#2196F3', color: '#0D47A1'  },
  verified: { backgroundColor: '#2196F3', color: '#0D47A1'  },
   Blocked: { backgroundColor: '#F87168', color: '#5D1F1A' },
 blocked: { backgroundColor: '#F87168', color: '#5D1F1A' },
  rejected: { backgroundColor: '#D32F2F', color: '#FFFFFF' },
  initiated: { backgroundColor: '#FDD35C', color: '#7A4100' },
  success: { backgroundColor: '#4CD08B', color: '#0E563F' },
   failed: { backgroundColor: '#F87168', color: '#5D1F1A' },
    trial: { backgroundColor: '#FEA362', color: '#702E00' },
unclaimed: { backgroundColor: '#FEA362', color: '#702E00' },
returned: { backgroundColor: '#4BCE97', color: '#164B35'  },
};
const canOpenDropdown = Object.keys(statusStyles).filter(
  status => status !== 'Paid' && status !== 'Received'
);
    const { t } = useTranslation();
const showDropdownIcon = ['Invited', 'Requested', 'Processing', 'Overdue','Verified','invited'];
const allStatuses = Object.keys(statusStyles);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    if (canOpenDropdown.includes(currentStatus)) {
      setAnchorEl(event.currentTarget);
    }
  };
  const handleClose = (status) => {
    if (status) onChange(status);
    setAnchorEl(null);
  };
  const displayStatusLabels = {
  initiated: 'Processing',
  success: 'Paid',
  failed: 'Failed',
  // Add other overrides if needed
};
  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.25,
          px: 1,
          py: 0.4,
          borderRadius: '4px',
          fontWeight: 400,
          fontFamily: 'Poppins, sans-serif',
          fontSize: '13px',
          cursor: canOpenDropdown.includes(currentStatus) ? 'pointer' : 'default',
          width: 'fit-content',
          minWidth: '120px',
          cursor:"pointer",
          ...statusStyles[currentStatus]
        }}
      >
        <img src={statusIcons[currentStatus]} alt={currentStatus} style={{ width: 16, height: 16, marginRight: 0 }} />
        <Typography 
          sx={{ 
            fontSize: '13px', 
            color: (statusStyles[currentStatus]?.color || '#333333'),
            marginLeft: 0,
            marginRight: 0,
            paddingLeft: 0,
            paddingRight: 0
          }}
        >
          {t(`statuses.${displayStatusLabels[currentStatus] || currentStatus}`)}
        </Typography>
        {/* {showDropdownIcon.includes(currentStatus) && (
          <ArrowDropDownIcon sx={{ fontSize: 18, color: statusStyles[currentStatus].color }} />
        )} */}
      </Box>

      <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose(null)}>
       
        {statusOptions.map((status) => (
  <MenuItem key={status} onClick={() => handleClose(status)}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <img src={statusIcons[status]} alt={status} style={{ width: 16, height: 16 }} />
      <Typography sx={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
        {t(`statuses.${displayStatusLabels[status] || status}`)}
      </Typography>
    </Box>
  </MenuItem>
))}
      </Menu>
    </>
  );
};

export default StatusDropdown;




