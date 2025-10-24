/* filepath: /home/skinny-ke/Desktop/BEN-MARKET/app/api/admin/analytics/route.ts */
import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/adminAuth";

export async function GET(request: Request) {
  const adm = await requireAdmin(request);
  if (!adm.ok) return NextResponse.json({ ok: false, message: adm.message }, { status: adm.status });

  // TODO: replace below with real DB aggregation (Prisma/SQL/etc.)
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

  return NextResponse.json({ ok: true, chart });
}
