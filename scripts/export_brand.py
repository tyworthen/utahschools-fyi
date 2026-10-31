"""Render production logo and icon files from brand/export.html into site/assets/brand/.

Needs: playwright (with Chromium) and Pillow.
Run:   python3 scripts/export_brand.py
"""
import os

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site", "assets", "brand")
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 2600, "height": 1400}, device_scale_factor=1)
    page.goto("file://" + os.path.join(ROOT, "brand", "export.html"))
    page.wait_for_function("document.fonts.status === 'loaded'")
    page.wait_for_timeout(500)
    for el, name in (("header", "logo-header.png"), ("footer", "logo-footer.png"), ("badge", "badge.png"),
                     ("og", "og-image.png"), ("icon", "icon-1024.png"), ("icon-square", "icon-square-1024.png")):
        page.locator("#" + el).screenshot(path=os.path.join(OUT, name), omit_background=True)
    browser.close()


def resized(src, size, dest):
    Image.open(os.path.join(OUT, src)).convert("RGBA").resize((size, size), Image.LANCZOS).save(os.path.join(OUT, dest), optimize=True)


# Header/footer: scale to 2x their display height for sharp rendering on high-density screens.
for name, height in (("logo-header.png", 88), ("logo-footer.png", 128)):
    im = Image.open(os.path.join(OUT, name))
    im.resize((round(im.width * height / im.height), height), Image.LANCZOS).save(os.path.join(OUT, name), optimize=True)

og = Image.open(os.path.join(OUT, "og-image.png")).convert("RGB")
og.save(os.path.join(OUT, "og-image.png"), optimize=True)
resized("badge.png", 512, "badge-512.png")
resized("icon-1024.png", 32, "favicon-32.png")
resized("icon-1024.png", 192, "icon-192.png")
resized("icon-1024.png", 512, "icon-512.png")
Image.open(os.path.join(OUT, "icon-square-1024.png")).convert("RGB").resize((180, 180), Image.LANCZOS).save(os.path.join(OUT, "apple-touch-icon.png"), optimize=True)
Image.open(os.path.join(OUT, "icon-1024.png")).convert("RGBA").save(
    os.path.join(ROOT, "site", "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
for tmp in ("icon-1024.png", "icon-square-1024.png", "badge.png"):
    os.remove(os.path.join(OUT, tmp))
print("wrote", sorted(os.listdir(OUT)), "and site/favicon.ico")
