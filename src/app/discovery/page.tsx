"use client";
import AppShell from "@/components/layout/AppShell";
import StudioWorkspace from "@/components/studio/StudioWorkspace";

// The /discovery route now hosts the AIGC Studio workspace (image / video /
// voiceover / music generation). The old discovery gallery is preserved at
// /tmp/discovery-gallery-backup.tsx for reference while the hero is redesigned.
export default function DiscoveryPage() {
  return (
    <AppShell>
      <StudioWorkspace />
    </AppShell>
  );
}
