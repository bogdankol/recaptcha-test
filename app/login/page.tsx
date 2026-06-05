"use client";

import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { recaptchaKeyForV2 } from "@/etc/config";
import { useRecaptchaScore } from "@/app/hooks/useRecaptchaScore";
import { useRecaptchaV2Handler } from "@/app/hooks/useRecaptchaV2Handler";
import { BackToHome } from "@/app/components/BackToHome";

// Demo of the real app's login flow: an invisible v3 score runs on load, and
// the visible v2 checkbox only appears as a fallback when the score is
// suspicious. Submit is blocked until verification passes.
export default function LoginPage() {
  const { recaptchaScore, isSuspiciousScore } = useRecaptchaScore({
    action: "login",
  });
  const { recaptchaRef, showV2Captcha, handleV2Change, isVerified } =
    useRecaptchaV2Handler(isSuspiciousScore);

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <BackToHome />
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900"
      >
        <h2 className="text-center text-xl font-semibold text-black dark:text-zinc-50">
          Log in
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="rounded-lg border border-black/12 px-4 py-2 text-sm outline-none dark:border-white/16 dark:bg-zinc-800"
        />
        <input
          type="password"
          placeholder="Password"
          className="rounded-lg border border-black/12 px-4 py-2 text-sm outline-none dark:border-white/16 dark:bg-zinc-800"
        />

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          {recaptchaScore === null
            ? "Running v3 verification…"
            : `v3 score: ${recaptchaScore.toFixed(1)} — ${
                isSuspiciousScore ? "suspicious, solve the checkbox" : "OK"
              }`}
        </p>

        {showV2Captcha && (
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={recaptchaKeyForV2}
              onChange={handleV2Change}
              onExpired={() => handleV2Change(null)}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!isVerified}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          Log in
        </button>

        {submitted && isVerified && (
          <p className="text-center text-sm font-medium text-green-600 dark:text-green-400">
            Submitted — verification passed.
          </p>
        )}
      </form>
    </main>
  );
}
