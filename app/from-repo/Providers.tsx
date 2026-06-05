"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { recaptchaKey } from "./config";

// Self-contained v3 provider for /from-repo, mirroring the real app's
// _app.tsx provider (<GoogleReCaptchaProvider reCaptchaKey useRecaptchaNet>).
// A distinct script id keeps it independent from the global provider.
export function FromRepoProvider({ children }: { children: React.ReactNode }) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaKey}
      useRecaptchaNet
      scriptProps={{ id: "recaptcha-from-repo" }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
