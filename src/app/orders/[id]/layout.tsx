import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order — Getstaked",
  description: "Track an order, its stages, and payments on Getstaked.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
