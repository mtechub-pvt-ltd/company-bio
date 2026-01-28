import { FormControl } from "@mui/material";
import SelectField from "./items/Selectfield";
import { useTranslation } from "react-i18next";

const StatusFilter = ({
  value = "all",
  onChange,
  executive,
  minWidth = 140,
  size = "small",
  options = [
    // default fallback options
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ],
}) => {
  const { t } = useTranslation();  

  const translatedOptions = options.map((opt) => ({
    ...opt,
    label: t(opt.label),
  }));

  return (
    <FormControl size={size} sx={{ minWidth: executive ? "100%" : minWidth }}>
      <SelectField
      sx={{height:'35px !important'}}
        filter={true}
        value={value}
        onChangeTerm={onChange}
        options={translatedOptions}
      />
    </FormControl>
  );
};

export default StatusFilter;
