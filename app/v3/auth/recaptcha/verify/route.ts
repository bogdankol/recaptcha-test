import { NextResponse } from "next/server";
import {
  recaptchaKey,
  recaptchaSecretKey,
  recaptchaProjectId,
  recaptchaApiKey,
} from "@/etc/config";

// Backend score verification, at the same path the real app uses
// (v3/auth/recaptcha/verify). Runs server-side, so there is no CORS and the
// secret / API key never reach the browser. Supports two variants:
//   "siteverify"  → classic v3 siteverify (secret key, no projectId)
//   "assessment"  → Enterprise Assessment API (projectId + API key)
export async function POST(request: Request) {
  const {
    token,
    variant = "siteverify",
    action = "login",
  } = (await request.json()) as {
    token?: string;
    variant?: "siteverify" | "assessment";
    action?: string;
  };

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const score =
    variant === "assessment"
      ? await createAssessment(token, action)
      : await siteverify(token);

  return NextResponse.json({ score });
}

// WITHOUT projectId — classic siteverify.
async function siteverify(token: string): Promise<number | null> {
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: recaptchaSecretKey, response: token }),
  });

  const data = (await res.json()) as {
    success: boolean;
    score?: number;
    "error-codes"?: string[];
  };

  if (!data.success) {
    console.log("siteverify failed:", data["error-codes"]);
    return null;
  }
  return data.score ?? null;
}

// WITH projectId — Enterprise Assessment REST API (translated from Google's
// createAssessment Node sample; the Node-only gRPC client pieces are dropped).
async function createAssessment(
  token: string,
  recaptchaAction: string
): Promise<number | null> {
  const res = await fetch(
    `https://recaptchaenterprise.googleapis.com/v1/projects/${recaptchaProjectId}/assessments?key=${recaptchaApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: { token, siteKey: recaptchaKey } }),
    }
  );

  const response = (await res.json()) as {
    tokenProperties?: { valid?: boolean; action?: string; invalidReason?: string };
    riskAnalysis?: { score?: number; reasons?: string[] };
  };

  if (!response.tokenProperties?.valid) {
    console.log(
      `The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`
    );
    return null;
  }

  if (response.tokenProperties.action === recaptchaAction) {
    console.log(`The reCAPTCHA score is: ${response.riskAnalysis?.score}`);
    response.riskAnalysis?.reasons?.forEach((reason) => console.log(reason));
    return response.riskAnalysis?.score ?? null;
  }

  console.log(
    "The action attribute in your reCAPTCHA tag does not match the action you are expecting to score"
  );
  return null;
}
