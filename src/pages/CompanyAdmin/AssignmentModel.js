import React, { useEffect, useState } from "react";
import { Box, Stack, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import ModalConfirmation from "../../components/items/ModalConfirmation";
import TypographyMD from "../../components/items/Typography";
import ButtonMD from "../../components/items/ButtonMD";
import SearchableDropdown from "../../components/SearchableCountryDropdown";
import url from "../../url";

const AssignmentModal = ({ open, onClose, data,onSuccess }) => {
  const { t, i18n } = useTranslation();
  const { token } = useSelector((state) => state.auth);

  const [accountExecutives, setAccountExecutives] = useState([]);
  const [selectedExecutive, setSelectedExecutive] = useState("");
  const [saving, setSaving] = useState(false);

  /* ================= FETCH EXECUTIVES ================= */
  const getAllExecutives = async () => {
    try {
      const res = await fetch(
        `${url}super-admin/public/account-executives?no_pagination=true`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();
      setAccountExecutives(json?.data?.account_executives || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (open) {
      setSelectedExecutive("");
      setSaving(false);
      getAllExecutives();
    }
  }, [open]);

  /* ================= SAVE ASSIGNMENT ================= */
  const handleSave = async () => {
    if (!selectedExecutive || !data?.id) return;

    setSaving(true);

    try {
      const res = await fetch(
        `${url}company-admins/${data.id}/account-executive-with-commissions`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account_executive_id: selectedExecutive,
          }),
        }
      );

      const json = await res.json();

      if (!json.error) {
        const msg =
          i18n.language === "es"
            ? json.message_es
            : json.message_en;

        toast.success(msg);


        setTimeout(() => {
          setSaving(false);
          onClose();
        }, 1000);

        if (onSuccess) {
  onSuccess();
}
      } else {
        toast.error(json.message || "Something went wrong");
        setSaving(false);
      }
    } catch (err) {
      toast.error("Something went wrong");
      setSaving(false);
    }
  };
const isSaveDisabled = !selectedExecutive;
  return (
    <ModalConfirmation
      open={open}
      onClose={onClose}
      title={t("changeAssignment")}
      /* 🔴 IMPORTANT: ModalConfirmation must NOT manage loading */
      data={
        <Stack spacing={2} p={2}>
          <TypographyMD
            variant="paragraph"
            label={t("Account Executive Association")}
            color="#626F86"
            fontSize="14px"
            fontWeight={450}
            align="left"
          />

          <SearchableDropdown
            value={selectedExecutive}
            onChange={setSelectedExecutive}
            options={accountExecutives
              .sort((a, b) =>
                (a.full_name || "").localeCompare(b.full_name || "")
              )
              .map((exec) => ({
                id: exec.id,
                name: `${exec.full_name} (${exec.email})`,
              }))}
            placeholder="searchAccountExecutive"
          />

          {selectedExecutive && (
            <Box>
              <Chip
                label={
                  accountExecutives.find((e) => e.id === selectedExecutive)
                    ?.full_name
                }
                onDelete={() => setSelectedExecutive("")}
                sx={{
                  backgroundColor: "#E9F3FF",
                  color: "#006EC2",
                  fontWeight: 500,
                  borderRadius: 1,
                }}
              />
            </Box>
          )}

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <ButtonMD
              variant="outlined"
              title={t("Cancel")}
              onClickTerm={onClose}
            />

   <Box
  sx={{
    pointerEvents: isSaveDisabled ? "none" : "auto",
    opacity: isSaveDisabled ? 0.6 : 1,
  }}
>
<ButtonMD
  variant="contained"
  title={t("Save")}
    disabled={saving }       // loader ONLY when saving
  onClickTerm={handleSave}
/>
</Box>
          </Stack>
        </Stack>
      }
    />
  );
};

export default AssignmentModal;
