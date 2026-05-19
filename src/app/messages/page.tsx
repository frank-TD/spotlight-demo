"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { SESSIONS } from "@/lib/mock-data";

export default function MessagesIndexPage() {
  const router = useRouter();
  const { activeRole } = useStore();

  useEffect(() => {
    const first = SESSIONS.find((s) =>
      activeRole === "backer" ? s.backerId === "u_backer_01" : s.creatorId === "u_creator_01"
    );
    router.replace(first ? `/messages/sessions/${first.id}` : `/messages/sessions/sess_001`);
  }, [activeRole, router]);

  return null;
}
