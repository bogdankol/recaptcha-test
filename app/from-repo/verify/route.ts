import { NextResponse } from "next/server";
import { recaptchaSecretForV2Hard } from "../config";

// Server-side verify for the /from-repo v2 key (siteverify needs the secret).
// NOTE: reCAPTCHA v2 returns only `success` (pass/fail) — there is no numeric
// score (that's v3/Enterprise). `score` is forwarded if present, else null.
export async function POST(request: Request) {
  const { token } = (await request.json()) as { token?: string };

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
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
    score?: number;
    "error-codes"?: string[];
  };

  return NextResponse.json({
    success: data.success ?? false,
    score: data.score ?? null,
    errorCodes: data["error-codes"] ?? [],
  });
}
