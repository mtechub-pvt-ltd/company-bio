import React, { useEffect, useState } from "react";
import { Box, Drawer, Button, TextField, MenuItem, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Cancel } from "@mui/icons-material";
import CustomText, { textStyles } from "../components/CustomText";
import CustomButton from "../components/CustomButton.js";
import SearchableDropdown from "../components/SearchableCountryDropdown.js";
import url from "../url"; // make sure this points to your API base URL
// 🔹 Status Options

const ThresholdFilterDrawer = ({
  open,
  onClose,
  filters,
  setFilters,
  onApplyFilters
}) => {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState(filters);
  const [executives, setExecutives] = useState([]);
  const [loadingExecs, setLoadingExecs] = useState(false);

  const statusOptions = [
  { key: "pending", label: t("commissionStatusOptions.pending") },
  { key: "ready_for_payout", label: t("commissionStatusOptions.ready_for_payout") },
  { key: "paid", label: t("commissionStatusOptions.paid") },
  { key: "no_commission", label:  t("commissionStatusOptions.no_commission") },
];
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
      fetchExecutives();
    }
  }, [open, filters]);

  // 🔹 Fetch all Account Executives (public)
  const fetchExecutives = async () => {
    setLoadingExecs(true);
    try {
      const response = await fetch(`${url}/super-admin/public/account-executives?no_pagination=true`);
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Failed to fetch executives");

      if (result?.data?.account_executives) {
        setExecutives(result.data.account_executives);
      } else {
        setExecutives([]);
      }
    } catch (error) {
      console.error("Error fetching executives:", error);
      setExecutives([]);
    } finally {
      setLoadingExecs(false);
    }
  };

  const apply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const clear = () => {
    const cleared = { status: "", executive: "", executiveId: "" };
    setLocalFilters(cleared);
    onApplyFilters(cleared);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400, md: 550 },
          backgroundColor: "#E7EBEE",
          mt: 9
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          backgroundColor: "#E7EBEE",
          zIndex: 10,
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid #DDE1E6"
        }}
      >
        <Cancel
          onClick={onClose}
          sx={{
            cursor: "pointer",
            color: "#F22727",
            fontSize: { xs: "20px", sm: "24px" }
          }}
        />
        <CustomText
          sx={{
            ...textStyles.h1,
            fontSize: 20,
            fontWeight: 600,
            color: "#2C384C"
          }}
        >
          {t("threshold.filter.heading")}
        </CustomText>
      </Box>

      {/* Body */}
      <Box sx={{ px: 2, mt: 2 }}>
        <Box
          sx={{
            backgroundColor: "#FFFFFF",
            px: 3,
            py: 3,
            borderRadius: "10px",
            height: "calc(100vh - 110px)",
            overflowY: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" }
          }}
        >
          {/* Status Filter */}
          <CustomText
            sx={{
              ...textStyles.h1,
              fontSize: 18,
              fontWeight: 500,
              color: "#2C384C",
              textAlign: "left",
              pt: 2
            }}
          >
            {t("threshold.filter.status")}
          </CustomText>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
            {statusOptions.map((opt) => {
              const isSelected = localFilters.status === opt.key;
              return (
                <Button
                  key={opt.key}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const newStatus = isSelected ? "" : opt.key;
                    setLocalFilters((prev) => ({
                      ...prev,
                      status: newStatus
                    }));
                  }}
                  sx={{
                    borderRadius: "6px",
                    fontSize: "15px",
                    fontFamily: "Poppins, sans-serif",
                    textTransform: "none",
                    py: 0.8,
                    px: 2,
                    color: isSelected ? "#006EC2" : "#363333",
                    border: isSelected
                      ? "2px solid #006EC2"
                      : "2px solid #091E4224",
                    backgroundColor: "transparent"
                  }}
                >
                  {opt.label}
                </Button>
              );
            })}
          </Box>

          {/* Account Executive Dropdown */}
         <Box sx={{ mt: 4 }}>
  <CustomText
    sx={{
      ...textStyles.h1,
      fontSize: 18,
      fontWeight: 500,
      color: "#2C384C",
      textAlign: "left",
    }}
  >
    {t("threshold.filter.executive")}
  </CustomText>

  {loadingExecs ? (
    <Box sx={{ mt: 3, textAlign: "center" }}>
      <CircularProgress size={24} />
    </Box>
  ) : (
    <SearchableDropdown
      value={localFilters.executiveId || ""}
      onChange={(val) => {
        const selectedExec = executives.find((ex) => ex.id === Number(val));
        setLocalFilters((prev) => ({
          ...prev,
          executiveId: val,
          executive: selectedExec?.full_name || "",
          executive_email: selectedExec?.email || "",
        }));
      }}
      options={executives.map((exec) => ({
        id: exec.id,
        name: `${exec.full_name} (${exec.email})`,
      }))}
      placeholder={t("threshold.filter.executivePlaceholder")}
      disabled={executives.length === 0}
    />
  )}
</Box>


          {/* Buttons */}
          <Box sx={{ mt: 5, display: "flex", flexWrap: "wrap", gap: 2 }}>
            <CustomButton
              onClick={apply}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {t("threshold.filter.apply")}
                </Box>
              }
              size="medium"
            />
            <Button
              variant="outlined"
              onClick={clear}
              sx={{
                fontSize: 15,
                textTransform: "none",
                borderRadius: "5px",
                fontFamily: "Poppins, sans-serif",
                color: "#006EC2",
                border: "2px solid #006EC2",
                px: 3,
                py: 1,
                height: "fit-content"
              }}
            >
              {t("threshold.filter.clear")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ThresholdFilterDrawer;
