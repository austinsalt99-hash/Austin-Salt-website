import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2b2a27",
          color: "#f8f4ea",
          fontSize: 84,
          fontWeight: 700,
          fontFamily: "sans-serif",
          letterSpacing: -3,
        }}
      >
        AS
      </div>
    ),
    { ...size },
  );
}
