import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator — Getstaked",
  description: "View a creator profile and showcase on Getstaked.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
