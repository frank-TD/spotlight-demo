"use client";
import { useEffect, useRef, useState } from "react";
import { useStore, type StudioMode, type StudioAssetSettings, type StudioAsset } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { MODELS_BY_MODE, DEFAULT_MODEL_BY_MODE, VOICES, type StudioVoice } from "@/lib/studio-mock";
import HistoryRail from "./HistoryRail";
import VisualsCanvas from "./VisualsCanvas";
import PromptDock from "./PromptDock";
import ModelPickerDialog from "./ModelPickerDialog";
import VoiceCatalogDialog from "./VoiceCatalogDialog";
import ReferenceUploadDialog, { type PromptReference } from "./ReferenceUploadDialog";
import AssetLightbox from "./AssetLightbox";
import { toast } from "sonner";

const DEFAULT_SETTINGS: Record<StudioMode, StudioAssetSettings> = {
  image: { aspect: "16:9", quality: "2K", count: 1 },
  video: { aspect: "16:9", duration: "5 sec", resolution: "1080p", audio: true },
  voiceover: { language: "English", accent: "American", effect: "No Effect" },
  music: { genre: "Cinematic", mood: "Uplifting", duration: "30 sec" },
};

// Map an aspect ratio token to picsum dimensions.
const ASPECT_DIM: Record<string, [number, number]> = {
  "1:1": [800, 800],
  "4:3": [800, 600],
  "16:9": [960, 540],
  "9:16": [540, 960],
  "21:9": [1050, 450],
};

function parseDurationSec(label?: string): number {
  if (!label) return 30;
  if (label.includes("min")) return parseInt(label) * 60;
  return parseInt(label) || 30;
}

export default function StudioWorkspace() {
  const t = useT();
  const {
    studioSessions,
    studioGroups,
    currentStudioSessionId,
    studioGenerating,
    newStudioSession,
    setCurrentStudioSession,
    deleteStudioSession,
    addStudioAsset,
    setStudioGenerating,
    updateStudioSessionTitle,
    moveStudioSession,
    reorderStudioSession,
    newStudioGroup,
    renameStudioGroup,
    deleteStudioGroup,
    toggleStudioGroupCollapsed,
    hasHydrated,
  } = useStore();

  const [mode, setMode] = useState<StudioMode>("image");
  const [prompt, setPrompt] = useState("");
  const [progress, setProgress] = useState(0);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [voiceCatalogOpen, setVoiceCatalogOpen] = useState(false);
  const [referencesOpen, setReferencesOpen] = useState(false);
  const [references, setReferences] = useState<PromptReference[]>([]);
  const [lightboxAsset, setLightboxAsset] = useState<StudioAsset | null>(null);

  // Per-mode model + settings so switching modes preserves each mode's choices.
  const [modelByMode, setModelByMode] = useState<Record<StudioMode, string>>(DEFAULT_MODEL_BY_MODE);
  const [settingsByMode, setSettingsByMode] = useState<Record<StudioMode, StudioAssetSettings>>(DEFAULT_SETTINGS);
  const [voice, setVoice] = useState<StudioVoice>(VOICES[0]);

  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (doneTimer.current) clearTimeout(doneTimer.current);
    };
  }, []);

  const currentSession = studioSessions.find((s) => s.id === currentStudioSessionId) ?? null;
  const modelId = modelByMode[mode];
  const settings = settingsByMode[mode];

  const removeReference = (id: string) => {
    setReferences((prev) => {
      const ref = prev.find((r) => r.id === id);
      if (ref?.previewUrl) URL.revokeObjectURL(ref.previewUrl);
      return prev.filter((r) => r.id !== id);
    });
  };

  const clearReferences = () => {
    references.forEach((r) => r.previewUrl && URL.revokeObjectURL(r.previewUrl));
    setReferences([]);
  };

  const onModeChange = (m: StudioMode) => {
    if (studioGenerating) return;
    setMode(m);
    clearReferences();
    // Show the most recent session of that mode, if any; else a fresh canvas.
    const latest = studioSessions.find((s) => s.mode === m);
    setCurrentStudioSession(latest ? latest.id : null);
  };

  const onSelectSession = (id: string) => {
    const s = studioSessions.find((x) => x.id === id);
    if (!s) return;
    clearReferences();
    setCurrentStudioSession(id);
    setMode(s.mode);
  };

  const buildAsset = (sessionMode: StudioMode, idx: number): StudioAsset => {
    const model = MODELS_BY_MODE[sessionMode].find((m) => m.id === modelId)!;
    const seed = `${encodeURIComponent(prompt).slice(0, 18)}-${Date.now()}-${idx}`;
    const base: StudioAsset = {
      id: `asset_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 5)}`,
      mode: sessionMode,
      prompt: prompt.trim(),
      modelId: model.id,
      modelName: model.name,
      settings: { ...settings },
      createdAt: Date.now(),
    };
    if (references.length > 0) {
      base.references = references.map((r) => ({ id: r.id, name: r.name, size: r.size, type: r.type }));
    }
    if (sessionMode === "image" || sessionMode === "video") {
      const [w, h] = ASPECT_DIM[settings.aspect ?? "16:9"] ?? [960, 540];
      base.imageUrl = `https://picsum.photos/seed/${seed}/${w}/${h}`;
    } else if (sessionMode === "voiceover") {
      const words = prompt.trim().split(/\s+/).filter(Boolean).length;
      base.durationSec = Math.max(6, Math.round(words / 2.5));
      base.waveformSeed = seed;
      base.settings = { ...base.settings, voiceId: voice.id, voiceName: voice.name };
    } else {
      base.durationSec = parseDurationSec(settings.duration);
      base.waveformSeed = seed;
    }
    return base;
  };

  const onGenerate = () => {
    if (studioGenerating) return;
    if (!prompt.trim()) {
      toast.error(t.aigc.emptyPromptToast);
      return;
    }

    // Append to the active session if it matches this mode; else start one.
    let sid = currentStudioSessionId;
    const active = studioSessions.find((s) => s.id === sid);
    if (!active || active.mode !== mode) {
      sid = newStudioSession(mode);
    }

    setStudioGenerating(true);
    setProgress(3);
    progressTimer.current = setInterval(() => {
      setProgress((p) => (p >= 95 ? 95 : p + Math.ceil((100 - p) / 8)));
    }, 220);

    doneTimer.current = setTimeout(() => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      setProgress(100);
      const count = mode === "image" ? settings.count ?? 1 : 1;
      for (let i = 0; i < count; i++) {
        addStudioAsset(sid!, buildAsset(mode, i));
      }
      setStudioGenerating(false);
      setPrompt("");
      clearReferences();
    }, 2400);
  };

  const onConfirmModel = (newModelId: string, newSettings: StudioAssetSettings) => {
    setModelByMode((m) => ({ ...m, [mode]: newModelId }));
    setSettingsByMode((s) => ({ ...s, [mode]: newSettings }));
  };

  const onNewSession = () => {
    // Always land the user on a fresh, focused canvas. If the current session
    // is already empty (no assets), keep it and just reset the dock — no point
    // stacking empty "Untitled session" entries; otherwise spin up a new one.
    const active = studioSessions.find((s) => s.id === currentStudioSessionId);
    if (!active || active.assets.length > 0 || active.mode !== mode) {
      newStudioSession(mode);
    }
    setPrompt("");
    clearReferences();
  };

  const onNewGroup = () => {
    newStudioGroup(t.aigc.untitledProject);
  };

  if (!hasHydrated) return null;

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-6 pt-6 pb-52">
      <div className="flex gap-5">
        <HistoryRail
          sessions={studioSessions}
          groups={studioGroups}
          currentId={currentStudioSessionId}
          onSelect={onSelectSession}
          onNewSession={onNewSession}
          onNewGroup={onNewGroup}
          onDeleteSession={deleteStudioSession}
          onRenameSession={updateStudioSessionTitle}
          onMoveSession={moveStudioSession}
          onReorderSession={reorderStudioSession}
          onRenameGroup={renameStudioGroup}
          onDeleteGroup={deleteStudioGroup}
          onToggleGroup={toggleStudioGroupCollapsed}
        />

        <main className="flex-1 min-w-0">
          <div className="h-[calc(100vh-220px)] min-h-[480px]">
            <VisualsCanvas
              mode={mode}
              session={currentSession}
              generating={studioGenerating}
              progress={progress}
              onOpenAsset={setLightboxAsset}
            />
          </div>
        </main>
      </div>

      {/* Floating dock */}
      <div className="fixed left-0 right-0 bottom-6 px-4 z-40 pointer-events-none lg:pl-[260px]">
        <PromptDock
          mode={mode}
          onModeChange={onModeChange}
          modelId={modelId}
          settings={settings}
          voice={mode === "voiceover" ? voice : undefined}
          prompt={prompt}
          onPromptChange={setPrompt}
          generating={studioGenerating}
          onGenerate={onGenerate}
          onOpenModelPicker={() => setModelPickerOpen(true)}
          onOpenVoiceCatalog={() => setVoiceCatalogOpen(true)}
          onOpenReferences={() => setReferencesOpen(true)}
          references={references}
          onRemoveReference={removeReference}
        />
      </div>

      <ModelPickerDialog
        open={modelPickerOpen}
        onOpenChange={setModelPickerOpen}
        mode={mode}
        modelId={modelId}
        settings={settings}
        onConfirm={onConfirmModel}
      />
      <VoiceCatalogDialog
        open={voiceCatalogOpen}
        onOpenChange={setVoiceCatalogOpen}
        selectedVoiceId={voice.id}
        onSelect={setVoice}
      />
      <ReferenceUploadDialog
        open={referencesOpen}
        onOpenChange={setReferencesOpen}
        references={references}
        onChange={setReferences}
      />
      <AssetLightbox
        asset={lightboxAsset}
        onOpenChange={(o) => !o && setLightboxAsset(null)}
        onReuse={(a) => {
          // Switch to the asset's mode + select its session so the canvas matches.
          setMode(a.mode);
          const sess = studioSessions.find((s) => s.assets.some((x) => x.id === a.id));
          if (sess) setCurrentStudioSession(sess.id);
          setPrompt(a.prompt);
          clearReferences();
        }}
      />
    </div>
  );
}
