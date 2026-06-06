"use client";
import AppShell from "@/components/layout/AppShell";
import StudioWorkspace from "@/components/studio/StudioWorkspace";

// The AIGC Studio workspace — image / video / voiceover / music generation
// with the history rail and prompt dock. The /discovery homepage exposes a
// "Start creating" CTA that lands users here.
export default function StudioWorkspacePage() {
  return (
    <AppShell>
      <StudioWorkspace />
    </AppShell>
  );
}
