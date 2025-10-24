/* filepath: /home/skinny-ke/Desktop/BEN-MARKET/lib/adminAuth.ts */
/*
  Server-side helper for admin checks using Clerk.
  Adjust to match your Clerk setup and which user metadata you use to mark admins.
*/
import { getAuth, clerkClient } from "@clerk/nextjs/server";

export async function requireAdmin(request) {
  // getAuth works in Next.js server handlers; in pages/api pass (req) and read cookies
  const auth = getAuth(request);
  const userId = auth.userId;
  if (!userId) {
    return { ok: false, status: 401, message: "Not authenticated" };
  }
  try {
    const user = await clerkClient.users.getUser(userId);
    // Customize this check to how you mark admins (publicMetadata.role, isAdmin, org membership, etc.)
    const meta = user?.publicMetadata || {};
    const isAdmin = meta.role === "admin" || meta.isAdmin === true || meta.admin === true;
    if (!isAdmin) return { ok: false, status: 403, message: "Admin required" };
    return { ok: true, user };
  } catch (err) {
    return { ok: false, status: 500, message: "Clerk lookup failed" };
  }
}
