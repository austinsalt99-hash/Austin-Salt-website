# Austin Salt Business Card — Design

**Date:** 2026-07-17
**Status:** Approved

## 1. Overview & Goals

A physical business card for Austin Salt, a mechanical engineering student, to hand out for networking. It drives people to his portfolio website (see `2026-07-17-portfolio-site-design.md`, which explicitly deferred business cards to this follow-up spec) via a QR code, and provides direct contact info as a fallback.

## 2. Content

- **Front:** Name, title ("Mechanical Engineering Student").
- **Back:** QR code linking to the portfolio website, the URL printed as text, email, phone number.

Double-sided, chosen over single-sided so each face stays uncluttered and the QR code has room to be reliably scannable.

## 3. Print Specs

- Standard US landscape business card: 3.5" × 2" trim size.
- 0.125" bleed on all sides → 3.75" × 2.25" total artwork size.
- 0.125" safe margin inside the trim edge for all text and the QR code.

## 4. Visual Design

Matches the warm-neutral palette and clean sans-serif typography established in the portfolio site spec, rather than introducing a separate visual identity. No literal engineering motifs (no blueprint lines, gears, wireframes), consistent with the site design direction.

**Palette** (concrete hex values — extends the site spec's named colors, which didn't specify hex codes; worth reusing when the site itself is built):

| Role | Usage | Hex |
|---|---|---|
| Base (cream) | card background, both sides | `#F7F2E9` |
| Text primary (brown) | name, headings | `#3B2F26` |
| Text secondary (gray) | subtitle, contact details | `#6B6560` |
| Accent (orange) | single rule line only | `#E0763A` |
| QR chip (white) | small backing square behind the QR code only | `#FFFFFF` |

**Typography:** Inter (or closest available system sans-serif), matching the site.

**Front:**
- Cream background, generous whitespace.
- "Austin Salt" — large, bold, brown, left-aligned.
- "Mechanical Engineering Student" — smaller, gray, directly below the name.
- A single thin orange rule (~0.75" wide) between name and subtitle. This is the only color accent on the card.
- No logo, no icon, nothing else on this face.

**Back:**
- Cream background.
- QR code (~0.9" square) centered in the upper-middle area, sitting on a small white/near-white rounded-square "chip" — the only place pure white appears on the card. This guarantees scan reliability that printing the QR pattern directly in brown-on-cream could risk (cream is not pure white, and low contrast is a common cause of failed scans across phone cameras/lighting).
- Website URL in small gray text directly beneath the QR code.
- A thin divider below that.
- Email and phone, stacked and centered, in brown, smaller than the front's name text.

## 5. QR Code

- Encodes the portfolio site URL. The portfolio site is not live yet, so a placeholder URL is used at first and swapped once the real domain is live.
- Error correction level Q (25% recovery) to stay reliable at small print size and after handling/wear, while leaving enough modules free that the chip doesn't need to be oversized.
- Rendered in the brown (`#3B2F26`) on the white chip background — not pure black — to stay on-palette without sacrificing contrast.

## 6. Deliverables

1. **HTML mockup** — front and back rendered at true 3.5:2 aspect ratio, viewable as a Claude artifact, for on-screen review and iteration before anything is finalized for print.
2. **Print-ready PDF** — generated from the approved mockup, at exact trim + bleed size specified in Section 3, with a real QR code.

## 7. Out of Scope

- The portfolio website itself (see `2026-07-17-portfolio-site-design.md`).
- Final domain/URL (placeholder used until the site is live).
- Ordering/vendor selection for physical printing — this spec covers the design and print-ready file only.
