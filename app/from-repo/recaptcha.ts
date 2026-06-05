// Self-contained verify helper for /from-repo. Mirrors the real app's
// checkRecaptchaToken → backend POST v3/auth/recaptcha/verify → { score }.
// The actual Google call (with the secret) happens server-side in
// app/v3/auth/recaptcha/verify/route.ts.
export async function checkRecaptchaToken(token: string): Promise<number> {
  const res = await fetch("/v3/auth/recaptcha/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, variant: "siteverify", action: "login" }),
  });

  if (!res.ok) {
    throw new Error(`recaptcha verify failed: ${res.status}`);
  }

  const { score } = (await res.json()) as { score: number | null };
  if (typeof score !== "number") {
    throw new Error("No score returned from backend");
  }
  return score;
}
