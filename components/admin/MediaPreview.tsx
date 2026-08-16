"use client";

export function MediaPreview({
  src,
  onRemove,
  imgClassName = "h-32 w-auto rounded-lg object-cover",
}: {
  src: string;
  onRemove: () => void;
  imgClassName?: string;
}) {
  return (
    <div className="relative inline-block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className={imgClassName} />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brown-900 text-sm leading-none text-cream shadow"
      >
        ×
      </button>
    </div>
  );
}
