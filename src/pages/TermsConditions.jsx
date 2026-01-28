



import React, { useState, useEffect } from "react";
import SidebarNew from "../components/sidebar/SidebarNew";
import { Box, Grid, CircularProgress, Button, Tabs, Tab } from "@mui/material";
import TypographyMD from "../components/items/Typography";
import ButtonMD from "../components/items/ButtonMD";

import {
  EditorState,
  ContentState,
  convertToRaw,
} from "draft-js";

import { Editor } from "react-draft-wysiwyg";
import htmlToDraft from "html-to-draftjs";
import draftToHtml from "draftjs-to-html";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useTranslation } from "react-i18next";
import url from "../url";

function TermsConditions() {
  const { t } = useTranslation();
  const { i18n } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize active tab from saved language preference
  const [activeLangTab, setActiveLangTab] = useState(() => {
    const savedLang = localStorage.getItem("lang") || i18n.language || "en";
    return savedLang;
  });
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  // Hold both language contents
  const [contentEn, setContentEn] = useState("");
  const [contentEs, setContentEs] = useState("");
const syncEditorToLang = () => {
  const raw = convertToRaw(editorState.getCurrentContent());
  const html = draftToHtml(raw);

  if (activeLangTab === "en") {
    setContentEn(html);
    return { en: html, es: contentEs };
  } else {
    setContentEs(html);
    return { en: contentEn, es: html };
  }
};

  // --------------------------------------------------------
  // FETCH TERMS CONTENT
  // --------------------------------------------------------
  async function fetchContent() {
    setLoading(true);

    try {
      const res = await fetch(`${url}terms`, { method: "GET" });
      const json = await res.json();

      console.log("GET TERMS RESPONSE:", json);

      if (!json.error && json.data) {
        const en = json.data.content || "";
        const es = json.data.content_es || "";

        setContentEn(en);
        setContentEs(es);

        loadEditorContent(activeLangTab === "en" ? en : es);
      }
    } catch (err) {
      console.log("GET TERMS ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  // Convert HTML → Editor blocks
  const loadEditorContent = (htmlString) => {
    const draft = htmlToDraft(htmlString || "");
    const contentState = ContentState.createFromBlockArray(
      draft.contentBlocks,
      draft.entityMap
    );
    setEditorState(EditorState.createWithContent(contentState));
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // --------------------------------------------------------
  // TAB CHANGE
  // --------------------------------------------------------
  // const handleTabChange = (e, newTab) => {
  //   setActiveLangTab(newTab);

  //   if (newTab === "en") loadEditorContent(contentEn);
  //   else loadEditorContent(contentEs);
  // };
const handleTabChange = (e, newTab) => {
  syncEditorToLang();
  setActiveLangTab(newTab);

  if (newTab === "en") {
    loadEditorContent(contentEn);
  } else {
    loadEditorContent(contentEs);
  }
};
  // --------------------------------------------------------
  // SAVE TERMS
  // --------------------------------------------------------
  const handleSave = async () => {
  setSaving(true);

  const { en, es } = syncEditorToLang();

  const payload = {
    content: en || "",
    content_es: es || "",
  };

  try {
    const res = await fetch(`${url}terms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    console.log("POST TERMS RESPONSE:", json);

    if (!json.error) {
      fetchContent();
    }
  } catch (err) {
    console.log("POST TERMS ERROR:", err);
  } finally {
    setSaving(false);
  }
};

  // const handleSave = async () => {
  //   setSaving(true);

  //   const rawState = convertToRaw(editorState.getCurrentContent());
  //   const htmlContent = draftToHtml(rawState);

  //   // Payload based on language tab
  //   const payload =
  //     activeLangTab === "en"
  //       ? { content: htmlContent }
  //       : { content_es: htmlContent };

  //   // URL based on tab
  //   const endpoint =
  //     activeLangTab === "en"
  //       ? `${url}terms`
  //       : `${url}terms/spanish`;

  //   try {
  //     const res = await fetch(endpoint, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     const json = await res.json();
  //     console.log("POST TERMS RESPONSE:", json);

  //     if (!json.error) fetchContent();
  //   } catch (err) {
  //     console.log("POST TERMS ERROR:", err);
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  // --------------------------------------------------------
  // UI (NO CHANGES, JUST TAB ADDED)
  // --------------------------------------------------------
  return (
    <SidebarNew
      componentTitle={t("admin")}
      componentData={
        <Box
          sx={{
            width: "100%",
            overflowX: "hidden",
            overflowY: "auto",
            height: {
              xs: "calc(100vh - 70px)",
              sm: "calc(100vh - 80px)",
              md: "calc(100vh - 85px)",
              lg: "calc(100vh - 85px)",
              xl: "calc(100vh - 110px)",
            },
          }}
        >
          {loading ? (
            <div
              style={{
                height: "50vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress size={20} thickness={3} color="primary" />
            </div>
          ) : (
            <Grid container spacing={0} sx={{ pl: 1, pr: 1 }} pt={0}>
              {/* HEADER */}
              <Grid xs={12} p={1}>
                <Box sx={{ backgroundColor: "#ffffff", borderRadius: "12px", p: 2 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                  >
                    <TypographyMD
                      variant="paragraph"
                      label={t("terms_and_conditions")}
                      color="#003149"
                      fontSize="22px"
                      fontWeight={600}
                    />

                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={saving}
                      sx={{
                        backgroundColor: "#003149",
                        textTransform: "none",
                        padding: "8px 25px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        boxShadow: "none",
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        t("save")
                      )}
                    </Button>
                  </Box>

                  {/* LANGUAGE TABS */}
                  <Tabs value={activeLangTab} onChange={handleTabChange} sx={{ mt: 2 }}>
                    <Tab label="English" value="en" />
                    <Tab label="Español" value="es" />
                  </Tabs>
                </Box>
              </Grid>

              {/* EDITOR */}
              <Grid xs={12} p={1} sx={{ height: "calc(100vh - 220px)" }}>
                <Box
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    p: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Editor
                    editorState={editorState}
                    onEditorStateChange={setEditorState}
                    toolbar={{
                      options: [
                        "inline",
                        "fontSize",
                        "colorPicker",
                        "list",
                        "link",
                        "history",
                      ],
                    }}
                    editorStyle={{
                      flex: 1,
                      backgroundColor: "white",
                      height: "100%",
                      border: "1px solid #ddd",
                      padding: "20px",
                      borderRadius: "10px",
                    }}
                  />
                </Box>
              </Grid>

         
            </Grid>
          )}
        </Box>
      }
    />
  );
}

export default TermsConditions;
