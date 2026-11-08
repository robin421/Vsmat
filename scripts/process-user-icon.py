#!/usr/bin/env python3
"""
Convert user uploaded official brand icon into all production assets.
Source: /Users/xiaowen/.gemini/antigravity-cli/brain/952ea046-6010-4cce-ab6c-44cc6095feec/.user_uploaded/uploaded_media_1794110599226.jpg
Outputs:
- public/icon-512.png
- public/icon-192.png
- public/apple-touch-icon.png (180x180)
- public/favicon.png (64x64)
- public/icon.svg
"""
import os
import base64
from PIL import Image

SRC = "/Users/xiaowen/.gemini/antigravity-cli/brain/952ea046-6010-4cce-ab6c-44cc6095feec/.user_uploaded/uploaded_media_1794110599226.jpg"
PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public"))

def main():
    img = Image.open(SRC).convert("RGBA")
    w, h = img.size
    print(f"Source size: {w}x{h}")

    # 1. 512x512
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    p_512 = os.path.join(PUBLIC_DIR, "icon-512.png")
    img_512.save(p_512, "PNG", optimize=True)
    print("Saved icon-512.png")

    # 2. 192x192
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    p_192 = os.path.join(PUBLIC_DIR, "icon-192.png")
    img_192.save(p_192, "PNG", optimize=True)
    print("Saved icon-192.png")

    # 3. 180x180 (apple-touch-icon)
    img_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
    p_180 = os.path.join(PUBLIC_DIR, "apple-touch-icon.png")
    img_180.save(p_180, "PNG", optimize=True)
    print("Saved apple-touch-icon.png")

    # 4. 64x64 (favicon)
    img_64 = img.resize((64, 64), Image.Resampling.LANCZOS)
    p_64 = os.path.join(PUBLIC_DIR, "favicon.png")
    img_64.save(p_64, "PNG", optimize=True)
    print("Saved favicon.png")

    # 5. icon.svg with base64 embedded high-res PNG
    with open(p_512, "rb") as f:
        b64_data = base64.b64encode(f.read()).decode("utf-8")

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#000000" />
  <image width="512" height="512" xlink:href="data:image/png;base64,{b64_data}" />
</svg>'''

    p_svg = os.path.join(PUBLIC_DIR, "icon.svg")
    with open(p_svg, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("Saved icon.svg")

if __name__ == '__main__':
    main()
