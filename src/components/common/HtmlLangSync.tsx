"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

// Keep <html lang> in sync with the active (client-persisted) locale so screen
// readers and search engines see the correct language after a locale switch.
// The server layout renders lang="en" by default; this corrects it on hydrate
// and on every subsequent locale change.
export default function HtmlLangSync() {
  const locale = useStore((s) => s.locale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
