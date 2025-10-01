#!/usr/bin/env python3
"""
Generate placeholder icons for PWA
Creates simple SVG icons that can be used for the Progressive Web App
"""

import os

# Icon sizes needed for PWA
sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512]

# SVG template
svg_template = """<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2196F3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1976D2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="{size}" height="{size}" fill="url(#grad)" rx="15%"/>
  <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="{emoji_size}" text-anchor="middle" dominant-baseline="middle">🚴</text>
  <text x="50%" y="75%" font-family="Arial, sans-serif" font-size="{text_size}" fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">QuickTravel</text>
</svg>"""

def create_icon(size):
    """Create an SVG icon of the specified size."""
    emoji_size = size // 3
    text_size = size // 12
    
    svg_content = svg_template.format(
        size=size,
        emoji_size=emoji_size,
        text_size=text_size
    )
    
    filename = f"icon-{size}x{size}.svg"
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"✓ Created {filename}")

def main():
    """Generate all required icon sizes."""
    print("Generating PWA icons...")
    print("-" * 40)
    
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    for size in sizes:
        create_icon(size)
    
    print("-" * 40)
    print(f"✓ Successfully generated {len(sizes)} icon sizes!")
    print("\nNote: For production, replace these placeholder icons")
    print("with professionally designed icon assets (PNG format).")

if __name__ == "__main__":
    main()
