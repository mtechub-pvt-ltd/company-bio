import React, { useEffect, useState } from 'react';
import url from '../url';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import icon1 from '../Assets/tickets/total.svg';
import icon2 from '../Assets/tickets/open.svg';
import icon3 from '../Assets/tickets/resolved.svg';
import icon4 from '../Assets/tickets/overdid.svg';
import icon5 from '../Assets/tickets/created.svg';
import icon6 from '../Assets/tickets/closed.svg'; // Closed tickets icon

const TicketCards = () => {
  const { token } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map headings to icons
  const icons = {
    'Total Tickets': icon1,
    'Open Tickets': icon2,
    'Resolved': icon3,
    'Overdue': icon4,
    'Created': icon5,
    'Closed': icon6,
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`${url}/tickets/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const summary = result.data.summary;

        const filteredData = [
          { heading: 'Total Tickets', value: summary.total_tickets },
          { heading: 'Open Tickets', value: summary.open_tickets },
          { heading: 'Resolved', value: summary.resolved_tickets },
          { heading: 'Overdue', value: summary.overdue_tickets },
          { heading: 'Created', value: summary.created_by_me },
          { heading: 'Closed', value: summary.closed_tickets }, 
        ];

        setData(filteredData);
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [token]);

  if (loading) return <p>Loading...</p>;

  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr 1fr 1fr 1fr 1fr' }} gap={1}>
      {data.map(({ heading, value }, i) => (
        <Box
          key={i}
          p={1}
          py={2}
          borderRadius={4}
          display="flex"
          alignItems="center"
          bgcolor="#fff"
          border="2px solid #E5E7EB"
          boxShadow="none"
          gap={1.3}
          width="100%"
          overflow="hidden"
        >
          {/* Icon */}
          <Box component="img" src={icons[heading]} alt={heading} width={45} height={45} />

          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            gap={0.5}
            flex={1}
            minWidth={0}
          >
            <Typography
              variant="subtitle1"
              fontSize="13px"
              fontWeight={500}
              noWrap
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "rgb(94, 92, 92)",
              }}
            >
              {heading}
            </Typography>

            <Typography
              variant="body1"
              fontSize="20px"
              fontWeight={500}
              sx={{ fontFamily: "'Poppins', sans-serif", color: "#181818" }}
              noWrap
            >
              {value}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default TicketCards;
