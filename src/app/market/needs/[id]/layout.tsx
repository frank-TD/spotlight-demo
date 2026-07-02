import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brief — Spotlight",
  description: "View project brief details on the Spotlight marketplace.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
