"use client";

import { useState } from "react";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { recaptchaKeyForV2Hard } from "./config";

// v2-only verification using the "key-v2-real-hard" checkbox key.
// No v3 score here — solving the checkbox is the only gate.
export default function FromRepoPage() {
  const [v2Token, setV2Token] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const isVerified = Boolean(v2Token);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!isVerified) return;
    setLoggedIn(true);
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
          Log in (v2 only)
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

        <div className="flex justify-center">
          <ReCAPTCHA
            sitekey={recaptchaKeyForV2Hard}
            onChange={(token) => setV2Token(token)}
            onExpired={() => setV2Token(null)}
          />
        </div>

        <button
          type="submit"
          disabled={!isVerified}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
        >
          Log in
        </button>

        {loggedIn && (
          <p className="text-center text-sm font-medium text-green-600 dark:text-green-400">
            Logged in — checkbox verified.
          </p>
        )}
      </form>
    </main>
  );
}
