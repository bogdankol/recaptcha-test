import Script from "next/script";
import { BackToHome } from "@/app/components/BackToHome";

// reCAPTCHA Enterprise — auto-rendered "g-recaptcha" widget bound to a form
// POST, mirroring Google's "Simple page" demo markup.
export default function TestKey1Page() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <BackToHome />
      <Script
        src="https://www.google.com/recaptcha/enterprise.js"
        strategy="afterInteractive"
      />

      <form
        action=""
        method="POST"
        className="flex flex-col items-center gap-4 rounded-2xl border-2 border-red-500 p-8"
      >
        It will return a fixed score of 0.4
        <div
          className="g-recaptcha rounded border-2 border-red-500 p-2"
          data-sitekey="6LdnAg4tAAAAAGhhdQFi8AajWX2Sb2IRp1guktLb"
          data-action="LOGIN"
        />
        <input
          type="submit"
          value="Submit"
          className="cursor-pointer rounded-full bg-foreground px-8 py-3 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        />
      </form>
    </main>
  );
}
