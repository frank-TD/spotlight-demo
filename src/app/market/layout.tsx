import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace — Spotlight",
  description: "Browse AI film briefs and creators on the Spotlight marketplace.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
