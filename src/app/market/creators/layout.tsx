import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creators — Spotlight",
  description: "Discover AI film creators for hire on Spotlight.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
