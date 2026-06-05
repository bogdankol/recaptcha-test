"use client";

import { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useRecaptchaScore } from "@/app/hooks/useRecaptchaScore";
import { recaptchaKey } from "@/etc/config";
import { BackToHome } from "@/app/components/BackToHome";
import { createAssessment, verifyWithSiteverify } from "@/app/lib/recaptcha";

const ACTION = "open_recaptcha";

// reCAPTCHA v3 (invisible, score-based). The provider is now global
// (app/providers.tsx), so this page just consumes the score hook.
export default function Recaptcha3Page() {
  if (!recaptchaKey) {
    return (
      <main className="flex flex-1 items-center justify-center bg-zinc-50 p-8 text-center dark:bg-black">
        <BackToHome />
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
    action: ACTION,
  });
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [manual, setManual] = useState<{ label: string; score: number | null } | null>(null);
  const [loading, setLoading] = useState(false);

  async function verify(variant: "siteverify" | "assessment") {
    if (!executeRecaptcha) return;
    setLoading(true);
    setManual(null);
    try {
      const token = await executeRecaptcha(ACTION);
      const score =
        variant === "siteverify"
          ? await verifyWithSiteverify(token)
          : await createAssessment({ token, recaptchaAction: ACTION });
      setManual({
        label:
          variant === "siteverify"
            ? "siteverify (no projectId)"
            : "Assessment API (with projectId)",
        score,
      });
    } catch (e) {
      console.error(e);
      setManual({
        label:
          variant === "siteverify"
            ? "siteverify (no projectId)"
            : "Assessment API (with projectId)",
        score: null,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <BackToHome />
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

        <div className="flex w-full flex-col gap-3 border-t border-black/12 pt-6 dark:border-white/16">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Real verification (client-side — likely CORS-blocked):
          </p>
          <button
            type="button"
            disabled={loading}
            onClick={() => verify("siteverify")}
            className="rounded-full border border-black/12 px-6 py-3 text-sm font-medium transition-colors hover:bg-black/4 disabled:opacity-50 dark:border-white/16 dark:hover:bg-white/6"
          >
            Verify — without projectId (siteverify)
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => verify("assessment")}
            className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            Verify — with projectId (Assessment API)
          </button>

          {loading && <p className="text-sm text-zinc-500">Verifying…</p>}

          {manual && (
            <p className="text-sm font-medium text-black dark:text-zinc-50">
              {manual.label}:{" "}
              {manual.score === null
                ? "failed (check console — likely CORS)"
                : manual.score.toFixed(1)}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
