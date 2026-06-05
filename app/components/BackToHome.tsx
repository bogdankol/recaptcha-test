import Link from "next/link";

// Fixed "back to main page" button, shown at the top-left of every sub-page.
export function BackToHome() {
  return (
    <Link
      href="/"
      className="fixed left-4 top-4 z-50 rounded-full border border-black/12 bg-white/80 px-4 py-2 text-sm font-medium text-black backdrop-blur transition-colors hover:bg-black/4 dark:border-white/16 dark:bg-zinc-900/80 dark:text-zinc-50 dark:hover:bg-white/6"
    >
      ← Main page
    </Link>
  );
}
