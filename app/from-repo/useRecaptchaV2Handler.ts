"use client";

import { useRef, useState } from "react";
import type ReCAPTCHA from "react-google-recaptcha";

// Self-contained copy of the real app's useRecaptchaV2Handler:
//   shouldShowV2 = isSuspiciousScore && !isSolvedRecaptcha
// The v2 token is a CLIENT-SIDE gate only (never sent to the backend); a
// non-empty token counts as a "pass". LoginFragment's special case requires
// RECAPTCHA_REQUIRED_PASSES (3) before it's considered solved.
const RECAPTCHA_REQUIRED_PASSES = 3;

export function useRecaptchaV2Handler(isSuspiciousScore: boolean) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [passes, setPasses] = useState(0);

  const isSolvedRecaptcha = passes >= RECAPTCHA_REQUIRED_PASSES;
  const shouldShowV2 = isSuspiciousScore && !isSolvedRecaptcha;

  const handleV2Change = (token: string | null) => {
    if (!token) return;
    setPasses((p) => p + 1);
    recaptchaRef.current?.reset();
  };

  return {
    recaptchaRef,
    shouldShowV2,
    isSolvedRecaptcha,
    passes,
    requiredPasses: RECAPTCHA_REQUIRED_PASSES,
    handleV2Change,
  };
}
