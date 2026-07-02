import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in — Spotlight",
  description: "Log in to your Spotlight account.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
