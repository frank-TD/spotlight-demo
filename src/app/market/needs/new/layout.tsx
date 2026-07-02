import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Need — Spotlight",
  description: "Post a new brief and invite creators to bid on Spotlight.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
