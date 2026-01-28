
// src/screens/content/ContentManagementScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import SidebarNew from "../../components/sidebar/SidebarNew";
import {
  Box,
  CardContent,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import EditIcon from "@mui/icons-material/Edit";
import toast, { Toaster } from "react-hot-toast";
import empty from "../../Assets/empty_chat.png";
import url from "../../url";
import AddSectionModal from "./AddSectionModal";
import EditSectionItemModal from "./EditModal";
import { Tabs, Tab } from "@mui/material";
import SocialLinks from "./SocialLinks";
function ContentManagementScreen() {
  const { t } = useTranslation();
  const [sections, setSections] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loadingTabs, setLoadingTabs] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const scrollRef = useRef(null);

  const SECTION_ORDER = [
    "Home","Home_Features_Website_Cards","Home_Features_Trust","Home_Features_OverSights",
    "Home_Industry_Section","Home_Pricing","Home_Happy_Team","FAQs","Home_Subscribe",
    "About","About_ Precision1","About_ Precision2","About_Workforce","About_Mission",
    "Features_Time_Tracking","Facial_Recognition","ClockIn_Out","Break_Time","Offline_Clocking",
    "Custom_Rules","Task_Management","Project_Assignment","Assign_Validate_Task",
    "Task_Creation","Employee_Absence","Employee_Department","Centralized_Communication",
    "Messaging_Conversations","Smart_Notifications","Request_Generation","Admin_Review",
    "Documents","Financial_Feature","Salary_payments","Employee_Logs","Loan_Management",
    "Employee_History","Subscription_Billing","Account_Executive","Company_List",
    "Interactive_Company","Messaging_Hub","Manage_Payments","Pricing"
  ];

  const sortSections = (data) => {
    return [...data].sort((a, b) => {
      const indexA = SECTION_ORDER.indexOf(a.name);
      const indexB = SECTION_ORDER.indexOf(b.name);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  };

  const fetchSections = async () => {
    const res = await fetch(`${url}/content/sections?page=1&limit=100&sort=order&status=published`);
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.message || t("contentManagement.errors.fetchSections"));
    const sorted = sortSections(data.data || []);
    setSections(sorted);
    if (sorted.length > 0) setActiveTab(sorted[0].id);
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchSections();
      } catch (err) {
        console.error(err);
        toast.error(err.message || t("contentManagement.errors.generic"));
      } finally {
        setLoadingTabs(false);
      }
    })();
  }, []);

  const [itemsBySection, setItemsBySection] = useState({});
  const [loadingItems, setLoadingItems] = useState(false);

  const fetchItems = async (sectionId) => {
    try {
      const res = await fetch(`${url}/content/sections/${sectionId}/items`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.message || t("contentManagement.errors.fetchItems"));
      return data.data || [];
    } catch (err) {
      console.error(err);
      toast.error(err.message || t("contentManagement.errors.fetchItems"));
      return [];
    }
  };

  useEffect(() => {
    if (!activeTab) return;
    const activeSection = sections.find((s) => s.id === activeTab);
    if (!activeSection) return;

    let groupSections = sections.filter(
      (s) => s.name === activeSection.name || s.name.startsWith(activeSection.name + "_")
    );

    const customOrders = {
      Home: [
        "Home","Home_Features_Website_Cards","Home_Features_Trust","Home_Features_OverSights",
        "Home_Industry_Section","Home_Pricing","Home_Happy_Team","FAQs","Home_Subscribe"
      ],
      About: [
        "About","About_ Precision1","About_ Precision2","About_Workforce","About_Mission"
      ],
      Features_Time_Tracking: [
        "Features_Time_Tracking","Facial_Recognition","ClockIn_Out","Break_Time",
        "Offline_Clocking","Custom_Rules"
      ],
      Task_Management: [
        "Task_Management","Project_Assignment","Assign_Validate_Task","Task_Creation",
        "Employee_Absence","Employee_Department"
      ],
      Centralized_Communication: [
        "Centralized_Communication","Messaging_Conversations","Smart_Notifications",
        "Request_Generation","Admin_Review","Documents"
      ],
      Financial_Feature: [
        "Financial_Feature","Salary_payments","Employee_Logs","Loan_Management",
        "Employee_History","Subscription_Billing"
      ],
      Account_Executive: [
        "Account_Executive","Company_List","Interactive_Company","Messaging_Hub","Manage_Payments"
      ],
      Pricing: ["Pricing"]
    };

    if (customOrders[activeSection.name]) {
      groupSections = customOrders[activeSection.name]
        .map((name) => sections.find((s) => s.name === name))
        .filter(Boolean);
    }

    setLoadingItems(true);
    Promise.all(groupSections.map(async (s) => ({ sectionId: s.id, items: await fetchItems(s.id) })))
      .then((results) => {
        const grouped = {};
        results.forEach((r) => { grouped[r.sectionId] = r.items; });
        setItemsBySection(grouped);
        setLoadingItems(false);
      });
  }, [activeTab, sections]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
const [activeMainTab, setActiveMainTab] = useState("content"); // default active

  return (
    <SidebarNew
      componentTitle={t("contentManagement.admin")}
      componentData={
<>
<Box
  sx={{
    backgroundColor: "white",
    borderRadius: "12px",
    py: 0.5,
    px: 2,
    mb: 2,
    border: "1px solid #E0E0E0",
    ml: 1,
    mr: 1,
  }}
>
  <Tabs
    value={activeMainTab}
    onChange={(e, v) => setActiveMainTab(v)}
    indicatorColor="primary"
    textColor="primary"
    TabIndicatorProps={{
      style: {
        backgroundColor: "#006EC2",
        height: "3px",
        borderRadius: "2px",
      },
    }}
    sx={{
      "& .MuiTab-root": {
        textTransform: "none",
        fontWeight: 500,
        fontSize: "14px",
        px: 3,
        color: "#006EC2",
      },
      "& .Mui-selected": {
        color: "#006EC2",
        fontWeight: 600,
      },
    }}
  >
    <Tab label={t("website_content")} value="content" />
    <Tab label={t("website_social_links")} value="social" />
  </Tabs>
</Box>

        
        <Box
          sx={{
            width: "100%",
            minHeight: "calc(100vh - 70px)",
            p: { xs: 1, sm: 2 },
            backgroundColor: "white",
            borderRadius: 2,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            overflow: "hidden",
          }}
        >
          <Toaster />

{/* TOP TAB BAR */}


          {/* Header for mobile */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              flexDirection: "row",
              justifyContent: "space-between",
              flexWrap: "wrap",
              mb: 2,
              width: "100%",
            }}
          >
            <Typography variant="h2" sx={{ fontSize: "24px", fontWeight: 600 }}>
              {t("contentManagement.sectionItems", {
                section: t(
                  `contentManagement.sections.${sections.find((s) => s.id === activeTab)?.name}`,
                  { defaultValue: sections.find((s) => s.id === activeTab)?.name }
                ),
              })}
            </Typography>
          </Box>
{activeMainTab === "social" && <SocialLinks />}
{activeMainTab === "content" && (
  <>
          {!loadingTabs && sections.length === 0 ? (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <img src={empty} alt="No data" style={{ maxWidth: 200, marginBottom: 16 }} />
              <Typography sx={{ fontSize: 16, fontWeight: 500, color: "#888" }}>
                {t("contentManagement.noData")}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Sidebar */}
              <Box
                sx={{
                  flex: { xs: "0 0 auto", md: "0 0 250px" },
                  border: "1px solid #091E4224",
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  height: { xs: "auto", md: 450 },
                  overflowY: "auto",
                  position: { xs: "static", md: "sticky" },
                  top: { xs: "auto", md: 0 },
                  alignSelf: { xs: "stretch", md: "flex-start" },
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "row", md: "column" },
                    gap: 1,
                    p: 1,
                    overflowX: { xs: "auto", md: "visible" },
                  }}
                >
                  {sections.map((section) => (
                    <Box
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      sx={{
                        px: 2,
                        py: 1,
                        cursor: "pointer",
                        borderRadius: 1,
                        backgroundColor: activeTab === section.id ? "#E6F2FB" : "transparent",
                        color: activeTab === section.id ? "#006EC2" : "#44546F",
                        fontWeight: 500,
                        fontSize: { xs: "12px", md: "14px" },
                        transition: "all 0.2s",
                        "&:hover": { backgroundColor: "#F4F6F8" },
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t(`contentManagement.sections.${section.name}`, { defaultValue: section.name })}
                    </Box>
                  ))}
                </CardContent>
              </Box>

              {/* Content */}
              <Box
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  backgroundColor: "white",
                  minHeight: { xs: "auto", md: 450 },
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "auto",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexShrink: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "14px", md: "15px" },
                      color: "#44546F",
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    {t("contentManagement.sectionItems", {
                      section: t(
                        `contentManagement.sections.${sections.find((s) => s.id === activeTab)?.name}`,
                        { defaultValue: sections.find((s) => s.id === activeTab)?.name }
                      ),
                    })}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    pr: 1,
                    scrollbarWidth: "thin",
                    "&::-webkit-scrollbar": { width: "6px" },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#ccc",
                      borderRadius: "4px",
                    },
                  }}
                >
                  {loadingItems ? (
                    <CircularProgress size={22} />
                  ) : (
                    Object.keys(itemsBySection).map((sectionId) => {
                      const section = sections.find((s) => s.id === sectionId);
                      if (!section) return null;
                      return (
                        <Box key={section.id} sx={{ mb: 3, border: "1px solid #091E4224", borderRadius: 2, p: 2, backgroundColor: "#fff" }}>
                          {itemsBySection[section.id]?.length > 0 ? (
                            itemsBySection[section.id].map((item) => {
                              let parsedList = [];
                              try {
                                parsedList = item.list ? JSON.parse(item.list) : [];
                              } catch (e) {
                                console.error("Invalid list JSON", e);
                              }

                              return (
                                <Box key={item.id} sx={{ mb: 2, backgroundColor: "#fff" }}>
                                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                                    <Typography sx={{ fontWeight: 500, fontSize: { xs: "13px", md: "15px" }, color: "#006EC2" }}>
                                      {item.title}
                                    </Typography>
                                    <Button
                                      size="small"
                                      onClick={() => {
                                        setSelectedItem({ ...item, sectionName: section.name });
                                        setEditModalOpen(true);
                                      }}
                                      startIcon={<EditIcon />}
                                      sx={{
                                        textTransform: "none",
                                        fontSize: { xs: "11px", md: "13px" },
                                        fontWeight: 500,
                                        color: "#006EC2",
                                        mt: { xs: 1, md: 0 },
                                      }}
                                    >
                                      {t("contentManagement.edit")}
                                    </Button>
                                  </Box>
                                  <Typography sx={{ fontSize: { xs: "12px", md: "14px" }, color: "#555", mb: 1 }}>
                                    {item.description}
                                  </Typography>

                                  {Array.isArray(parsedList) && parsedList.length > 0 && (
                                    <Box
                                      sx={{
                                        display: "grid",
                                        gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
                                        gap: 2,
                                      }}
                                    >
                                      {parsedList.map((f) => (
                                        <Box
                                          key={f.id || f.name}
                                          sx={{
                                            border: "1px solid #e0e0e0",
                                            borderRadius: 1,
                                            p: 1.5,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-start",
                                          }}
                                        >
                                          {f.icon_image_url && (
                                            <img
                                              crossOrigin="anonymous"
                                              src={f.icon_image_url}
                                              alt={f.name}
                                              style={{ width: 40, height: 40, objectFit: "contain", marginBottom: 8 }}
                                            />
                                          )}
                                          <Typography sx={{ fontWeight: 500, fontSize: 14 }}>{f.name}</Typography>
                                          <Typography sx={{ fontSize: 13, color: "#555" }}>{f.value}</Typography>
                                          {f.url && (
                                            <Typography
                                              sx={{ fontSize: 13, color: "#006EC2", textDecoration: "underline" }}
                                              component="a"
                                              href={f.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              {f.url}
                                            </Typography>
                                          )}
                                        </Box>
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              );
                            })
                          ) : (
                            <Typography sx={{ fontSize: "14px", color: "#999" }}>
                              {t("contentManagement.noItems")}
                            </Typography>
                          )}
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            </>
          )}
  </>
)}

          {/* Modals */}
          <AddSectionModal open={openModal} handleClose={() => setOpenModal(false)} onSave={() => {}} />
          <EditSectionItemModal
            open={editModalOpen}
            handleClose={() => setEditModalOpen(false)}
            sectionId={activeTab}
            sectionName={t(
              `contentManagement.sections.${sections.find((s) => s.id === activeTab)?.name}`,
              { defaultValue: sections.find((s) => s.id === activeTab)?.name }
            )}
            items={itemsBySection[activeTab] || []}
            item={selectedItem}
            onUpdated={() => fetchSections()}
          />
        </Box>
     
     </> }
    />
  );
}

export default ContentManagementScreen;
















