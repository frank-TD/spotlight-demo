import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choose your role — Spotlight",
  description: "Choose whether you are joining Spotlight as a backer or a creator.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
