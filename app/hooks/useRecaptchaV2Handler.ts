"use client";

import { useEffect, useRef, useState } from "react";
import type ReCAPTCHA from "react-google-recaptcha";

// Shows the visible reCAPTCHA v2 ("I'm not a robot") checkbox as a fallback
// when the invisible v3 score is suspicious — mirroring the real app's
// useRecaptchaV2Handler. The form is considered verified when either the v3
// score is fine, or the v2 challenge has been solved.
export function useRecaptchaV2Handler(isSuspiciousScore: boolean) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [showV2Captcha, setShowV2Captcha] = useState(false);
  const [v2Token, setV2Token] = useState<string | null>(null);

  // Reveal the v2 fallback once the v3 score comes back suspicious.
  useEffect(() => {
    if (isSuspiciousScore) {
      setShowV2Captcha(true);
    }
  }, [isSuspiciousScore]);

  const handleV2Change = (token: string | null) => setV2Token(token);

  const resetV2 = () => {
    setV2Token(null);
    recaptchaRef.current?.reset();
  };

  const isVerified = !isSuspiciousScore || Boolean(v2Token);

  return {
    recaptchaRef,
    showV2Captcha,
    v2Token,
    handleV2Change,
    resetV2,
    isVerified,
  };
}
