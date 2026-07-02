import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Backer — Spotlight",
  description: "View a backer profile and commissioned projects on Spotlight.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
