import React from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import { Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import Inbox from "./Inbox";
import WorkerInbox from "./WorkerInbox";

function Messages() {
  return (
    <SidebarNew
      componentTitle="Messages"
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
          <Inbox />
        </Box>
      }
    />
  );
}

export default Messages;
