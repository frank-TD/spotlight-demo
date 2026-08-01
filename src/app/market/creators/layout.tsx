import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creators — Getstaked",
  description: "Discover AI film creators for hire on Getstaked.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
