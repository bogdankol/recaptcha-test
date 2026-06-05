import { apiClient } from "@/app/lib/apiClient";

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

// Thin helper the hook consumes: returns just the numeric score.
export async function checkRecaptchaToken(token: string): Promise<number> {
  const { score } = await validRecaptchaToken(token);
  return score;
}
