// app/api/contact/route.js
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/db";
import User from "@/models/userModel"; // ✅ your user model

export async function POST(req) {
  try {
    await connectDB();

    const { topic, description, userId } = await req.json();

    if (!topic || !description || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ✅ Fetch user details
    const user = await User.findOne({ clerkId: userId }); // or _id if you store differently
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // or SMTP details
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Email to Admin
    // console.log
    await transporter.sendMail({
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // Admin email
      subject: `New Contact Issue: ${topic}`,
      html: `
        <h2>New Issue Reported</h2>
        <p><strong>User:</strong> ${user.name} (${user.email})</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <p><strong>Description:</strong></p>
        <p>${description}</p>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error in /api/contact:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
