"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { recaptchaKey } from "@/etc/config";

// Global reCAPTCHA v3 provider, mirroring the real app's single provider in
// pages/_app.tsx. Wraps the whole app so any page/component can call
// executeRecaptcha (via useRecaptchaScore).
export function Providers({ children }: { children: React.ReactNode }) {
  // No v3 key configured — render without the provider so the rest of the app
  // still works (the v3 score flow simply stays inactive).
  if (!recaptchaKey) {
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey} useRecaptchaNet>
      {children}
    </GoogleReCaptchaProvider>
  );
}
