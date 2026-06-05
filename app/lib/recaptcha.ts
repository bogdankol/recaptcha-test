import { apiClient } from "@/app/lib/apiClient";

type Variant = "siteverify" | "assessment";

// Posts a token to the backend verify route and returns the score. The actual
// Google call (with the secret / API key) happens server-side in
// app/v3/auth/recaptcha/verify/route.ts.
// variant: "siteverify" (no projectId) | "assessment" (with projectId).
const validRecaptchaToken = async (
  token: string,
  variant?: Variant,
  action?: string
): Promise<{ score: number | null }> => {
  return apiClient.post({
    requestURL: "v3/auth/recaptcha/verify",
    payload: { token, variant, action },
  }) as Promise<{ score: number | null }>;
};

// Entry point the score hook consumes. Throws if the backend couldn't score the
// token (so useRecaptchaScore retries / falls back).
export async function checkRecaptchaToken(token: string): Promise<number> {
  const { score } = await validRecaptchaToken(token);
  if (typeof score !== "number") {
    throw new Error("No score returned from backend");
  }
  return score;
}

// Used by the two demo buttons — both verify through the backend (no CORS).
export async function verifyViaBackend(
  token: string,
  variant: Variant,
  action: string
): Promise<number | null> {
  const { score } = await validRecaptchaToken(token, variant, action);
  return score;
}
