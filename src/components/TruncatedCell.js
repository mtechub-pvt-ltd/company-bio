import { Tooltip, Typography } from "@mui/material";

const TruncatedCell = ({ text, maxLength = 15 ,sx = {}}) => {
  if (!text) text = "-";

  const displayText =
    text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  return (
    <Tooltip title={text} arrow>
      <Typography
        sx={{
          maxWidth: 150, // adjust width as needed
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          cursor: "pointer",
          fontSize: "13px",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 400,
          color: "#172B4D",
                 ...sx,
        }}
      >
        {displayText}
      </Typography>
    </Tooltip>
  );
};

export default TruncatedCell;
