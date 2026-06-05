import { apiClient } from "@/app/lib/apiClient";
import {
  recaptchaKey,
  recaptchaSecretKey,
  recaptchaProjectId,
  recaptchaApiKey,
} from "@/etc/config";

// API call that exchanges a reCAPTCHA v3 token for a risk score, matching the
// real backend method. In production this hits `v3/auth/recaptcha/verify`;
// here it resolves against the simulated apiClient (see app/lib/apiClient.ts).
const validRecaptchaToken = async (token: string): Promise<{ score: number }> => {
  return apiClient.post({
    requestURL: "v3/auth/recaptcha/verify",
    payload: {
      token,
    },
  }) as Promise<{ score: number }>;
};

// Thin helper the hook consumes: returns just the numeric (simulated) score.
export async function checkRecaptchaToken(token: string): Promise<number> {
  const { score } = await validRecaptchaToken(token);
  return score;
}

// ── Real verification, two variants (both client-side; both likely blocked by
// CORS in the browser — real verification belongs on a backend) ──────────────

// WITHOUT projectId: classic v3 siteverify, using the secret key + token.
export async function verifyWithSiteverify(token: string): Promise<number | null> {
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
  console.log(`siteverify score: ${data.score}`);
  return data.score ?? null;
}

// WITH projectId: Enterprise Assessment REST API. Browser-callable translation
// of Google's createAssessment Node sample — the Node-only pieces (the gRPC
// client, projectPath, client.close) are dropped; the assessment logic stays.
export async function createAssessment({
  token,
  recaptchaAction,
}: {
  token: string;
  recaptchaAction: string;
}): Promise<number | null> {
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

  // Check if the token is valid.
  if (!response.tokenProperties?.valid) {
    console.log(
      `The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`
    );
    return null;
  }

  // Check if the expected action was executed.
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
