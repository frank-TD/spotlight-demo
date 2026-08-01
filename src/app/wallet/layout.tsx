import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet — Getstaked",
  description: "Manage your Getstaked balance, payments, and payouts.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
