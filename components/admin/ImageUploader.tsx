"use client";

import { useCallback, useState } from "react";
import { uploadMedia } from "@/lib/upload";

export function ImageUploader({
  path,
  onUploaded,
  label,
}: {
  path: string;
  onUploaded: (url: string) => void;
  label: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      setError(null);
      try {
        for (const file of Array.from(files)) {
          const url = await uploadMedia(file, path);
          onUploaded(url);
        }
      } catch {
        setError("Upload failed. Try a different file.");
      } finally {
        setUploading(false);
      }
    },
    [path, onUploaded]
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
      }}
      className="rounded-lg border-2 border-dashed border-brown-600/40 bg-beige/40 p-6 text-center"
    >
      <label className="cursor-pointer text-brown-600">
        {uploading ? "Uploading…" : label}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {error && <p className="mt-2 text-sm text-error">{error}</p>}
    </div>
  );
}
