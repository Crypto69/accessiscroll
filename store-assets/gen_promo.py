"""Generate the Chrome Web Store promo tiles from the logo.

- promo-small-440x280.png   (small promo tile, required for good placement)
- promo-marquee-1400x560.png (marquee tile, used if the store features the
  extension; must be 24-bit with no alpha)
"""
from PIL import Image, ImageDraw, ImageFont

logo_src = Image.open("../icons/logo.png").convert("RGBA")
logo_src = logo_src.crop(logo_src.getbbox())


def fit(logo, max_w, max_h):
    scale = min(max_w / logo.width, max_h / logo.height)
    return logo.resize((round(logo.width * scale), round(logo.height * scale)), Image.LANCZOS)


# --- Small tile: logo centered on white ---
TILE = (440, 280)
MARGIN = 28
logo = fit(logo_src, TILE[0] - 2 * MARGIN, TILE[1] - 2 * MARGIN)
tile = Image.new("RGBA", TILE, (255, 255, 255, 255))
tile.paste(logo, ((TILE[0] - logo.width) // 2, (TILE[1] - logo.height) // 2), logo)
tile.convert("RGB").save("promo-small-440x280.png")

# --- Marquee: logo left, tagline right, stylized scrollbar on the edge ---
W, H = 1400, 560
NAVY = (43, 62, 133)
GRAY = (91, 91, 91)
TRACK = (85, 85, 85)     # matches the screenshot colors
THUMB = (34, 197, 94)

tile = Image.new("RGB", (W, H), (255, 255, 255))
d = ImageDraw.Draw(tile)

logo = fit(logo_src, 10_000, 360)
tile.paste(logo, (80, (H - logo.height) // 2), logo)

tx = 80 + logo.width + 70
max_w = (W - 110) - tx  # keep clear of the scrollbar graphic
size = 58
while size > 30:
    f_head = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
    if max(d.textlength("Big, easy-to-grab scrollbars.", font=f_head),
           d.textlength("On every site.", font=f_head)) <= max_w:
        break
    size -= 2
f_sub = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)

d.text((tx, 175), "Big, easy-to-grab scrollbars.", font=f_head, fill=NAVY)
d.text((tx, 175 + size + 18), "On every site.", font=f_head, fill=NAVY)
d.text((tx, 175 + 2 * (size + 18) + 24), "Your size. Your colors. Built for accessibility.", font=f_sub, fill=GRAY)

track_x0, track_w = W - 66, 26
d.rounded_rectangle([track_x0, 40, track_x0 + track_w, H - 40], radius=13, fill=TRACK)
d.rounded_rectangle([track_x0, 70, track_x0 + track_w, 250], radius=13, fill=THUMB)

tile.save("promo-marquee-1400x560.png")
print("done")
