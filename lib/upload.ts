import { createClient } from "@/lib/supabase/client";

export function computeResizeDimensions(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }
  const scale = maxDimension / Math.max(width, height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

async function resizeImageFile(file: File, maxDimension = 1920): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = computeResizeDimensions(bitmap.width, bitmap.height, maxDimension);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Resize failed"))), "image/jpeg", 0.85);
  });
}

export async function uploadMedia(file: File, path: string): Promise<string> {
  const supabase = createClient();
  const isImage = file.type.startsWith("image/");
  const toUpload = isImage ? await resizeImageFile(file) : file;
  const ext = isImage ? "jpg" : file.name.split(".").pop();
  const fullPath = `${path}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("media").upload(fullPath, toUpload, {
    contentType: isImage ? "image/jpeg" : file.type,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("media").getPublicUrl(fullPath);
  return data.publicUrl;
}
