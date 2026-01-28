import { Avatar, Box, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Usercard = ({ icon, heading, value }) => {
  const { t } = useTranslation();

  return (
    <Box
  border={'2px solid #dcdfe4'}
      p={2}
      py={3}
      borderRadius={4}
      display="flex"
      alignItems="center"
      bgcolor="#fff"
      gap={1.3}
      width="100%"         // make card full width of container
      overflow="hidden"    // prevent overflow

    >
      <Box>
        {icon}
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap={0.5}
        flex={1}             // allow this box to take remaining space
        minWidth={0}         // crucial for text ellipsis
      >
        <Typography
          variant="subtitle1"
          fontSize={'11px'}
          fontWeight={'semibold'}
          noWrap
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {t(heading)}
        </Typography>
        <Typography
          variant="body2"
          noWrap
          fontSize={'10px'}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
};

export default Usercard;


// import { Avatar, Box, Typography  } from '@mui/material'
// import React from 'react'

// const Usercard = ({ icon, heading, value }) => {
//   return (
//     <Box
//       p={2}
//       py={3}
//       borderRadius={4}
//       display="flex"
//       alignItems="center"
//       bgcolor="#fff"
//       gap={1.3}
//       width="100%"         // make card full width of container
//       overflow="hidden"    // prevent overflow
//     >
//       <Box >
//         {icon}
//       </Box>

//       <Box
//         display="flex"
//         flexDirection="column"
//         alignItems="flex-start"
//         gap={0.5}
//         flex={1}             // allow this box to take remaining space
//         minWidth={0}         // crucial for text ellipsis
//       >
//         <Typography
//           variant="subtitle1"
//           fontSize={'16px'}
//           fontWeight={'semibold'}
//           noWrap
//           style={{
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//           }}
//         >
//           {heading}
//         </Typography>
//         <Typography
//           variant="body2"
//           noWrap
//           fontSize={'14px'}
//           style={{
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//           }}
//         >
//           {value}
//         </Typography>
//       </Box>
//     </Box>
//   )
// }

// export default Usercard
