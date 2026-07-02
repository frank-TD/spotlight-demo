import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet — Spotlight",
  description: "Manage your Spotlight balance, payments, and payouts.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
