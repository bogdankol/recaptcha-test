"use client";

import { useState } from "react";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { recaptchaKeyForV2Hard } from "./config";

// v2-only ("key-v2-real-hard"). Solve the checkbox to get a token, then click
// "Run check" to verify it server-side (siteverify). Each click appends a
// result. v2 has no numeric score — it returns pass/fail.
type Check = { n: number; score: number | null; success: boolean; codes: string[] };

export default function FromRepoPage() {
  const [v2Token, setV2Token] = useState<string | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(false);

  async function runCheck() {
    if (!v2Token) return;
    setLoading(true);
    try {
      const res = await fetch("/from-repo/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: v2Token }),
      });
      const data = (await res.json()) as {
        success: boolean;
        score: number | null;
        errorCodes: string[];
      };
      setChecks((c) => [
        ...c,
        { n: c.length + 1, score: data.score, success: data.success, codes: data.errorCodes },
      ]);
    } catch {
      setChecks((c) => [
        ...c,
        { n: c.length + 1, score: null, success: false, codes: ["request-failed"] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 rounded-full border border-black/12 bg-white/80 px-4 py-2 text-sm font-medium text-black backdrop-blur transition-colors hover:bg-black/4 dark:border-white/16 dark:bg-zinc-900/80 dark:text-zinc-50 dark:hover:bg-white/6"
      >
        ← Main page
      </Link>

      <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900">
        <h2 className="text-center text-xl font-semibold text-black dark:text-zinc-50">
          reCAPTCHA v2 (key-v2-real-hard)
        </h2>

        <ReCAPTCHA
          sitekey={recaptchaKeyForV2Hard}
          onChange={(token) => setV2Token(token)}
          onExpired={() => setV2Token(null)}
        />

        <button
          type="button"
          onClick={runCheck}
          disabled={!v2Token || loading}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          {loading ? "Checking…" : "Run check"}
        </button>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          v2 tokens are single-use — re-solve the checkbox for a fresh token.
        </p>

        {checks.length > 0 && (
          <ul className="flex w-full flex-col gap-1 text-sm">
            {checks.map((c) => (
              <li
                key={c.n}
                className={`font-medium ${
                  c.success
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                #{c.n} — score:{" "}
                {c.score === null ? "n/a (v2)" : c.score.toFixed(1)} —{" "}
                {c.success ? "pass" : `fail${c.codes.length ? ` (${c.codes.join(", ")})` : ""}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
