import React from "react";
import egypt from '../../Assets/egypt.png'
import germany from '../../Assets/germany.png'
import southkorea from '../../Assets/southkorea.png'
import china from '../../Assets/china.png'
import map from '../../Assets/map.png'
import { Box, Card, CardContent, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import TypographyMD from "./Typography";
import { useEffect } from "react";
import { useState } from "react";
import url from "../../url";
import toast from "react-hot-toast";

export const DashboardGoogleMap = () => {

    useEffect(() => {

        countries();
        usersbycountries();

    }, []);

    const [secondAPIData, setSecondAPIData] = useState({});
    const [displayedCountries, setDisplayedCountries] = useState([]);
    const usersbycountries = async () => {
        await fetch(`${url}user/getUserByCountry`)
            .then((response) => response.json())
            .then((data) => {
                setSecondAPIData(data.data);

                const firstFourKeys = Object.keys(data.data).slice(0, 4);
                setDisplayedCountries(firstFourKeys);

            })
            .catch((error) => toast.error("Something went wrong! Please try again."));
    }

    const [countriesData, setCountriesData] = useState([]);
    const countries = async () => {
        await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags')
            .then((response) => response.json())
            .then((data) => {
                // Extract the country name and flag information from the API response
                const countryData = data.map((country) => ({
                    name: country.name.common,
                    flag: country.flags.png,
                }));
                setCountriesData(countryData);
            })
            .catch((error) => toast.error("Something went wrong! Please try again."));
    }

    return (
        <>
            <Card sx={{
                boxShadow: "none", height: { xs: "auto", md: "460px" }, borderRadius: "12px", border: "1px solid rgba(0, 0, 0, 0.10)"
            }}>
                <CardContent>
                    <Grid container spacing={0}>
                        <Grid xs={12} md={7.5}>
                            <TypographyMD variant='h2' label="World Wide Users" color="#424242" fontFamily="Nunito Sans" marginLeft={0} fontSize="25px" fontWeight={550} align="left" />
                            <TypographyMD variant='h2' label="Last Research Report" color="#A5ADB0" fontFamily="Nunito Sans" marginLeft={0} fontSize="17px" fontWeight={500} align="left" />

                            <img src={map} alt="..." style={{ width: "400px", height: "310px" }} />

                        </Grid>

                        <Grid xs={12} md={4.5}>
                            <TypographyMD variant='h2' label="Countries" color="#424242" fontFamily="Nunito Sans" marginLeft={0} fontSize="25px" fontWeight={550} align="left" />

                            {displayedCountries.map((countryName, index) => {
                                const countryInfo = secondAPIData[countryName];
                                const flagData = countriesData.find((country) => country.name.toLowerCase() === countryName.toLowerCase());
                                return (
                                    <Box key={index}>
                                        {flagData && (
                                            <>
                                                <Grid container spacing={0}>
                                                    <Grid xs={6} md={6}>
                                                        <Stack direction="row" spacing={1}>
                                                            <img src={flagData.flag} alt={countryName} width="50" height="50" />
                                                            <div>
                                                                {/* <TypographyMD variant='h2' label={countryName} color="#424242" fontFamily="Nunito Sans" marginTop={3} fontSize="17px" fontWeight={550} align="left" /> */}
                                                                <Typography variant="h2" color="#424242" sx={{ textTransform: "capitalize", fontFamily:"Nunito Sans" }} marginTop={3} fontSize="17px" fontWeight={550} align="left">{countryName}</Typography>
                                                            </div>
                                                        </Stack>
                                                    </Grid>

                                                    <Grid xs={6} md={6}>
                                                        <TypographyMD variant='h2' label={countryInfo.percentage} color="#A5ADB0" fontFamily="Nunito Sans" marginTop={3} fontSize="17px" fontWeight={500} align="right" />
                                                    </Grid>

                                                    <Grid xs={12} md={12} pt={2} pb={2}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={parseFloat(countryInfo.percentage.replace('%', ''))}
                                                            style={{ borderRadius: '20px', backgroundColor: '#EDEDED' }}
                                                            sx={{ '& .MuiLinearProgress-bar': { backgroundColor: '#C4B1AB', borderRadius: '20px' } }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                {/* <img src={flagData.flag} alt={countryName} width="30" />
                                                {countryName} - Count: {countryInfo.count}, Percentage: {countryInfo.percentage} */}
                                            </>
                                        )}
                                    </Box >
                                );
                            })}
                            {/* {renderCountryProgress("Germany", 70, germany)}
                            {renderCountryProgress("SouthKorea", 100, southkorea)}
                            {renderCountryProgress("China", 80, china)} */}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    )
}

const renderCountryProgress = (countryName, value, imageSrc) => (
    <>
        <Grid container spacing={0}>
            <Grid xs={6} md={6}>
                <Stack direction="row" spacing={1}>
                    <img src={imageSrc} alt={countryName} width="50" height="50" />
                    <div>
                        <TypographyMD variant='h2' label={countryName} color="#424242" fontFamily="Nunito Sans" marginTop={3} fontSize="17px" fontWeight={550} align="left" />
                    </div>
                </Stack>
            </Grid>

            <Grid xs={6} md={6}>
                <TypographyMD variant='h2' label={`${value}%`} color="#A5ADB0" fontFamily="Nunito Sans" marginTop={3} fontSize="17px" fontWeight={500} align="right" />
            </Grid>

            <Grid xs={12} md={12} pt={2} pb={2}>
                <LinearProgress
                    variant="determinate"
                    value={value}
                    style={{ borderRadius: '20px', backgroundColor: '#EDEDED' }}
                    sx={{ '& .MuiLinearProgress-bar': { backgroundColor: '#C4B1AB', borderRadius: '20px' } }}
                />
            </Grid>
        </Grid>

    </>
);