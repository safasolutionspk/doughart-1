import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  clearAuthCookies(response);
  return response;
}
