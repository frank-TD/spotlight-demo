import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace — Getstaked",
  description: "Browse AI film briefs and creators on the Getstaked marketplace.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
