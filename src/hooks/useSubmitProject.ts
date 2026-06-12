"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";

// "Submit a Project" smart routing, shared by the hero and the creator
// callout. Anonymous users go through register; signed-in users that haven't
// finished onboarding land on the role picker; fully onboarded users jump
// straight into the post-a-need flow.
export function useSubmitProject() {
  const t = useT();
  const router = useRouter();
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const onboardingComplete = useStore((s) => s.onboardingComplete);

  return () => {
    if (!isLoggedIn) {
      toast.info(t.homeV2.submitToast);
      router.push("/register");
      return;
    }
    if (!onboardingComplete) {
      router.push("/onboarding/role");
      return;
    }
    router.push("/market/needs/new");
  };
}
