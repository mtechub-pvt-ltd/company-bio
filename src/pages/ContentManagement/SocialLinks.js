import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  CircularProgress,
  Button,
  Typography,
} from "@mui/material";
import url from "../../url";
import toast from "react-hot-toast";
import { t } from "i18next";

const SocialLinks = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const SOCIAL_FIELDS = [
  { key: "email", label: "Email", placeholder: "Enter Email" },
  { key: "facebook_link", label: "Facebook Link", placeholder: "Enter Facebook Link" },
  { key: "youtube_link", label: "YouTube Link", placeholder: "Enter YouTube Link" },
  { key: "twitter_link", label: "Twitter Link", placeholder: "Enter Twitter Link" },
  { key: "linkedin_link", label: "LinkedIn Link", placeholder: "Enter LinkedIn Link" },
  { key: "appstore_url", label: "App Store URL", placeholder: "Enter App Store URL" },
  { key: "google_play_store_url", label: "Google Play Store URL", placeholder: "Enter Google Play Store URL" },
];
  const [formData, setFormData] = useState({
    email: "",
    facebook_link: "",
    youtube_link: "",
    twitter_link: "",
    linkedin_link: "",
    appstore_url: "",
    google_play_store_url: "",
  });

  // -------------------------------------------
  // FETCH SOCIAL LINKS (GET API)
  // -------------------------------------------
  const fetchSocialLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${url}social-links`, {
        method: "GET",
      });

      const json = await res.json();
      console.log("GET SOCIAL LINKS: ", json);

      if (!json.error && json.data) {
        setFormData({
          email: json.data.email || "",
          facebook_link: json.data.facebook_link || "",
          youtube_link: json.data.youtube_link || "",
          twitter_link: json.data.twitter_link || "",
          linkedin_link: json.data.linkedin_link || "",
          appstore_url: json.data.appstore_url || "",
          google_play_store_url: json.data.google_play_store_url || "",
        });
      }
    } catch (error) {
      console.log("GET SOCIAL LINKS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  // -------------------------------------------
  // HANDLE INPUT CHANGE
  // -------------------------------------------
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // -------------------------------------------
  // SAVE SOCIAL LINKS (POST/PUT API)
  // -------------------------------------------
const handleUpdate = async () => {
  setSaving(true);

  try {
    const res = await fetch(`${url}social-links`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const json = await res.json();
    console.log("UPDATE SOCIAL LINKS:", json);

    if (!json.error) {
  toast.success(t("social_links_updated_success"));
      await fetchSocialLinks(); // refresh updated links
    } else {
      toast.error(json.message || "Failed to update social links");
    }
  } catch (error) {
    console.log("UPDATE SOCIAL LINKS ERROR:", error);
toast.error(t("social_links_update_error"));
  } finally {
    setSaving(false);
  }
};


  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #E0E0E0",
        ml: 1,
        mr: 1,
      }}
    >
    <Box
  sx={{
    display: "flex",
    alignItems: "center",
    gap:1,
    mb: 2,
  }}
>
  <Typography
    sx={{ fontSize: "18px", fontWeight: 600, color: "#003149" }}
  >
  {t("Website Social Links")}
  </Typography>

  {loading && (
    <CircularProgress size={20} thickness={4} sx={{ color: "#006EC2" }} />
  )}
</Box>

<Grid container spacing={2}>
  {SOCIAL_FIELDS.map((field) => (
    <Grid item xs={12} md={6} key={field.key}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 500,
            color: "#003149",
            mb: 0.5,
          }}
        >
          {t(field.label)}
        </Typography>

        <TextField
          fullWidth
          size="small"
          value={formData[field.key]}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder={t(field.placeholder)}
          sx={{
            backgroundColor: "#F9FAFB",
            "& .MuiOutlinedInput-root": {
              borderRadius: "6px",
            },
          }}
        />
      </Box>
    </Grid>
  ))}
</Grid>


      {/* UPDATE BUTTON */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={saving}
          sx={{
            backgroundColor: "#006EC2",
            textTransform: "none",
            px: 4,
            py: 1,
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            "&:hover": { backgroundColor: "#0057A3" },
          }}
        >
{saving ? <CircularProgress size={18} color="inherit" /> : t("Update")}
        </Button>
      </Box>
    </Box>
  );
};

export default SocialLinks;
