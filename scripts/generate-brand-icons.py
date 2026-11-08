#!/usr/bin/env python3
"""
Generate black Inverted-V brand assets for Vsmat, aligned with aisubdeal.com visual style.
Outputs:
- public/icon.svg
- public/icon-512.png
- public/icon-192.png
- public/apple-touch-icon.png (180x180)
- public/favicon.png (64x64)
"""
import os
from PIL import Image, ImageDraw

def generate_svg(path: str):
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="vBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d0e12" />
      <stop offset="50%" stop-color="#070709" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>
    <linearGradient id="vShape" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f1f5f9" />
    </linearGradient>
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#ffffff" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Black Squircle Container -->
  <rect width="512" height="512" rx="124" fill="url(#vBg)" />
  <rect width="508" height="508" x="2" y="2" rx="122" fill="none" stroke="#27272a" stroke-width="2" stroke-opacity="0.6" />

  <!-- Inverted V Chevron Symbol -->
  <path filter="url(#glow)"
        d="M256 124 C260 124 263 126 266 130 L406 334 C412 343 406 358 392 358 L334 358 C327 358 320 354 316 348 L256 262 L196 348 C192 354 185 358 178 358 L120 358 C106 358 100 343 106 334 L246 130 C249 126 252 124 256 124 Z"
        fill="url(#vShape)" />
</svg>'''
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Generated {path}")

def generate_pngs(base_dir: str):
    # Render at 4x scale (2048x2048)
    SCALE = 4
    SIZE = 512 * SCALE
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    rx = 124 * SCALE
    # Dark rounded background
    draw.rounded_rectangle([0, 0, SIZE, SIZE], radius=rx, fill=(7, 7, 9, 255))
    # Border
    draw.rounded_rectangle([2*SCALE, 2*SCALE, SIZE - 2*SCALE, SIZE - 2*SCALE],
                           radius=rx - 2*SCALE, outline=(39, 39, 42, 160), width=2*SCALE)

    # Inverted V polygon points
    # (x, y) coordinates mapped to 512 scale
    pts_512 = [
        (256, 126),
        (263, 131),
        (405, 336),
        (391, 358),
        (333, 358),
        (256, 262),
        (179, 358),
        (121, 358),
        (107, 336),
        (249, 131),
    ]
    pts = [(x * SCALE, y * SCALE) for (x, y) in pts_512]
    draw.polygon(pts, fill=(255, 255, 255, 255))

    # Save 512x512
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(os.path.join(base_dir, "icon-512.png"))
    print("Saved icon-512.png")

    # Save 192x192
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(os.path.join(base_dir, "icon-192.png"))
    print("Saved icon-192.png")

    # Save apple-touch-icon 180x180
    img_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save(os.path.join(base_dir, "apple-touch-icon.png"))
    print("Saved apple-touch-icon.png")

    # Save favicon 64x64
    img_64 = img.resize((64, 64), Image.Resampling.LANCZOS)
    img_64.save(os.path.join(base_dir, "favicon.png"))
    print("Saved favicon.png")

if __name__ == '__main__':
    public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public"))
    generate_svg(os.path.join(public_dir, "icon.svg"))
    generate_pngs(public_dir)
