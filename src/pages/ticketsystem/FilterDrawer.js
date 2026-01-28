




import React, { useState, useEffect } from "react";
import { Box, Grid, Modal, OutlinedInput, Button } from "@mui/material";
import { Cancel } from "@mui/icons-material";
import TypographyMD from "../../components/items/Typography";
import MultiSelectDropdown from "../../components/MultiSelectionDropdown";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import url from "../../url";

function FilterModal({ open, onClose, initial = {}, onApply }) {
  const [filters, setFilters] = useState({
    statuses: initial.statuses ?? [],
    priorities: initial.priorities ?? [],
    categories: initial.categories ?? [],
    startDate: initial.startDate ?? "",
    endDate: initial.endDate ?? "",
  });

  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth);

  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingPrio, setLoadingPrio] = useState(false);

  useEffect(() => {
    setFilters({
      statuses: initial.statuses ?? [],
      priorities: initial.priorities ?? [],
      categories: initial.categories ?? [],
      startDate: initial.startDate ?? "",
      endDate: initial.endDate ?? "",
    });
  }, [initial]);

  const fetchData = async (endpoint, setter, setLoading) => {
    try {
      setLoading(true);
      const res = await fetch(`${url}/tickets/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.error) setter(json.data[endpoint] || []);
    } catch {
      toast.error(`Failed to load ${endpoint}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData("statuses", setStatuses, setLoadingStatus);
      fetchData("categories", setCategories, setLoadingCats);
      fetchData("priorities", setPriorities, setLoadingPrio);
    }
  }, [open]);

  const setField = (k, v) => setFilters((prev) => ({ ...prev, [k]: v }));
  const resetAll = () =>
    setFilters({ statuses: [], priorities: [], categories: [], startDate: "", endDate: "" });

  const saveAndClose = () => {
    onApply?.(filters);
    onClose?.();
  };

  const modalStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100vh",
    bgcolor: "#E7EBEE",
    outline: "none",
    boxShadow: 0,
    display: "flex",
    flexDirection: "column",
    width: { xs: "100vw", sm: 400, md: 450, lg: 450, xl: 450 },
    maxWidth: { xs: "100vw", sm: "90vw" },
    p: { xs: 0.5, sm: 1 },
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ ...modalStyle }}>
        {/* Header */}
        <Grid container spacing={0} pb={0} py={1}>
          <Grid xs={1} align="left">
            <Cancel onClick={onClose} sx={{ cursor: "pointer", color: "#F22727" }} />
          </Grid>
          <Grid xs={11} align="left">
            <TypographyMD
              variant="paragraph"
              label={t("filterDrawerTickets.title")}
              color="#2C384C"
              fontSize="17px"
              fontWeight={650}
              align="left"
            />
          </Grid>
        </Grid>

        {/* Body */}
        <Box
          sx={{
            mt: 1,
            p: { xs: 1, sm: 2 },
            bgcolor: "white",
            flex: 1,
            overflowY: "auto",
            borderRadius: { xs: 0, sm: 1 },
            mx: { xs: 0.5, sm: 0 },
          }}
        >
          <Box mb={2}>
            <MultiSelectDropdown
              label={t("filterDrawerTickets.status")}
              name="statuses"
              values={filters.statuses}
              onChange={(e) => setField("statuses", e.target.value)}
              options={statuses}
              placeholder={loadingStatus ? t("Loading...") : t("Select")}
              disabled={loadingStatus}
            />
          </Box>

          <Box mb={2}>
            <MultiSelectDropdown
              label={t("filterDrawerTickets.categoryLabel")}
              name="categories"
              values={filters.categories}
              onChange={(e) => setField("categories", e.target.value)}
              options={categories}
              placeholder={loadingCats ? t("Loading...") : t("Select")}
              disabled={loadingCats}
            />
          </Box>

          <Box mb={2}>
            <MultiSelectDropdown
              label={t("filterDrawerTickets.priority")}
              name="priorities"
              values={filters.priorities}
              onChange={(e) => setField("priorities", e.target.value)}
              options={priorities}
              placeholder={loadingPrio ? t("Loading...") : t("Select")}
              disabled={loadingPrio}
            />
          </Box>

          {/* Date Range */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: { xs: 1, sm: 2 },
            }}
          >
            <Box>
              <label
                style={{ fontSize: { xs: "13px", sm: "15px" }, fontWeight: 400, color: "rgb(107, 119, 140)" }}
              >
                {t("filterDrawerTickets.startDate")}
              </label>
              <OutlinedInput
                type="date"
                value={filters.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                sx={{
                  width: "100%",
                  height: "38px",
                  borderRadius: "6px",
                  border: "2px solid rgba(9, 30, 66, 0.14)",
                  backgroundColor: "#fff",
                  fontSize: 14,
                  "&:hover": { borderColor: "#006EC2" },
                  "&.Mui-focused": { borderColor: "#006EC2" },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  padding: "0 12px",
                }}
              />
            </Box>

            <Box>
              <label
                style={{ fontSize: { xs: "13px", sm: "15px" }, fontWeight: 400, color: "rgb(107, 119, 140)" }}
              >
                {t("filterDrawerTickets.endDate")}
              </label>
              <OutlinedInput
                type="date"
                value={filters.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
                sx={{
                  width: "100%",
                  height: "38px",
                  borderRadius: "6px",
                  border: "2px solid rgba(9, 30, 66, 0.14)",
                  backgroundColor: "#fff",
                  fontSize: 14,
                  "&:hover": { borderColor: "#006EC2" },
                  "&.Mui-focused": { borderColor: "#006EC2" },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  padding: "0 12px",
                }}
              />
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ 
            display: "flex", 
            gap: { xs: 0.5, sm: 1 }, 
            mt: 3,
            flexDirection: { xs: "column", sm: "row" }
          }}>
            <Button
              variant="contained"
              onClick={saveAndClose}
              sx={{ 
                textTransform: "none",
                fontSize: { xs: "12px", sm: "14px" },
                py: { xs: 1, sm: 1.5 },
                width: { xs: "100%", sm: "auto" }
              }}
            >
              {t("filterDrawerTickets.save")}
            </Button>
            <Button
              variant="outlined"
              onClick={resetAll}
              sx={{
                textTransform: "none",
                border: "2px solid #006EC2",
                color: "#006EC2",
                fontSize: { xs: "12px", sm: "14px" },
                py: { xs: 1, sm: 1.5 },
                width: { xs: "100%", sm: "auto" }
              }}
            >
              {t("filterDrawerTickets.clear")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default FilterModal;
