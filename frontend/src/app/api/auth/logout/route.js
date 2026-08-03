import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth";

async function logout(request) {
  await deleteSession();

  const url = new URL("/connexion", request.url);
  const reason = request.nextUrl.searchParams.get("reason");
  url.searchParams.set(
    "reason",
    reason === "session-expired" ? "session-expired" : "logged-out",
  );

  return NextResponse.redirect(url, 303);
}

export async function GET(request) {
  return logout(request);
}

export async function POST(request) {
  return logout(request);
}
