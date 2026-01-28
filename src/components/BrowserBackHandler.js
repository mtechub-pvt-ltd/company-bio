// components/BrowserBackHandler.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Reusable browser back handler
 * Works same as navigate(-1)
 *
 * Props:
 * - enabled (boolean) → turn on/off
 * - fallback (string) → route to go if history is empty (optional)
 */
const BrowserBackHandler = ({ enabled = true, fallback = "/" }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    const handleBack = () => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(fallback);
      }
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, [enabled, fallback, navigate]);

  return null;
};

export default BrowserBackHandler;
