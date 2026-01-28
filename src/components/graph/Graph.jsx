import React, { useEffect, useState } from "react";
import { AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area, Legend, BarChart, Bar } from "recharts";
import url from "../../url";
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import TypographyMD from "../items/Typography";
import { Filter, FilterAlt, Warning } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

function Graph() {

    const { t } = useTranslation();

    const getCurrentYear = () => {
        return new Date().getFullYear();
    };

    const [year, setYear] = useState('');

    const years = [];
    for (let i = getCurrentYear(); i <= getCurrentYear() + 100; i++) {
        years.push(i.toString());
    }

    const [month, setMonth] = useState("");
    const [date, setDate] = useState("");

    const [data, setData] = useState([]);

    useEffect(() => {
        getgraphdata();
    }, []);

    const getgraphdata = async () => {
        var InsertAPIURL = `${url}orders/getByMonth?month=september&year=2023`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {
                console.log(response.result);
                setData(response.result);
            }
            )
            .catch(error => {

                alert(error);
            });

    }

    const filter = async () => {
        var InsertAPIURL = `${url}orders/getByMonth?month=${month}&year=${year}`
        await fetch(InsertAPIURL, {
            method: 'GET',
            body: JSON.stringify(),
        })
            .then(response => response.json())
            .then(response => {
                console.log(response.result);
                setData(response.result);
            }
            )
            .catch(error => {

                alert(error);
            });

    }

    const monthNames = [
        '1', '2', '3', '4', '5', '6', '7',
        '8', '9', '10', '11', '12'
    ];

    const customYAxisTickFormatter = (value) => {
        // Ensure value is within the range of monthNames
        const index = Math.min(Math.max(value, 0), monthNames.length - 1);
        return monthNames[index];
    };

    const yTicks = monthNames.map((month, index) => index);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active) {
            const orderData = data.find((item) => item.order_id === label); // Find the corresponding order data

            return (
                <div className="custom-tooltip">
                    {orderData ? (
                        <>
                            <Box sx={{ backgroundColor: "#fff1ed", borderRadius: "10px" }}>
                                <Stack p={2}>
                                    <Stack direction="row" spacing={2}>
                                        <TypographyMD variant='paragraph' label="Order ID:" color="#FF5722" marginLeft={0} fontSize="15px" fontWeight={550} align="center" />
                                        <TypographyMD variant='paragraph' label={label} color="text.secondary" marginLeft={0} fontSize="14px" fontWeight={540} align="center" />
                                    </Stack>

                                    <Stack direction="row" spacing={2}>
                                        <TypographyMD variant='paragraph' label="Status:" color="#FF5722" marginLeft={0} fontSize="15px" fontWeight={550} align="center" />
                                        <TypographyMD variant='paragraph' label={orderData.order_status} color="text.secondary" marginLeft={0} fontSize="14px" fontWeight={540} align="center" />
                                    </Stack>

                                    <Stack direction="row" spacing={2}>
                                        <TypographyMD variant='paragraph' label="Estimated delivery time:" color="#FF5722" marginLeft={0} fontSize="15px" fontWeight={550} align="center" />
                                        <TypographyMD variant='paragraph' label={payload[0]?.value} color="text.secondary" marginLeft={0} fontSize="14px" fontWeight={540} align="center" />
                                    </Stack>

                                    <Stack direction="row" spacing={2}>
                                        <TypographyMD variant='paragraph' label="Date:" color="#FF5722" marginLeft={0} fontSize="15px" fontWeight={550} align="center" />
                                        <TypographyMD variant='paragraph' label={new Date(orderData.created_at).toLocaleString()} color="text.secondary" marginLeft={0} fontSize="14px" fontWeight={540} align="center" />
                                    </Stack>

                                    {/* <Stack direction="row" spacing={2}>
                                        <TypographyMD variant='paragraph' label="Total Amount:" color="#FF5722" marginLeft={0} fontSize="15px" fontWeight={550} align="center" />
                                        <TypographyMD variant='paragraph' label={orderData.total_amount} color="text.secondary" marginLeft={0} fontSize="14px" fontWeight={540} align="center" />
                                    </Stack> */}
                                </Stack>
                            </Box>
                        </>
                    ) : (
                        <></>
                    )}
                </div>
            );
        }

        return null;
    };

    const [isFocused, setIsFocused] = useState(false);
    const handleFocus = () => {
        setIsFocused(true);
    };

    return (
        <>
            <div>
                <Box sx={{ display: { xs: "none", sm: "none", md: "block" }, cursor: "pointer", pt: 2, height: "555px", borderRadius: "12px", border: "1px solid #E4E4E4" }}>
                    <TypographyMD variant='paragraph' label="Recent Orders " color="#FF5722" marginLeft={0} fontSize="30px" fontWeight={550} align="left" />

                    <Stack align="left" direction="row" spacing={2} p={2}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Year</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                label="Year"
                            >
                                {years.map((yearValue) => (
                                    <MenuItem key={yearValue} value={yearValue}>
                                        {yearValue}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Month</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                label="Month"
                            >
                                <MenuItem value="january">January</MenuItem>
                                <MenuItem value="febuary">Febuary</MenuItem>
                                <MenuItem value="march">March</MenuItem>
                                <MenuItem value="april">April</MenuItem>
                                <MenuItem value="may">May</MenuItem>
                                <MenuItem value="june">June</MenuItem>
                                <MenuItem value="july">July</MenuItem>
                                <MenuItem value="august">August</MenuItem>
                                <MenuItem value="september">September</MenuItem>
                                <MenuItem value="october">October</MenuItem>
                                <MenuItem value="november">November</MenuItem>
                                <MenuItem value="december">December</MenuItem>
                            </Select>
                        </FormControl>

                        {/* <TextField style={{ borderRadius: "100px", height: '45px', width: '100%' }}
                            InputProps={{
                                style: {
                                    color: isFocused ? 'gray' : 'gray',
                                    fontSize: "13px"
                                },
                            }}
                            InputLabelProps={{
                                style: {
                                    color: isFocused ? 'gray' : 'gray',
                                    fontSize: "15px"
                                },
                            }}
                            sx={{
                                borderRadius: "10px",
                                width: "100%",
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        border: isFocused ? '1px solid gray' : '1px solid gray',
                                    },
                                    '&:hover fieldset': {
                                        border: '1px solid gray',
                                    },
                                    '&.Mui-focused fieldset': {
                                        border: '1px solid gray',
                                    },
                                },
                            }}
                            onFocus={handleFocus}
                            autoFocus={false}
                            type="text"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            label="Date"
                        /> */}

                        <button onClick={filter} style={{ width: "fit-content", padding: "13px", display: "flex", justifyContent: "center", alignContent: "center", alignSelf: "center", border: "1px solid #FF5722", borderRadius: "10px", backgroundColor: "#fff1ed", color: "#FF5722" }}>
                            <Stack direction="row" sx={{ pl: 1, pr: 1 }}>
                                <div>
                                    <Stack sx={{ paddingLeft: "0px" }}>
                                        <FilterAlt sx={{ fontWeight: 500, width: "24dpi" }} />
                                    </Stack>
                                </div>

                                <div>
                                    <Stack sx={{ marginLeft: "1vh", paddingTop: "0vh", paddingRight: "5px", fontWeight: "medium" }}>Filter</Stack>
                                </div>
                            </Stack>
                        </button>

                    </Stack>

                    {data == null || undefined ?
                        <Grid container spacing={0} pt={15}>
                            <Grid xs={12} lg={12} align="center"  >
                                <Stack direction="column">
                                    <Warning sx={{ fontSize: "5vh", color: "#FF5722", opacity: 0.5, alignSelf: "center" }} />
                                    <TypographyMD variant='paragraph' label={t("Data Not Found")} color="#FF5722" marginLeft={0} fontSize="14px" fontWeight={500} align="center" />
                                </Stack>
                            </Grid>
                        </Grid>
                        :
                        <>
                            <Grid container spacing={0}  >
                                <Grid xs={12} align="center">
                                    <Box ml={-3}>
                                        <AreaChart width={580} height={380} data={data}>
                                            {/* <CartesianGrid strokeDasharray="3 3" /> */}
                                            <XAxis dataKey="order_id" angle={-30} textAnchor="end" />
                                            <YAxis />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend style={{ marginTop: "200px" }} />
                                            <Area type="monotone" dataKey="estimated_delivery_time" stroke="#FF5722" fill="#fcc7b8" />
                                        </AreaChart>
                                    </Box>
                                </Grid>
                            </Grid>
                        </>
                    }
                </Box>

                <Box sx={{ display: { xs: "block", sm: "block", md: "none" }, pt: 2, height: "550px", borderRadius: "12px", border: "1px solid #E4E4E4" }}>
                    <TypographyMD variant='paragraph' label="Recent Orders " color="#FF5722" marginLeft={0} fontSize="30px" fontWeight={550} align="left" />

                    <Stack align="left" direction="row" spacing={2} p={2}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Year</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                label="Year"
                            >
                                {years.map((yearValue) => (
                                    <MenuItem key={yearValue} value={yearValue}>
                                        {yearValue}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Month</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                label="Month"
                            >
                                <MenuItem value="january">January</MenuItem>
                                <MenuItem value="febuary">Febuary</MenuItem>
                                <MenuItem value="march">March</MenuItem>
                                <MenuItem value="april">April</MenuItem>
                                <MenuItem value="may">May</MenuItem>
                                <MenuItem value="june">June</MenuItem>
                                <MenuItem value="july">July</MenuItem>
                                <MenuItem value="august">August</MenuItem>
                                <MenuItem value="september">September</MenuItem>
                                <MenuItem value="october">October</MenuItem>
                                <MenuItem value="november">November</MenuItem>
                                <MenuItem value="december">December</MenuItem>
                            </Select>
                        </FormControl>

                        {/* <TextField style={{ borderRadius: "100px", height: '45px', width: '100%' }}
                            InputProps={{
                                style: {
                                    color: isFocused ? 'gray' : 'gray',
                                    fontSize: "13px"
                                },
                            }}
                            InputLabelProps={{
                                style: {
                                    color: isFocused ? 'gray' : 'gray',
                                    fontSize: "15px"
                                },
                            }}
                            sx={{
                                borderRadius: "10px",
                                width: "100%",
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        border: isFocused ? '1px solid gray' : '1px solid gray',
                                    },
                                    '&:hover fieldset': {
                                        border: '1px solid gray',
                                    },
                                    '&.Mui-focused fieldset': {
                                        border: '1px solid gray',
                                    },
                                },
                            }}
                            onFocus={handleFocus}
                            autoFocus={false}
                            type="text"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            label="Date"
                        /> */}

                        <button onClick={filter} style={{ width: "fit-content", padding: "13px", display: "flex", justifyContent: "center", alignContent: "center", alignSelf: "center", border: "1px solid #FF5722", borderRadius: "10px", backgroundColor: "#fff1ed", color: "#FF5722" }}>
                            <Stack direction="row" sx={{ pl: 1, pr: 1 }}>
                                <div>
                                    <Stack sx={{ paddingLeft: "0px" }}>
                                        <FilterAlt sx={{ fontWeight: 500, width: "24dpi" }} />
                                    </Stack>
                                </div>

                                <div>
                                    <Stack sx={{ marginLeft: "1vh", paddingTop: "0vh", paddingRight: "5px", fontWeight: "medium" }}>Filter</Stack>
                                </div>
                            </Stack>
                        </button>

                    </Stack>

                    {data == null || undefined ?
                        <Grid container spacing={0} pt={15}>
                            <Grid xs={12} lg={12} align="center"  >
                                <Stack direction="column">
                                    <Warning sx={{ fontSize: "5vh", color: "#FF5722", opacity: 0.5, alignSelf: "center" }} />
                                    <TypographyMD variant='paragraph' label={t("Data Not Found")} color="#FF5722" marginLeft={0} fontSize="14px" fontWeight={500} align="center" />
                                </Stack>
                            </Grid>
                        </Grid>
                        :
                        <>
                            <AreaChart width={320} height={400} data={data}>
                                {/* <CartesianGrid strokeDasharray="3 3" /> */}
                                <XAxis dataKey="order_id" />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area type="monotone" dataKey="estimated_delivery_time" stroke="#FF5722" fill="#fcc7b8" />
                            </AreaChart>
                        </>
                    }
                </Box>
            </div>

        </>
    )
}

export default Graph;