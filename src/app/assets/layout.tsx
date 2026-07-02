import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assets — Spotlight",
  description: "Manage the video assets you have created and collected on Spotlight.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
