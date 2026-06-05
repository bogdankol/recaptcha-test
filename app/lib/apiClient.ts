// Minimal API client: POSTs a JSON payload to a same-origin route handler,
// mirroring the real app's apiClient. requestURL is relative
// (e.g. "v3/auth/recaptcha/verify") so the call is same-origin → no CORS.
type PostArgs = {
  requestURL: string;
  payload: Record<string, unknown>;
};

export const apiClient = {
  async post({ requestURL, payload }: PostArgs): Promise<unknown> {
    const res = await fetch(`/${requestURL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Request to ${requestURL} failed: ${res.status}`);
    }

    return res.json();
  },
};
