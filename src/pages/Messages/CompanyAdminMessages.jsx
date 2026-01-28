import React from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import { Box, Typography, Card, CardContent, Avatar, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import Inbox from "./Inbox";

function CompanyAdminMessages() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'company_admin';

  return (
    <SidebarNew
      componentTitle="Company Admin Messages"
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
          {/* Header Section */}
         

          {/* Messages Component */}
          <Inbox role={role} />
        </Box>
      }
    />
  );
}

export default CompanyAdminMessages;
