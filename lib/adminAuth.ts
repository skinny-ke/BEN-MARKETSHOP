/* filepath: /lib/adminAuth.ts */

import { getAuth, clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect"; // ensure you have a DB connection util
import User from "@/models/User"; // your Mongo User model

/**
 * Checks if the current user is authenticated and an admin.
 * Supports both Clerk metadata and MongoDB fallback.
 */
export async function requireAdmin(request: Request) {
  try {
    // Get Clerk authentication context
    const { userId } = getAuth(request);
    if (!userId) {
      return { ok: false, status: 401, message: "Not authenticated" };
    }

    // Fetch the user details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    const meta = clerkUser?.publicMetadata || {};

    // 1️⃣ Check Clerk metadata for admin role
    let isAdmin =
      meta.role === "admin" ||
      meta.isAdmin === true ||
      meta.admin === true;

    // 2️⃣ If not admin, check MongoDB
    if (!isAdmin) {
      await dbConnect();
      const dbUser = await User.findOne({ clerkId: userId });
      if (dbUser && dbUser.role === "admin") {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      return { ok: false, status: 403, message: "Admin access required" };
    }

    // ✅ Success: return both Clerk and Mongo data
    return { ok: true, user: { clerkUser, isAdmin, userId } };
  } catch (error: any) {
    console.error("❌ requireAdmin error:", error);
    return { ok: false, status: 500, message: "Internal server error" };
  }
}
/* filepath: /lib/adminAuth.ts */

import { getAuth, clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect"; // ensure you have a DB connection util
import User from "@/models/User"; // your Mongo User model

/**
 * Checks if the current user is authenticated and an admin.
 * Supports both Clerk metadata and MongoDB fallback.
 */
export async function requireAdmin(request: Request) {
  try {
    // Get Clerk authentication context
    const { userId } = getAuth(request);
    if (!userId) {
      return { ok: false, status: 401, message: "Not authenticated" };
    }

    // Fetch the user details from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    const meta = clerkUser?.publicMetadata || {};

    // 1️⃣ Check Clerk metadata for admin role
    let isAdmin =
      meta.role === "admin" ||
      meta.isAdmin === true ||
      meta.admin === true;

    // 2️⃣ If not admin, check MongoDB
    if (!isAdmin) {
      await dbConnect();
      const dbUser = await User.findOne({ clerkId: userId });
      if (dbUser && dbUser.role === "admin") {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      return { ok: false, status: 403, message: "Admin access required" };
    }

    // ✅ Success: return both Clerk and Mongo data
    return { ok: true, user: { clerkUser, isAdmin, userId } };
  } catch (error: any) {
    console.error("❌ requireAdmin error:", error);
    return { ok: false, status: 500, message: "Internal server error" };
  }
}
