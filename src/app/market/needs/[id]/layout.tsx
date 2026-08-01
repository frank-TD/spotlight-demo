import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brief — Getstaked",
  description: "View project brief details on the Getstaked marketplace.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
