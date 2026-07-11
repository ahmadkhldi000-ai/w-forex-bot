#!/usr/bin/env bash
# ====================================================================
#  W-FOREX-BOT · Deploy Frontend to GitHub Pages
#  Usage:  bash scripts/deploy-gh-pages.sh
# ====================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="$ROOT/web"
REPO="ahmadkhldi000-ai/w-forex-bot"
PAGES_BRANCH="gh-pages"

echo "🚀 Deploying W-Forex Bot frontend to GitHub Pages..."
echo ""

# ---- 1. Build with basePath for GitHub Pages ----
echo "📦 Step 1: Building Next.js with basePath=/w-forex-bot"
cd "$WEB_DIR"

cp next.config.ts next.config.ts.bak
cat > next.config.gh.ts << 'EOF'
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/w-forex-bot",
  assetPrefix: "/w-forex-bot/",
  images: { unoptimized: true },
  poweredByHeader: false,
  trailingSlash: true,
};
export default nextConfig;
EOF
cp next.config.gh.ts next.config.ts
npm run build
cp next.config.ts.bak next.config.ts
rm -f next.config.gh.ts next.config.ts.bak

echo "✅ Build complete"
echo ""

# ---- 2. Push to gh-pages branch ----
echo "📤 Step 2: Pushing to gh-pages branch"
TMP_DIR="$(mktemp -d)"
cd "$TMP_DIR"
git clone --quiet "https://github.com/$REPO.git" wfb-deploy
cd wfb-deploy
git checkout --orphan "$PAGES_BRANCH"
git read-tree --empty
git clean -fdx
rsync -a --delete --exclude='.git' --exclude='.nojekyll' "$WEB_DIR/out/" .
touch .nojekyll
git add -A
git config user.email "dev@wforex.io"
git config user.name "W Forex Dev"
git commit -m "🚀 Deploy frontend to GitHub Pages ($(date -u +%Y-%m-%d\ %H:%M))" --quiet
git push --force --quiet origin "$PAGES_BRANCH"
cd "$ROOT"
rm -rf "$TMP_DIR"

echo "✅ Pushed to $PAGES_BRANCH branch"
echo ""
echo "🌐 Your site is live at:"
echo "   https://ahmadkhldi000-ai.github.io/w-forex-bot/"
echo ""
echo "⏱  GitHub Pages may take 1-2 minutes to rebuild."
