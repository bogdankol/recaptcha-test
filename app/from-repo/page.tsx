"use client";

import { useState } from "react";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { recaptchaKeyForV2Hard } from "./config";

// v2-only ("key-v2-real-hard"), client-side only. Solving the checkbox mints a
// token in the browser; there is no server-side verification here. (A real
// app must verify the token server-side with the secret — see the other demos.)
export default function FromRepoPage() {
  const [v2Token, setV2Token] = useState<string | null>(null);

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

        {v2Token && (
          <p className="text-center text-sm font-medium text-green-600 dark:text-green-400">
            Token received (client-side only — not verified)
          </p>
        )}

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          v2 tokens are single-use — re-solve the checkbox for a fresh token.
        </p>
      </div>
    </main>
  );
}
