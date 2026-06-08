import { NextResponse } from "next/server";
import { recaptchaSecretForV2Hard } from "../config";

// Server-side verification for the /from-repo v2 reCAPTCHA token. The secret
// can't ship to the client, so the checkbox token is POSTed here and checked
// against Google's siteverify. v2 returns only pass/fail (no numeric score).
export async function POST(request: Request) {
  const { token } = (await request.json()) as { token?: string };

  if (!token) {
    return NextResponse.json({ verified: false, errorCodes: ["missing-token"] }, { status: 400 });
  }

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: recaptchaSecretForV2Hard,
      response: token,
    }),
  });

  const data = (await res.json()) as {
    success: boolean;
    "error-codes"?: string[];
  };

  return NextResponse.json({
    verified: data.success ?? false,
    errorCodes: data["error-codes"] ?? [],
  });
}
