#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "========================================="
echo "  UE5 Blueprints Academy — Build APK"
echo "========================================="
echo ""

if [ -z "$EXPO_TOKEN" ]; then
  echo "❌ EXPO_TOKEN is not set."
  echo ""
  echo "  To fix this:"
  echo "  1. Go to https://expo.dev/accounts/[your-username]/settings/access-tokens"
  echo "  2. Create a new token"
  echo "  3. Add it as a secret named EXPO_TOKEN in Replit (Tools → Secrets)"
  echo ""
  exit 1
fi

echo "✅ EXPO_TOKEN found"
echo ""

cd "$MOBILE_DIR"

echo "🔧 Checking EAS CLI..."
npx eas-cli --version

echo ""
echo "🚀 Starting EAS Build for Android APK..."
echo "   Profile: preview (APK format)"
echo "   This will take 5–15 minutes in the cloud."
echo ""

EXPO_TOKEN="$EXPO_TOKEN" npx eas-cli build \
  --platform android \
  --profile preview \
  --non-interactive \
  --no-wait=false

echo ""
echo "✅ Build complete!"
echo "   Download your APK from the URL above or at:"
echo "   https://expo.dev/accounts/[your-username]/projects/mobile/builds"
echo ""
