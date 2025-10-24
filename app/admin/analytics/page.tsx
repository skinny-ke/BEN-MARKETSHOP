/* filepath: /home/skinny-ke/Desktop/BEN-MARKET/app/admin/analytics/page.tsx */
import dynamic from "next/dynamic";
const AdminAnalyticsClient = dynamic(() => import("../../../components/admin/AdminAnalyticsClient"), { ssr: false });

export default function Page() {
  return <AdminAnalyticsClient />;
}
