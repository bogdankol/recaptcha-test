// All reCAPTCHA keys, hardcoded for this demo (no env indirection).
// Mirrors the real app's etc/config.ts shape: recaptchaKey (v3) and
// recaptchaKeyForV2 (v2). The secret normally lives on the backend; here the
// "backend" is a local Next route handler, so it's kept alongside.

// reCAPTCHA v3 (invisible, score-based) — resource "testKeyV3".
// Used by the global provider.
export const recaptchaKey = "6LdFZA4tAAAAAFH26HtSIjG7SkvFE5PebD-F9m8Z";

// v3 secret — would be used by a backend to call siteverify and read the real
// score. UNUSED in this client-only demo (scoring is simulated; see
// app/lib/apiClient.ts). Kept here for reference.
export const recaptchaSecretKey = "6LdFZA4tAAAAAGa4mB_XksStrzM1geX-3XmH0UiN";

// reCAPTCHA v2 ("I'm not a robot" checkbox) — shown as a fallback when the
// v3 score is suspicious.
export const recaptchaKeyForV2 = "6Ldv2QwtAAAAACPW15qWL0-ypdxX5aTuUMu7JkZW";
