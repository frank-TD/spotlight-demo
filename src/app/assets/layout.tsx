import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assets — Getstaked",
  description: "Manage the video assets you have created and collected on Getstaked.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
