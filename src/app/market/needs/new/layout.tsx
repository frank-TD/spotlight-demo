import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Need — Getstaked",
  description: "Post a new brief and invite creators to bid on Getstaked.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
