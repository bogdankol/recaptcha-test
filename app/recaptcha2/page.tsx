"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

// reCAPTCHA v2 ("I'm not a robot" checkbox).
// Defaults to Google's official test site key, which always passes.
// Override with NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY for a real key.
const SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE_KEY ??
  "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

export default function Recaptcha2Page() {
  const [open, setOpen] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);

  // Render the widget once the overlay is open and the API has loaded.
  useEffect(() => {
    if (!open || !scriptReady) return;
    const container = containerRef.current;
    if (!container || !window.grecaptcha) return;
    if (widgetIdRef.current !== null) return;

    container.innerHTML = "";
    widgetIdRef.current = window.grecaptcha.render(container, {
      sitekey: SITE_KEY,
      theme: "light",
      callback: (t) => setToken(t),
      "expired-callback": () => setToken(null),
    });
  }, [open, scriptReady]);

  function close() {
    setOpen(false);
    setToken(null);
    // Reset so the widget can be re-rendered cleanly next time.
    if (widgetIdRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetIdRef.current);
    }
    widgetIdRef.current = null;
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <Script
        src="https://www.google.com/recaptcha/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      <button
        type="button"
        onClick={() => setOpen(true)}
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
            className="flex flex-col items-center gap-6 rounded-2xl bg-white p-8 shadow-2xl dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
              reCAPTCHA v2
            </h2>

            <div ref={containerRef} />

            {!scriptReady && (
              <p className="text-sm text-zinc-500">Loading reCAPTCHA…</p>
            )}

            {token && (
              <p className="max-w-xs break-all text-center text-sm text-green-600 dark:text-green-400">
                Verified! Token: {token.slice(0, 24)}…
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
