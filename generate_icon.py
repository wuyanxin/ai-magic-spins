#!/usr/bin/env python3
"""
App Icon Generator for MagicSpins - 药吃了么
Creates a professional pill/capsule icon with checkmark
"""

import struct
import zlib

def create_png(width, height, pixels):
    """Create a minimal PNG file from pixel data"""
    
    def png_chunk(chunk_type, data):
        chunk_len = struct.pack(">I", len(data))
        chunk_crc = struct.pack(">I", zlib.crc32(chunk_type + data) & 0xffffffff)
        return chunk_len + chunk_type + data + chunk_crc
    
    signature = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = png_chunk(b'IHDR', ihdr_data)
    
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'
        for x in range(width):
            raw_data += pixels[y * width + x]
    
    compressed = zlib.compress(raw_data, 9)
    idat = png_chunk(b'IDAT', compressed)
    
    iend = png_chunk(b'IEND', b'')
    
    return signature + ihdr + idat + iend

def create_capsule_icon(size):
    """Create a capsule (pill) icon with checkmark"""
    pixels = []
    center = size // 2
    margin = size // 10
    
    primary_color = (0, 122, 255)  # Blue
    secondary_color = (52, 199, 89)  # Green
    white = (255, 255, 255)
    shadow = (0, 0, 0, 30)
    
    pill_width = size - 2 * margin
    pill_height = size // 3
    pill_top = center - pill_height // 2
    corner_radius = pill_height // 2
    
    for y in range(size):
        for x in range(size):
            in_pill = False
            in_left_half = False
            in_check = False
            
            pill_x = x - margin
            pill_y = y - pill_top
            
            if 0 <= pill_x < pill_width and 0 <= pill_y < pill_height:
                if pill_x < corner_radius:
                    dx = pill_x - corner_radius
                    dy = pill_y - pill_height // 2
                    if dx * dx + dy * dy <= corner_radius * corner_radius:
                        in_pill = True
                        in_left_half = True
                elif pill_x > pill_width - corner_radius:
                    dx = pill_x - (pill_width - corner_radius)
                    dy = pill_y - pill_height // 2
                    if dx * dx + dy * dy <= corner_radius * corner_radius:
                        in_pill = True
                        in_left_half = False
                else:
                    in_pill = True
                    in_left_half = (pill_x < pill_width // 2)
            
            check_size = size // 6
            check_left = center - check_size // 3
            check_top = center - check_size // 6
            check_x = x - check_left
            check_y = y - check_top
            
            if 0 <= check_x < check_size and 0 <= check_y < check_size:
                if check_x < check_size // 2:
                    if check_y >= check_x + check_size // 2 and check_y < check_size - check_x // 2:
                        in_check = True
                else:
                    if check_y <= -check_x + check_size + check_size // 2 and check_y > check_x - check_size:
                        in_check = True
            
            if in_check:
                pixels.append(bytes([255, 255, 255, 255]))
            elif in_pill:
                if in_left_half:
                    pixels.append(bytes([0, 122, 255, 255]))
                else:
                    pixels.append(bytes([52, 199, 89, 255]))
            else:
                pixels.append(bytes([0, 0, 0, 0]))
    
    return create_png(size, size, pixels)

def main():
    print("🔄 Generating MagicSpins App Icon...")
    print("   Icon Design: Capsule (pill) with checkmark")
    print("   Left half: Blue (primary)")
    print("   Right half: Green (success)")
    print("   Center: White checkmark ✓\n")
    
    size = 1024
    png_data = create_capsule_icon(size)
    filename = f"MagicSpins/Assets.xcassets/AppIcon.appiconset/AppIcon.png"
    
    with open(filename, 'wb') as f:
        f.write(png_data)
    
    print(f"✅ Created {filename} ({size}x{size})")
    print("\n📝 Note:")
    print("   - This is a programmatically generated icon")
    print("   - For production, consider using a professional designer")
    print("   - You can replace this with a custom 1024x1024 PNG icon")
    print("   - Required for App Store: 1024x1024 PNG without transparency")
    print("\n🎉 Icon generation complete!")

if __name__ == "__main__":
    main()
