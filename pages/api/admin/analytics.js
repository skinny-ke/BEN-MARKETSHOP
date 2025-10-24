/* filepath: /home/skinny-ke/Desktop/BEN-MARKET/pages/api/admin/analytics.js */
import { requireAdmin } from "../../../lib/adminAuth";

export default async function handler(req, res) {
  const adm = await requireAdmin(req);
  if (!adm.ok) return res.status(adm.status).json({ ok: false, message: adm.message });

  // TODO: replace below with real DB aggregation
  const chart = {
    labels: ["Product A", "Product B", "Product C", "Product D"],
    datasets: [
      {
        label: "Units sold",
        backgroundColor: ["#3b82f6", "#f97316", "#ef4444", "#10b981"],
        data: [120, 90, 60, 30],
      },
    ],
  };

  res.status(200).json({ ok: true, chart });
}
