import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VendorTable from "../components/VendorTable";
import { getVendorRiskScores } from "../services/api";

export default function RiskAnalytics() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getVendorRiskScores();
        setVendors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load vendor risk scores:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInvestigate = (vendor) => {
    navigate("/investigation", { state: { vendor } });
  };

  if (loading) {
    return (
      <div className="rounded-3xl bg-white/70 p-6 shadow-xl dark:bg-slate-900/70">
        Loading vendor risk data...
      </div>
    );
  }

  return <VendorTable vendors={vendors} onInvestigate={handleInvestigate} />;
}
