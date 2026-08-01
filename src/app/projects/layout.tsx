import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Projects — Getstaked",
  description: "Track your active and completed Getstaked projects.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
