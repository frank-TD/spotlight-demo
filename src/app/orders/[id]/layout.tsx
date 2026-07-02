import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order — Spotlight",
  description: "Track an order, its stages, and payments on Spotlight.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
