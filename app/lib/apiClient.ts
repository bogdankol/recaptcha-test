// Client-side stand-in for the app's real API client.
//
// IMPORTANT: this is fully client-side — no server, no network. A real
// reCAPTCHA v3 score CANNOT be obtained in the browser: it requires the secret
// key server-side and Google's siteverify endpoint blocks cross-origin browser
// requests. So `post` SIMULATES the backend response. Swap this for the real
// api client (which hits your backend) in production.
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
      // Random score in [0, 1] so both the OK and suspicious paths are reachable.
      return { score: Math.round(Math.random() * 10) / 10 };
    }

    throw new Error(`Unhandled request: ${requestURL}`);
  },
};
