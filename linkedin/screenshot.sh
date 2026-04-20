#!/bin/bash
# Screenshot all LinkedIn post slides at 1080x1080 using pageres

set -e

LINKEDIN_DIR="$(cd "$(dirname "$0")" && pwd)"

POSTS=(
  post-01-lph-improvement
  post-02-shift-comparison
  post-03-top-performer
  post-04-agency-onboarding
  post-05-induction
  post-06-errors-not-random
  post-07-fishbone
  post-08-shelf-capacity
)

SLIDES=(
  slide-01-hook
  slide-02-context
  slide-03-work
  slide-04-dashboard
  slide-05-takeaway
)

echo "Screenshotting all slides at 1080x1080..."
echo ""

for post in "${POSTS[@]}"; do
  echo "→ $post"
  cd "$LINKEDIN_DIR/$post"
  for slide in "${SLIDES[@]}"; do
    if [ -f "$slide.html" ]; then
      pageres "$slide.html" 1080x1080 --filename="$slide"
      echo "  ✓ $slide.png"
    fi
  done
  cd "$LINKEDIN_DIR"
done

echo ""
echo "Done. PNGs written alongside each HTML file."
