import { NextResponse } from "next/server";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { recaptchaKey, recaptchaSecretKey, recaptchaProjectId } from "@/etc/config";

// Backend score verification, at the same path the real app uses
// (v3/auth/recaptcha/verify). Runs server-side, so there is no CORS and the
// secret / credentials never reach the browser. Supports two variants:
//   "siteverify"  → classic v3 siteverify (secret key, no projectId)
//   "assessment"  → Enterprise Assessment API via @google-cloud/recaptcha-enterprise
//                   (needs a service account — see note below).
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

  try {
    const score =
      variant === "assessment"
        ? await createAssessment(token, action)
        : await siteverify(token);
    return NextResponse.json({ score });
  } catch (e) {
    console.error(`${variant} verification error:`, e);
    return NextResponse.json({ score: null });
  }
}

// WITHOUT projectId — classic siteverify (secret key + token).
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

// WITH projectId — Enterprise Assessment via the official Node library.
// Authenticates via Application Default Credentials: set GOOGLE_APPLICATION_CREDENTIALS
// to a service-account JSON whose account has the reCAPTCHA Enterprise Agent role.
// The client is cached across requests (per Google's recommendation).
let recaptchaClient: RecaptchaEnterpriseServiceClient | null = null;
function getClient() {
  if (!recaptchaClient) {
    recaptchaClient = new RecaptchaEnterpriseServiceClient();
  }
  return recaptchaClient;
}

async function createAssessment(
  token: string,
  recaptchaAction: string
): Promise<number | null> {
  const client = getClient();
  const projectPath = client.projectPath(recaptchaProjectId);

  const [response] = await client.createAssessment({
    assessment: { event: { token, siteKey: recaptchaKey } },
    parent: projectPath,
  });

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
