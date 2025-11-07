import express from "express";
import User from "../Models/User.js";
import { Webhook } from "svix";

const router = express.Router();

router.post("/webhook", express.raw({ type: "*/*" }), async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error("❌ Missing Clerk Webhook Secret in environment variables.");
    return res.status(500).json({ success: false, message: "Server misconfigured" });
  }

  try {
    const payload = req.body.toString("utf8");
    const headers = req.headers;

    const wh = new Webhook(secret);
    const evt = wh.verify(payload, headers);

    console.log(`📨 Clerk event received: ${evt.type}`);

    const data = evt.data;
    if (!data) {
      console.warn("⚠️ No data found in Clerk event.");
      return res.status(400).json({ success: false, message: "No data in event" });
    }

    switch (evt.type) {
      case "user.created": {
        const email = data.email_addresses?.[0]?.email_address;
        if (!email) break;

        const isAdmin = ["bensonmmaina89@gmail.com"].includes(email);
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
          const newUser = new User({
            name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            email,
            image: data.image_url,
            clerkId: data.id,
            role: isAdmin ? "admin" : "user",
          });
          await newUser.save();
          console.log(`✅ Created ${isAdmin ? "admin" : "user"}: ${email}`);
        } else {
          console.log(`ℹ️ User ${email} already exists`);
        }
        break;
      }

      case "user.updated": {
        const email = data.email_addresses?.[0]?.email_address;
        if (!email) break;

        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            email,
            image: data.image_url,
          },
          { new: true }
        );
        console.log(`🔄 Updated user: ${email}`);
        break;
      }

      case "user.deleted": {
        await User.findOneAndDelete({ clerkId: data.id });
        console.log(`🗑 Deleted user with Clerk ID: ${data.id}`);
        break;
      }

      default:
        console.log(`⚙️ Unhandled Clerk event: ${evt.type}`);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Clerk webhook error:", err.message);
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }
});

export default router;
