"use client";

import { useState } from "react";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { recaptchaKeyForV2Hard } from "./config";
import { FromRepoProvider } from "./Providers";
import { useRecaptchaScore } from "./useRecaptchaScore";
import { useRecaptchaV2Handler } from "./useRecaptchaV2Handler";

// Faithful, self-contained port of web-nextjs's LoginFragment + useLogin
// reCAPTCHA flow:
//  • v3 score runs on load (useRecaptchaScore).
//  • v2 checkbox appears only when the score is suspicious (fallback).
//  • LoginFragment's special case: v2 must be solved 3 times.
//  • Login is gated: proceed only if a v3 score exists, v2 isn't pending,
//    and the button isn't locked.
export default function FromRepoPage() {
  return (
    <FromRepoProvider>
      <LoginForm />
    </FromRepoProvider>
  );
}

function LoginForm() {
  const { recaptchaScore, isSuspiciousScore } = useRecaptchaScore({
    action: "login",
  });
  const {
    recaptchaRef,
    shouldShowV2,
    isSolvedRecaptcha,
    passes,
    requiredPasses,
    handleV2Change,
  } = useRecaptchaV2Handler(isSuspiciousScore);

  const [buttonLock, setButtonLock] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  // Mirrors useLogin: early-return unless a score exists, v2 isn't pending,
  // and the button isn't locked.
  const canSubmit = recaptchaScore !== null && !shouldShowV2 && !buttonLock;

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setButtonLock(true);
    // (real app calls the auth endpoint here)
    setLoggedIn(true);
    setButtonLock(false);
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 rounded-full border border-black/12 bg-white/80 px-4 py-2 text-sm font-medium text-black backdrop-blur transition-colors hover:bg-black/4 dark:border-white/16 dark:bg-zinc-900/80 dark:text-zinc-50 dark:hover:bg-white/6"
      >
        ← Main page
      </Link>

      <form
        onSubmit={handleLogin}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900"
      >
        <h2 className="text-center text-xl font-semibold text-black dark:text-zinc-50">
          Log in (from-repo)
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
                isSuspiciousScore ? "suspicious" : "OK"
              }`}
        </p>

        {shouldShowV2 && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Suspicious score — solve the checkbox {passes}/{requiredPasses}
            </p>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={recaptchaKeyForV2Hard}
              onChange={handleV2Change}
            />
          </div>
        )}

        {isSolvedRecaptcha && (
          <p className="text-center text-xs text-green-600 dark:text-green-400">
            Checkbox solved {requiredPasses}× — unlocked.
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          Log in
        </button>

        {loggedIn && (
          <p className="text-center text-sm font-medium text-green-600 dark:text-green-400">
            Logged in — verification passed.
          </p>
        )}
      </form>
    </main>
  );
}
