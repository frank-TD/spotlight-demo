import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backer — Getstaked",
  description: "View a backer profile and commissioned projects on Getstaked.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
