"use client";

import { useState } from "react";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { recaptchaKeyForV2Hard } from "@/app/from-repo/config";

// v2 with a real server-side validation step. Solving the checkbox mints a
// token in the browser; that token is POSTed to /from-repo-with-backend/verify,
// which checks it against Google's siteverify using the secret. Every token is
// logged to the console so you can watch them come through.
type Status = "idle" | "checking" | "verified" | "failed";

export default function FromRepoWithBackendPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorCodes, setErrorCodes] = useState<string[]>([]);

  async function verifyToken(token: string) {
    console.log("[recaptcha v2] sending token to backend:", token);
    setStatus("checking");
    setErrorCodes([]);
    try {
      const res = await fetch("/from-repo-with-backend/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { verified: boolean; errorCodes: string[] };
      console.log("[recaptcha v2] backend response:", data);
      setStatus(data.verified ? "verified" : "failed");
      setErrorCodes(data.errorCodes ?? []);
    } catch (err) {
      console.log("[recaptcha v2] backend request failed:", err);
      setStatus("failed");
      setErrorCodes(["request-failed"]);
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
          reCAPTCHA v2 + backend (key-v2-real-hard)
        </h2>

        <ReCAPTCHA
          sitekey={recaptchaKeyForV2Hard}
          onChange={async (token) => {
            console.log("[recaptcha v2] token received from widget:", token);
            if (token) await verifyToken(token);
          }}
          onExpired={() => {
            console.log("[recaptcha v2] token expired");
            setStatus("idle");
            setErrorCodes([]);
          }}
        />

        {status !== "idle" && (
          <h4
            className={`text-center text-base font-semibold ${
              status === "checking"
                ? "text-zinc-500 dark:text-zinc-400"
                : status === "verified"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
            }`}
          >
            {status === "checking"
              ? "Backend verification: checking…"
              : `Backend verification ended: ${
                  status === "verified"
                    ? "verified"
                    : `not verified${errorCodes.length ? ` (${errorCodes.join(", ")})` : ""}`
                }`}
          </h4>
        )}

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          v2 tokens are single-use — re-solve the checkbox for a fresh token.
          Open the browser console to see every token.
        </p>
      </div>
    </main>
  );
}
