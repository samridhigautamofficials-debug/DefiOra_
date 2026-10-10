"use client";

import { useId } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { DOCUMENT_LABELS, type DocumentType } from "@/lib/types";

type UploadCardProps = {
  source: DocumentType;
  title: string;
  description: string;
  file: File | null;
  required?: boolean;
  icon: IconName;
  disabled?: boolean;
  onFileSelected: (file: File | null) => void;
};

export function UploadCard({
  source,
  title,
  description,
  file,
  required = false,
  icon,
  disabled = false,
  onFileSelected,
}: UploadCardProps) {
  const inputId = useId();

  function receiveFile(candidate: File | undefined) {
    if (!candidate) return;
    onFileSelected(candidate);
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#e2eae4] bg-white p-5 shadow-[0_12px_34px_rgba(20,63,59,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#acd9c4] hover:shadow-[0_18px_42px_rgba(20,63,59,0.09)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#9ed6bb] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e4f3ec] text-[#075b4c]">
            <Icon name={icon} width={20} height={20} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-[#143f3b]">{title}</h3>
              {required ? (
                <span className="status-pill status-pill-coral px-2 py-1">Required</span>
              ) : (
                <span className="status-pill px-2 py-1 text-[#607a78]">Optional</span>
              )}
            </div>
            <p className="mt-1 text-sm leading-6 text-[#607a78]">{description}</p>
          </div>
        </div>
      </div>

      <label
        htmlFor={inputId}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          receiveFile(event.dataTransfer.files[0]);
        }}
        className={`mt-5 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3 transition-colors ${
          disabled
            ? "cursor-not-allowed border-[#e2eae4] bg-[#f7fbf8] opacity-60"
            : "border-[#c9dfd2] bg-[#fbfefc] hover:border-[#075b4c] hover:bg-[#f1faf5]"
        }`}
      >
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#143f3b]">
            {file ? "Evidence selected" : `Add ${DOCUMENT_LABELS[source].toLowerCase()}`}
          </p>
          <p className="mt-1 truncate text-xs text-[#607a78]">
            {file ? file.name : "PDF, PNG, JPG or JPEG · max 10 MB"}
          </p>
        </div>
        <span className="shrink-0 rounded-lg border border-[#c9dfd2] px-3 py-2 text-xs font-bold text-[#075b4c]">
          {file ? "Replace" : "Choose file"}
        </span>
        <input
          id={inputId}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          disabled={disabled}
          className="sr-only"
          onChange={(event) => receiveFile(event.target.files?.[0])}
        />
      </label>
    </div>
  );
}
