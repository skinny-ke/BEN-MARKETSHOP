/* filepath: /home/skinny-ke/Desktop/BEN-MARKET/pages/admin/analytics.js */
import dynamic from "next/dynamic";
const AdminAnalyticsClient = dynamic(() => import("../../components/admin/AdminAnalyticsClient"), { ssr: false });

export default function Page() {
  return <AdminAnalyticsClient />;
}
