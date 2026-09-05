import math
from pathlib import Path
from PIL import Image, ImageDraw

STATIC_DIR = Path(__file__).resolve().parent / "src" / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)

def create_radar_gif():
    width, height = 480, 240
    num_frames = 40
    cx, cy = width // 2, height // 2
    max_radius = 100
    
    # Target blips (rel_x, rel_y, label, color)
    blips = [
        (-60, -35, "SUP-001 Apex", (52, 211, 153)),
        (70, -45, "MSK-402W Vessel", (56, 189, 248)),
        (45, 50, "WH-MAIN Hub", (16, 185, 129)),
        (-75, 40, "ORD-501 Tesla", (244, 63, 94)),
        (90, 20, "FX-8921 Air", (110, 231, 183))
    ]
    
    frames = []
    for f in range(num_frames):
        angle = (f / num_frames) * 2 * math.pi
        img = Image.new("RGBA", (width, height), (3, 24, 16, 255))
        draw = ImageDraw.Draw(img)
        
        # Grid rings
        for r in (30, 60, 90):
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(16, 185, 129, 90), width=1)
        
        # Axis crosshairs
        draw.line([(cx - 105, cy), (cx + 105, cy)], fill=(16, 185, 129, 70), width=1)
        draw.line([(cx, cy - 105), (cx, cy + 105)], fill=(16, 185, 129, 70), width=1)
        
        # Radar sweeping beam (sector cone)
        for sweep_step in range(25):
            sweep_angle = angle - (sweep_step * 0.04)
            bx = cx + math.cos(sweep_angle) * max_radius
            by = cy + math.sin(sweep_angle) * max_radius
            alpha = int(180 * (1.0 - sweep_step / 25))
            draw.line([(cx, cy), (bx, by)], fill=(52, 211, 153, alpha), width=2)
            
        # Draw blips with pulse
        for bx, by, label, (br, bg, bb) in blips:
            px = cx + bx
            py = cy + by
            # Distance in angle
            blip_ang = math.atan2(by, bx)
            if blip_ang < 0:
                blip_ang += 2 * math.pi
            ang_diff = (angle - blip_ang) % (2 * math.pi)
            
            if ang_diff < 1.0:
                glow_int = 1.0 - (ang_diff / 1.0)
                # Outer beacon
                orad = int(4 + 6 * glow_int)
                draw.ellipse([px - orad, py - orad, px + orad, py + orad], fill=(br, bg, bb, int(70 * glow_int)))
                draw.ellipse([px - 3, py - 3, px + 3, py + 3], fill=(255, 255, 255, 255))
            else:
                draw.ellipse([px - 2, py - 2, px + 2, py + 2], fill=(br, bg, bb, 160))
                
        frames.append(img.convert("RGB"))
        
    out_path = STATIC_DIR / "radar_scan.gif"
    frames[0].save(str(out_path), save_all=True, append_images=frames[1:], duration=50, loop=0, optimize=True)
    print("Generated:", out_path)

def create_cargo_flow_gif():
    width, height = 640, 140
    num_frames = 36
    
    stations = [
        (80, 70, "🏭 Supplier", (16, 185, 129)),
        (240, 70, "🚢 Port / Transit", (56, 189, 248)),
        (400, 70, "📦 Hub (WH-MAIN)", (52, 211, 153)),
        (560, 70, "🏢 Customers", (110, 231, 183))
    ]
    
    frames = []
    for f in range(num_frames):
        t = f / num_frames
        img = Image.new("RGBA", (width, height), (3, 24, 16, 255))
        draw = ImageDraw.Draw(img)
        
        # Connecting track line
        draw.line([(80, 70), (560, 70)], fill=(5, 150, 105, 140), width=3)
        
        # Moving cargo pulses
        for p in range(4):
            phase = (t + p * 0.25) % 1.0
            cx = 80 + phase * (560 - 80)
            cy = 70
            draw.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=(52, 211, 153, 90))
            draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 255, 255, 240))
            
        # Draw Station Nodes
        for sx, sy, label, (sr, sg, sb) in stations:
            pulse = math.sin(t * 2 * math.pi + sx * 0.05) * 2
            draw.ellipse([sx - 12 - pulse, sy - 12 - pulse, sx + 12 + pulse, sy + 12 + pulse], fill=(sr, sg, sb, 60))
            draw.ellipse([sx - 8, sy - 8, sx + 8, sy + 8], fill=(sr, sg, sb, 200))
            draw.ellipse([sx - 4, sy - 4, sx + 4, sy + 4], fill=(255, 255, 255, 255))
            
        frames.append(img.convert("RGB"))
        
    out_path = STATIC_DIR / "cargo_flow.gif"
    frames[0].save(str(out_path), save_all=True, append_images=frames[1:], duration=50, loop=0, optimize=True)
    print("Generated:", out_path)

if __name__ == "__main__":
    create_radar_gif()
    create_cargo_flow_gif()
