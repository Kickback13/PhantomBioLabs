"use client";

// Adapted from 21st.dev "File Dropzone" by joyco: drag-and-drop single file with type and size
// checks and inline errors. Simplified (no preview images) and restyled for Phantom.
import { AlertCircle, FileText, Upload, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function FileDropzone({
  file,
  onFileChange,
  accept = "application/pdf",
  acceptLabel = "PDF",
  maxSizeMB = 20,
  disabled,
  className,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
  acceptLabel?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(candidate: File | undefined) {
    if (!candidate) return;
    const types = accept.split(",").map((t) => t.trim());
    if (!types.includes(candidate.type)) {
      setError(`Only ${acceptLabel} files are accepted.`);
      return;
    }
    if (candidate.size > maxSizeMB * 1024 * 1024) {
      setError(`That file is ${formatSize(candidate.size)}. The limit is ${maxSizeMB} MB.`);
      return;
    }
    setError(null);
    onFileChange(candidate);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        data-dragging={dragging || undefined}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) pick(e.dataTransfer.files[0]);
        }}
        className={cn(
          "relative flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed p-5 text-center transition-colors",
          dragging ? "border-violet-400 bg-violet-500/10" : "border-line-strong bg-ink-950/60",
          disabled && "opacity-50",
        )}
      >
        <input
          ref={input}
          id={id}
          type="file"
          accept={accept}
          disabled={disabled}
          className="sr-only"
          aria-label={`Choose a ${acceptLabel} file`}
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {file ? (
          <div className="flex items-center gap-3 text-left">
            <span className="grid size-11 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-300">
              <FileText className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block max-w-[16rem] truncate text-sm font-medium">{file.name}</span>
              <span className="text-xs text-muted">{formatSize(file.size)}</span>
            </span>
            <button
              type="button"
              aria-label="Remove file"
              onClick={() => onFileChange(null)}
              className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <span className="grid size-11 place-items-center rounded-full border border-line-strong text-muted">
              <Upload className="size-4" />
            </span>
            <p className="mt-3 text-sm font-medium">Drop the {acceptLabel} here</p>
            <p className="mt-1 text-xs text-muted">
              {acceptLabel} up to {maxSizeMB} MB
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-4" disabled={disabled} onClick={() => input.current?.click()}>
              Choose file
            </Button>
          </>
        )}
      </div>
      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-danger">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
