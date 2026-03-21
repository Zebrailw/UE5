#!/usr/bin/env bash
set -e

MOBILE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo ""
echo "========================================="
echo "  UE5 Blueprints Academy — Build APK"
echo "========================================="
echo ""

if [ -z "$EXPO_TOKEN" ]; then
  echo "❌ EXPO_TOKEN is not set."
  echo ""
  echo "  1. Go to: https://expo.dev/settings/access-tokens"
  echo "  2. Create a new token"
  echo "  3. Add it as EXPO_TOKEN in Replit Secrets"
  echo ""
  exit 1
fi

cd "$MOBILE_DIR"
export EXPO_TOKEN

echo "🔑 Expo account:"
npx --yes eas-cli whoami 2>&1 | grep -v "npm warn" || true
echo ""

echo "🚀 Starting EAS Build for Android APK..."
echo "   Profile: preview (produces .apk file)"
echo "   Build runs in Expo cloud — takes 5–15 min."
echo ""

npx --yes eas-cli build \
  --platform android \
  --profile preview \
  --non-interactive

echo ""
echo "✅ Done! Download your APK from the link above."
echo "   Or visit: https://expo.dev/accounts/zebradf/projects/mobile/builds"
echo ""
