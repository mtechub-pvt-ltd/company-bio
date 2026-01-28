// utils/formatHelpers.js

// Format numbers (1000 -> 1k, 1000000 -> 1M)
export const formatAmount = (amount) => {
  const num = Number(amount);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
  return num.toString();
};

// Get currency symbol from currency code
export const getCurrencySymbol = (currency) => {
  switch (currency) {
    case "USD": return "$";
    case "EUR": return "€";
    case "GBP": return "£";
    case "JPY": return "¥";
    default: return currency; // fallback if unknown
  }
};

export default { formatAmount, getCurrencySymbol };
