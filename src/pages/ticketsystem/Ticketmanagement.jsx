import React, { useState, useEffect } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import TicketCard from "./TicketCard";
import TicketsTable from "./TicketTable";
import TicketDetails from "./TicketsDetails";

// 🖼️ Correct icons
import total from "../../Assets/tickets/total.svg";
import resolved from "../../Assets/tickets/resolved.svg";
import overdue from "../../Assets/tickets/overdid.svg"; // rename file if needed
import created from "../../Assets/tickets/created.svg";
import closed from "../../Assets/tickets/closed.svg";
import open from "../../Assets/tickets/open.svg";
import high from "../../Assets/tickets/high.svg";
import assign from "../../Assets/tickets/assign.png";

import url from "../../url";
import SidebarNew from "../../components/sidebar/SidebarNew"; // ✅ make sure path is correct

const TicketManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const { token } = useSelector((state) => state.auth);

  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [summary, setSummary] = useState({});
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${url}/tickets/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed: ${res.status}`);
        }

        const json = await res.json();
        setSummary(json?.data?.summary || {});
        setRecentTickets(json?.data?.recent_tickets || []);
      } catch (err) {
        setError(err?.message || "Request failed");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [token]);

  return (
    <SidebarNew
      componentTitle="Dashboard"
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
          <Box sx={{ pl: 0.5, pr: 0.5, py: 2 }}>
            {selectedTicketId ? (
              <Box>
                <TicketDetails
                  ticketId={selectedTicketId}
                  onBack={() => setSelectedTicketId(null)}
                />
              </Box>
            ) : (
              <>
                {/* ---- DASHBOARD CARDS ---- */}
                <Box
                  sx={{
                    px: 1,
                    display: "grid",
                    gap: 1,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                      lg: "repeat(4, 1fr)",
                    },
                  }}
                >
                  <TicketCard
                    icon={total}
                    title={t("Total Tickets")}
                    description={summary?.total_tickets ?? "-"}
                  />
                  <TicketCard
                    icon={open}
                    title={t("Open Tickets")}
                    description={summary?.open_tickets ?? "-"}
                  />
                  <TicketCard
                    icon={assign}
                    title={t("tickets.assigned_to_me")}
                    description={summary?.assigned_to_me ?? "-"}
                  />
                  <TicketCard
                    icon={created}
                    title={t("tickets.created")}
                    description={summary?.created_by_me ?? "-"}
                  />
                  <TicketCard
                    icon={high}
                    title={t("tickets.high_priority")}
                    description={summary?.high_priority_tickets ?? "-"}
                  />
                  <TicketCard
                    icon={overdue}
                    title={t("Overdue")}
                    description={summary?.overdue_tickets ?? "-"}
                  />
                  <TicketCard
                    icon={resolved}
                    title={t("tickets.resolved")}
                    description={summary?.resolved_tickets ?? "-"}
                  />
                  <TicketCard
                    icon={closed}
                    title={t("tickets.closed")}
                    description={summary?.closed_tickets ?? "-"}
                  />
                </Box>

                {/* ---- TICKETS TABLE ---- */}
                <Box>
                  <TicketsTable onView={(id) => setSelectedTicketId(id)} />
                </Box>
              </>
            )}
          </Box>
        </Box>
      }
    />
  );
};

export default TicketManagement;


