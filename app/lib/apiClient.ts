// Minimal stand-in for the app's real API client.
//
// With no backend in this demo, `post` SIMULATES the server response instead
// of making a network call. Swap this module for the real api client in
// production — the call sites (e.g. validRecaptchaToken) stay unchanged.
type PostArgs = {
  requestURL: string;
  payload: Record<string, unknown>;
};

export const apiClient = {
  async post({ requestURL, payload }: PostArgs): Promise<unknown> {
    // Simulate network latency.
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (requestURL === "v3/auth/recaptcha/verify") {
      if (!payload.token) {
        throw new Error("Missing reCAPTCHA token");
      }
      // A real backend verifies the token with Google and returns its score.
      // Here we return a random score in [0, 1] so both the "OK" and
      // "Risky (< 0.4)" paths are reachable.
      return { score: Math.round(Math.random() * 10) / 10 };
    }

    throw new Error(`Unhandled request: ${requestURL}`);
  },
};
