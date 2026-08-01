import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Getstaked",
  description: "Learn about Getstaked — where AI films get funded, owned, and streamed.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
