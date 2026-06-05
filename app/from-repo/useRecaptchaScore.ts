"use client";

import { useCallback, useEffect, useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { checkRecaptchaToken } from "./recaptcha";

// Self-contained copy of the real app's useRecaptchaScore.
const RISKY_THRESHOLD = 0.5;
const isLocalhost =
  typeof window !== "undefined" && window.location.hostname === "localhost";

export function useRecaptchaScore({ action }: { action: string }): {
  recaptchaScore: number | null;
  isSuspiciousScore: boolean;
} {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [recaptchaScore, setRecaptchaScore] = useState<number | null>(null);

  const getRecaptchaScore = useCallback(async () => {
    const maxRetries = 5;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        if (!executeRecaptcha) {
          throw new Error("executeRecaptcha not ready");
        }
        const recaptchaToken = await executeRecaptcha(action || "login");
        const score = await checkRecaptchaToken(recaptchaToken);
        setRecaptchaScore(score);
        return;
      } catch (error) {
        retryCount++;
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`Retry ${retryCount}/${maxRetries}:`, message);

        if (retryCount >= maxRetries) {
          console.error(
            "Failed to get recaptcha score after retries, using fallback"
          );
          setRecaptchaScore(1); // Fallback to allow login
          return;
        }
        await new Promise((resolve) =>
          setTimeout(resolve, 100 * Math.pow(2, retryCount - 1))
        );
      }
    }
  }, [executeRecaptcha, action]);

  useEffect(() => {
    if (!executeRecaptcha) {
      return;
    }
    getRecaptchaScore();
  }, [executeRecaptcha, getRecaptchaScore]);

  const isSuspiciousScore =
    !isLocalhost &&
    typeof recaptchaScore === "number" &&
    recaptchaScore < RISKY_THRESHOLD;

  return { recaptchaScore, isSuspiciousScore };
}
