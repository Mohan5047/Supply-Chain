import math
from pathlib import Path
from PIL import Image, ImageDraw

OUTPUT_DIR = Path(__file__).resolve().parent / "src" / "static"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_FILE = OUTPUT_DIR / "network_bg.gif"

width, height = 960, 540
num_frames = 40

# Supply chain nodes (x, y, radius, label_type)
nodes = [
    (140, 130, 8, "supplier"),
    (230, 310, 7, "supplier"),
    (110, 390, 7, "supplier"),
    (380, 170, 11, "hub"),
    (480, 290, 15, "central_warehouse"),
    (340, 420, 9, "hub"),
    (680, 150, 9, "port"),
    (780, 270, 11, "customer_zone"),
    (640, 410, 10, "distribution"),
    (840, 420, 8, "retail"),
    (560, 110, 8, "port")
]

edges = [
    (0, 3), (1, 3), (2, 5), (1, 5),
    (3, 4), (5, 4), (4, 6), (4, 7),
    (4, 8), (6, 7), (7, 9), (8, 9),
    (3, 10), (10, 6)
]

frames = []

for frame_idx in range(num_frames):
    t = frame_idx / num_frames
    
    # Pure fluid dark emerald canvas (zero grid lines, zero boxes)
    img = Image.new("RGBA", (width, height), (3, 24, 16, 255))
    draw = ImageDraw.Draw(img)

    # Soft ambient glowing green light patches (organic, smooth fluid halos)
    draw.ellipse([100, 60, 520, 440], fill=(16, 185, 129, 35))
    draw.ellipse([400, 120, 880, 500], fill=(52, 211, 153, 30))
    draw.ellipse([200, 220, 720, 530], fill=(5, 150, 105, 30))

    # Draw network edges in glowing organic emerald green lines
    for n1_idx, n2_idx in edges:
        x1, y1 = nodes[n1_idx][0], nodes[n1_idx][1]
        x2, y2 = nodes[n2_idx][0], nodes[n2_idx][1]
        draw.line([(x1, y1), (x2, y2)], fill=(16, 185, 129, 90), width=2)

    # Draw animated bright cargo pulses traveling along edges
    for edge_i, (n1_idx, n2_idx) in enumerate(edges):
        x1, y1 = nodes[n1_idx][0], nodes[n1_idx][1]
        x2, y2 = nodes[n2_idx][0], nodes[n2_idx][1]
        
        phase = (t + edge_i * 0.22) % 1.0
        px = x1 + (x2 - x1) * phase
        py = y1 + (y2 - y1) * phase
        
        # Outer pulse halo
        draw.ellipse([px - 7, py - 7, px + 7, py + 7], fill=(52, 211, 153, 140))
        # Inner bright core
        draw.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(255, 255, 255, 255))

    # Draw nodes with rhythmic breathing glow
    for i, (nx, ny, base_r, ntype) in enumerate(nodes):
        pulse = math.sin((t * 2 * math.pi) + (i * 0.7)) * 3.0
        r = base_r + pulse

        # Outer soft glow halo
        draw.ellipse([nx - r - 12, ny - r - 12, nx + r + 12, ny + r + 12], fill=(16, 185, 129, 60))
        # Inner vibrant green ring
        draw.ellipse([nx - r - 3, ny - r - 3, nx + r + 3, ny + r + 3], fill=(52, 211, 153, 180))
        # Core node center
        color = (255, 255, 255, 255) if ntype == "central_warehouse" else (209, 250, 229, 255)
        draw.ellipse([nx - base_r * 0.6, ny - base_r * 0.6, nx + base_r * 0.6, ny + base_r * 0.6], fill=color)

    frames.append(img.convert("RGB"))

frames[0].save(
    str(OUTPUT_FILE),
    save_all=True,
    append_images=frames[1:],
    duration=50,
    loop=0,
    optimize=True
)

print(f"Generated network_bg.gif (zero boxes/grids) at: {OUTPUT_FILE}")
