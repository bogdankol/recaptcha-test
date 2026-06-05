"use client";

import { useRecaptchaScore } from "@/app/hooks/useRecaptchaScore";
import { recaptchaKey } from "@/etc/config";

// reCAPTCHA v3 (invisible, score-based). The provider is now global
// (app/providers.tsx), so this page just consumes the score hook.
export default function Recaptcha3Page() {
  if (!recaptchaKey) {
    return (
      <main className="flex flex-1 items-center justify-center bg-zinc-50 p-8 text-center dark:bg-black">
        <p className="max-w-sm text-sm text-red-600 dark:text-red-400">
          Set recaptchaKey (v3 site key) in etc/config.ts to run reCAPTCHA v3.
        </p>
      </main>
    );
  }

  return <Recaptcha3Inner />;
}

function Recaptcha3Inner() {
  const { recaptchaScore, isSuspiciousScore } = useRecaptchaScore({
    action: "open_recaptcha",
  });

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-zinc-900">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
          reCAPTCHA v3------1
        </h2>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          v3 is invisible and runs in the background, returning a risk score (no
          checkbox to solve). The score is checked on load.
        </p>

        {recaptchaScore === null ? (
          <p className="text-sm text-zinc-500">Running verification…</p>
        ) : (
          <p
            className={`text-sm font-medium ${
              isSuspiciousScore
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            Score: {recaptchaScore.toFixed(1)} —{" "}
            {isSuspiciousScore ? "Risky (< 9)" : "OK"}
          </p>
        )}
      </div>
    </main>
  );
}
