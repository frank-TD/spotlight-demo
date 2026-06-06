"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useT } from "@/hooks/useT";
import { Upload, X, FileIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface PromptReference {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  // Object URL for live preview of images; revoked on remove.
  previewUrl?: string;
}

const MAX_FILES = 5;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function formatSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ReferenceUploadDialog({
  open,
  onOpenChange,
  references,
  onChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  references: PromptReference[];
  onChange: (next: PromptReference[]) => void;
}) {
  const t = useT();
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke object URLs on unmount to avoid leaking blob memory.
  useEffect(() => {
    return () => {
      references.forEach((r) => r.previewUrl && URL.revokeObjectURL(r.previewUrl));
    };
    // We intentionally do not depend on `references` — the cleanup runs only
    // when the host unmounts; per-item revocation happens in handleRemove.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (files: FileList | File[]) => {
    const incoming = Array.from(files);
    const slotsLeft = MAX_FILES - references.length;
    if (slotsLeft <= 0) {
      toast.error(t.aigc.refTooMany);
      return;
    }
    const accepted: PromptReference[] = [];
    for (const f of incoming.slice(0, slotsLeft)) {
      if (f.size > MAX_SIZE) {
        toast.error(t.aigc.refTooLarge(f.name));
        continue;
      }
      accepted.push({
        id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        file: f,
        name: f.name,
        size: f.size,
        type: f.type,
        previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      });
    }
    onChange([...references, ...accepted]);
  };

  const handleRemove = (id: string) => {
    const ref = references.find((r) => r.id === id);
    if (ref?.previewUrl) URL.revokeObjectURL(ref.previewUrl);
    onChange(references.filter((r) => r.id !== id));
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden" showCloseButton>
        <div className="p-6">
          <h2 className="font-headline text-2xl text-on-surface mb-5">{t.aigc.refTitle}</h2>

          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            className={cn(
              "rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
              dragOver
                ? "border-primary bg-primary-container/30"
                : "border-outline-variant/60 hover:border-primary/50"
            )}
          >
            <Upload className="w-7 h-7 text-primary mx-auto mb-3" />
            <p className="font-body text-sm text-on-surface mb-1">
              {t.aigc.refDrop}{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary underline-offset-2 hover:underline font-medium"
              >
                {t.aigc.refBrowse}
              </button>
            </p>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {t.aigc.refLimits}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {/* Selected file thumbnails */}
          {references.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 mt-5">
              {references.map((r) => (
                <div key={r.id} className="relative group rounded-xl overflow-hidden bg-surface-container border border-outline-variant/40">
                  {r.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.previewUrl} alt={r.name} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square flex items-center justify-center text-on-surface-variant">
                      <FileIcon className="w-8 h-8" />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(r.id)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/55 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="px-2 py-1.5">
                    <p className="font-body text-[11px] text-on-surface truncate">{r.name}</p>
                    <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
                      {formatSize(r.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-on-surface-variant/70 text-center mt-5">
              {t.aigc.refEmpty}
            </p>
          )}

          <div className="flex items-center justify-between mt-6">
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {references.length}/{MAX_FILES}
            </span>
            <button
              onClick={() => onOpenChange(false)}
              className="bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all"
            >
              {t.aigc.refDone}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
