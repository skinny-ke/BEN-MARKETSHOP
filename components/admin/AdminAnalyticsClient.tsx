/* filepath: /home/skinny-ke/Desktop/BEN-MARKET/components/admin/AdminAnalyticsClient.tsx */
"use client";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminAnalyticsClient() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/analytics", { credentials: "same-origin" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch analytics");
        return r.json();
      })
      .then((d) => {
        if (!mounted) return;
        setChartData(d.chart);
      })
      .catch((e) => setError(e.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div>Loading analytics…</div>;
  if (error) return <div>Error loading analytics: {error}</div>;
  if (!chartData) return <div>No analytics data</div>;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 20 }}>
      <h2>Products — Sales (Admin)</h2>
      <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
    </div>
  );
}
