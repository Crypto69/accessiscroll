from PIL import Image, ImageDraw

BG = (76, 99, 210)       # accent blue
TRACK = (255, 255, 255, 70)
THUMB = (255, 255, 255, 255)

def make_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = max(2, round(size * 0.22))
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BG)

    track_w = max(2, round(size * 0.30))
    margin = max(1, round(size * 0.14))
    track_x0 = size - margin - track_w
    track_x1 = size - margin
    d.rounded_rectangle(
        [track_x0, margin, track_x1, size - margin],
        radius=track_w // 2,
        fill=TRACK,
    )

    thumb_h = round((size - 2 * margin) * 0.55)
    thumb_y0 = margin + round((size - 2 * margin - thumb_h) * 0.28)
    thumb_y1 = thumb_y0 + thumb_h
    d.rounded_rectangle(
        [track_x0, thumb_y0, track_x1, thumb_y1],
        radius=track_w // 2,
        fill=THUMB,
    )
    return img

# Toolbar icons are full-bleed so the mark reads larger at small sizes.
for size in (16, 32, 48):
    make_icon(size).save(f"icon{size}.png")

# Store icon spec: 128x128 canvas with 96x96 artwork and 16px transparent
# padding (Chrome Web Store adds its own framing around the full canvas).
store = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
store.paste(make_icon(96), (16, 16))
store.save("icon128.png")

print("done")
