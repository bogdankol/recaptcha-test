// Type declarations for the Google reCAPTCHA browser API (`grecaptcha`),
// loaded at runtime via https://www.google.com/recaptcha/api.js.

interface ReCaptchaRenderParams {
  sitekey: string;
  theme?: "light" | "dark";
  size?: "normal" | "compact";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

interface ReCaptcha {
  /** Run a callback once the API is fully loaded and ready. */
  ready: (callback: () => void) => void;
  /** Explicitly render a v2 widget into a container, returning its widget id. */
  render: (
    container: HTMLElement | string,
    params: ReCaptchaRenderParams,
  ) => number;
  /** Reset a v2 widget so it can be solved again. */
  reset: (widgetId?: number) => void;
  /** Read the response token of a solved v2 widget. */
  getResponse: (widgetId?: number) => string;
  /** Execute a v3 challenge for the given action, resolving to a token. */
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

interface Window {
  grecaptcha?: ReCaptcha;
}
