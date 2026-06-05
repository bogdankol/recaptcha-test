"use client";

import Script from "next/script";
import { useState } from "react";
import { BackToHome } from "@/app/components/BackToHome";

// reCAPTCHA Enterprise (score-based) loaded with a render key, per Google's
// "Load the JavaScript API with your key" flow. Tokens are obtained via
// grecaptcha.enterprise.execute on click. With no backend here, each button
// SIMULATES a score in a fixed range so both the pass and fail paths are
// demonstrable.
const SITE_KEY = "6LcTCA4tAAAAAEhz9gWnuo4si5XUqwvrmhBwhm_R";

declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (cb: () => void) => void;
        execute: (
          key: string,
          opts: { action: string }
        ) => Promise<string>;
      };
    };
  }
}

type Result = { score: number } | null;

// Resolve a real Enterprise token via grecaptcha.enterprise.execute.
function getEnterpriseToken(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const g = window.grecaptcha;
    if (!g) {
      reject(new Error("grecaptcha not loaded"));
      return;
    }
    g.enterprise.ready(() => {
      g.enterprise.execute(SITE_KEY, { action: "LOGIN" }).then(resolve, reject);
    });
  });
}

export default function TestKeyAlways09Page() {
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState(false);

  async function runCheck(range: "pass" | "fail" | "any") {
    setLoading(true);
    setResult(null);

    // Best-effort: fetch a real token, but the score below is simulated since
    // these buttons don't verify it server-side.
    try {
      await getEnterpriseToken();
    } catch {
      /* ignore — score is simulated regardless */
    }

    // Simulated score: pass → [0.9, 1.0], fail → [0.0, 0.5), any → [0.0, 1.0].
    const score =
      range === "pass"
        ? Math.round((0.9 + Math.random() * 0.1) * 10) / 10
        : range === "fail"
          ? Math.round(Math.random() * 0.5 * 10) / 10
          : Math.round(Math.random() * 10) / 10;

    setResult({ score });
    setLoading(false);
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <BackToHome />
      <Script
        src={`https://www.google.com/recaptcha/enterprise.js?render=${SITE_KEY}`}
        strategy="afterInteractive"
      />

      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-zinc-900">
        <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
          reCAPTCHA Enterprise
        </h2>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Each button runs grecaptcha.enterprise.execute, then shows a simulated
          score in a fixed range.
        </p>

        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => runCheck("pass")}
            className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            Pass check (0.9 – 1.0)
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => runCheck("fail")}
            className="rounded-full border border-red-500 px-6 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
          >
            Fail check (&lt; 0.5)
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => runCheck("any")}
            className="rounded-full border border-black/12 px-6 py-3 text-sm font-medium transition-colors hover:bg-black/4 disabled:opacity-50 dark:border-white/16 dark:hover:bg-white/6"
          >
            Run check (any score)
          </button>
        </div>

        {loading && (
          <p className="text-sm text-zinc-500">Running verification…</p>
        )}

        {result && (
          <p
            className={`text-sm font-medium ${
              result.score < 0.5
                ? "text-red-600 dark:text-red-400"
                : "text-green-600 dark:text-green-400"
            }`}
          >
            Score: {result.score.toFixed(1)} —{" "}
            {result.score < 0.5 ? "Risky" : "OK"}
          </p>
        )}
      </div>
    </main>
  );
}
