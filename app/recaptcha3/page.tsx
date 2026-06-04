"use client";

import Script from "next/script";
import { useState } from "react";

// reCAPTCHA v3 (invisible, score-based — no checkbox).
// v3 has no public "always pass" test key, so a real key is required.
// Set NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY in .env.local.
const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY ?? "";

type Status = "idle" | "loading" | "done" | "error";

export default function Recaptcha3Page() {
  const [open, setOpen] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [token, setToken] = useState<string | null>(null);

  function openOverlay() {
    setOpen(true);
    setStatus("idle");
    setToken(null);

    if (!SITE_KEY) {
      setStatus("error");
      return;
    }
    if (!scriptReady || !window.grecaptcha) {
      setStatus("loading");
      return;
    }
    execute();
  }

  function execute() {
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha || !SITE_KEY) return;
    setStatus("loading");
    grecaptcha.ready(() => {
      grecaptcha
        .execute(SITE_KEY, { action: "open_recaptcha" })
        .then((t) => {
          setToken(t);
          setStatus("done");
        })
        .catch(() => setStatus("error"));
    });
  }

  function close() {
    setOpen(false);
    setStatus("idle");
    setToken(null);
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      {SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`}
          strategy="afterInteractive"
          onLoad={() => {
            setScriptReady(true);
            // If the overlay opened before the script finished loading, run now.
            if (open && status === "loading") execute();
          }}
        />
      )}

      <button
        type="button"
        onClick={openOverlay}
        className="rounded-full bg-foreground px-8 py-4 text-lg font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Open reCAPTCHA
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              reCAPTCHA v3
            </h2>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              v3 is invisible and runs in the background, returning a token and
              a risk score (no checkbox to solve).
            </p>

            {status === "loading" && (
              <p className="text-sm text-zinc-500">Running verification…</p>
            )}

            {status === "done" && token && (
              <p className="max-w-xs break-all text-sm text-green-600 dark:text-green-400">
                Token received: {token.slice(0, 24)}…
              </p>
            )}

            {status === "error" && (
              <p className="max-w-xs text-sm text-red-600 dark:text-red-400">
                {SITE_KEY
                  ? "Verification failed. Check the site key and domain."
                  : "Set NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY in .env.local to run v3."}
              </p>
            )}

            <button
              type="button"
              onClick={close}
              className="rounded-full border border-black/[.12] px-6 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.16] dark:hover:bg-white/[.06]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
