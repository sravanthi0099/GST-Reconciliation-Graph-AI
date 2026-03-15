import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import InvestigationPanel from "../components/InvestigationPanel";
import { getVendorRiskScores } from "../services/api";

export default function Investigation() {
  const location = useLocation();
  const [vendor, setVendor] = useState(location.state?.vendor || null);

  useEffect(() => {
    if (location.state?.vendor) {
      setVendor(location.state.vendor);
    }
  }, [location.state]);

  useEffect(() => {
    const loadFallbackVendor = async () => {
      if (vendor) return;
      try {
        const data = await getVendorRiskScores();
        if (Array.isArray(data) && data.length > 0) {
          setVendor(data[0]);
        }
      } catch (error) {
        console.error("Failed to load fallback investigation vendor:", error);
      }
    };

    loadFallbackVendor();
  }, [vendor]);

  return <InvestigationPanel vendor={vendor} />;
}
