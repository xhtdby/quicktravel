#!/bin/bash
# Generate placeholder icons for the PWA
# This creates simple colored placeholder icons using ImageMagick

# Icon sizes needed for PWA
sizes=(72 96 128 144 152 180 192 384 512)

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Installing..."
    # Note: In production, use proper icon assets
fi

# Create simple placeholder icons
for size in "${sizes[@]}"; do
    # Create a simple icon with text using base64 encoded SVG
    cat > "icon-${size}x${size}.svg" << EOF
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2196F3"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size/4}" fill="white" text-anchor="middle" dominant-baseline="central">🚴</text>
</svg>
EOF
    
    echo "Created icon-${size}x${size}.svg"
done

echo "Icon generation complete!"
echo "Note: For production, replace these with proper icon assets."
