import React, { useEffect, useState } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import dummy from '../../Assets/dummy.png'
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import TypographyMD from "../../components/items/Typography";
import back_arrow from "../../Assets/back_arrow.png";
import { useNavigate, useSearchParams } from "react-router-dom";
import url from "../../url";
import { toast } from "react-hot-toast";
import WorkerDetailsTab from "./WorkerDetailsTabs";
import { useTranslation } from "react-i18next";
import FormatDate from "../../components/FormatDate";
import StatusDropdown from "../../components/StatusDropdown";

function WokerDetails() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const worker_id = searchParams.get("id");

  const navigate = useNavigate();
  const [workerDetails, setWorkerDetails] = useState(null);

  const getWorkerDetails = async (worker_id) => {
    const InsertAPIURL = `${url}public/workers/${worker_id}`;
    
    try {
      const response = await fetch(InsertAPIURL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        toast.error("Something went wrong! Please try again ");
        return;
      }

      const data = await response.json();

      if (data?.data) {
        setWorkerDetails(data.data);
      } else {
        toast.error(t("Employee not found"));
      }
    } catch (error) {
      toast.error("Something went wrong! Please try again.");
    }
  };

  useEffect(() => {
    if (worker_id) {
      getWorkerDetails(worker_id);
    }
  }, [worker_id]);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));


  const SummaryCards = ({ summary }) => {
 const items = [
  { label: t("summaryData.total_tasks"), value: summary?.total_tasks },
  { label: t("summaryData.total_attendance"), value: summary?.total_attendance_records },
  { label: t("summaryData.total_requests"), value: summary?.total_requests },
  { label: t("summaryData.total_documents"), value: summary?.total_documents },
  { label: t("summaryData.total_expenses"), value: summary?.total_expenses },
  { label: t("summaryData.total_remunerations"), value: summary?.total_remunerations },
];

  return (
    <Grid container spacing={1}>
      {items.map((item, i) => (
        <Grid item xs={6} sm={4} md={2} key={i}>
          <Card
            sx={{
              borderRadius: "12px",
              border: "2px solid rgba(9, 30, 66, 0.14)",
              boxShadow: "none",
            }}
          >
            <CardContent>
              <Typography fontSize="12px" color="#5E5C5C">
                {item.label}
              </Typography>
              <Typography fontSize="20px" fontWeight={600}>
                {item.value ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};


  return (
    <>
      <SidebarNew
        componentTitle="Employee Details"
        componentData={
          <Box
            sx={{
              width: "100%",
              overflowX: "hidden",
              height: {
                xs: "calc(100vh - 70px)",
                sm: "calc(100vh - 80px)",
                md: "calc(100vh - 85px)",
                lg: "calc(100vh - 85px)",
                xl: "calc(100vh - 110px)",
              },
            }}
          >
            {!workerDetails ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="50vh"
              >
                <CircularProgress size={20} thickness={3} color="primary" />
              </Box>
            ) : (
              <Grid container spacing={2} sx={{ pl: 2, pr: 2, pt: 2 }}>
                {/* Back Button and Breadcrumb */}
                <Grid xs={12} pb={1}>
                  <Card
                    sx={{
                      width: "100%",
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "2px solid rgba(9, 30, 66, 0.14)",
                      boxShadow: "none",
                      p: 2,
                    }}
                  >
                    <CardContent sx={{ p: 0, "&:last-child": { paddingBottom: 0 } }}>
                      <Box display="flex" alignItems="center" gap={1} mb={0}>
                        <Box
                          onClick={() => navigate("/workers")}
                          component="img"
                          src={back_arrow}
                          sx={{ cursor: "pointer", width: "30px" }}
                        />

                        <Breadcrumbs separator="/" aria-label="breadcrumb" sx={{ lineHeight: 1, m: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 400,
                              fontSize: "15px",
                              fontFamily: "Roboto",
                              lineHeight: 1.2,
                              m: 0,
                            }}
                            color="#626F86"
                          >
                            {t("Workers")}
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 400,
                              fontSize: "15px",
                              fontFamily: "Roboto",
                              lineHeight: 1.2,
                              m: 0,
                            }}
                            color="#626F86"
                          >
                            {[workerDetails?.first_name, workerDetails?.middle_name, workerDetails?.last_name]
                              .filter(Boolean)
                              .join(" ")}
                          </Typography>
                        </Breadcrumbs>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
{/* SUMMARY CARDS – TOP */}
<Grid xs={12} mb={2}>
  <SummaryCards summary={workerDetails?.summary} />
</Grid>
                {/* Worker Details Card */}
                <Grid container spacing={2} pt={0}>
                  {/* Left Section - Profile and Basic Info */}
                  <Grid item xs={12} md={5} p={0.7}>
                    <Card
                      sx={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "2px solid rgba(9, 30, 66, 0.14)",
                        boxShadow: "none",
                      }}
                    >
                      <CardContent>
                        <Box align="left">
                          <Grid container spacing={0} p={0}>


                            <Grid  align="center" pb={1}>
                              <TypographyMD
                                variant="h2"
                                label={t("personal_details")}
                                 color="#424242"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="18px"
                              fontWeight={750}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={12} align="center" pb={2}>
                              <img
                                src={workerDetails?.profile_image || dummy}
                                width={150}
                                height={150}
                                style={{
                                  border: "none",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                                alt="Profile"
                                onError={(e) => { e.target.src = dummy; }}
                              />
                            </Grid>

                            {/* Basic Info Fields */}
                            <Grid xs={5} md={5} align="center" pb={1}>
                              <TypographyMD
                                variant="h2"
                                label={t("ID")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} md={7} align="right" pb={0.5}>
                              <TypographyMD
                                variant="h2"
                                label={`#${workerDetails?.id}`}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} md={5} align="center" pb={1}>
                              <TypographyMD
                                variant="h2"
                                label={t("Status")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} md={7} align="right" pb={0.5}>
                               <Box
                                                                          sx={{
                                                                        pointerEvents: "none",
                                                                           }}
                                                                             >
                                                                              <StatusDropdown
                                                                                currentStatus={workerDetails?.status}
                                                                                  />
                                                                                                                        </Box>
                              {/* <Chip
 label={
  workerDetails?.status
    ? t(`status.${workerDetails.status}`)
    : "N/A"
}
                                sx={{
                                  backgroundColor:
                                    workerDetails?.status === "active" ? "#E6F5E6" :
                                    workerDetails?.status === "pending" ? "#FFF4E6" :
                                    workerDetails?.status === "email_pending" ? "#FFE6E6" :
                                    "#E6E6E6",
                                  color:
                                    workerDetails?.status === "active" ? "#00CC00" :
                                    workerDetails?.status === "pending" ? "#FFA500" :
                                    workerDetails?.status === "email_pending" ? "#FF3333" :
                                    "#666666",
                                  fontWeight: 500,
                                  textTransform: "capitalize",
                                }}
                              /> */}
                            </Grid>

                            <Grid xs={5} md={5} align="center" pb={1}>
                              <TypographyMD
                                variant="h2"
                                label={t("First Name")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} md={7} align="right" pb={0.5}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.first_name || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} md={5} align="center" pb={1}>
                              <TypographyMD
                                variant="h2"
                                label={t("Middle Name")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} md={7} align="right" pb={0.5}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.middle_name || "-"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} md={5} align="center" pb={1}>
                              <TypographyMD
                                variant="h2"
                                label={t("Last Name")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} md={7} align="right" pb={0.5}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.last_name || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} md={5} align="center" pb={1}>
                              <TypographyMD
                                variant="h2"
                                label={t("Email")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} md={7} align="right" pb={0.5}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.email || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} md={5} align="center" pb={1}>
                              <TypographyMD
                                variant="h2"
                                label={t("Phone No.")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} md={7} align="right" pb={0.5}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.phone || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} md={5} align="center" pb={1}>
                              <TypographyMD
                                variant="h2"
                                label={t("Designation")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} md={7} align="right" pb={0.5}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.designation || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} md={5} align="center" pb={1}>
                              <TypographyMD
                                variant="h2"
                                label={t("Date of Birth")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} md={7} align="right" pb={0.5}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.dob ? <FormatDate inputDate={workerDetails.dob} /> : "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} md={5} align="center" pb={1}>
                              <TypographyMD
                                variant="h2"
                                label={t("Registered")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} md={7} align="right" pb={0.5}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.created_at ? <FormatDate inputDate={workerDetails.created_at} /> : "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Right Section - Additional Info */}
                  <Grid item xs={12} md={7} p={0.7}>
                    <Card
                      sx={{
                        width: "100%",
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "2px solid rgba(9, 30, 66, 0.14)",
                        boxShadow: "none",
                      }}
                    >
                      <CardContent>
                        <Box align="left">
                            <Grid xs={5} md={5} align="center" pb={1}>
                              <TypographyMD
                                variant="h2"
                                label={t("personal_details")}
                                 color="#424242"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="18px"
                              fontWeight={750}
                                align="left"
                              />
                            </Grid>
                          <Grid container spacing={0} p={0}>


                            

                            <Grid xs={5} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={t("Employee Type")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.employee_type || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={t("Department")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.department_name || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={t("Shift Schedule")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.shift_schedule || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={t("Work Hours")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.work_hours ? `${workerDetails.work_hours} hrs` : "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={t("Salary")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.salary ? `$${workerDetails.salary}` : "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={t("Hire Date")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.hire_date ? <FormatDate inputDate={workerDetails.hire_date} /> : "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={t("Company Name")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.company_name || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={t("Company Email")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.company_email || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={t("Country")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.country || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>


                            <Grid xs={5} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={t("City")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.city || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={t("Province")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.province || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>

                            <Grid xs={5} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={t("Address")}
                                color="#5E5C5C"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="left"
                              />
                            </Grid>
                            <Grid xs={7} pb={0.8}>
                              <TypographyMD
                                variant="h2"
                                label={workerDetails?.street_address || "N/A"}
                                color="#172B4D"
                                fontFamily="Roboto"
                                marginLeft={0}
                                fontSize="13px"
                                fontWeight={450}
                                align="right"
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

             
                 <WorkerDetailsTab workerDetails={workerDetails} />

              </Grid>
            )}
          </Box>
        }
      />
    </>
  );
}

export default WokerDetails;