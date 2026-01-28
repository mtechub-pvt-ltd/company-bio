import { Card, CardContent, Grid, CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import TypographyMD from "./Typography";
import ReactApexChart from 'react-apexcharts';
import url from "../../url";
import toast from "react-hot-toast";

function DashboardAreaChart() {

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    const [series, setSeries] = React.useState([
        {
            name: "Users",
            data: []
        }
    ]);

    const [options, setOptions] = React.useState({
        chart: {
            height: 350,
            type: 'area',
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            colors: ['#2152CD']
        },
        fill: {
            opacity: 0.9,
            colors: ['#b1bafc']
        },
        grid: {
            row: {
                colors: ['#f3f3f3', 'transparent'],
                opacity: 0.5
            },
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        }
    });

    const [loading, setLoading] = useState(false);

    const getusersbyyear = async (year = currentYear) => {
        setLoading(true); // start loading
        const InsertAPIURL = `${url}user/getList`;
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };

        try {
            const response = await fetch(InsertAPIURL, {
                method: 'GET',
                headers: headers,
            });
            const result = await response.json();

            const filteredResult = result?.data?.filter(item => item?.role !== "admin");

            const users = filteredResult || [];

            const monthlyCounts = new Array(12).fill(0);

            users.forEach(user => {
                const date = new Date(user.created_at);
                if (date.getFullYear() === year) {
                    const monthIndex = date.getMonth();
                    monthlyCounts[monthIndex]++;
                }
            });

            setSeries([
                {
                    name: "Users",
                    data: monthlyCounts,
                }
            ]);
        } catch (error) {
           toast.error("Something went wrong! Please try again.");
            alert(error);
        } finally {
            setLoading(false); // stop loading
        }
    };

    useEffect(() => {
        getusersbyyear(selectedYear);
    }, [selectedYear]);


    return (
        <>
            <Card sx={{
                boxShadow: "none", height: { xs: "auto", md: "334px" }, borderRadius: "12px", border: "1px solid transparent"
            }}>
                <CardContent>
                    <Grid container spacing={0}>
                        <Grid xs={6} md={6}>
                            <TypographyMD variant='h2' label="User Growth Map" color="#rgb(33, 33, 33)" fontFamily="" marginLeft={0} fontSize="15px" align="left" />
                        </Grid>

                        <Grid xs={6} align="right">
                            <div className="flex justify-end mb-2">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="border rounded px-3 py-1 bg-white"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Grid>

                        <Grid xs={12}>
                            <div id="chart" className='bg-white flex justify-center items-center' style={{ height: "280px" }}>
                                {loading ? (
                                    <CircularProgress size={20} thickness={3} color="primary" />
                                ) : (
                                    <ReactApexChart options={options} series={series} type="area" height={280} />
                                )}
                            </div>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </>
    )
}

export default DashboardAreaChart;
