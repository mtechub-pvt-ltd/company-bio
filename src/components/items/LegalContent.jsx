import React from 'react';
import { Box } from '@mui/material';
import TypographyMD from './Typography';

const LegalContent = ({ title, sections }) => {
    return (
        <Box
            sx={{
                p: 4,
                maxWidth: '100%',
                margin: '0 auto',
                backgroundColor: '#fff',
                borderRadius: '8px',
                // boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                // overflowY: 'auto',
                // maxHeight: '85vh',
            }}
        >
            <TypographyMD variant="h4" label={title} color="#003149" fontWeight={950} fontSize="45px" fontFamily="Roboto" />

            {sections.map((section, index) => (
                <Box key={index} sx={{ mb: 3 }}>

                    <TypographyMD variant="body" label={section.introduction} color="#000000" lineHeight="30px" sx={{ marginBottom: 1 }} fontFamily="Roboto" />

                    <TypographyMD variant="h6" label={section.heading} color="#2C384C" fontWeight={750} fontSize="38px" sx={{ marginBottom: 1 }} fontFamily="Roboto" />

                    <TypographyMD variant="h6" label={section.subheading} color="#363333" fontWeight={650} fontSize="30px" sx={{ marginBottom: 1 }} fontFamily="Roboto" />
                    {section.paragraphs.map((para, idx) => (
                        <TypographyMD variant="body" label={para} color="#000000" lineHeight="30px" sx={{ marginBottom: 1 }} fontFamily="Roboto" />
                    ))}

                    <TypographyMD variant="h6" label={section.paraSubheading} color="#363333" fontWeight={650} fontSize="30px" sx={{ marginBottom: 1 }} fontFamily="Roboto" />

                    <TypographyMD variant="body" label={section.paraIntro} color="#000000" lineHeight="30px" fontWeight={500} sx={{ marginBottom: 1 }} fontFamily="Roboto" />

                    {section.list && (
                        <ul style={{ paddingLeft: '20px', color: '#555' }}>
                            {section.list.map((item, idx) => (
                                <li key={idx} style={{ marginBottom: '6px' }}>
                                    <TypographyMD variant="body2" label={item} color="#000000" sx={{ marginBottom: 1 }} fontFamily="Roboto" />
                                </li>
                            ))}
                        </ul>
                    )}
                </Box>
            ))}
        </Box>
    );
};

export default LegalContent;
